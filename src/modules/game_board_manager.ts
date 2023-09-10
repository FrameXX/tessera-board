import type { Ref } from "vue";
import BoardManager from "./board_manager";
import type Piece from "./pieces";
import type { PositionedMark, PositionedPiece } from "../components/Board.vue";
import type { BoardStateValue } from "./user_data/board_state";

class GameBoardManager extends BoardManager {
  constructor(
    boardStateReactive: BoardStateValue,
    private readonly playerCapturedPiecesRef: Ref<Piece[]>,
    private readonly opponentCapturedPiecesRef: Ref<Piece[]>,
    private readonly playerBoardMarksRef: Ref<PositionedMark[]>,
    private readonly OpponentBoardMarksRef: Ref<PositionedMark[]>
  ) {
    super(boardStateReactive);
  }

  public onPieceClick(boardPiece: PositionedPiece): void {}

  public onCellClick(row: number, col: number): void {}
}

export default GameBoardManager;
