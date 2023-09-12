import BoardManager from "./board_manager";
import type { BoardStateValue } from "./user_data/board_state";
import { BoardPieceProps } from "../components/Board.vue";
import type ConfigPieceDialog from "./config_piece_dialog";

class DefaultBoardManager extends BoardManager {
  constructor(
    boardState: BoardStateValue,
    private configPieceDialog: ConfigPieceDialog
  ) {
    super(boardState);
  }

  public onPieceClick(boardPiece: BoardPieceProps): void {
    this.boardState[boardPiece.row][boardPiece.col] = null;
  }

  public async onCellClick(row: number, col: number) {
    const piece = await this.configPieceDialog.open();
    this.boardState[row][col] = piece;
  }
}

export default DefaultBoardManager;
