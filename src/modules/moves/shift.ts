import type { Ref } from "vue";
import type {
  BoardPosition,
  BooleanBoardState,
  MarkBoardState,
} from "../../components/Board.vue";
import type { BoardPositionValue, PieceId } from "../pieces/piece";
import type { BoardStateValue } from "../user_data/board_state";
import Move from "./move";
import { CHAR_INDEXES } from "../board_manager";

class Shift extends Move {
  constructor(
    pieceId: string,
    private readonly origin: BoardPosition,
    private readonly target: BoardPosition,
    private readonly captures?: BoardPositionValue,
    private readonly onPerform?: (move: Move) => void
  ) {
    const notation = `{${pieceId}}${CHAR_INDEXES[target.col - 1]}${target.row}`;
    super("shift", notation);
  }

  public perform(
    boardStateValue: BoardStateValue,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    higlightedCells: BooleanBoardState
  ): void {
    if (this.captures)
      this.capturePieces(
        [this.captures],
        boardStateValue,
        blackCapturedPieces,
        whiteCapturedPieces
      );
    const originValue = boardStateValue[this.origin.row][this.origin.col];
    boardStateValue[this.origin.row][this.origin.col] = null;
    boardStateValue[this.target.row][this.target.col] = originValue;
    higlightedCells[this.origin.row][this.origin.col] = true;
    higlightedCells[this.target.row][this.target.col] = true;
    if (this.onPerform) this.onPerform(this);
  }

  public getClickablePositions(): BoardPosition[] {
    return [this.target];
  }

  public showCellMarks(cellMarks: MarkBoardState): void {
    cellMarks[this.target.row][this.target.col] = "availible";
    if (this.captures)
      cellMarks[this.captures.row][this.captures.col] = "capture";
  }
}

export default Shift;
