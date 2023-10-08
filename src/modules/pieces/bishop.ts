import type { BoardPosition } from "../../components/Board.vue";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import { BoardStateValue } from "../user_data/board_state";
import Piece, { getBoardPositionPiece, isFriendlyPiece } from "./piece";
import {
  type BoardPositionValue,
  type PlayerColor,
  getDeltaPosition,
  isTargetOnBoard,
} from "./piece";

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
        while (true) {
          totalColDelta += colDelta;
          totalRowDelta += rowDelta;
          const target = getDeltaPosition(
            position,
            totalColDelta,
            totalRowDelta
          );
          if (!isTargetOnBoard(target)) {
            break;
          }
          const piece = getBoardPositionPiece(target, boardStateValue);
          capturingPositions.push(target);
          if (piece) {
            break;
          }
        }
      }
    }
    return capturingPositions;
  }

  public getNewPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[] {
    const moves: Move[] = [];
    const capturingPositions = this.getNewCapturingPositions(
      position,
      boardStateValue
    );

    for (const target of capturingPositions) {
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

export default Bishop;
