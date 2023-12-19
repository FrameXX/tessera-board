import { reactive, watch } from "vue";
import type Piece from "../pieces/piece";
import type { RawPiece } from "../pieces/raw_piece";
import { getPieceFromRaw } from "../pieces/raw_piece";
import type { PlayerColor } from "../utils/game";

export class ConfigPieceDialogError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConfigPieceDialogError.prototype);
    this.name = ConfigPieceDialogError.name;
  }
}

interface ConfigPieceDialogProps {
  open: boolean;
  selectedPiece: RawPiece;
  color: PlayerColor;
}

class ConfigPieceDialog {
  private resolve?: (piece: Piece | null) => void;
  public props: ConfigPieceDialogProps;

  constructor() {
    this.props = reactive({
      open: false,
      selectedPiece: { pieceId: "pawn", color: "white" },
      color: "white",
    });

    watch(
      () => this.props.color,
      (newValue) => {
        this.props.selectedPiece.color = newValue;
      }
    );
  }

  public open(): Promise<Piece | null> {
    this.props.open = true;
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  public confirm = () => {
    if (!this.resolve) {
      throw new ConfigPieceDialogError(
        "Cannot confirm dialog. No resolve function is availible."
      );
    }
    this.resolve(getPieceFromRaw(this.props.selectedPiece));
    this.resolve = undefined;

    this.props.open = false;
  };

  public cancel = () => {
    if (!this.resolve) {
      throw new ConfigPieceDialogError(
        "Cannot confirm dialog. No resolve function is availible."
      );
    }
    this.resolve(null);
    this.resolve = undefined;
    this.props.open = false;
  };
}

export default ConfigPieceDialog;
