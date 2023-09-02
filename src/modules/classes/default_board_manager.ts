import BoardManager from "./board_manager";
import type { BoardStateValue } from "../user_data/board_state";
import { BoardPiece } from "../../components/Board.vue";

class DefaultBoardManager extends BoardManager {
  constructor(boardStateReactive: BoardStateValue) {
    super(boardStateReactive);
  }

  public onPieceClick(boardPiece: BoardPiece): void {
    this.boardStateReactive[boardPiece.row][boardPiece.col] = null;
  }

  public onCellClick(row: number, col: number): void {}
}

export default DefaultBoardManager;
