import type { ComputedRef } from "vue";
import { computed, ref, watch } from "vue";
import type { BoardPosition, PieceContext } from "./board_manager";
import type BoardManager from "./board_manager";
import { positionsEqual, addPositions } from "./utils/game";
import type Game from "./game";

export default class BoardPieceDragHandler {
  private pressTimeout: number | null = null;
  private lastDragX = 0;
  private lastDragY = 0;
  private readonly showDragging = ref<boolean>(false);
  public dragXDiff = ref(0);
  public dragYDiff = ref(0);
  public draggingPiece = ref<PieceContext | null>(null);
  public readonly inchCmOffset = ref(1.8);

  private inchPxOffset = computed(() => {
    let offset = this.inchCmOffset.value * this.pixelsPerCm;
    if (
      this.boardManager.contentRotated.value &&
      this.boardManager.boardRotated.value
    ) {
      offset *= -1;
    }
    return offset;
  });
  public shiftedDragYDiff = computed(() => {
    return this.dragYDiff.value - this.inchPxOffset.value;
  });
  private dragRowDiff = computed(() => {
    let diff = Math.round(-this.shiftedDragYDiff.value / this.cellSize.value);
    diff = diff + 0;
    return diff;
  });
  private dragColDiff = computed(() => {
    let diff = Math.round(this.dragXDiff.value / this.cellSize.value);
    diff = diff + 0;
    return diff;
  });
  private targetingDragPosition = computed(() => {
    if (!this.draggingPiece.value) {
      return { row: 0, col: 0 };
    }
    const position = addPositions(
      {
        row: this.draggingPiece.value?.row,
        col: this.draggingPiece.value?.col,
      },
      {
        row: this.dragRowDiff.value,
        col: this.dragColDiff.value,
      }
    );
    return position;
  });

  constructor(
    public boardManager: BoardManager,
    public game: Game,
    private readonly cellSize: ComputedRef<number>,
    private readonly pixelsPerCm: number
  ) {
    watch(this.targetingDragPosition, () => {
      if (!this.draggingPiece.value || !this.showDragging.value) {
        return;
      }
      this.boardManager.onPieceDragOverCell(
        this.targetingDragPosition.value,
        this.draggingPiece.value
      );
    });

    watch(this.showDragging, (newValue) => {
      if (!this.draggingPiece.value || !newValue) return;
      this.boardManager.onPieceDragStart(
        this.targetingDragPosition.value,
        this.draggingPiece.value
      );
      if (this.game.settings.vibrationsEnabled.value) navigator.vibrate(30);
    });
    watch(this.dragXDiff, this.dragDiffChange);
    watch(this.dragYDiff, this.dragDiffChange);
  }

  public isPieceDragged(position: BoardPosition) {
    if (!this.draggingPiece.value || !this.showDragging.value) {
      return false;
    }
    return positionsEqual(this.draggingPiece.value, position);
  }

  private dragDiffChange = () => {
    if (this.showDragging.value || !this.draggingPiece.value) return;
    if (
      Math.abs(this.dragXDiff.value) / this.cellSize.value > 0.5 ||
      Math.abs(this.dragYDiff.value) / this.cellSize.value > 0.5
    ) {
      this.showDragging.value = true;
    }
  };

  public onPiecePointerStart(event: PointerEvent, pieceContext: PieceContext) {
    if (event.pointerType === "touch") {
      if (this.pressTimeout !== null || this.draggingPiece.value !== null)
        return;
      this.inchCmOffset.value = 1.8;
    } else {
      if (
        event.button !== 0 ||
        this.pressTimeout !== null ||
        this.draggingPiece.value !== null
      )
        return;
      this.inchCmOffset.value = 0;
    }

    this.pressTimeout = window.setTimeout(() => {
      this.initDrag(event, pieceContext);
    }, this.game.settings.pieceLongPressTimeout.value);
  }

  private initDrag(event: PointerEvent, pieceContext: PieceContext) {
    this.pressTimeout = null;
    this.draggingPiece.value = pieceContext;

    const x = event.clientX;
    const y = event.clientY;

    this.lastDragX = x;
    this.lastDragY = y;
    this.updatePointerPosition(x, y);
  }

  private updatePointerPosition(x: number, y: number) {
    let xDiff = x - this.lastDragX;
    let yDiff = y - this.lastDragY;
    if (this.boardManager.boardRotated.value) {
      xDiff = -xDiff;
      yDiff = -yDiff;
    }

    this.dragXDiff.value = this.dragXDiff.value + xDiff;
    this.dragYDiff.value = this.dragYDiff.value + yDiff;

    this.lastDragX = x;
    this.lastDragY = y;
  }

  public onPointerMove = (event: PointerEvent) => {
    if (!this.draggingPiece.value) {
      return;
    }
    this.updatePointerPosition(event.clientX, event.clientY);
  };

  public onPointerUp = () => {
    if (!this.draggingPiece.value) {
      if (this.pressTimeout === null) return;
      clearTimeout(this.pressTimeout);
      this.pressTimeout = null;
      return;
    }
    if (this.showDragging.value) {
      this.boardManager.onPieceDragEnd(
        this.targetingDragPosition.value,
        this.draggingPiece.value
      );
      this.showDragging.value = false;
    }
    this.draggingPiece.value = null;
    this.resetDragDiff();
  };

  private resetDragDiff() {
    this.dragXDiff.value = 0;
    this.dragYDiff.value = 0;
  }
}
