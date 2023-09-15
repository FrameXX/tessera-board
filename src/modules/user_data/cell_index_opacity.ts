import { NumberUserData } from "./user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";
import type ToastManager from "../toast_manager";

const DEFAULT_CELL_INDEX_OPACITY_VALUE = 80;

class CellIndexOpacityData extends NumberUserData {
  constructor(valueRef: Ref<number>, toastManager: ToastManager) {
    super(
      "cell_index_opacity",
      DEFAULT_CELL_INDEX_OPACITY_VALUE,
      toastManager,
      valueRef
    );
  }

  public apply(): void {
    setCSSVariable("cell-index-opacity", (this.value / 100).toString());
  }
}

export default CellIndexOpacityData;
