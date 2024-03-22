import { setCSSVariable } from "../utils/elements";
import NumberOption from "./number_option";

export default class PiecePaddingOption extends NumberOption {
  constructor(defaultValue: number) {
    super(defaultValue, "piece-padding");
    this.addEventListener("change", () => {
      this.apply();
    });
    this.apply();
  }

  public apply(): void {
    setCSSVariable("piece-padding", this.value.toString() + "%");
  }
}
