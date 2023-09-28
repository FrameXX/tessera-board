import type { BoardPosition } from "../../components/Board.vue";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import Transform from "../moves/transform";
import type { BoardStateValue } from "../user_data/board_state";
import Piece, { BoardPositionValue } from "./piece";
import { type PlayerColor, getTarget } from "./piece";
import { RawPiece, getRawPiece } from "./rawPiece";

interface RawPawn extends RawPiece {
  hasMoved: boolean;
}

function isRawPawn(rawPiece: RawPiece): rawPiece is RawPawn {
  return typeof rawPiece.hasPiece !== "boolean";
}

export class Pawn extends Piece {
  private hasMoved: boolean = false;

  constructor(color: PlayerColor) {
    super(color, "pawn");
  }

  private get transformOptions(): [RawPiece, ...RawPiece[]] {
    return [
      { pieceId: "queen", color: this.color },
      { pieceId: "rook", color: this.color },
      { pieceId: "bishop", color: this.color },
      { pieceId: "knight", color: this.color },
    ];
  }

  public onPerformMove(): void {
    this.hasMoved = true;
  }

  public dumpObject(): object {
    return { ...getRawPiece(this), hasMoved: this.hasMoved };
  }

  public loadCustomProps(rawPiece: RawPiece): void {
    if (!isRawPawn(rawPiece)) {
      console.error("Given raw piece is not a rawPawn. No props were loaded.");
      return;
    }
    this.hasMoved = rawPiece.hasMoved;
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateData: BoardStateValue
  ): Move[] {
    const moves: Move[] = [];

    // Move one cell forward
    for (let rowDelta of [1, 2]) {
      if (rowDelta === 2 && this.hasMoved) {
        break;
      }
      if (this.color === "black") rowDelta = rowDelta * -1;
      const target = getTarget(position, 0, rowDelta);
      if (boardStateData[target.row][target.col]) {
        break;
      }
      if (
        ((target.row === 7 && this.color === "white") ||
          (target.row === 0 && this.color === "black")) &&
        Math.abs(rowDelta) === 1
      ) {
        moves.push(
          new Transform(this.pieceId, position, target, this.transformOptions)
        );
        break;
      } else {
        moves.push(
          new Shift(this.pieceId, position, target, undefined, () => {
            this.onPerformMove();
          })
        );
      }
    }

    // Capture
    for (const colDelta of [1, -1]) {
      const target = getTarget(
        position,
        colDelta,
        this.color === "white" ? 1 : -1
      );
      const piece = boardStateData[target.row][target.col];
      if (piece) {
        const captures: BoardPositionValue = {
          ...target,
          value: piece,
        };
        if (piece.color !== this.color) {
          if (
            ((target.row === 7 && this.color === "white") ||
              (target.row === 0 && this.color === "black")) &&
            Math.abs(colDelta) === 1
          ) {
            moves.push(
              new Transform(
                this.pieceId,
                position,
                target,
                this.transformOptions,
                captures
              )
            );
          } else {
            moves.push(
              new Shift(this.pieceId, position, target, captures, () => {
                this.onPerformMove();
              })
            );
          }
        }
      }
    }

    return moves;
  }
}

export default Pawn;
