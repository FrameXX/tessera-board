import SelectOption from "./select_option";

export type PlayerColor = "white" | "black";
export function isPlayerColor(string: string): string is PlayerColor {
  return string === "white" || string === "black";
}

export default class PlayerColorOption extends SelectOption<PlayerColor> {
  constructor(defaultValue: PlayerColor, id: string) {
    super(defaultValue, id, isPlayerColor);
  }
}
