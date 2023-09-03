import type { Ref } from "vue";
import { watch, toRaw } from "vue";

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
  protected value: ValueType;
  public readonly id: string;

  constructor(id: string, value: ValueType, valueRef?: Ref<ValueType>) {
    this.id = id;
    this.value = value;

    // Watch ref for changes, update the original value and save changes.
    if (valueRef) {
      this.valueRef = valueRef;
      watch(valueRef, async (newValue) => {
        this.onValueChange(newValue);
      });
    }
  }

  protected save() {
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
    throw new UserDataError(`"Loaded ${this.id} value was invalid"`);
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

// The ComplexUserData class uses reactive instead of ref which means it can also watch and react for changes in properties of the reatcive value, thus it's more suitable for more complex values.
export abstract class ComplexUserData<ValueType> extends UserData<ValueType> {
  private reactiveValue: ValueType;

  constructor(id: string, value: ValueType, reactiveValue: ValueType) {
    super(id, value);

    this.reactiveValue = reactiveValue;
    watch(reactiveValue!, (newValue) => {
      this.onValueChange(newValue);
    });
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
}

export default UserData;
