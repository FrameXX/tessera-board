import type { Ref } from "vue";
import type ToastManager from "../toast_manager";
import { BooleanUserData } from "./user_data";

export const DEFAULT_ROTATE_SCREEN_VALUE = false;

class RotateScreenData extends BooleanUserData {
  constructor(
    value: boolean,
    valueRef: Ref<boolean>,
    toastManager: ToastManager
  ) {
    super("rotate_checkboard", value, toastManager, valueRef);
  }

  public apply(): void {}
}

export default RotateScreenData;