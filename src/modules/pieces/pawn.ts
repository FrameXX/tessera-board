import type Move from "../moves/move";
import Shift from "../moves/shift";
import Promotion from "../moves/promotion";
import Piece, { getBoardPositionPiece, isFriendlyPiece } from "./piece";
import { getDeltaPosition } from "./piece";
import type { RawPiece } from "./raw_piece";
import { getRawPiece } from "./raw_piece";
import type { PlayerColor } from "../game";
import {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";

interface RawPawn extends RawPiece {
  moved: boolean;
}

function isRawPawn(rawPiece: RawPiece): rawPiece is RawPawn {
  return typeof rawPiece.moved === "boolean";
}

export class Pawn extends Piece {
  private moved: boolean = false;

  constructor(color: PlayerColor, id?: string) {
    super(color, "pawn", id, false);
  }

  private get transformOptions(): [RawPiece, ...RawPiece[]] {
    return [
      { pieceId: "queen", color: this.color },
      { pieceId: "rook", color: this.color },
      { pieceId: "bishop", color: this.color },
      { pieceId: "knight", color: this.color },
    ];
  }

  public getRawPiece(): RawPawn {
    return { ...getRawPiece(this), moved: this.moved };
  }

  public loadCustomProps(rawPiece: RawPiece): void {
    if (!isRawPawn(rawPiece)) {
      console.error("Given raw piece is not a rawPawn. No props were loaded.");
      return;
    }
    this.moved = rawPiece.moved;
  }

  public getNewCapturingPositions(position: BoardPosition): BoardPosition[] {
    const capturingPositions: BoardPosition[] = [];
    for (const colDelta of [1, -1]) {
      const target = getDeltaPosition(
        position,
        colDelta,
        this.color === "white" ? 1 : -1
      );
      capturingPositions.push(target);
    }
    return capturingPositions;
  }

  public getNewPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[] {
    const moves: Move[] = [];

    // Move one cell forward
    for (let rowDelta of [1, 2]) {
      if (rowDelta === 2 && this.moved) {
        break;
      }
      if (this.color === "black") rowDelta = rowDelta * -1;
      const target = getDeltaPosition(position, 0, rowDelta);
      if (getBoardPositionPiece(target, boardStateValue)) {
        break;
      }
      if (
        ((target.row === 7 && this.color === "white") ||
          (target.row === 0 && this.color === "black")) &&
        Math.abs(rowDelta) === 1
      ) {
        moves.push(
          new Promotion(
            this.pieceId,
            this.color,
            position,
            target,
            this.transformOptions
          )
        );
        break;
      } else {
        moves.push(
          new Shift(this.pieceId, position, target, undefined, this.id)
        );
      }
    }

    // Capture
    const capturingPositions = this.getCapturingPositions(
      position,
      boardStateValue
    );
    for (const target of capturingPositions) {
      const piece = getBoardPositionPiece(target, boardStateValue);
      if (!piece) {
        continue;
      }
      if (isFriendlyPiece(piece, this.color)) {
        continue;
      }
      const captures: BoardPieceProps = {
        ...target,
        piece: piece,
      };
      if (
        (target.row === 7 && this.color === "white") ||
        (target.row === 0 && this.color === "black")
      ) {
        moves.push(
          new Promotion(
            this.pieceId,
            this.color,
            position,
            target,
            this.transformOptions,
            captures,
            this.id
          )
        );
      } else {
        moves.push(
          new Shift(this.pieceId, position, target, captures, this.id)
        );
      }
    }

    return moves;
  }
}

export default Pawn;
