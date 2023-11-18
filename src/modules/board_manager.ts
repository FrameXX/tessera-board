import { Mark } from "../components/Cell.vue";
import type { Piece, PieceId } from "./pieces/piece";

export type BoardStateValue = (Piece | null)[][];

export type MarkBoardState = (Mark | null)[][];

export interface BoardPosition {
  row: number;
  col: number;
}
export function isBoardPosition(object: object): object is BoardPosition {
  if (!("row" in object && "col" in object)) return false;
  return typeof object.row === "number" && typeof object.col === "number";
}

export interface BoardPieceProps extends BoardPosition {
  piece: Piece;
}

export const CHAR_INDEXES = ["a", "b", "c", "d", "e", "f", "g", "h"];

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
