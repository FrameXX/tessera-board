import { reactive } from "vue";
import { type PieceId, type PlayerColor } from "./pieces/piece";
import type Piece from "./pieces/piece";
import { getPieceFromRaw } from "./pieces/rawPiece";

interface ConfigPieceDialogProps {
  open: boolean;
  pieceId: PieceId;
  color: PlayerColor;
}

class ConfigPieceDialog {
  private resolve?: (piece: Piece) => void;
  public props: ConfigPieceDialogProps;

  constructor() {
    this.props = reactive({
      open: false,
      pieceId: "pawn",
      color: "white",
    });
  }

  public open(): Promise<Piece> {
    this.props.open = true;
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  public confirm = () => {
    if (this.resolve) {
      this.resolve(
        getPieceFromRaw({
          pieceId: this.props.pieceId,
          color: this.props.color,
        })
      );
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
