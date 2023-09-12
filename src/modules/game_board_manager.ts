import type { Ref } from "vue";
import BoardManager from "./board_manager";
import type Piece from "./pieces";
import type { BoardMarkProps, BoardPieceProps } from "../components/Board.vue";
import type { BoardStateValue } from "./user_data/board_state";

class GameBoardManager extends BoardManager {
  private selectedPiece: BoardPieceProps | null = null;

  constructor(
    boardState: BoardStateValue,
    private readonly playerCapturedPiecesRef: Ref<Piece[]>,
    private readonly opponentCapturedPiecesRef: Ref<Piece[]>,
    private readonly playerBoardMarksRef: Ref<BoardMarkProps>,
    private readonly OpponentBoardMarksRef: Ref<BoardMarkProps>
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
