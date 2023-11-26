import type { Ref } from "vue";
import type Piece from "../pieces/piece";
import type { PieceId } from "../pieces/piece";
import {
  getElementInstanceById,
  waitForTransitionEnd,
} from "../utils/elements";
import { getPositionPiece } from "../game_board_manager";
import { GameLogicError, getAllPieceProps } from "../game";
import type { BoardPosition, MarkBoardState } from "../board_manager";
import type { RawMove } from "./raw_move";
import { BoardStateValue } from "../board_manager";

export type MoveId = "shift" | "castling" | "promotion";
export function isMoveId(string: string): string is MoveId {
  return string === "shift" || string === "castling" || string === "promotion";
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

  /**
   * Alters the gameBoardState according to the move without any further effects or requiring any user input.
   * @param args The arguments and their count vary from class to class
   * @abstract
   */
  public abstract forward(...args: any): void;

  protected onPerformForward() {
    if (this.performed) {
      throw new GameLogicError(
        "A move that was already performed shouldn't be performed again."
      );
    }
    this.performed = true;
  }

  /**
   * Alters the gameBoardState according to the move, but reverse and without any further effects or requiring any user input.
   * @param args The arguments and their count vary from class to class
   * @abstract
   */
  public abstract reverse(BoardStateValue: BoardStateValue): void;

  protected beforePerformReverse() {
    if (!this.performed) {
      throw new GameLogicError(
        "A move that wasn't performed yet shouldn't be reversed already."
      );
    }
    this.performed = false;
  }

  /**
   * Alters the gameBoardState according to the move. May include audio effects, vibrations or user dialogs.
   * @param args The arguments and their count vary from class to class
   * @abstract
   */
  public abstract perform(...args: any): Promise<void>;

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
  if (piece.color === "white") {
    blackCapturedPieces.value.push(piece.pieceId);
  } else {
    whiteCapturedPieces.value.push(piece.pieceId);
  }
}

export function transformPiece(
  position: BoardPosition,
  newPiece: Piece,
  boardStateValue: BoardStateValue
) {
  const piece = boardStateValue[position.row][position.col];
  if (!piece) {
    throw new GameLogicError(
      `Board position is missing a required piece. Position: ${JSON.stringify(
        position
      )}`
    );
  }
  boardStateValue[position.row][position.col] = newPiece;
}

export function handleInvalidRawMove(rawMove: RawMove): never {
  console.error("Invalid rawMove was provided.", rawMove);
  throw new GameLogicError("Provided rawMove is invalid.");
}

export function movePositionValue(
  piece: Piece,
  origin: BoardPosition,
  target: BoardPosition,
  boardStateValue: BoardStateValue
) {
  boardStateValue[target.row][target.col] = piece;
  boardStateValue[origin.row][origin.col] = null;
}

export async function movePiece(
  origin: BoardPosition,
  target: BoardPosition,
  boardStateValue: BoardStateValue,
  boardId: string = "player-board"
) {
  const piece = getPositionPiece(origin, boardStateValue);
  movePositionValue(piece, origin, target, boardStateValue);
  // Player board is always visible so it's ok to observe the transition only on player board
  const board = getElementInstanceById(boardId);
  const pieceElement = board.querySelector(`[data-id="piece-${piece.id}"]`);
  if (!(pieceElement instanceof SVGElement)) {
    console.error(`Could not find piece element of piece ${piece.id}`);
    return;
  }
  await waitForTransitionEnd(pieceElement);
}

export function getPieceById(id: string, boardStateValue: BoardStateValue) {
  const pieceProps = getAllPieceProps(boardStateValue);
  for (const props of pieceProps) {
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

export function tellPieceItMoved(
  id: string,
  boardStateValue: BoardStateValue,
  newValue: boolean = true
): boolean {
  const piece = getPieceById(id, boardStateValue);
  if (!("moved" in piece)) {
    return false;
  }
  if (typeof piece.moved !== "boolean") {
    return false;
  }
  const previousValue = piece.moved;
  piece.moved = newValue;
  return previousValue;
}

export function getCleanBoardPosition(position: BoardPosition) {
  return { row: position.row, col: position.col };
}

export function tellPieceItCastled(
  id: string,
  boardStateValue: BoardStateValue,
  newValue: boolean = true
): boolean {
  const piece = getPieceById(id, boardStateValue);
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
  boardStateValue: BoardStateValue
) {
  boardStateValue[position.row][position.col] = null;
}

export function capturePosition(
  position: BoardPosition,
  boardStateValue: BoardStateValue,
  blackCapturedPieces: Ref<PieceId[]>,
  whiteCapturedPieces: Ref<PieceId[]>
) {
  const piece = boardStateValue[position.row][position.col];
  if (!piece) {
    return;
  }
  boardStateValue[position.row][position.col] = null;
  addCapturedPiece(piece, blackCapturedPieces, whiteCapturedPieces);
}

export default Move;
