import { reactive } from "vue";
import type { RawPiece } from "../pieces/raw_piece";
import type ToastManager from "../toast_manager";

interface SelectPieceDialogProps {
  open: boolean;
  selectedPiece: RawPiece | null;
  pieceOptions: RawPiece[];
}

class SelectPieceDialog {
  private resolve?: (piece: RawPiece) => void;
  public props: SelectPieceDialogProps;

  constructor(private readonly toastManager: ToastManager) {
    this.props = reactive({
      open: false,
      selectedPiece: null,
      pieceOptions: [],
    });
  }

  public open(pieceOptions: RawPiece[]): Promise<RawPiece> {
    this.props.pieceOptions = pieceOptions;
    if (pieceOptions.length > 0) {
      this.props.selectedPiece = pieceOptions[0];
    }
    this.props.open = true;
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  public confirm = () => {
    if (!this.props.selectedPiece) {
      this.toastManager.showToast(
        "Please select one of the pieces by clicking on them.",
        "alert-circle-outline",
        "error"
      );
      return;
    }
    if (this.resolve) this.resolve(this.props.selectedPiece);
    this.props.open = false;
  };

  public cancel = () => {
    this.toastManager.showToast(
      "Cannot cancel. Please select one of the pieces.",

      "cancel"
    );
  };
}

export default SelectPieceDialog;
