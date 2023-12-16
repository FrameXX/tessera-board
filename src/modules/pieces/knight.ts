import type { PieceContext, BoardPosition } from "../board_manager";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import {
  getDiffPosition,
  isFriendlyPiece,
  isPositionOnBoard,
  type PlayerColor,
} from "../utils/game";
import Piece from "./piece";
import Game from "../game";

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
