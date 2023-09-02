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
  private valueRef?: Ref<ValueType>;
  protected saveCallback: () => void;
  protected value: ValueType;
  public id: string;

  constructor(
    saveCallBack: () => void,
    id: string,
    value: ValueType,
    valueRef?: Ref<ValueType>
  ) {
    this.saveCallback = saveCallBack;
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

  protected onValueChange(newValue: ValueType) {
    this.value = newValue;
    this.apply();
    this.saveCallback();
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

  public abstract apply(): void;

  // Dump value into a string
  public abstract dump(): string;

  // Load value from a string
  public abstract load(dumped: string): void;
}

// The ComplexUserData class uses reactive instead of ref which means it can also watch and react for changes in properties of the reatcive value, thus it's more suitable for more complex values.
export abstract class ComplexUserData<ValueType> extends UserData<ValueType> {
  // @ts-ignore
  private reactiveValue: ValueType;

  constructor(
    saveCallBack: () => void,
    id: string,
    value: ValueType,
    reactiveValue: ValueType
  ) {
    super(saveCallBack, id, value);

    this.reactiveValue = reactiveValue;
    watch(reactiveValue!, (newValue) => {
      this.onValueChange(newValue);
    });
  }

  // Value of reactive is a proxy. To get the original value toRaw built-in Vue function is used to extract the real value.
  protected onValueChange(newValue: ValueType) {
    this.value = toRaw(newValue);
    console.log(this.value);
    this.apply();
    this.saveCallback();
  }

  // Reactive loses reactivity if the whole value is overwritten. The values needs to be chnaged key by key.
  public updateReference() {
    for (const key in this.reactiveValue) {
      this.reactiveValue[key] = this.value[key];
    }
  }
}

export default UserData;
