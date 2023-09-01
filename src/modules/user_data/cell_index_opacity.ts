import UserData from "./user_data";
import type { SaveCallBack } from "./user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";

export const DEFAULT_CELL_INDEX_OPACITY_VALUE = 80;

class CellIndexOpacityData extends UserData<number> {
  constructor(
    saveCallBack: SaveCallBack,
    value: number,
    valueRef: Ref<number>
  ) {
    super(saveCallBack, "cell_index_opacity", value, valueRef);
  }

  public dump(): string {
    return this.value.toString();
  }

  public load(dumped: string): void {
    this.value = +dumped;
  }

  public apply(): void {
    setCSSVariable("cell-index-opacity", (this.value / 100).toString());
  }
}

export default CellIndexOpacityData;
