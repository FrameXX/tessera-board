import type { ComputedRef } from "vue";
import type {
  PieceContext,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import {
  getBoardPositionPiece,
  getDiffPosition,
  isFriendlyPiece,
  isPositionOnBoard,
  type PlayerColor,
} from "../utils/game";
import Piece from "./piece";

export class Bishop extends Piece {
  constructor(color: PlayerColor, id?: string) {
    super(color, "bishop", id);
  }

  public getNewCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];
    for (const colDiff of [-1, 1]) {
      for (const rowDiff of [-1, 1]) {
        let totalColDiff = 0;
        let totalRowDiff = 0;

        let piece = null;
        do {
          totalColDiff += colDiff;
          totalRowDiff += rowDiff;
          const target = getDiffPosition(position, totalColDiff, totalRowDiff);
          if (!isPositionOnBoard(target)) {
            break;
          }
          piece = getBoardPositionPiece(target, boardStateValue);
          capturingPositions.push(target);
        } while (piece === null);
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
      let captures: PieceContext | undefined = undefined;
      const piece = boardStateValue[target.row][target.col];
      if (isFriendlyPiece(piece, this.color)) {
        continue;
      }
      if (piece) captures = { ...target, piece: piece };
      moves.push(new Shift(this.pieceId, position, target, captures));
    }

    return moves;
  }

  public loadCustomProps(): void {}
}

export default Bishop;
