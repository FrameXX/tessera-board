import type { Ref } from "vue";
import SelectUserData from "./select_user_data";
import type ToastManager from "../toast_manager";

export type PieceIconPack = "material_design" | "font_awesome" | "tabler";
function ispieceIconPackValue(string: string): string is PieceIconPack {
  return (
    string === "material_design" ||
    string === "font_awesome" ||
    string === "tabler"
  );
}

class PieceIconPackData extends SelectUserData<PieceIconPack> {
  constructor(
    value: PieceIconPack,
    valueRef: Ref<PieceIconPack>,
    toastManager: ToastManager
  ) {
    super("piece_set", value, ispieceIconPackValue, toastManager, valueRef);
  }

  public apply(): void {}
}

export default PieceIconPackData;
