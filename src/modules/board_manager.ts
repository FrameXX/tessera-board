import type { BoardPieceProps, BoardPosition } from "../components/Board.vue";
import type { PieceId } from "./pieces/piece";

export const CHAR_INDEXES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function isBoardPosition(object: any): object is BoardPosition {
  return typeof object.row === "number" && typeof object.col === "number";
}

abstract class BoardManager {
  constructor() {}

  public abstract onPieceClick(boardPiece: BoardPieceProps): void;

  public abstract onCellClick(position: BoardPosition): void;

  public abstract onPieceDragStart(
    boardPiece: BoardPieceProps,
    targetPosition: BoardPosition
  ): void;

  public abstract onPieceDragEnd(
    boardPiece: BoardPieceProps,
    targetPosition: BoardPosition
  ): void;

  public abstract onPieceDragOverCell(
    boardPiece: BoardPieceProps,
    targetPosition: BoardPosition
  ): void;
}

export function getPositionNotation(position: BoardPosition) {
  return `${CHAR_INDEXES[position.col]}${position.row + 1}`;
}

export function getPieceNotation(pieceId: PieceId) {
  return `{${pieceId}}`;
}

export default BoardManager;
