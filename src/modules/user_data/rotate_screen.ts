import type { Ref } from "vue";
import type ToastManager from "../toast_manager";
import { BooleanUserData } from "./user_data";

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
