import type { BoardPosition } from "../../components/Board.vue";
import type { PlayerColor } from "../game";
import Castling from "../moves/castling";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import type { BoardStateValue } from "../user_data/board_state";
import Piece, {
  getDeltaPosition,
  isPositionOnBoard,
  isFriendlyPiece,
  type BoardPositionValue,
  getBoardPositionPiece,
} from "./piece";
import { type RawPiece, getRawPiece } from "./rawPiece";
import { isPieceRook } from "./rook";

interface RawKing extends RawPiece {
  hasMoved: boolean;
  hasCastled: boolean;
}

function isRawKing(rawPiece: RawPiece): rawPiece is RawKing {
  return (
    typeof rawPiece.hasMoved === "boolean" &&
    typeof rawPiece.hasCastled === "boolean"
  );
}

export function isPieceKing(piece: Piece): piece is King {
  return piece.pieceId === "king";
}

export class King extends Piece {
  public hasMoved: boolean = false;
  public hasCastled: boolean = false;

  constructor(color: PlayerColor, id?: string) {
    super(color, "king", id, true);
  }

  public dumpObject(): object {
    return {
      ...getRawPiece(this),
      hasMoved: this.hasMoved,
      hasCastled: this.hasCastled,
    };
  }

  public loadCustomProps(rawPiece: RawPiece): void {
    if (!isRawKing(rawPiece)) {
      console.error("Given raw piece is not a rawKing. No props were loaded.");
      return;
    }
    this.hasMoved = rawPiece.hasMoved;
    this.hasCastled = rawPiece.hasCastled;
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
      let captures: BoardPositionValue | undefined = undefined;
      const piece = boardStateValue[target.row][target.col];
      if (isFriendlyPiece(piece, this.color)) {
        continue;
      }
      if (piece) captures = { ...target, value: piece };
      moves.push(
        new Shift(
          this.pieceId,
          position,
          target,
          captures,
          () => (this.hasMoved = true)
        )
      );
    }

    // https://en.wikipedia.org/wiki/Castling
    if (!this.hasMoved && !this.hasCastled) {
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
          if (piece.hasCastled || piece.hasMoved) break;
          moves.push(
            new Castling(
              true,
              colDelta === 1,
              position,
              kingTarget,
              searchRookPosition,
              rookTarget,
              () => {
                this.hasCastled = true;
              }
            )
          );
        }
      }
    }

    return moves;
  }
}

export default King;
