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

  public getCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];

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
          const piece = boardStateValue[target.row][target.col];
          if (piece) {
            if (piece.color === this.color) {
              break;
            }
          }
          capturingPositions.push(target);
          if (piece) {
            break;
          }
        }
      }
    }

    return capturingPositions;
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[] {
    const moves: Move[] = [];
    const capturingPositions = this.getCapturingPositions(
      position,
      boardStateValue
    );

    for (const target of capturingPositions) {
      let captures: BoardPositionValue | undefined = undefined;
      const piece = boardStateValue[target.row][target.col];
      if (piece) captures = { ...target, value: piece };
      moves.push(new Shift(this.pieceId, position, target, captures));
    }

    return moves;
  }
}

export default Rook;
