import type { Ref } from "vue";
import type ToastManager from "../toast_manager";
import { BooleanUserData } from "./user_data";

export const DEFAULT_SECOND_CHECKBOARD_VALUE = false;

class SecondCheckboard extends BooleanUserData {
  constructor(
    value: boolean,
    valueRef: Ref<boolean>,
    toastManager: ToastManager
  ) {
    super("second_checkboard", value, toastManager, valueRef);
  }

  public apply(): void {}
}

export default SecondCheckboard;
