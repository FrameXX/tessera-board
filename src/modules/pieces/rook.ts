import type { ComputedRef } from "vue";
import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import Castling from "../moves/castling";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import { isPieceKing } from "./king";
import { type RawPiece } from "./raw_piece";
import {
  getBoardPositionPiece,
  getDiffPosition,
  getRawPiece,
  isFriendlyPiece,
  isPositionOnBoard,
  type PlayerColor,
} from "../utils/game";
import Piece from "./piece";

interface RawRook extends RawPiece {
  moved: boolean;
  castled: boolean;
}

function isRawRook(rawPiece: RawPiece): rawPiece is RawRook {
  return (
    typeof rawPiece.moved === "boolean" && typeof rawPiece.castled === "boolean"
  );
}

export function isPieceRook(piece: Piece): piece is Rook {
  return piece.pieceId === "rook";
}

export class Rook extends Piece {
  public moved: boolean = false;
  public castled: boolean = false;

  constructor(color: PlayerColor, id?: string) {
    super(color, "rook", id);
  }

  public getRawPiece(): RawRook {
    return {
      ...getRawPiece(this),
      moved: this.moved,
      castled: this.castled,
    };
  }

  public loadCustomProps(rawPiece: RawPiece): void {
    if (!isRawRook(rawPiece)) {
      console.error("Given raw piece is not a rawRook. No props were loaded.");
      return;
    }
    this.moved = rawPiece.moved;
  }

  public getNewCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];

    for (const axis of ["x", "y"]) {
      for (const diff of [-1, 1]) {
        let totalDiff = 0;
        while (true) {
          totalDiff += diff;
          let target: BoardPosition;
          axis === "x"
            ? (target = getDiffPosition(position, totalDiff, 0))
            : (target = getDiffPosition(position, 0, totalDiff));
          if (!isPositionOnBoard(target)) {
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
      if (piece) captures = { ...target, piece: piece };
      moves.push(new Shift(this.pieceId, position, target, captures, this.id));
    }

    // https://en.wikipedia.org/wiki/Castling
    if (!this.moved && !this.castled) {
      for (const colDiff of [-1, 1]) {
        let totalColDiff = 0;
        while (true) {
          totalColDiff += colDiff;
          const searchKingPosition = getDiffPosition(
            position,
            totalColDiff,
            position.row
          );
          if (!isPositionOnBoard(searchKingPosition)) break;
          const piece = getBoardPositionPiece(
            searchKingPosition,
            boardStateValue
          );
          if (!piece) continue;
          // There is wrong piece in way. Castling cannot be performed.
          if (!isPieceKing(piece) || piece.color !== this.color) break;
          if (piece.castled || piece.moved) break;
          const kingTarget = {
            row: searchKingPosition.row,
            col: searchKingPosition.col + colDiff * -2,
          };
          const rookTarget = {
            row: kingTarget.row,
            col: kingTarget.col + colDiff,
          };
          moves.push(
            new Castling(
              false,
              colDiff === -1,
              searchKingPosition,
              kingTarget,
              position,
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

export default Rook;
