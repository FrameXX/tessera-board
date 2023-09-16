import type { Ref } from "vue";
import { SelectUserData } from "./user_data";
import type ToastManager from "../toast_manager";

export type PieceSetValue = "material_design" | "font_awesome";
function isPieceSetValue(string: string): string is PieceSetValue {
  return string === "material_design" || string === "font_awesome";
}

class PieceSetData extends SelectUserData<PieceSetValue> {
  constructor(
    value: PieceSetValue,
    valueRef: Ref<PieceSetValue>,
    toastManager: ToastManager
  ) {
    super("piece_set", value, isPieceSetValue, toastManager, valueRef);
  }

  public apply(): void {}
}

export default PieceSetData;
