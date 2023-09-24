import { BoardPieceProps, BoardPosition } from "../components/Board.vue";

export const CHAR_INDEXES = ["a", "b", "c", "d", "e", "f", "g", "h"];

abstract class BoardManager {
  constructor() {}

  public abstract onPieceClick(boardPiece: BoardPieceProps): void;

  public abstract onCellClick(position: BoardPosition): void;
}

export default BoardManager;
