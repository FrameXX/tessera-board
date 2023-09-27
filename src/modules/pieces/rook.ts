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

export class Rook extends Piece {
  constructor(color: PlayerColor) {
    super(color, "rook");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[] {
    const moves: Move[] = [];
    let piece: Piece | null;

    // Check row
    for (const axis of ["x", "y"]) {
      for (const delta of [-1, 1]) {
        let totalDelta = 0;
        while (true) {
          totalDelta += delta;
          let target: BoardPosition;
          axis === "x"
            ? (target = getTarget(position, totalDelta, 0))
            : (target = getTarget(position, 0, totalDelta));
          if (!isTargetOnBoard(target)) {
            break;
          }

          let captures: BoardPositionValue | undefined = undefined;
          piece = boardStateValue[target.row][target.col];
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

export default Rook;
