import { Ref } from "vue";
import UserData, { type SaveCallBack } from "./user_data";
import { setCSSVariable } from "../utils/elements";

export const DEFAULT_PIECE_BORDER_VALUE = 1.1;

class PieceBorderData extends UserData<Number> {
  constructor(
    saveCallBack: SaveCallBack,
    value: number,
    valueRef: Ref<number>
  ) {
    super(saveCallBack, "piece_border", value, valueRef);
  }

  public load(dumped: string): void {
    this.value = +dumped;
  }

  public dump(): string {
    return this.value.toString();
  }

  public apply(): void {
    setCSSVariable("piece-stroke-width", this.value.toString() + "px");
  }
}

export default PieceBorderData;
