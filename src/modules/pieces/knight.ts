import type { ComputedRef } from "vue";
import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import {
  getDiffPosition,
  isFriendlyPiece,
  isPositionOnBoard,
  type PlayerColor,
} from "../utils/game";
import Piece from "./piece";

export class Knight extends Piece {
  constructor(color: PlayerColor, id?: string) {
    super(color, "knight", id);
  }

  public getNewCapturingPositions(position: BoardPosition): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];
    for (const colDiff of [-2, -1, 1, 2]) {
      for (const rowDiff of [-2, -1, 1, 2]) {
        if (Math.abs(colDiff) === Math.abs(rowDiff)) {
          continue;
        }
        const target = getDiffPosition(position, colDiff, rowDiff);
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
    boardStateValue: BoardStateValue,
    lastMove: ComputedRef<Move | null>
  ): Move[] {
    const moves: Move[] = [];
    const capturingPositions = this.getCapturingPositions(
      position,
      boardStateValue,
      lastMove
    );

    for (const target of capturingPositions) {
      let captures: BoardPieceProps | undefined = undefined;
      const piece = boardStateValue[target.row][target.col];
      if (isFriendlyPiece(piece, this.color)) {
        continue;
      }
      if (piece) {
        captures = { ...target, piece: piece };
      }
      moves.push(new Shift(this.pieceId, position, target, captures));
    }

    return moves;
  }

  public loadCustomProps(): void {}
}

export default Knight;
