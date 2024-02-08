import { reactive } from "vue";
import type { RawPiece } from "../pieces/raw_piece";
import type Toaster from "../toaster/toaster";

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
  private resolve?: (piece: RawPiece) => void;
  public props: SelectPieceDialogProps;

  constructor(private readonly toaster: Toaster) {
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
    if (!this.resolve) {
      throw new SelectPieceDialogError(
        "Cannot confirm dialog. No resolve function is availible."
      );
    }
    if (!this.props.selectedPiece) {
      this.toaster.bake(
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
    this.toaster.bake(
      "Promotion cannot be canceled. You can undo the move after it's complete.",
      "cancel",
      "error"
    );
  };
}

export default SelectPieceDialog;
