import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import Castling from "../moves/castling";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import {
  getBoardPositionPiece,
  getDiffPosition,
  getRawPiece,
  isFriendlyPiece,
  isPositionOnBoard,
  type PlayerColor,
} from "../utils/game";
import Piece from "./piece";
import { type RawPiece } from "./raw_piece";
import { isPieceRook } from "./rook";
// import { isPieceRook } from "./rook";

interface RawKing extends RawPiece {
  moved: boolean;
  castled: boolean;
}

function isRawKing(rawPiece: RawPiece): rawPiece is RawKing {
  return (
    typeof rawPiece.moved === "boolean" && typeof rawPiece.castled === "boolean"
  );
}

export function isPieceKing(piece: Piece): piece is King {
  return piece.pieceId === "king";
}

export class King extends Piece {
  public moved: boolean = false;
  public castled: boolean = false;

  constructor(color: PlayerColor, id?: string) {
    super(color, "king", id, true);
  }

  public getRawPiece(): RawKing {
    return {
      ...getRawPiece(this),
      moved: this.moved,
      castled: this.castled,
    };
  }

  public loadCustomProps(rawPiece: RawPiece): void {
    if (!isRawKing(rawPiece)) {
      console.error("Given raw piece is not a rawKing. No props were loaded.");
      return;
    }
    this.moved = rawPiece.moved;
    this.castled = rawPiece.castled;
  }

  public getNewCapturingPositions(position: BoardPosition): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];
    for (const colDiff of [-1, 0, 1]) {
      for (const rowDiff of [-1, 0, 1]) {
        if (colDiff === 0 && rowDiff === 0) {
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
    boardStateValue: BoardStateValue
  ): Move[] {
    const moves: Move[] = [];
    const capturingPositions = this.getNewCapturingPositions(position);

    for (const target of capturingPositions) {
      let captures: BoardPieceProps | undefined = undefined;
      const piece = boardStateValue[target.row][target.col];
      if (isFriendlyPiece(piece, this.color)) {
        continue;
      }
      if (piece) captures = { ...target, piece: piece };
      moves.push(new Shift(this.pieceId, position, target, captures, this.id));
    }

    // https://en.wikipedia.org/wiki/Castling
    if (!this.moved && !this.castled) {
      for (const colDiff of [-1, 1]) {
        let kingTarget: BoardPosition | null = null;
        let rookTarget: BoardPosition | null = null;
        let totalColDiff = 0;
        while (true) {
          totalColDiff += colDiff;
          const searchRookPosition = getDiffPosition(
            position,
            totalColDiff,
            position.row
          );
          if (!isPositionOnBoard(searchRookPosition)) break;
          // Rook moves on the other side of the moved king
          if (Math.abs(totalColDiff) === 1) {
            rookTarget = searchRookPosition;
          }
          // King moves 2 cells in rook direction
          if (Math.abs(totalColDiff) === 2) {
            kingTarget = searchRookPosition;
          }
          const piece = getBoardPositionPiece(
            searchRookPosition,
            boardStateValue
          );
          if (!piece) continue;
          // There is wrong piece in way. Castling cannot be performed.
          if (
            !isPieceRook(piece) ||
            piece.color !== this.color ||
            !rookTarget ||
            !kingTarget
          )
            break;
          if (piece.castled || piece.moved) break;
          moves.push(
            new Castling(
              true,
              colDiff === 1,
              position,
              kingTarget,
              searchRookPosition,
              rookTarget,
              this.id
            )
          );
        }
      }
    }

    return moves;
  }
}

export default King;
