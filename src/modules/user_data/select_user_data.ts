import type { Ref } from "vue";
import UserData from "./user_data";
import type ToastManager from "../toast_manager";

class SelectUserData<ValueType extends string> extends UserData<ValueType> {
  constructor(
    id: string,
    value: ValueType,
    protected readonly validate: (string: string) => string is ValueType,
    valueRef?: Ref<ValueType>
  ) {
    super(id, value, valueRef);
  }

  public dump(): string {
    return this.value;
  }

  public load(dumped: string, toastManager: ToastManager): void {
    if (!this.validate(dumped)) {
      console.error(
        `An error occured while trying to parse select user data ${this.id}.`
      );
      this.handleInvalidLoadValue(dumped, toastManager);
      return;
    }
    this.value = dumped;
  }

  public apply(): void {}
}

export default SelectUserData;
