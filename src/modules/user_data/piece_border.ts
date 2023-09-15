import { Ref } from "vue";
import { type SaveCallBack, NumberUserData } from "./user_data";
import { setCSSVariable } from "../utils/elements";
import type ToastManager from "../toast_manager";

export const DEFAULT_PIECE_BORDER_VALUE = 1.1;

class PieceBorderData extends NumberUserData {
  constructor(
    value: number,
    valueRef: Ref<number>,
    toastManager: ToastManager
  ) {
    super("piece_border", value, toastManager, valueRef);
  }

  public apply(): void {
    setCSSVariable("piece-stroke-width", this.value.toString() + "px");
  }
}

export default PieceBorderData;
