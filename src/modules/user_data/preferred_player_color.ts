import type { Ref } from "vue";
import UserData from "./user_data";
import type ToastManager from "../toast_manager";

export const DEFAULT_PREFERRED_PLAYER_COLOR_VALUE: PreferredPlayerColorValue =
  "random";

type PreferredPlayerColorValue = "white" | "black" | "random";
function isPreferredPlayerColorValue(
  string: string
): string is PreferredPlayerColorValue {
  return string === "white" || string === "black" || string === "random";
}

class PreferredPlayerColor extends UserData<PreferredPlayerColorValue> {
  constructor(
    value: PreferredPlayerColorValue,
    valueRef: Ref<PreferredPlayerColorValue>,
    toastManager: ToastManager
  ) {
    super("preferred_player_color", value, toastManager, valueRef);
  }

  public load(dumped: string): void {
    isPreferredPlayerColorValue(dumped)
      ? (this.value = dumped)
      : this.handleInvalidLoadValue(dumped);
  }

  public dump(): string {
    return this.value;
  }

  public apply(): void {}
}

export default PreferredPlayerColor;
