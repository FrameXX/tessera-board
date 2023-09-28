import type { Ref } from "vue";
import type {
  BoardPosition,
  BooleanBoardState,
  MarkBoardState,
} from "../../components/Board.vue";
import type { BoardPositionValue, PieceId } from "../pieces/piece";
import type { BoardStateValue } from "../user_data/board_state";
import Move from "./move";
import { getPieceNotation, getPositionNotation } from "../board_manager";
import { capturePosition, movePositionValue } from "../game_board_manager";

export function isMoveShift(move: Move): move is Shift {
  return move.moveId == "shift";
}

class Shift extends Move {
  constructor(
    private readonly pieceId: PieceId,
    private readonly origin: BoardPosition,
    private readonly target: BoardPosition,
    private readonly captures?: BoardPositionValue,
    private readonly onPerform?: (move: Move) => void
  ) {
    super("shift");
  }

  public perform(
    boardStateValue: BoardStateValue,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    higlightedCells: BooleanBoardState
  ): string {
    if (this.captures)
      capturePosition(
        this.captures,
        boardStateValue,
        blackCapturedPieces,
        whiteCapturedPieces
      );
    movePositionValue(this.origin, this.target, boardStateValue);

    higlightedCells[this.origin.row][this.origin.col] = true;
    higlightedCells[this.target.row][this.target.col] = true;
    if (this.onPerform) this.onPerform(this);

    let notation: string;
    this.captures
      ? (notation = `${getPieceNotation(this.pieceId)}x${getPositionNotation(
          this.captures
        )}`)
      : (notation = `${getPieceNotation(this.pieceId)}${getPositionNotation(
          this.target
        )}`);
    return notation;
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
