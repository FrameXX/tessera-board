import type { Ref } from "vue";
import type ToastManager from "../toast_manager";
import UserData from "./user_data";

class SelectUserData<ValueType extends string> extends UserData<ValueType> {
  constructor(
    id: string,
    value: ValueType,
    protected readonly validate: (string: string) => string is ValueType,
    toastManager: ToastManager,
    valueRef?: Ref<ValueType>
  ) {
    super(id, value, toastManager, valueRef);
  }

  public dump(): string {
    return this.value;
  }

  public load(dumped: string): void {
    if (!this.validate(dumped)) {
      console.error(
        `An error occured while trying to parse select user data ${this.id}.`
      );
      this.handleInvalidLoadValue(dumped);
      return;
    }
    this.value = dumped;
  }

  public apply(): void {}
}

export default SelectUserData;
