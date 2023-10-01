import NumberUserData from "./number_user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";
import type ToastManager from "../toast_manager";

class TransitionDurationData extends NumberUserData {
  constructor(
    value: number,
    valueRef: Ref<number>,
    toastManager: ToastManager
  ) {
    super("transition_duration", value, toastManager, valueRef);
  }

  public apply(): void {
    setCSSVariable(
      "transition-duration-multiplier-config",
      (this.value / 100).toString()
    );
  }
}

export default TransitionDurationData;
