import type { Ref } from "vue";
import type ToastManager from "../toast_manager";
import { BooleanUserData } from "./user_data";

export const DEFAULT_REQUIRE_MOVE_CONFIRM_VALUE = false;

class RequireMoveConfirmData extends BooleanUserData {
  constructor(
    value: boolean,
    valueRef: Ref<boolean>,
    toastManager: ToastManager
  ) {
    super("require_move_confirm", value, toastManager, valueRef);
  }

  public apply(): void {}
}

export default RequireMoveConfirmData;