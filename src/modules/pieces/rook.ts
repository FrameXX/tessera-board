import type { BoardPosition } from "../../components/Board.vue";
import type { PlayerColor } from "../game";
import Castling from "../moves/castling";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import type { BoardStateValue } from "../user_data/board_state";
import { isPieceKing } from "./king";
import Piece, { getBoardPositionPiece, isFriendlyPiece } from "./piece";
import type { BoardPositionValue } from "./piece";
import { getDeltaPosition, isPositionOnBoard } from "./piece";
import { getRawPiece, type RawPiece } from "./rawPiece";

interface RawRook extends RawPiece {
  hasMoved: boolean;
  hasCastled: boolean;
}

function isRawRook(rawPiece: RawPiece): rawPiece is RawRook {
  return (
    typeof rawPiece.hasMoved === "boolean" &&
    typeof rawPiece.hasCastled === "boolean"
  );
}

export function isPieceRook(piece: Piece): piece is Rook {
  return piece.pieceId === "rook";
}

export class Rook extends Piece {
  public hasMoved: boolean = false;
  public hasCastled: boolean = false;

  constructor(color: PlayerColor, id?: string) {
    super(color, "rook", id);
  }

  public dumpObject(): object {
    return {
      ...getRawPiece(this),
      hasMoved: this.hasMoved,
      hasCastled: this.hasCastled,
    };
  }

  public loadCustomProps(rawPiece: RawPiece): void {
    if (!isRawRook(rawPiece)) {
      console.error("Given raw piece is not a rawRook. No props were loaded.");
      return;
    }
    this.hasMoved = rawPiece.hasMoved;
  }

  public getNewCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];

    for (const axis of ["x", "y"]) {
      for (const delta of [-1, 1]) {
        let totalDelta = 0;
        while (true) {
          totalDelta += delta;
          let target: BoardPosition;
          axis === "x"
            ? (target = getDeltaPosition(position, totalDelta, 0))
            : (target = getDeltaPosition(position, 0, totalDelta));
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
    boardStateValue: BoardStateValue
  ): Move[] {
    const moves: Move[] = [];
    const capturingPositions = this.getCapturingPositions(
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
      moves.push(
        new Shift(this.pieceId, position, target, captures, () => {
          this.hasMoved = true;
        })
      );
    }

    // https://en.wikipedia.org/wiki/Castling
    if (!this.hasMoved && !this.hasCastled) {
      for (const colDelta of [-1, 1]) {
        let totalColDelta = 0;
        while (true) {
          totalColDelta += colDelta;
          const searchKingPosition = getDeltaPosition(
            position,
            totalColDelta,
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
          if (piece.hasCastled || piece.hasMoved) break;
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

export default Rook;
