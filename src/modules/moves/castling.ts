import type { BoardPosition, MarkBoardState } from "../../components/Board.vue";
import type { BoardStateValue } from "../user_data/board_state";
import Move, { movePositionValue } from "./move";

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

  public async perform(
    boardStateValue: BoardStateValue,
    audioEffects: boolean,
    moveAudioEffect: Howl
  ): Promise<string> {
    movePositionValue(this.kingOrigin, this.kingTarget, boardStateValue);
    await movePositionValue(this.rookOrigin, this.rookTarget, boardStateValue);
    if (audioEffects) moveAudioEffect.play();

    if (this.onPerform) this.onPerform(this);

    let notation: string;
    this.kingSide ? (notation = "0-0") : (notation = "0-0-0");
    return notation;
  }

  public getClickablePositions(): BoardPosition[] {
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
