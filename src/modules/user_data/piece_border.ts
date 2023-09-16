import { Ref } from "vue";
import { NumberUserData } from "./user_data";
import { setCSSVariable } from "../utils/elements";
import type ToastManager from "../toast_manager";

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
