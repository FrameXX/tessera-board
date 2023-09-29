import BoardManager from "./board_manager";
import type { BoardPieceProps, BoardPosition } from "../components/Board.vue";
import type ConfigPieceDialog from "./dialogs/config_piece";
import { BoardStateValue } from "./user_data/board_state";
import type { Ref } from "vue";

class DefaultBoardManager extends BoardManager {
  constructor(
    private readonly board: BoardStateValue,
    private readonly configPieceDialog: ConfigPieceDialog,
    private readonly audioEffects: Ref<boolean>,
    private readonly pieceMoveAudioEffect: Howl,
    private readonly pieceRemoveAudioEffect: Howl
  ) {
    super();
  }

  public onPieceClick(boardPiece: BoardPieceProps): void {
    this.board[boardPiece.row][boardPiece.col] = null;
    if (this.audioEffects.value) this.pieceRemoveAudioEffect.play();
  }

  public async onCellClick(position: BoardPosition) {
    const piece = await this.configPieceDialog.open();
    this.board[position.row][position.col] = piece;
    if (this.audioEffects.value) this.pieceMoveAudioEffect.play();
  }
}

export default DefaultBoardManager;
