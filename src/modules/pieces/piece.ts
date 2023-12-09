import { getRandomId } from "../utils/misc";
import type BoardStateData from "../user_data/board_state";
import {
  PlayerColor,
  getRawPiece,
  willMoveCheckGuardedPiece,
} from "../utils/game";
import type { ComputedRef, Ref } from "vue";
import type Move from "../moves/move";
import type { RawPiece } from "./raw_piece";
import type { BoardPosition, BoardStateValue } from "../board_manager";
import type { MoveForwardContext } from "../moves/move";

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

export interface Path {
  origin: BoardPosition;
  target: BoardPosition;
}

/**
 * The class represent a generic piece.
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
    boardStateValue: BoardStateValue,
    lastMove: ComputedRef<Move | null>
  ): BoardPosition[] {
    if (!this.capturingPositionsCache)
      this.capturingPositionsCache = this.getNewCapturingPositions(
        position,
        boardStateValue,
        lastMove
      );
    return this.capturingPositionsCache;
  }

  public abstract getNewCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue,
    lastMove: ComputedRef<Move | null>
  ): BoardPosition[];

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue,
    boardStateData: BoardStateData,
    moveForwardContext: MoveForwardContext,
    ignorePiecesGuardedProperty: Ref<boolean>,
    lastMove: ComputedRef<Move | null>
  ): Move[] {
    if (!this.possibleMovesCache) {
      let possibleMoves = this.getNewPossibleMoves(
        position,
        boardStateValue,
        lastMove
      );

      if (!ignorePiecesGuardedProperty.value) {
        // const newBoardStateData = new BoardStateData([]);
        // newBoardStateData.load(boardStateData.dump());
        // const newBoardStateValue = newBoardStateData.value;

        // moveForwardContext.boardStateValue = newBoardStateValue;

        possibleMoves = possibleMoves.filter((move) => {
          return !willMoveCheckGuardedPiece(
            move,
            this.color,
            boardStateValue,
            moveForwardContext,
            lastMove
          );
        });
      }

      this.possibleMovesCache = possibleMoves;
    }
    return this.possibleMovesCache;
  }

  public abstract getNewPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue,
    lastMove: ComputedRef<Move | null>
  ): Move[];
}

export default Piece;
