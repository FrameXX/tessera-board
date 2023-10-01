import type { Ref } from "vue";
import type ToastManager from "../toast_manager";
import UserData from "./user_data";

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

export default BooleanUserData;
