import type {
  PieceContext,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import Castling from "../moves/castling";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import { isPieceKing } from "./king";
import { type RawPiece } from "./raw_piece";
import {
  getBoardPositionValue,
  getRawPiece,
  isFriendlyPiece,
  isPositionOnBoard,
  addPositions,
  type PlayerColor,
} from "../utils/game";
import Piece from "./piece";
import type Game from "../game";

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
    boardState: BoardStateValue
  ): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];

    for (const axis of ["x", "y"]) {
      for (const colDelta of [-1, 1]) {
        let colDiff = 0;
        while (true) {
          colDiff += colDelta;
          let target: BoardPosition;
          axis === "x"
            ? (target = addPositions(position, { row: 0, col: colDiff }))
            : (target = addPositions(position, { row: colDiff, col: 0 }));
          if (!isPositionOnBoard(target)) {
            break;
          }
          const piece = getBoardPositionValue(target, boardState);
          capturingPositions.push(target);
          if (piece) {
            break;
          }
        }
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

    // https://en.wikipedia.org/wiki/Castling
    if (!this.moved && !this.castled) {
      for (const colDelta of [-1, 1]) {
        let colDiff = 0;
        while (true) {
          colDiff += colDelta;
          const searchKingPosition = addPositions(position, {
            row: 0,
            col: colDiff,
          });
          if (!isPositionOnBoard(searchKingPosition)) break;
          const piece = getBoardPositionValue(
            searchKingPosition,
            game.boardState
          );
          if (!piece) continue;
          // There is wrong piece in way. Castling cannot be performed.
          if (!isPieceKing(piece) || piece.color !== this.color) break;
          if (piece.castled || piece.moved) break;
          const kingTarget = {
            row: searchKingPosition.row,
            col: searchKingPosition.col + colDelta * -2,
          };
          const rookTarget = {
            row: kingTarget.row,
            col: kingTarget.col + colDelta,
          };
          moves.push(
            new Castling(
              false,
              colDelta === -1,
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
