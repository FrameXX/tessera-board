import NumberUserData from "./number_user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";

class CellIndexOpacityData extends NumberUserData {
  constructor(value: number, valueRef: Ref<number>) {
    super("cell_index_opacity", value, valueRef);
  }

  public apply(): void {
    setCSSVariable("cell-index-opacity", (this.value / 100).toString());
  }
}

export default CellIndexOpacityData;
