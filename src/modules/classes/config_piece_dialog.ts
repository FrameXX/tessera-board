import { Ref } from "vue";
import {
  type PieceId,
  type PlayerColor,
  type Piece,
  getPieceById,
} from "./pieces";

class ConfigPieceDialog {
  private resolve?: (piece: Piece) => void;

  constructor(
    private configPieceIdRef: Ref<PieceId>,
    private configPieceColorRef: Ref<PlayerColor>,
    private showConfigPieceDialogRef: Ref<boolean>
  ) {}

  public onConfirm() {
    if (this.resolve) {
      this.resolve(
        getPieceById(
          this.configPieceIdRef.value,
          this.configPieceColorRef.value
        )
      );
      this.resolve = undefined;
      this.showConfigPieceDialogRef.value = false;
    }
  }

  public onCancel() {
    this.resolve = undefined;
    this.showConfigPieceDialogRef.value = false;
  }

  public show(): Promise<Piece> {
    this.showConfigPieceDialogRef.value = true;
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }
}

export default ConfigPieceDialog;
