import type { Ref } from "vue";
import type Piece from "../pieces/piece";
import type { PieceId } from "../pieces/piece";
import {
  getElementInstanceById,
  waitForTransitionEnd,
} from "../utils/elements";
import type { BoardPosition, MarkBoardState } from "../board_manager";
import type { RawMove } from "./raw_move";
import type { BoardStateValue } from "../board_manager";
import { GameLogicError, getAllpieceContext } from "../utils/game";
import type Game from "../game";

export const MOVE_IDS = ["shift", "castling", "promotion"] as const;

type MoveId = (typeof MOVE_IDS)[number];
export function isMoveId(string: string): string is MoveId {
  return MOVE_IDS.includes(string as MoveId);
}

/**
 * Represents a generic move.
 * @class
 * @abstract
 */
abstract class Move {
  public notation?: string;
  protected performed = false;
  constructor(public readonly moveId: MoveId) {}

  public abstract getRaw(): RawMove;

  public loadCustomProps(rawMove: RawMove) {
    this.performed = rawMove.performed;
  }

  /**
   * Returns an array of board positions that should be highlighted after the move is performed to indicate what has happened in the last move
   */
  public abstract get highlightedBoardPositions(): BoardPosition[];

  protected abstract redo(game: Game): Promise<void>;

  /**
   * Alters the gameBoardState according to the move without any further effects or requiring any user input.
   * @param args The arguments and their count vary from class to class
   * @abstract
   */
  protected abstract _forward(boardState: BoardStateValue, game: Game): void;

  public forward(boardState: BoardStateValue, game: Game, redo = false) {
    if (this.performed) {
      throw new GameLogicError(
        "A move that was already performed shouldn't be performed again."
      );
    }
    this.performed = true;
    redo ? this.redo(game) : this._forward(boardState, game);
  }

  public abstract getNotation(): string;

  protected abstract undo(game: Game): Promise<void>;

  /**
   * Alters the gameBoardState according to the move, but reverse and without any further effects or requiring any user input.
   * @param args The arguments and their count vary from class to class
   * @abstract
   */
  protected abstract _reverse(boardState: BoardStateValue): void;

  public reverse(boardState: BoardStateValue, game: Game, undo = false) {
    if (!this.performed) {
      console.error(this);
      throw new GameLogicError(
        "A move that wasn't performed yet shouldn't be reversed already."
      );
    }
    this.performed = false;
    undo ? this.undo(game) : this._reverse(boardState);
  }

  public perform(game: Game) {
    if (this.performed) {
      throw new GameLogicError(
        "A move that was already performed shouldn't be performed again."
      );
    }
    this.performed = true;
    this._perform(game);
  }

  /**
   * Alters the gameBoardState according to the move. May include audio effects, vibrations or user dialogs.
   * @param args The arguments and their count vary from class to class
   * @abstract
   */
  protected abstract _perform(game: Game): Promise<boolean>;

  /**
   * Returns an array of board positions that after click should perform this move.
   */
  public abstract get clickablePositions(): BoardPosition[];

  /**
   * Sets specific cell marks related to the move to show on the checkboard.
   * @param cellMarks reactive
   * @param boardStateValue
   * @abstract
   */
  public abstract showCellMarks(
    cellMarks: MarkBoardState,
    boardStateValue: BoardStateValue
  ): void;
}

export function addCapturedPiece(
  piece: Piece,
  blackCapturedPieces: Ref<PieceId[]>,
  whiteCapturedPieces: Ref<PieceId[]>
) {
  piece.color === "white"
    ? blackCapturedPieces.value.push(piece.pieceId)
    : whiteCapturedPieces.value.push(piece.pieceId);
}

export function removeCapturedPiece(
  piece: Piece,
  blackCapturedPieces: Ref<PieceId[]>,
  whiteCapturedPieces: Ref<PieceId[]>
) {
  piece.color === "white"
    ? blackCapturedPieces.value.splice(
        blackCapturedPieces.value.indexOf(piece.pieceId)
      )
    : whiteCapturedPieces.value.splice(
        blackCapturedPieces.value.indexOf(piece.pieceId)
      );
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

export async function movePiece(
  piece: Piece,
  origin: BoardPosition,
  target: BoardPosition,
  boardState: BoardStateValue,
  boardId: string = "primary-board"
) {
  movePositionValue(piece, origin, target, boardState);
  // Player board is always visible so it's ok to observe the transition only on player board
  const board = getElementInstanceById(boardId);
  const pieceElement = board.querySelector(`[data-id="piece-${piece.id}"]`);
  if (!(pieceElement instanceof SVGElement)) {
    console.error("Could not find SVG element of piece", piece);
    return;
  }
  await waitForTransitionEnd(pieceElement);
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

export function capturePosition(
  position: BoardPosition,
  boardState: BoardStateValue,
  blackCapturedPieces: Ref<PieceId[]>,
  whiteCapturedPieces: Ref<PieceId[]>
) {
  const piece = boardState[position.row][position.col];
  if (!piece) {
    throw new GameLogicError(
      `Provided position has no piece to capture: ${JSON.stringify(position)}`
    );
  }
  boardState[position.row][position.col] = null;
  addCapturedPiece(piece, blackCapturedPieces, whiteCapturedPieces);
}

export function unCapturePosition(
  position: BoardPosition,
  piece: Piece,
  boardState: BoardStateValue,
  blackCapturedPieces: Ref<PieceId[]>,
  whiteCapturedPieces: Ref<PieceId[]>
) {
  const value = boardState[position.row][position.col];
  if (value) {
    throw new GameLogicError(
      `Provided position already has a piece: ${JSON.stringify(value)}`
    );
  }
  boardState[position.row][position.col] = piece;
  removeCapturedPiece(piece, blackCapturedPieces, whiteCapturedPieces);
}

export default Move;
