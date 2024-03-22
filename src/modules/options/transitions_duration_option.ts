import { setCSSVariable } from "../utils/elements";
import NumberOption from "./number_option";

export default class TransitionsDurationOption extends NumberOption {
  constructor(defaultValue: number) {
    super(defaultValue, "transitions-duration");
    this.addEventListener("change", () => {
      this.apply();
    });
    this.apply();
  }

  public apply(): void {
    setCSSVariable(
      "transition-duration-multiplier-config",
      (this.value / 100).toString()
    );
  }
}
