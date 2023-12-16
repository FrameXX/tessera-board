import type {
  PieceContext,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import {
  getDiffPosition,
  getBoardPositionValue,
  isFriendlyPiece,
  isPositionOnBoard,
  type PlayerColor,
} from "../utils/game";
import Piece from "./piece";
import Game from "../game";

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
          piece = getBoardPositionValue(target, boardStateValue);
          capturingPositions.push(target);
        } while (piece === null);
      }
    }
    return capturingPositions;
  }

  public getNewPossibleMoves(position: BoardPosition, game: Game): Move[] {
    const moves: Move[] = [];
    const capturingPositions = this.getCapturingPositions(
      position,
      game.boardState
    );

    for (const target of capturingPositions) {
      let captures: PieceContext | undefined = undefined;
      const piece = game.boardState[target.row][target.col];
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
