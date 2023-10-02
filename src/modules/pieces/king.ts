import type { BoardPosition } from "../../components/Board.vue";
import Castling from "../moves/castling";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import type { BoardStateValue } from "../user_data/board_state";
import Piece, {
  getDeltaPosition,
  isTargetOnBoard,
  isFriendlyPiece,
  type BoardPositionValue,
  type Path,
  targetWillBeCaptured,
  getBoardPositionPiece,
} from "./piece";
import { type PlayerColor } from "./piece";
import { type RawPiece, getRawPiece } from "./rawPiece";

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

export class King extends Piece {
  private hasMoved: boolean = false;
  private hasCastled: boolean = false;

  constructor(color: PlayerColor, id?: string) {
    super(color, "king", id);
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
        if (!isTargetOnBoard(target)) {
          continue;
        }
        capturingPositions.push(target);
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
    const capturingPositions = this.getNewCapturingPositions(position);

    for (const target of capturingPositions) {
      if (targetWillBeCaptured(target, opponentCapturingPaths)) {
        continue;
      }
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

    if (!this.hasMoved && !this.hasCastled) {
      // Castling
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
          if (!isTargetOnBoard(searchRookPosition)) {
            break;
          }
          if (Math.abs(totalColDelta) <= 2) {
            if (
              targetWillBeCaptured(searchRookPosition, opponentCapturingPaths)
            ) {
              break;
            }
          }
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
          if (piece) {
            if (piece.pieceId === "rook" && rookTarget && kingTarget) {
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
            } else {
              break;
            }
          }
        }
      }
    }

    return moves;
  }
}

export default King;
