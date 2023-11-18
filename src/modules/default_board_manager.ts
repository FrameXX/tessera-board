import BoardManager, {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
} from "./board_manager";
import type ConfigPieceDialog from "./dialogs/config_piece";
import type { Ref } from "vue";
import { isPositionOnBoard } from "./pieces/piece";
import { movePiece } from "./moves/move";
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
    if (this.audioEffects.value) this.pieceMoveAudioEffect.play();
  }

  public onPieceClick(pieceProps: BoardPieceProps): void {
    if (this.dragEndTimeout) {
      return;
    }
    this.boardStateValue[pieceProps.row][pieceProps.col] = null;
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
