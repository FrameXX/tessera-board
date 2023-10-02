import { BoardPosition } from "../../components/Board.vue";
import Castling from "../moves/castling";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import { BoardStateValue } from "../user_data/board_state";
import Piece, {
  type Path,
  getBoardPositionPiece,
  isFriendlyPiece,
  targetWillBeCaptured,
} from "./piece";
import {
  BoardPositionValue,
  PlayerColor,
  getDeltaPosition,
  isTargetOnBoard,
} from "./piece";
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

export class Rook extends Piece {
  private hasMoved: boolean = false;
  private hasCastled: boolean = false;

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
          if (!isTargetOnBoard(target)) {
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
    opponentCapturingPaths: Path[]
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

    return moves;
  }
}

export default Rook;
