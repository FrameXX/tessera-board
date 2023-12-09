import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "./board_manager";
import BoardManager from "./board_manager";
import type ConfigPieceDialog from "./dialogs/config_piece";
import { computed, ref, type Ref } from "vue";
import { movePiece } from "./moves/move";
import { isPositionOnBoard, positionsEqual } from "./utils/game";

class DefaultBoardManager extends BoardManager {
  private dragEndTimeout: boolean = false;
  public readonly draggingOverCells = ref<BoardPosition[]>([]);

  constructor(
    private readonly boardStateValue: BoardStateValue,
    private readonly configPieceDialog: ConfigPieceDialog,
    private readonly audioEffectsEnabled: Ref<boolean>,
    private readonly pieceMoveAudioEffect: Howl,
    private readonly pieceRemoveAudioEffect: Howl,
    private readonly vibrationsEnabled: Ref<boolean>
  ) {
    super(computed(() => false));
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
    targetPosition: BoardPosition,
    pieceProps: BoardPieceProps
  ): void {
    this.onPieceDragOverCell(targetPosition, pieceProps);
  }

  public onPieceDragOverCell(
    targetPosition: BoardPosition,
    pieceProps: BoardPieceProps
  ): void {
    this.clearDraggingOverCells();
    if (
      !this.isPositionAvailible(targetPosition) &&
      !positionsEqual(pieceProps, targetPosition)
    ) {
      return;
    }
    this.draggingOverCells.value.push(targetPosition);
  }

  public async onPieceDragEnd(
    targetPosition: BoardPosition,
    pieceProps: BoardPieceProps
  ) {
    this.dragEndTimeout = true;
    setTimeout(() => {
      this.dragEndTimeout = false;
    }, 100);
    this.clearDraggingOverCells();
    if (!this.isPositionAvailible(targetPosition)) {
      return;
    }
    await movePiece(
      pieceProps,
      targetPosition,
      this.boardStateValue,
      "default-board"
    );
    if (this.audioEffectsEnabled.value) this.pieceMoveAudioEffect.play();
  }

  public onPieceClick(pieceProps: BoardPieceProps): void {
    if (this.dragEndTimeout) {
      return;
    }
    this.boardStateValue[pieceProps.row][pieceProps.col] = null;
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
