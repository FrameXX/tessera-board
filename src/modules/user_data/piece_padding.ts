import { Ref } from "vue";
import UserData, { type SaveCallBack } from "./user_data";
import { setCSSVariable } from "../utils/elements";

export const DEFAULT_PIECE_PADDING_VALUE = 5;

class PiecePaddingData extends UserData<Number> {
  constructor(value: number, valueRef: Ref<number>) {
    super("piece_padding", value, valueRef);
  }

  public load(dumped: string): void {
    this.value = +dumped;
  }

  public dump(): string {
    return this.value.toString();
  }

  public apply(): void {
    setCSSVariable("piece-padding", this.value.toString() + "px");
  }
}

export default PiecePaddingData;
