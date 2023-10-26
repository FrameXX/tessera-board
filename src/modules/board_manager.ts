import type { BoardPieceProps, BoardPosition } from "../components/Board.vue";
import type { PieceId } from "./pieces/piece";

export const CHAR_INDEXES = ["a", "b", "c", "d", "e", "f", "g", "h"];

abstract class BoardManager {
  constructor() {}

  public abstract onPieceClick(boardPiece: BoardPieceProps): void;

  public abstract onCellClick(position: BoardPosition): void;

  public abstract onPieceDragStart(boardPiece: BoardPieceProps): void;

  public abstract onPieceDragEnd(rowDelta: number, colDelta: number): void;

  public abstract onPieceDragOverCell(rowDelta: number, colDelta: number): void;
}

export function getPositionNotation(position: BoardPosition) {
  return `${CHAR_INDEXES[position.col]}${position.row + 1}`;
}

export function getPieceNotation(pieceId: PieceId) {
  return `{${pieceId}}`;
}

export default BoardManager;
