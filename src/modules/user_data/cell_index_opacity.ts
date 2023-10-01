import NumberUserData from "./number_user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";
import type ToastManager from "../toast_manager";

class CellIndexOpacityData extends NumberUserData {
  constructor(
    value: number,
    valueRef: Ref<number>,
    toastManager: ToastManager
  ) {
    super("cell_index_opacity", value, toastManager, valueRef);
  }

  public apply(): void {
    setCSSVariable("cell-index-opacity", (this.value / 100).toString());
  }
}

export default CellIndexOpacityData;
