import type {
  BoardPieceProps,
  BoardPosition,
} from "../../components/Board.vue";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import Promotion from "../moves/promotion";
import type { BoardStateValue } from "../user_data/board_state";
import Piece, { getBoardPositionPiece, isFriendlyPiece } from "./piece";
import { getDeltaPosition } from "./piece";
import type { RawPiece } from "./raw_piece";
import { getRawPiece } from "./raw_piece";
import type { PlayerColor } from "../game";

interface RawPawn extends RawPiece {
  hasMoved: boolean;
}

function isRawPawn(rawPiece: RawPiece): rawPiece is RawPawn {
  return typeof rawPiece.hasMoved === "boolean";
}

export class Pawn extends Piece {
  private hasMoved: boolean = false;

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
    return { ...getRawPiece(this), hasMoved: this.hasMoved };
  }

  public loadCustomProps(rawPiece: RawPiece): void {
    if (!isRawPawn(rawPiece)) {
      console.error("Given raw piece is not a rawPawn. No props were loaded.");
      return;
    }
    this.hasMoved = rawPiece.hasMoved;
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
      if (rowDelta === 2 && this.hasMoved) {
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
          new Shift(this.pieceId, position, target, undefined, () => {
            this.hasMoved = true;
          })
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
            captures
          )
        );
      } else {
        moves.push(
          new Shift(this.pieceId, position, target, captures, () => {
            this.hasMoved = true;
          })
        );
      }
    }

    return moves;
  }
}

export default Pawn;
