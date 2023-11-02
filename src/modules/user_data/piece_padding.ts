import type { Ref } from "vue";
import NumberUserData from "./number_user_data";
import { setCSSVariable } from "../utils/elements";
import type ToastManager from "../toast_manager";

class PiecePaddingData extends NumberUserData {
  constructor(
    value: number,
    valueRef: Ref<number>,
    toastManager: ToastManager
  ) {
    super("piece_padding", value, toastManager, valueRef, 0, 30);
  }

  public apply(): void {
    setCSSVariable("piece-padding", this.value.toString() + "%");
  }
}

export default PiecePaddingData;
