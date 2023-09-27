import type { Ref } from "vue";
import type {
  BoardPosition,
  BooleanBoardState,
  MarkBoardState,
} from "../../components/Board.vue";
import type Piece from "../pieces/piece";
import type { PieceId } from "../pieces/piece";
import type { BoardStateValue } from "../user_data/board_state";

type MoveId = "shift" | "castling" | "transform";

abstract class Move {
  constructor(public readonly moveId: MoveId, public notation: string) {}

  protected capturePieces(
    capturePositions: BoardPosition[],
    boardStateValue: BoardStateValue,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>
  ) {
    for (const position of capturePositions) {
      const piece = boardStateValue[position.row][position.col];
      if (!piece) {
        continue;
      }
      boardStateValue[position.row][position.col] = null;
      this.addCapturedPiece(piece, blackCapturedPieces, whiteCapturedPieces);
    }
  }

  private addCapturedPiece(
    piece: Piece,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>
  ) {
    if (piece.color === "white") {
      blackCapturedPieces.value.push(piece.pieceId);
    } else {
      whiteCapturedPieces.value.push(piece.pieceId);
    }
  }

  public abstract perform(
    boardStateValue: BoardStateValue,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    higlightedCells: BooleanBoardState
  ): void;

  public abstract getClickablePositions(): BoardPosition[];

  public abstract showCellMarks(
    cellMarks: MarkBoardState,
    boardStateValue: BoardStateValue
  ): void;
}

export default Move;
