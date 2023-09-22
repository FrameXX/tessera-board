import { BoardPieceProps } from "../components/Board.vue";

export const CHAR_INDEXES = ["a", "b", "c", "d", "e", "f", "g", "h"];

abstract class BoardManager {
  constructor() {}

  public abstract onPieceClick(boardPiece: BoardPieceProps): void;

  public abstract onCellClick(row: number, col: number): void;
}

export default BoardManager;
