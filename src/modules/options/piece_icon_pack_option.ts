import SelectOption from "./select_option";

export type PieceIconPack =
  | "material_design"
  | "font_awesome"
  | "tabler"
  | "game";
export function isPieceIconPack(string: string): string is PieceIconPack {
  return (
    string === "material_design" ||
    string === "font_awesome" ||
    string === "tabler" ||
    string === "game"
  );
}

export default class PieceIconPackOption extends SelectOption<PieceIconPack> {
  constructor(defaultValue: PieceIconPack) {
    super(defaultValue, "piece-icon-pack", isPieceIconPack);
  }
}
