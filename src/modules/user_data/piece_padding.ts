import { Ref } from "vue";
import { NumberUserData } from "./user_data";
import { setCSSVariable } from "../utils/elements";
import type ToastManager from "../toast_manager";

export const DEFAULT_PIECE_PADDING_VALUE = 5;

class PiecePaddingData extends NumberUserData {
  constructor(
    value: number,
    valueRef: Ref<number>,
    toastManager: ToastManager
  ) {
    super("piece_padding", value, toastManager, valueRef);
  }

  public apply(): void {
    setCSSVariable("piece-padding", this.value.toString() + "px");
  }
}

export default PiecePaddingData;
