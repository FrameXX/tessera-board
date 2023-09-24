import BoardManager from "./board_manager";
import type { BoardPieceProps, BoardPosition } from "../components/Board.vue";
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

  public async onCellClick(position: BoardPosition) {
    const piece = await this.configPieceDialog.open();
    this.board[position.row][position.col] = piece;
  }
}

export default DefaultBoardManager;
