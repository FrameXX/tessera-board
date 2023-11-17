import { reactive, watch } from "vue";
import type Piece from "../pieces/piece";
import type { RawPiece } from "../pieces/raw_piece";
import { getPieceFromRaw } from "../pieces/raw_piece";
import type { PlayerColor } from "../game";

interface ConfigPieceDialogProps {
  open: boolean;
  selectedPiece: RawPiece;
  color: PlayerColor;
}

class ConfigPieceDialog {
  private resolve?: (piece: Piece) => void;
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

  public open(): Promise<Piece> {
    this.props.open = true;
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  public confirm = () => {
    if (this.resolve) {
      this.resolve(getPieceFromRaw(this.props.selectedPiece));
      this.resolve = undefined;
    }
    this.props.open = false;
  };

  public cancel = () => {
    this.resolve = undefined;
    this.props.open = false;
  };
}

export default ConfigPieceDialog;
