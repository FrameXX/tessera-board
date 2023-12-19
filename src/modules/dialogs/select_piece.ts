import { reactive } from "vue";
import type { RawPiece } from "../pieces/raw_piece";
import type ToastManager from "../toast_manager";

interface SelectPieceDialogProps {
  open: boolean;
  selectedPiece: RawPiece | null;
  pieceOptions: RawPiece[];
}

export class SelectPieceDialogError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, SelectPieceDialogError.prototype);
    this.name = SelectPieceDialogError.name;
  }
}

class SelectPieceDialog {
  private resolve?: (piece: RawPiece | null) => void;
  public props: SelectPieceDialogProps;

  constructor(private readonly toastManager: ToastManager) {
    this.props = reactive({
      open: false,
      selectedPiece: null,
      pieceOptions: [],
    });
  }

  public open(pieceOptions: RawPiece[]): Promise<RawPiece | null> {
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
    if (!this.resolve) {
      throw new SelectPieceDialogError(
        "Cannot confirm dialog. No resolve function is availible."
      );
    }
    if (!this.props.selectedPiece) {
      this.toastManager.showToast(
        "Please select one of the pieces by clicking on them.",
        "alert-circle-outline",
        "error"
      );
      return;
    }
    this.resolve(this.props.selectedPiece);
    this.resolve = undefined;
    this.props.open = false;
  };

  public cancel = () => {
    if (!this.resolve) {
      throw new SelectPieceDialogError(
        "Cannot confirm dialog. No resolve function is availible."
      );
    }
    this.resolve(null);
    this.resolve = undefined;
    this.props.open = false;
  };
}

export default SelectPieceDialog;
