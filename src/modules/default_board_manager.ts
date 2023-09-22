import BoardManager from "./board_manager";
import { BoardPieceProps } from "../components/Board.vue";
import type ConfigPieceDialog from "./config_piece_dialog";
import { BoardStateValue } from "./user_data/board_state";

class DefaultBoardManager extends BoardManager {
  constructor(
    private readonly board: BoardStateValue,
    private configPieceDialog: ConfigPieceDialog
  ) {
    super();
  }

  public onPieceClick(boardPiece: BoardPieceProps): void {
    this.board[boardPiece.row][boardPiece.col] = null;
  }

  public async onCellClick(row: number, col: number) {
    const piece = await this.configPieceDialog.open();
    this.board[row][col] = piece;
  }
}

export default DefaultBoardManager;
