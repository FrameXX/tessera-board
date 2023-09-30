import type { BoardPosition } from "../../components/Board.vue";
import type Move from "../moves/move";
import type { BoardStateValue } from "../user_data/board_state";
import Piece, {
  getTarget,
  isTargetOnBoard,
  isFriendlyPiece,
  getTargetPiece,
} from "./piece";
import { type PlayerColor } from "./piece";

export class King extends Piece {
  constructor(color: PlayerColor, id?: string) {
    super(color, "king", id);
  }

  public getCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];
    for (const colDelta of [-1, 0, 1]) {
      for (const rowDelta of [-1, 0, 1]) {
        if (colDelta + rowDelta === 0) {
          continue;
        }
        const target = getTarget(position, colDelta, rowDelta);
        if (!isTargetOnBoard(target)) {
          continue;
        }
        const piece = getTargetPiece(target, boardStateValue);
        if (isFriendlyPiece(piece, this.color)) {
          continue;
        }
        capturingPositions.push(target);
      }
    }
    return capturingPositions;
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[] {
    return [];
  }
}

export default King;
