import type { BoardPosition } from "../../components/Board.vue";
import type Move from "../moves/move";
import Shift from "../moves/shift";
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
    for (let yDelta of [1, 2]) {
      if (this.color === "black") yDelta = yDelta * -1;
      const target = getTarget(position, 0, yDelta);
      if (boardStateData[target.row][target.col]) {
        break;
      }
      moves.push(
        new Shift(this.pieceId, position, target, undefined, () => {
          this.onPerformMove();
        })
      );
    }

    // Capture
    for (const xDelta of [1, -1]) {
      const target = getTarget(
        position,
        xDelta,
        this.color === "white" ? 1 : -1
      );
      const piece = boardStateData[target.row][target.col];
      if (piece) {
        const captures: BoardPositionValue = {
          ...target,
          value: piece,
        };
        if (piece.color !== this.color) {
          moves.push(
            new Shift(this.pieceId, position, target, captures, () => {
              this.onPerformMove();
            })
          );
        }
      }
    }

    return moves;
  }
}

export default Pawn;
