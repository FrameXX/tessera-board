import type { PieceContext, BoardPosition } from "./board_manager";
import BoardManager from "./board_manager";
import { isPositionOnBoard, positionsEqual } from "./utils/game";
import type Game from "./game";

class DefaultBoardManager extends BoardManager {
  private dragEndTimeoutActive: boolean = false;

  constructor(private readonly game: Game) {
    super();
  }

  private isPositionAvailible(position: BoardPosition) {
    if (!isPositionOnBoard(position)) return false;
    return (
      this.game.settings.defaultBoardState[position.row][position.col] === null
    );
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
    await this.game.movePiece(
      pieceContext.piece,
      pieceContext,
      targetPosition,
      true
    );
    if (this.game.settings.audioEffectsEnabled.value)
      this.game.audioEffects.pieceMove.play();
  }

  public onPieceClick(pieceContext: PieceContext): void {
    if (this.dragEndTimeoutActive) {
      return;
    }
    this.game.settings.defaultBoardState[pieceContext.row][pieceContext.col] =
      null;
    if (this.game.settings.audioEffectsEnabled.value)
      this.game.audioEffects.pieceRemove.play();
    if (this.game.settings.vibrationsEnabled.value) navigator.vibrate(30);
  }

  public async onCellClick(position: BoardPosition) {
    const piece = await this.game.ui.configPieceDialog.open();
    if (!piece) {
      return;
    }
    this.game.settings.defaultBoardState[position.row][position.col] = piece;
    if (this.game.settings.audioEffectsEnabled.value)
      this.game.audioEffects.pieceMove.play();
    if (this.game.settings.vibrationsEnabled.value) navigator.vibrate(30);
  }
}

export default DefaultBoardManager;
