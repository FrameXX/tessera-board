import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import type { PlayerColor } from "../game";
import Castling from "../moves/castling";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import Piece, {
  getDeltaPosition,
  isPositionOnBoard,
  isFriendlyPiece,
  getBoardPositionPiece,
} from "./piece";
import { type RawPiece, getRawPiece } from "./raw_piece";
import { isPieceRook } from "./rook";

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
    for (const colDelta of [-1, 0, 1]) {
      for (const rowDelta of [-1, 0, 1]) {
        if (colDelta === 0 && rowDelta === 0) {
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
      for (const colDelta of [-1, 1]) {
        let kingTarget: BoardPosition | null = null;
        let rookTarget: BoardPosition | null = null;
        let totalColDelta = 0;
        while (true) {
          totalColDelta += colDelta;
          const searchRookPosition = getDeltaPosition(
            position,
            totalColDelta,
            position.row
          );
          if (!isPositionOnBoard(searchRookPosition)) break;
          // Rook moves on the other side of the moved king
          if (Math.abs(totalColDelta) === 1) {
            rookTarget = searchRookPosition;
          }
          // King moves 2 cells in rook direction
          if (Math.abs(totalColDelta) === 2) {
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
              colDelta === 1,
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
