import type { Ref } from "vue";
import { SelectUserData } from "./user_data";
import type ToastManager from "../toast_manager";

export const DEFAULT_PREFERRED_PLAYER_COLOR_VALUE: PreferredPlayerColorValue =
  "random";

type PreferredPlayerColorValue = "white" | "black" | "random";
function isPreferredPlayerColorValue(
  string: string
): string is PreferredPlayerColorValue {
  return string === "white" || string === "black" || string === "random";
}

class PreferredPlayerColor extends SelectUserData<PreferredPlayerColorValue> {
  constructor(
    value: PreferredPlayerColorValue,
    valueRef: Ref<PreferredPlayerColorValue>,
    toastManager: ToastManager
  ) {
    super(
      "preferred_player_color",
      value,
      isPreferredPlayerColorValue,
      toastManager,
      valueRef
    );
  }

  public apply(): void {}
}

export default PreferredPlayerColor;
