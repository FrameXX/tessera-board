import type { Ref } from "vue";
import type ToastManager from "../toast_manager";
import { BooleanUserData } from "./user_data";

export const DEFAULT_OPPONENT_OVER_LAN_VALUE = false;

class OpponentOverLan extends BooleanUserData {
  constructor(
    value: boolean,
    valueRef: Ref<boolean>,
    toastManager: ToastManager
  ) {
    super("opponent_over_lan", value, toastManager, valueRef);
  }

  public apply(): void {}
}

export default OpponentOverLan;
