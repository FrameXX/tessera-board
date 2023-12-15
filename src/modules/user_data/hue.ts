import NumberUserData from "./number_user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";

class HueData extends NumberUserData {
  private forOpponent: boolean;

  constructor(value: number, valueRef: Ref<number>, forOpponent: boolean) {
    super(forOpponent ? "player_hue" : "opponent_hue", value, valueRef, 0, 360);
    this.forOpponent = forOpponent;
  }

  public apply(): void {
    if (this.forOpponent) {
      setCSSVariable("H-secondary-player", this.value.toString());
    } else {
      setCSSVariable("H-primary-player", this.value.toString());
    }
  }
}

export default HueData;
