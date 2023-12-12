import type { Ref } from "vue";
import NumberUserData from "./number_user_data";
import { setCSSVariable } from "../utils/elements";

class PiecePaddingData extends NumberUserData {
  constructor(value: number, valueRef: Ref<number>) {
    super("piece_padding", value, valueRef, 0, 30);
  }

  public apply(): void {
    setCSSVariable("piece-padding", this.value.toString() + "%");
  }
}

export default PiecePaddingData;
