import type { BoardPosition } from "../../components/Board.vue";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import { BoardStateValue } from "../user_data/board_state";
import Piece from "./piece";
import {
  type BoardPositionValue,
  type PlayerColor,
  getTarget,
  isTargetOnBoard,
} from "./piece";

export class Bishop extends Piece {
  constructor(color: PlayerColor) {
    super(color, "bishop");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[] {
    const moves: Move[] = [];

    // Check row
    for (const xDelta of [-1, 1]) {
      for (const yDelta of [-1, 1]) {
        let totalXDelta = 0;
        let totalYDelta = 0;
        while (true) {
          totalXDelta += xDelta;
          totalYDelta += yDelta;
          const target = getTarget(position, totalXDelta, totalYDelta);
          if (!isTargetOnBoard(target)) {
            break;
          }

          let captures: BoardPositionValue | undefined = undefined;
          const piece = boardStateValue[target.row][target.col];
          if (piece) {
            if (piece.color === this.color) {
              break;
            }
            captures = { ...target, value: piece };
          }

          moves.push(new Shift(this.pieceId, position, target, captures));

          if (piece) {
            break;
          }
        }
      }
    }

    return moves;
  }
}

export default Bishop;
