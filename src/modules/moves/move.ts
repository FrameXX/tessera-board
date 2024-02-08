import type Piece from "../pieces/piece";
import type { BoardPosition, MarkBoardState } from "../board_manager";
import type { RawMove } from "./raw_move";
import type { BoardStateValue } from "../board_manager";
import { GameLogicError, getAllpieceContext } from "../utils/game";
import type Game from "../game";

export const MOVE_IDS = ["shift", "castling", "promotion"] as const;

export type MoveId = (typeof MOVE_IDS)[number];
export function isMoveId(string: string): string is MoveId {
  return MOVE_IDS.includes(string as MoveId);
}

abstract class Move {
  public notation?: string;
  protected performed = false;
  constructor(public readonly moveId: MoveId) {}

  public abstract getRaw(): RawMove;

  public loadCustomProps(rawMove: RawMove) {
    this.performed = rawMove.performed;
  }

  public abstract get highlightedBoardPositions(): BoardPosition[];

  public forward(boardState: BoardStateValue, game: Game) {
    if (this.performed) {
      throw new GameLogicError(
        "A move that was already performed shouldn't be performed again."
      );
    }
    this.performed = true;
    this._forward(boardState, game);
  }

  protected abstract _forward(boardState: BoardStateValue, game: Game): void;

  public abstract getNotation(): string;

  public async redo(game: Game) {
    if (this.performed) {
      throw new GameLogicError(
        "A move that was already performed shouldn't be performed again."
      );
    }
    this.performed = true;
    await this._redo(game);
  }

  protected abstract _redo(game: Game): Promise<void>;

  public async undo(game: Game) {
    if (!this.performed) {
      console.error(this);
      throw new GameLogicError(
        "A move that wasn't performed yet shouldn't be reversed already."
      );
    }
    this.performed = false;
    await this._undo(game);
  }

  protected abstract _undo(game: Game): Promise<void>;

  public reverse(boardState: BoardStateValue) {
    if (!this.performed) {
      console.error(this);
      throw new GameLogicError(
        "A move that wasn't performed yet shouldn't be reversed already."
      );
    }
    this.performed = false;
    this._reverse(boardState);
  }

  protected abstract _reverse(boardState: BoardStateValue): void;

  public async perform(game: Game) {
    if (this.performed) {
      throw new GameLogicError(
        "A move that was already performed shouldn't be performed again."
      );
    }
    this.performed = true;
    await this._perform(game);
  }

  protected abstract _perform(game: Game): Promise<void>;

  public abstract get clickablePositions(): BoardPosition[];

  public abstract showCellMarks(
    cellMarks: MarkBoardState,
    boardStateValue: BoardStateValue
  ): void;
}

export function transformPiece(
  position: BoardPosition,
  newPiece: Piece,
  boardState: BoardStateValue
) {
  const piece = boardState[position.row][position.col];
  if (!piece) {
    throw new GameLogicError(
      `Board position is missing a required piece. Position: ${JSON.stringify(
        position
      )}`
    );
  }
  boardState[position.row][position.col] = newPiece;
}

export function handleInvalidRawMove(rawMove: RawMove): never {
  console.error("Invalid rawMove was provided.", rawMove);
  throw new GameLogicError("Provided rawMove is invalid.");
}

export function movePositionValue(
  piece: Piece,
  origin: BoardPosition,
  target: BoardPosition,
  boardState: BoardStateValue
) {
  boardState[target.row][target.col] = piece;
  boardState[origin.row][origin.col] = null;
}

export function getPieceById(id: string, boardState: BoardStateValue) {
  const pieceContext = getAllpieceContext(boardState);
  for (const props of pieceContext) {
    if (props.piece.id !== id) {
      continue;
    } else {
      return props.piece;
    }
  }
  throw new GameLogicError(
    `Piece with id ${id} is not be found in provided boardStateValue.`
  );
}

export function pieceHasMovedProperty(
  piece: Piece
): piece is Piece & { moved: boolean } {
  if (!("moved" in piece)) {
    return false;
  }
  if (typeof piece.moved !== "boolean") {
    return false;
  }
  return true;
}

export function setPieceMoveProperty(
  piece: Piece & { moved: boolean },
  newValue: boolean = true
) {
  piece.moved = newValue;
}

export function getCleanBoardPosition(position: BoardPosition) {
  return { row: position.row, col: position.col };
}

export function tellPieceItCastled(
  id: string,
  boardState: BoardStateValue,
  newValue: boolean = true
): boolean {
  const piece = getPieceById(id, boardState);
  if (!("castled" in piece)) {
    return false;
  }
  if (typeof piece.castled !== "boolean") {
    return false;
  }
  const previousValue = piece.castled;
  piece.castled = newValue;
  return previousValue;
}

export function clearPositionValue(
  position: BoardPosition,
  boardState: BoardStateValue
) {
  boardState[position.row][position.col] = null;
}

export default Move;
