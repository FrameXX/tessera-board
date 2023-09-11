import UserData from "./user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";
import type ToastManager from "../toast_manager";

export const DEFAULT_TRANSITION_DURATION_VALUE = 100;

class TransitionDurationData extends UserData<number> {
  constructor(
    value: number,
    valueRef: Ref<number>,
    toastManager: ToastManager
  ) {
    super("transition_duration", value, toastManager, valueRef);
  }

  public dump(): string {
    return this.value.toString();
  }

  public load(dumped: string): void {
    this.value = +dumped;
  }

  public apply(): void {
    setCSSVariable(
      "transition-duration-multiplier-config",
      (this.value / 100).toString()
    );
  }
}

export default TransitionDurationData;
