import type Move from "../moves/move";
import Shift, { isMoveShift } from "../moves/shift";
import Promotion from "../moves/promotion";
import type { RawPiece } from "./raw_piece";
import type { PieceContext, BoardPosition } from "../board_manager";
import {
  getDiffPosition,
  getBoardPositionValue,
  getRawPiece,
  isFriendlyPiece,
  type PlayerColor,
  getBoardPositionPiece,
} from "../utils/game";
import Piece from "./piece";
import type Game from "../game";

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
    for (const colDiff of [1, -1]) {
      const target = getDiffPosition(
        position,
        colDiff,
        this.color === "white" ? 1 : -1
      );
      capturingPositions.push(target);
    }
    return capturingPositions;
  }

  public getNewPossibleMoves(position: BoardPosition, game: Game): Move[] {
    const moves: Move[] = [];

    // Move one cell forward
    for (let rowDiff of [1, 2]) {
      if (rowDiff === 2 && this.moved) {
        break;
      }
      if (this.color === "black") rowDiff = rowDiff * -1;
      const target = getDiffPosition(position, 0, rowDiff);
      if (getBoardPositionValue(target, game.boardState)) {
        break;
      }
      if (
        ((target.row === 7 && this.color === "white") ||
          (target.row === 0 && this.color === "black")) &&
        Math.abs(rowDiff) === 1
      ) {
        moves.push(
          new Promotion(
            this,
            position,
            target,
            this.transformOptions,
            undefined,
            this.id
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
      game.boardState
    );
    for (const target of capturingPositions) {
      const piece = getBoardPositionValue(target, game.boardState);
      if (!piece) {
        continue;
      }
      if (isFriendlyPiece(piece, this.color)) {
        continue;
      }
      const captures: PieceContext = {
        ...target,
        piece: piece,
      };
      if (
        (target.row === 7 && this.color === "white") ||
        (target.row === 0 && this.color === "black")
      ) {
        moves.push(
          new Promotion(
            this,
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

    if (!game.lastMove.value) return moves;
    if (!isMoveShift(game.lastMove.value)) return moves;
    const lastShift = game.lastMove.value;

    const moveRowDiff = lastShift.target.row - lastShift.origin.row;
    if (Math.abs(moveRowDiff) !== 2) return moves;
    const targetPawnAbsColDiff = Math.abs(lastShift.target.col - position.col);
    const targetPawnAbsRowDiff = Math.abs(lastShift.target.row - position.row);
    if (targetPawnAbsColDiff !== 1 || targetPawnAbsRowDiff !== 0) return moves;

    const targetRow = lastShift.target.row + (moveRowDiff === 2 ? -1 : 1);
    const capturedPiece = getBoardPositionPiece(
      lastShift.target,
      game.boardState
    );
    moves.push(
      new Shift(
        this.pieceId,
        position,
        {
          row: targetRow,
          col: lastShift.target.col,
        },
        {
          row: lastShift.target.row,
          col: lastShift.target.col,
          piece: capturedPiece,
        },
        this.id
      )
    );

    return moves;
  }
}

export default Pawn;
