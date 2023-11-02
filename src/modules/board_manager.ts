import type { BoardPieceProps, BoardPosition } from "../components/Board.vue";
import type { PieceId } from "./pieces/piece";

export const CHAR_INDEXES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function isBoardPosition(object: object): object is BoardPosition {
  if (!("row" in object && "col" in object)) return false;
  return typeof object.row === "number" && typeof object.col === "number";
}

abstract class BoardManager {
  constructor() {}

  public abstract onPieceClick(boardPiece: BoardPieceProps): void;

  public abstract onCellClick(position: BoardPosition): void;

  public abstract onPieceDragStart(
    targetPosition: BoardPosition,
    pieceProps: BoardPieceProps
  ): void;

  public abstract onPieceDragEnd(
    targetPosition: BoardPosition,
    pieceProps: BoardPieceProps
  ): void;

  public abstract onPieceDragOverCell(
    targetPosition: BoardPosition,
    pieceProps: BoardPieceProps
  ): void;
}

export function getPositionNotation(position: BoardPosition) {
  return `${CHAR_INDEXES[position.col]}${position.row + 1}`;
}

export function getPieceNotation(pieceId: PieceId) {
  return `{${pieceId}}`;
}

export default BoardManager;
