import BoardManager from "./board_manager";
import type { BoardStateValue } from "./user_data/board_state";
import { PositionedPiece } from "../components/Board.vue";
import type ConfigPieceDialog from "./config_piece_dialog";

class DefaultBoardManager extends BoardManager {
  constructor(
    boardStateReactive: BoardStateValue,
    private configPieceDialog: ConfigPieceDialog
  ) {
    super(boardStateReactive);
  }

  public onPieceClick(boardPiece: PositionedPiece): void {
    this.boardStateReactive[boardPiece.row][boardPiece.col] = null;
  }

  public async onCellClick(row: number, col: number) {
    const piece = await this.configPieceDialog.open();
    this.boardStateReactive[row][col] = piece;
  }
}

export default DefaultBoardManager;
