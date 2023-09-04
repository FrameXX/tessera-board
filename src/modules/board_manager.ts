import type { BoardStateValue } from "./user_data/board_state";
import { BoardPiece } from "../components/Board.vue";

abstract class BoardManager {
  protected readonly boardStateReactive: BoardStateValue;

  constructor(boardStateReactive: BoardStateValue) {
    this.boardStateReactive = boardStateReactive;
  }

  public abstract onPieceClick(boardPiece: BoardPiece): void;

  public abstract onCellClick(row: number, col: number): void;
}

export default BoardManager;