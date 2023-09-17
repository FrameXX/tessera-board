import type { Ref } from "vue";
import BoardManager from "./board_manager";
import type { BoardPieceProps, MarkState } from "../components/Board.vue";
import type { BoardStateValue } from "./user_data/board_state";
import type Game from "./game";
import { PieceId } from "./pieces";

class GameBoardManager extends BoardManager {
  private selectedPiece: BoardPieceProps | null = null;

  constructor(
    game: Game,
    boardState: BoardStateValue,
    private readonly whiteCapturedPieces: Ref<PieceId[]>,
    private readonly blackCapturedPieces: Ref<PieceId[]>,
    private readonly playerBoardMarks: MarkState,
    private readonly OpponentBoardMarks: MarkState
  ) {
    super(boardState);
  }

  public onPieceClick(boardPiece: BoardPieceProps): void {
    this.selectedPiece = boardPiece;
  }

  public onCellClick(row: number, col: number): void {
    if (this.selectedPiece) {
      this.boardState[this.selectedPiece.row][this.selectedPiece.col] = null;
      this.boardState[row][col] = this.selectedPiece.piece;
      this.selectedPiece = null;
    }
  }
}

export default GameBoardManager;
