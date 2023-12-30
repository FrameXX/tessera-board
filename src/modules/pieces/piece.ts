import { getRandomId } from "../utils/misc";
import type { PlayerColor } from "../utils/game";
import { getRawPiece, willMoveCheckGuardedPiece } from "../utils/game";
import type { Ref } from "vue";
import type Move from "../moves/move";
import type { RawPiece } from "./raw_piece";
import type { BoardPosition, BoardStateValue } from "../board_manager";
import type Game from "../game";

export const PIECES = {
  rook: "Rook",
  knight: "Knight",
  bishop: "Bishop",
  queen: "Queen",
  king: "King",
  pawn: "Pawn",
} as const;

export const PIECE_IDS = Object.keys(PIECES) as PieceId[];

export type PieceId = keyof typeof PIECES;
export function isPieceId(string: string): string is PieceId {
  return Object.keys(PIECES).includes(string);
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
    boardState: BoardStateValue
  ): BoardPosition[] {
    if (!this.capturingPositionsCache)
      this.capturingPositionsCache = this.getNewCapturingPositions(
        position,
        boardState
      );
    return this.capturingPositionsCache;
  }

  public abstract getNewCapturingPositions(
    position: BoardPosition,
    boardState: BoardStateValue
  ): BoardPosition[];

  public getPossibleMoves(game: Game, position: BoardPosition): Move[] {
    if (!this.possibleMovesCache) {
      let possibleMoves = this.getNewPossibleMoves(position, game);

      if (!game.settings.ignorePiecesGuardedProperty.value) {
        possibleMoves = possibleMoves.filter((move) => {
          return !willMoveCheckGuardedPiece(
            game,
            move,
            this.color,
            game.backendBoardStateData.value
          );
        });
      }

      this.possibleMovesCache = possibleMoves;
    }
    return this.possibleMovesCache;
  }

  public abstract getNewPossibleMoves(
    position: BoardPosition,
    game: Game
  ): Move[];
}

export default Piece;
