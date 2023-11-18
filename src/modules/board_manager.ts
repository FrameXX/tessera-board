import { Mark } from "../components/Cell.vue";
import type { Piece, PieceId } from "./pieces/piece";
import { RawPiece, isRawPiece } from "./pieces/raw_piece";

export type BoardStateValue = (Piece | null)[][];

export type MarkBoardState = (Mark | null)[][];

export interface BoardPosition {
  row: number;
  col: number;
}
export function isBoardPosition(object: any): object is BoardPosition {
  if (typeof object.row !== "number") return false;
  if (typeof object.col !== "number") return false;
  return true;
}

export interface BoardPieceProps extends BoardPosition {
  piece: Piece;
}

export interface RawBoardPieceProps extends BoardPosition {
  piece: RawPiece;
}
export function isRawBoardPieceProps(
  object: any
): object is RawBoardPieceProps {
  if (typeof object.row !== "number") return false;
  if (typeof object.col !== "number") return false;
  if (typeof object.piece !== "object") return false;
  if (!isRawPiece(object.piece)) return false;
  return true;
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
