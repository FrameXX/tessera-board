import type { Ref } from "vue";
import { watch } from "vue";

export type SaveCallBack = () => void;

export class UserDataError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UserDataError.prototype);
    this.name = UserDataError.name;
  }
}

abstract class UserData<ValueType> {
  private saveCallback: () => void;
  protected value: ValueType;
  public id: string;
  public valueRef?: Ref<ValueType>;

  constructor(
    saveCallBack: () => void,
    id: string,
    value: ValueType,
    valueRef?: Ref<ValueType>
  ) {
    this.saveCallback = saveCallBack;
    this.id = id;
    this.value = value;

    if (valueRef) {
      this.valueRef = valueRef;
      watch<ValueType>(valueRef, async (newValue) => {
        this.value = newValue;
        this.apply();
        this.saveCallback();
      });
    }
  }

  protected handleInvalidLoadValue(value: string) {
    console.error("Invalid load value.", value);
    throw new UserDataError(`"Loaded ${this.id} value was invalid"`);
  }

  public updateRefIfDefined() {
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

export default UserData;
