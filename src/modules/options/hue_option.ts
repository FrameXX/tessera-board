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
    this.addEventListener("change", () => {
      this.apply();
    });
    this.apply();
  }

  private apply(): void {
    if (this.primaryPlayer) {
      setCSSVariable("H-primary-player", this.value.toString());
    } else {
      setCSSVariable("H-secondary-player", this.value.toString());
    }
  }
}

export default HueOption;
