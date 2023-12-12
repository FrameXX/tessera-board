import type { Ref } from "vue";
import NumberUserData from "./number_user_data";
import { setCSSVariable } from "../utils/elements";

class PieceBorderData extends NumberUserData {
  constructor(value: number, valueRef: Ref<number>) {
    super("piece_border", value, valueRef);
  }

  public apply(): void {
    setCSSVariable("piece-stroke-width", this.value.toString() + "px");
  }
}

export default PieceBorderData;
