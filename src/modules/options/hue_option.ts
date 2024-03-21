import NumberOption from "./number_option";
import { setCSSVariable } from "../utils/elements";

class HueOption extends NumberOption {
  constructor(defaultValue: number, private readonly primaryPlayer: boolean) {
    super(
      defaultValue,
      primaryPlayer ? "hue-player-primary" : "hue-player-secondary",
      0,
      360
    );
    this.addEventListener("change", (event) => {
      const newValue = (event as CustomEvent).detail;
      this.apply(newValue);
    });
    this.apply(this.value);
  }

  private apply(value: number): void {
    if (this.primaryPlayer) {
      setCSSVariable("H-primary-player", value.toString());
    } else {
      setCSSVariable("H-secondary-player", value.toString());
    }
  }
}

export default HueOption;
