import { BoardPosition } from "../../components/Board.vue";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import { BoardStateValue } from "../user_data/board_state";
import Piece from "./piece";
import {
  BoardPositionValue,
  PlayerColor,
  getTarget,
  isTargetOnBoard,
} from "./piece";

export class Knight extends Piece {
  constructor(color: PlayerColor) {
    super(color, "knight");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[] {
    const moves: Move[] = [];

    for (const colDelta of [-2, -1, 1, 2]) {
      for (const rowDelta of [-2, -1, 1, 2]) {
        if (Math.abs(colDelta) === Math.abs(rowDelta)) {
          continue;
        }
        const target = getTarget(position, colDelta, rowDelta);
        if (!isTargetOnBoard(target)) {
          continue;
        }
        let captures: BoardPositionValue | undefined = undefined;
        const piece = boardStateValue[target.row][target.col];
        if (piece) {
          if (piece.color !== this.color) {
            captures = { ...target, value: piece };
          } else {
            continue;
          }
        }

        moves.push(new Shift(this.pieceId, position, target, captures));
      }
    }

    return moves;
  }
}

export default Knight;
