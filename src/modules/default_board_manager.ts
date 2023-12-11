import type {
  PieceContext,
  BoardPosition,
  BoardStateValue,
} from "./board_manager";
import BoardManager from "./board_manager";
import type ConfigPieceDialog from "./dialogs/config_piece";
import { type Ref } from "vue";
import { movePiece } from "./moves/move";
import { isPositionOnBoard, positionsEqual } from "./utils/game";

class DefaultBoardManager extends BoardManager {
  private dragEndTimeoutActive: boolean = false;

  constructor(
    private readonly boardStateValue: BoardStateValue,
    private readonly configPieceDialog: ConfigPieceDialog,
    private readonly audioEffectsEnabled: Ref<boolean>,
    private readonly pieceMoveAudioEffect: Howl,
    private readonly pieceRemoveAudioEffect: Howl,
    private readonly vibrationsEnabled: Ref<boolean>
  ) {
    super();
  }

  private isPositionAvailible(position: BoardPosition) {
    if (!isPositionOnBoard(position)) {
      return false;
    }
    return this.boardStateValue[position.row][position.col] === null;
  }

  public onPieceDragStart(
    targetPosition: BoardPosition,
    pieceContext: PieceContext
  ): void {
    this.onPieceDragOverCell(targetPosition, pieceContext);
  }

  public onPieceDragOverCell(
    targetPosition: BoardPosition,
    pieceContext: PieceContext
  ): void {
    // A dragged piece can be returned to its original position.
    if (positionsEqual(targetPosition, pieceContext)) {
      this.draggingOverCell.value = targetPosition;
      return;
    }

    this.draggingOverCell.value = this.isPositionAvailible(targetPosition)
      ? targetPosition
      : null;
  }

  private temporarilyActivateDragEndTimeout() {
    this.dragEndTimeoutActive = true;
    setTimeout(() => {
      this.dragEndTimeoutActive = false;
    }, 100);
  }

  public async onPieceDragEnd(
    targetPosition: BoardPosition,
    pieceContext: PieceContext
  ) {
    this.temporarilyActivateDragEndTimeout();
    if (!this.isPositionAvailible(targetPosition)) {
      return;
    }
    await movePiece(
      pieceContext,
      targetPosition,
      this.boardStateValue,
      "default-board"
    );
    if (this.audioEffectsEnabled.value) this.pieceMoveAudioEffect.play();
  }

  public onPieceClick(pieceContext: PieceContext): void {
    if (this.dragEndTimeoutActive) {
      return;
    }
    this.boardStateValue[pieceContext.row][pieceContext.col] = null;
    if (this.audioEffectsEnabled.value) this.pieceRemoveAudioEffect.play();
    if (this.vibrationsEnabled.value) navigator.vibrate(30);
  }

  public async onCellClick(position: BoardPosition) {
    const piece = await this.configPieceDialog.open();
    this.boardStateValue[position.row][position.col] = piece;
    if (this.audioEffectsEnabled.value) this.pieceMoveAudioEffect.play();
    if (this.vibrationsEnabled.value) navigator.vibrate(30);
  }
}

export default DefaultBoardManager;
