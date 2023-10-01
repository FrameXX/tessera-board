import type { Ref } from "vue";
import type ToastManager from "../toast_manager";
import BooleanUserData from "./boolean_user_data";

class SecondCheckboardData extends BooleanUserData {
  constructor(
    value: boolean,
    valueRef: Ref<boolean>,
    toastManager: ToastManager
  ) {
    super("second_checkboard", value, toastManager, valueRef);
  }

  public apply(): void {}
}

export default SecondCheckboardData;
