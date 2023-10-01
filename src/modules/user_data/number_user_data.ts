import type { Ref } from "vue";
import type ToastManager from "../toast_manager";
import UserData from "./user_data";

class NumberUserData extends UserData<number> {
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

export default NumberUserData;
