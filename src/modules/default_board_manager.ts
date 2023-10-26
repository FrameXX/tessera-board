import BoardManager from "./board_manager";
import type { BoardPieceProps, BoardPosition } from "../components/Board.vue";
import type ConfigPieceDialog from "./dialogs/config_piece";
import { BoardStateValue } from "./user_data/board_state";
import type { Ref } from "vue";
import { isPositionOnBoard } from "./pieces/piece";
import { movePositionValue } from "./moves/move";
import { positionsEqual } from "./game_board_manager";

class DefaultBoardManager extends BoardManager {
  private dragEndTimeout: boolean = false;

  constructor(
    private readonly boardStateValue: BoardStateValue,
    private readonly configPieceDialog: ConfigPieceDialog,
    private readonly draggingOverCells: Ref<BoardPosition[]>,
    private readonly audioEffects: Ref<boolean>,
    private readonly pieceMoveAudioEffect: Howl,
    private readonly pieceRemoveAudioEffect: Howl,
    private readonly useVibratons: Ref<boolean>
  ) {
    super();
  }

  private clearDraggingOverCells() {
    this.draggingOverCells.value = [];
  }

  private isPositionAvailible(position: BoardPosition) {
    if (!isPositionOnBoard(position)) {
      return false;
    }
    return this.boardStateValue[position.row][position.col] === null;
  }

  public onPieceDragStart(
    boardPiece: BoardPieceProps,
    targetPosition: BoardPosition
  ): void {
    this.onPieceDragOverCell(boardPiece, targetPosition);
  }

  public onPieceDragOverCell(
    boardPiece: BoardPieceProps,
    targetPosition: BoardPosition
  ): void {
    if (
      !this.isPositionAvailible(targetPosition) &&
      !positionsEqual(boardPiece, targetPosition)
    ) {
      return;
    }
    this.clearDraggingOverCells();
    this.draggingOverCells.value.push(targetPosition);
  }

  public async onPieceDragEnd(
    boardPiece: BoardPieceProps,
    targetPosition: BoardPosition
  ) {
    this.dragEndTimeout = true;
    setTimeout(() => {
      this.dragEndTimeout = false;
    }, 100);
    this.clearDraggingOverCells();
    if (!this.isPositionAvailible(targetPosition)) {
      return;
    }
    await movePositionValue(
      boardPiece,
      targetPosition,
      this.boardStateValue,
      "default-board"
    );
    if (this.audioEffects.value) this.pieceMoveAudioEffect.play();
  }

  public onPieceClick(boardPiece: BoardPieceProps): void {
    if (this.dragEndTimeout) {
      return;
    }
    this.boardStateValue[boardPiece.row][boardPiece.col] = null;
    if (this.audioEffects.value) this.pieceRemoveAudioEffect.play();
    if (this.useVibratons.value) navigator.vibrate(30);
  }

  public async onCellClick(position: BoardPosition) {
    const piece = await this.configPieceDialog.open();
    this.boardStateValue[position.row][position.col] = piece;
    if (this.audioEffects.value) this.pieceMoveAudioEffect.play();
    if (this.useVibratons.value) navigator.vibrate(30);
  }
}

export default DefaultBoardManager;
