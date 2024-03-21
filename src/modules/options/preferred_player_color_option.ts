import SelectOption from "./select_option";

export type PreferredPlayerColor = "white" | "black" | "random";
function isPreferredPlayerColor(
  string: string
): string is PreferredPlayerColor {
  return string === "white" || string === "black" || string === "random";
}

export default class PreferredPlayerColorOption extends SelectOption<PreferredPlayerColor> {
  constructor(defaultValue: PreferredPlayerColor, id: string) {
    super(defaultValue, id, isPreferredPlayerColor);
  }
}
