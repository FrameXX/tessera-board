import UserData from "./user_data";
import { setCSSVariable } from "../utils/elements";
import type { Ref } from "vue";
import type ToastManager from "../toast_manager";

export const DEFAULT_PLAYER_HUE_VALUE = 37;
export const DEFAULT_OPPONENT_HUE_VALUE = 212;

class HueData extends UserData<number> {
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
      valueRef
    );
    this.forOpponent = forOpponent;
  }

  public dump(): string {
    return this.value.toString();
  }

  public load(dumped: string): void {
    this.value = Math.max(Math.min(+dumped, 360), 0);
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
