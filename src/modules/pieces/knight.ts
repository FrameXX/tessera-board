import type { BoardPosition } from "../../components/Board.vue";
import type { PlayerColor } from "../game";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import type { BoardStateValue } from "../user_data/board_state";
import Piece, { isFriendlyPiece } from "./piece";
import type {
  BoardPositionValue} from "./piece";
import {
  getDeltaPosition,
  isPositionOnBoard,
} from "./piece";

export class Knight extends Piece {
  constructor(color: PlayerColor, id?: string) {
    super(color, "knight", id);
  }

  public getNewCapturingPositions(position: BoardPosition): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];
    for (const colDelta of [-2, -1, 1, 2]) {
      for (const rowDelta of [-2, -1, 1, 2]) {
        if (Math.abs(colDelta) === Math.abs(rowDelta)) {
          continue;
        }
        const target = getDeltaPosition(position, colDelta, rowDelta);
        if (!isPositionOnBoard(target)) {
          continue;
        }
        capturingPositions.push(target);
      }
    }
    return capturingPositions;
  }

  public getNewPossibleMoves(
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
      if (isFriendlyPiece(piece, this.color)) {
        continue;
      }
      if (piece) {
        captures = { ...target, value: piece };
      }
      moves.push(new Shift(this.pieceId, position, target, captures));
    }

    return moves;
  }

  public loadCustomProps(): void {}
}

export default Knight;
