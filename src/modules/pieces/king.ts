import type { BoardPosition } from "../../components/Board.vue";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import type { BoardStateValue } from "../user_data/board_state";
import Piece, {
  getTarget,
  isTargetOnBoard,
  isFriendlyPiece,
  getTargetPiece,
  type BoardPositionValue,
  type BoardPositionPath,
  targetWillBeCaptured,
} from "./piece";
import { type PlayerColor } from "./piece";

export class King extends Piece {
  constructor(color: PlayerColor, id?: string) {
    super(color, "king", id);
  }

  public getNewCapturingPositions(position: BoardPosition): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];
    for (const colDelta of [-1, 0, 1]) {
      for (const rowDelta of [-1, 0, 1]) {
        if (colDelta === 0 && rowDelta === 0) {
          continue;
        }
        const target = getTarget(position, colDelta, rowDelta);
        if (!isTargetOnBoard(target)) {
          continue;
        }
        capturingPositions.push(target);
      }
    }
    return capturingPositions;
  }

  public getNewPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue,
    opponentCapturingPositionsPaths: BoardPositionPath[]
  ): Move[] {
    const moves: Move[] = [];
    const capturingPositions = this.getNewCapturingPositions(position);

    for (const target of capturingPositions) {
      if (targetWillBeCaptured(target, opponentCapturingPositionsPaths)) {
        continue;
      }
      let captures: BoardPositionValue | undefined = undefined;
      const piece = boardStateValue[target.row][target.col];
      if (isFriendlyPiece(piece, this.color)) {
        continue;
      }
      if (piece) captures = { ...target, value: piece };
      moves.push(new Shift(this.pieceId, position, target, captures));
    }

    return moves;
  }
}

export default King;
