import type { BoardPosition, MarkBoardState } from "../../components/Board.vue";
import { getPositionPiece } from "../game_board_manager";
import type { BoardStateValue } from "../user_data/board_state";
import Move, { movePiece, movePositionValue } from "./move";

export function isMoveCastling(move: Move): move is Castling {
  return move.moveId == "castling";
}

class Castling extends Move {
  constructor(
    private readonly king: boolean,
    private readonly kingSide: boolean,
    private readonly kingOrigin: BoardPosition,
    private readonly kingTarget: BoardPosition,
    private readonly rookOrigin: BoardPosition,
    private readonly rookTarget: BoardPosition,
    private readonly onPerform?: (move: Move) => void
  ) {
    super("castling");
  }

  get highlightedBoardPositions() {
    return [this.kingOrigin, this.kingTarget, this.rookOrigin, this.rookTarget];
  }

  public forward(boardStateValue: BoardStateValue): void {
    this.onPerformForward();

    const king = getPositionPiece(this.kingOrigin, boardStateValue);
    const rook = getPositionPiece(this.rookOrigin, boardStateValue);

    movePositionValue(king, this.kingOrigin, this.kingTarget, boardStateValue);
    movePositionValue(rook, this.rookOrigin, this.rookTarget, boardStateValue);

    this.performed = true;
  }

  public reverse(boardStateValue: BoardStateValue): void {
    this.onPerformReverse();

    const king = getPositionPiece(this.kingTarget, boardStateValue);
    const rook = getPositionPiece(this.rookTarget, boardStateValue);

    movePositionValue(king, this.kingOrigin, this.kingTarget, boardStateValue);
    movePositionValue(rook, this.rookOrigin, this.rookTarget, boardStateValue);

    this.performed = false;
  }

  public async perform(
    boardStateValue: BoardStateValue,
    audioEffects: boolean,
    moveAudioEffect: Howl
  ): Promise<void> {
    this.onPerformForward();

    movePiece(this.kingOrigin, this.kingTarget, boardStateValue);
    await movePiece(this.rookOrigin, this.rookTarget, boardStateValue);
    if (audioEffects) moveAudioEffect.play();

    this.notation = this.kingSide ? "0-0" : "0-0-0";

    if (this.onPerform) this.onPerform(this);
    this.performed = true;
  }

  public get clickablePositions(): BoardPosition[] {
    if (this.king) {
      return [this.kingTarget, this.rookOrigin];
    } else {
      return [this.kingOrigin];
    }
  }

  public showCellMarks(cellMarks: MarkBoardState): void {
    if (this.king) {
      cellMarks[this.kingTarget.row][this.kingTarget.col] = "availible";
      cellMarks[this.rookOrigin.row][this.rookOrigin.col] = "capture";
    } else {
      cellMarks[this.kingOrigin.row][this.kingOrigin.col] = "capture";
    }
  }
}

export default Castling;
