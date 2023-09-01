import { Ref } from "vue";
import BoardManager from "./board_manager";
import type { BoardStateValue } from "../user_data/board_state";
import { BoardPiece } from "../../components/Board.vue";

class DefaultBoardManager extends BoardManager {
  private temporaryPiece?: BoardPiece;

  constructor(boardStateRef: Ref<BoardStateValue>) {
    super(boardStateRef);
  }

  public onPieceClick(boardPiece: BoardPiece): void {
    this.temporaryPiece = boardPiece;
  }

  public onCellClick(row: number, col: number): void {
    if (this.temporaryPiece) {
      this.boardStateRef.value[this.temporaryPiece.row][
        this.temporaryPiece.col
      ] = null;
      this.boardStateRef.value[row][col] = this.temporaryPiece.piece;
      this.temporaryPiece = undefined;
    }
  }
}

export default DefaultBoardManager;
