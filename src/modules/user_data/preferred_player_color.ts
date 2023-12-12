import type { Ref } from "vue";
import SelectUserData from "./select_user_data";

export type PreferredPlayerColor = "white" | "black" | "random";
function isPreferredPlayerColor(
  string: string
): string is PreferredPlayerColor {
  return string === "white" || string === "black" || string === "random";
}

class PlayerColorOptionData extends SelectUserData<PreferredPlayerColor> {
  constructor(
    id: string,
    value: PreferredPlayerColor,
    valueRef: Ref<PreferredPlayerColor>
  ) {
    super(id, value, isPreferredPlayerColor, valueRef);
  }

  public apply(): void {}
}

export default PlayerColorOptionData;
