import type { Ref } from "vue";
import { watch, toRaw } from "vue";
import type ToastManager from "../toast_manager";

export type SaveCallBack = () => void;

export class UserDataError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UserDataError.prototype);
    this.name = UserDataError.name;
  }
}

// UserData class manages recovering, applying and saving data types from and to localStorage.
abstract class UserData<ValueType> {
  public static readonly STORAGE_KEY = "tessera_board";
  private valueRef?: Ref<ValueType>;

  constructor(
    public readonly id: string,
    protected value: ValueType,
    private readonly toastManager: ToastManager,
    valueRef?: Ref<ValueType>
  ) {
    // Watch ref for changes, update the original value and save changes.
    if (valueRef) {
      this.valueRef = valueRef;
      watch(
        valueRef,
        async (newValue) => {
          this.onValueChange(newValue);
        },
        { deep: true }
      );
    }
  }

  public save() {
    if (navigator.cookieEnabled) {
      localStorage.setItem(`${UserData.STORAGE_KEY}-${this.id}`, this.dump());
    }
  }

  protected onValueChange(newValue: ValueType) {
    this.value = newValue;
    this.apply();
    this.save();
  }

  protected handleInvalidLoadValue(value: string) {
    console.error("Invalid load value.", value);
    this.toastManager.showToast(
      "An error occured while trying to load data from local storage. Your data are probably corrupted or invalid and it's recommended that you clear all data.",
      "error",
      "database-alert"
    );
  }

  public updateReference() {
    if (this.valueRef) {
      this.valueRef.value = this.value;
    }
  }

  public recover() {
    const dumped = localStorage.getItem(`${UserData.STORAGE_KEY}-${this.id}`);
    if (dumped) {
      this.load(dumped);
    }
  }

  public abstract apply(): void;

  // Dump value into a string
  public abstract dump(): string;

  // Load value from a string
  public abstract load(dumped: string): void;
}

// These 3 classes implement all of the mandatory methods of UserData for their extending classes already. It's up to the extending class to override any of the methods if needed. They are not abstract and can be used as they are.
export class SelectUserData<
  ValueType extends string
> extends UserData<ValueType> {
  constructor(
    id: string,
    value: ValueType,
    private readonly validate: (string: string) => string is ValueType,
    toastManager: ToastManager,
    valueRef?: Ref<ValueType>
  ) {
    super(id, value, toastManager, valueRef);
  }

  public dump(): string {
    return this.value;
  }

  public load(dumped: string): void {
    if (this.validate(dumped)) {
      this.value = dumped;
    } else {
      console.error(
        `An error occured while trying to parse select user data ${this.id}.`
      );
      this.handleInvalidLoadValue(dumped);
    }
  }

  public apply(): void {}
}

export class NumberUserData extends UserData<number> {
  constructor(
    id: string,
    value: number,
    toastManager: ToastManager,
    valueRef?: Ref<number>,
    private readonly minValue?: number,
    private readonly maxValue?: number
  ) {
    super(id, value, toastManager, valueRef);
  }

  public dump(): string {
    return this.value.toString();
  }

  public load(dumped: string): void {
    this.value = Math.max(
      Math.min(+dumped, this.maxValue ?? Number.MAX_VALUE),
      this.minValue ?? Number.MIN_VALUE
    );
  }

  public apply(): void {}
}

export class BooleanUserData extends UserData<boolean> {
  constructor(
    id: string,
    value: boolean,
    toastManager: ToastManager,
    valueRef?: Ref<boolean>
  ) {
    super(id, value, toastManager, valueRef);
  }

  public dump(): string {
    const numRepr = this.value ? 1 : 0;
    return numRepr.toString();
  }

  public load(dumped: string): void {
    this.value = Boolean(+dumped);
  }

  public apply(): void {}
}

// The ComplexUserData class uses reactive instead of ref which means it can also watch and react for changes in properties of the reatcive value, thus it's more suitable for more complex values. This is still an abstract class and some methods need to be implemented by extending classes (children).
export abstract class ComplexUserData<ValueType> extends UserData<ValueType> {
  constructor(
    id: string,
    value: ValueType,
    protected reactiveValue: ValueType,
    toastManager: ToastManager,
    autoSave: boolean = true
  ) {
    super(id, value, toastManager);

    if (autoSave) {
      watch(reactiveValue!, (newValue) => {
        this.onValueChange(newValue);
      });
    }
  }

  // HACK: Value of reactive is a proxy. To get the original value toRaw built-in Vue function is used to extract the real value.
  protected onValueChange(newValue: ValueType) {
    this.value = toRaw(newValue);
    this.apply();
    this.save();
  }

  // NOTE: Reactive loses reactivity if the whole value is overwritten. The values needs to be chnaged key by key instead of updating it as a whole.
  public updateReference() {
    for (const key in this.reactiveValue) {
      this.reactiveValue[key] = this.value[key];
    }
  }

  public apply(): void {}
}

export default UserData;
