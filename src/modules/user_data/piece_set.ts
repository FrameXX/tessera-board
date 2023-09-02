import type { Ref } from "vue";
import UserData from "./user_data";

export type PieceSetValue = "material_design" | "font_awesome";
function isPieceSetValue(string: string): string is PieceSetValue {
  return string === "material_design" || string === "font_awesome";
}

export const DEFAULT_PIECE_SET_VALUE: PieceSetValue = "material_design";

class PieceSetData extends UserData<PieceSetValue> {
  constructor(value: PieceSetValue, valueRef: Ref<PieceSetValue>) {
    super("piece_set", value, valueRef);
  }

  public load(dumped: string): void {
    if (isPieceSetValue(dumped)) {
      this.value = dumped;
    } else {
      this.handleInvalidLoadValue(dumped);
    }
  }

  public dump(): string {
    return this.value;
  }

  public apply(): void {}
}

export default PieceSetData;
