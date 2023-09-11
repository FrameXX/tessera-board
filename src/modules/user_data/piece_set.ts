import type { Ref } from "vue";
import UserData from "./user_data";
import type ToastManager from "../toast_manager";

export type PieceSetValue = "material_design" | "font_awesome";
function isPieceSetValue(string: string): string is PieceSetValue {
  return string === "material_design" || string === "font_awesome";
}

export const PIECE_SETS_DIR = "assets/img/";
export const DEFAULT_PIECE_SET_VALUE: PieceSetValue = "material_design";

class PieceSetData extends UserData<PieceSetValue> {
  constructor(
    value: PieceSetValue,
    valueRef: Ref<PieceSetValue>,
    toastManager: ToastManager
  ) {
    super("piece_set", value, toastManager, valueRef);
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
