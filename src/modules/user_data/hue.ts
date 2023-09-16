import { NumberUserData } from "./user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";
import type ToastManager from "../toast_manager";

class HueData extends NumberUserData {
  private forOpponent: boolean;

  constructor(
    value: number,
    valueRef: Ref<number>,
    forOpponent: boolean,
    toastManager: ToastManager
  ) {
    super(
      forOpponent ? "player_hue" : "opponent_hue",
      value,
      toastManager,
      valueRef,
      0,
      360
    );
    this.forOpponent = forOpponent;
  }

  public apply(): void {
    if (this.forOpponent) {
      setCSSVariable("H-opponent", this.value.toString());
    } else {
      setCSSVariable("H-player", this.value.toString());
    }
  }
}

export default HueData;
