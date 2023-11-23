import { ComputedRef } from "vue";
import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import type { PlayerColor } from "../game";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import Piece, { getBoardPositionPiece, isFriendlyPiece } from "./piece";
import { getDeltaPosition, isPositionOnBoard } from "./piece";

export class Bishop extends Piece {
  constructor(color: PlayerColor, id?: string) {
    super(color, "bishop", id);
  }

  public getNewCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];
    for (const colDelta of [-1, 1]) {
      for (const rowDelta of [-1, 1]) {
        let totalColDelta = 0;
        let totalRowDelta = 0;

        let piece = null;
        do {
          totalColDelta += colDelta;
          totalRowDelta += rowDelta;
          const target = getDeltaPosition(
            position,
            totalColDelta,
            totalRowDelta
          );
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
    lastMove: ComputedRef<Move>
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
      if (piece) captures = { ...target, piece: piece };
      moves.push(new Shift(this.pieceId, position, target, captures));
    }

    return moves;
  }

  public loadCustomProps(): void {}
}

export default Bishop;
