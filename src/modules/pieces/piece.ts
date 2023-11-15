import type { Ref } from "vue";
import type { BoardPosition } from "../../components/Board.vue";
import {
  getAllPieceProps,
  invalidatePiecesCache,
  isGuardedPieceChecked,
  type PlayerColor,
} from "../game";
import { positionsEqual } from "../game_board_manager";
import type Move from "../moves/move";
import type { BoardStateValue } from "../user_data/board_state";
import { getRandomId, sumPositions } from "../utils/misc";
import { type RawPiece, getRawPiece } from "./rawPiece";
import { isMoveShift } from "../moves/shift";
import { isMovePromotion } from "../moves/promotion";
import { isMoveCastling } from "../moves/castling";
import BoardStateData from "../user_data/board_state";

export const PIECE_IDS: PieceId[] = [
  "rook",
  "knight",
  "bishop",
  "queen",
  "king",
  "pawn",
];
export type PieceId = "rook" | "knight" | "bishop" | "queen" | "king" | "pawn";
export function isPieceId(string: string): string is PieceId {
  return (
    string === "rook" ||
    string === "knight" ||
    string === "bishop" ||
    string === "queen" ||
    string === "king" ||
    string === "pawn"
  );
}

export type PiecesImportance = {
  [key in PieceId]: Ref<number>;
};

export interface BoardPositionValue extends BoardPosition {
  value: Piece | null;
}

export interface Path {
  origin: BoardPosition;
  target: BoardPosition;
}

/**
 * Represent a generic piece
 * @class
 * @abstract
 */
export abstract class Piece {
  protected capturingPositionsCache?: BoardPosition[];
  protected possibleMovesCache?: Move[];
  public readonly id: string;

  constructor(
    public readonly color: PlayerColor,
    public readonly pieceId: PieceId,
    id?: string,
    public readonly guarded: boolean = false
  ) {
    this.id = id ? id : getRandomId();
  }

  /**
   * Every piece can override this method and possibly load some custom properties from the restored raw piece object.
   * @param rawPiece Raw piece object usually parsed from storage from which the props will be extracted.
   */
  public abstract loadCustomProps(rawPiece: RawPiece): void;

  /**
   * Every piece can override this method and return object with extra custom props to be saved into localStorage.
   * @returns RawPiece object with extra custom props.
   */
  public getRawPiece(): RawPiece {
    return getRawPiece(this);
  }

  public invalidateCache() {
    this.capturingPositionsCache = undefined;
    this.possibleMovesCache = undefined;
  }

  public getCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[] {
    if (!this.capturingPositionsCache)
      this.capturingPositionsCache = this.getNewCapturingPositions(
        position,
        boardStateValue
      );
    return this.capturingPositionsCache;
  }

  public abstract getNewCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[];

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue,
    boardStateData: BoardStateData,
    piecesImportance: PiecesImportance,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    reviveFromCapturedPieces: Ref<boolean>
  ): Move[] {
    if (!this.possibleMovesCache) {
      const allPossibleMoves = this.getNewPossibleMoves(
        position,
        boardStateValue
      );

      const newBoardStateData = new BoardStateData([]);
      newBoardStateData.load(boardStateData.dump());
      const newBoardStateValue = boardStateData.value;

      this.possibleMovesCache = allPossibleMoves.filter((move) => {
        if (isMoveShift(move)) {
          move.forward(newBoardStateValue);
        } else if (isMovePromotion(move)) {
          move.forward(
            newBoardStateValue,
            piecesImportance,
            blackCapturedPieces,
            whiteCapturedPieces,
            reviveFromCapturedPieces
          );
        } else if (isMoveCastling(move)) {
          move.forward(boardStateValue);
        }

        const pieceProps = getAllPieceProps(newBoardStateValue);
        invalidatePiecesCache(pieceProps);
        const checksGuardedPiece = isGuardedPieceChecked(
          boardStateValue,
          this.color,
          pieceProps
        );

        if (isMoveShift(move)) {
          move.reverse(boardStateValue);
        } else if (isMovePromotion(move)) {
          move.reverse(boardStateValue);
        } else if (isMoveCastling(move)) {
          move.reverse(boardStateValue);
        }

        return !checksGuardedPiece;
      });
    }
    return this.possibleMovesCache;
  }

  public abstract getNewPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[];
}

export function getDeltaPosition(
  position: BoardPosition,
  colDelta: number,
  rowDelta: number
): BoardPosition {
  return sumPositions(position, { row: rowDelta, col: colDelta });
}

export function getBoardPositionPiece(
  position: BoardPosition,
  boardStateValue: BoardStateValue
) {
  return boardStateValue[position.row][position.col];
}

export function isFriendlyPiece(
  piece: Piece | null,
  friendlyColor: PlayerColor
) {
  if (!piece) {
    return false;
  }
  return piece.color === friendlyColor;
}

export function isPositionOnBoard(target: BoardPosition) {
  return (
    target.row >= 0 && target.row <= 7 && target.col >= 0 && target.col <= 7
  );
}

export function getTargetMatchingPaths(
  target: BoardPosition,
  capturingPaths: Path[]
) {
  return capturingPaths.filter((path) => positionsEqual(path.target, target));
}

export function positionWillBeCaptured(
  target: BoardPosition,
  capturingPaths: Path[]
): boolean {
  const matchingPositions = getTargetMatchingPaths(target, capturingPaths);
  return matchingPositions.length !== 0;
}

export function getCapturingPositionPath(
  target: BoardPosition,
  origin: BoardPosition
): Path {
  return { origin: origin, target: target };
}

export function positionsToPath(
  boardPositions: BoardPosition[],
  origin: BoardPosition
) {
  return boardPositions.map((target) =>
    getCapturingPositionPath(target, origin)
  );
}

export function chooseBestPiece(
  pieces: RawPiece[],
  piecesImportance: PiecesImportance
) {
  let bestPiece = pieces[0];
  for (const piece of pieces) {
    if (
      piecesImportance[bestPiece.pieceId].value <
      piecesImportance[piece.pieceId].value
    ) {
      bestPiece = piece;
    }
  }
  return bestPiece;
}

export default Piece;
