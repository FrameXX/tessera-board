import type { Ref } from "vue";
import type ToastManager from "../toast_manager";
import { BooleanUserData } from "./user_data";

class OpponentOverLanData extends BooleanUserData {
  constructor(
    value: boolean,
    valueRef: Ref<boolean>,
    toastManager: ToastManager
  ) {
    super("opponent_over_lan", value, toastManager, valueRef);
  }

  public apply(): void {}
}

export default OpponentOverLanData;
