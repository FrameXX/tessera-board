<script lang="ts" setup>
import {
  computed,
  type PropType,
  ref,
  onMounted,
  inject,
  type Ref,
  watch,
} from "vue";
import { getDiffPosition, type PieceId } from "../modules/pieces/piece";
import Cell from "./Cell.vue";
import BoardPiece from "./BoardPiece.vue";
import type BoardManager from "../modules/board_manager";
import CapturedPieces from "./CapturedPieces.vue";
import { positionsEqual } from "../modules/game_board_manager";
import type { PlayerColor } from "../modules/game";
import { getElementSizes } from "../modules/utils/elements";
import {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
  MarkBoardState,
} from "../modules/board_manager";

interface Arrow {
  color: PlayerColor;
  origin: BoardPosition;
  target: BoardPosition;
}

const BORDER_PERCENT_DELTA = 100 / 7;
const CELL_PERCENT_DELTA = (100 - BORDER_PERCENT_DELTA) / 7;

const props = defineProps({
  state: { type: Object as PropType<BoardStateValue>, required: true },
  marksState: {
    type: Array as PropType<MarkBoardState>,
    default: Array(8).fill(Array(8).fill(null)),
  },
  selectedPieces: {
    type: Array as PropType<BoardPosition[]>,
    default: [],
  },
  selectedCells: {
    type: Array as PropType<BoardPosition[]>,
    default: [],
  },
  draggingOverCells: {
    type: Array as PropType<BoardPosition[]>,
    default: [],
  },
  highlightedCells: {
    type: Array as PropType<BoardPosition[]>,
    default: [],
  },
  piecePadding: { type: Number, required: true },
  pieceBorder: { type: Number, required: true },
  manager: { type: Object as PropType<BoardManager>, required: true },
  whiteCapturedPieces: { type: Array as PropType<PieceId[]> },
  blackCapturedPieces: { type: Array as PropType<PieceId[]> },
  contentRotated: { type: Boolean, default: false },
  rotated: { type: Boolean, default: false },
  arrows: {
    type: Array as PropType<Arrow[]>,
    default: [],
  },
  primary: { type: Boolean, default: false },
  allPieceProps: {
    type: Object as PropType<BoardPieceProps[]>,
    required: true,
  },
});

const pieceLongPressTimeout = inject("pieceLongPressTimeout") as Ref<number>;
const vibrationsEnabled = inject("vibrationsEnabled") as Ref<boolean>;
const pixelsPerCm = inject("pixelsPerCm") as number;

const container = ref<HTMLDivElement | null>(null);
const containerSize = ref<number>(0);
const draggingPiece = ref<BoardPieceProps | null>(null);
const showDragging = ref<boolean>(false);
let inchCmOffset = ref(1.8);

const cellSize = computed(() => {
  return containerSize.value / 8;
});
const pieceSize = computed(() => {
  return cellSize.value - (props.piecePadding / 50) * cellSize.value;
});

function updateContainerSize() {
  const minSize = getContainerMinSize();
  if (minSize) {
    containerSize.value = minSize;
  }
}

function getContainerMinSize() {
  if (container.value) {
    const [width, height] = getElementSizes(container.value);
    const minSize = Math.min(width, height);
    return minSize;
  } else {
    console.error(
      "Board container element reference is null. Cannot get minSize."
    );
    return null;
  }
}

function onCellClick(position: BoardPosition) {
  props.manager.onCellClick({ row: 8 - position.row, col: position.col - 1 });
}

function isInArrayOfBoardPositions(
  position: BoardPosition,
  array: BoardPosition[]
) {
  return (
    array.filter((selectedPosition) =>
      positionsEqual(selectedPosition, position)
    ).length > 0
  );
}

function isPieceDragged(position: BoardPosition) {
  if (!draggingPiece.value || !showDragging.value) {
    return false;
  }
  return positionsEqual(draggingPiece.value, position);
}

function resetDragDiff() {
  dragXDiff.value = 0;
  dragYDiff.value = 0;
}

const shiftedDragYDiff = computed(() => {
  return dragYDiff.value - inchPxOffset.value;
});

const dragRowDiff = computed(() => {
  let diff = Math.round(-shiftedDragYDiff.value / cellSize.value);
  if (diff === -0) {
    diff = 0;
  }
  return diff;
});

const dragColDiff = computed(() => {
  let diff = Math.round(dragXDiff.value / cellSize.value);
  if (diff === -0) {
    diff = 0;
  }
  return diff;
});

const targetingDragPosition = computed(() => {
  if (!draggingPiece.value) {
    return { row: 0, col: 0 };
  }
  const position = getDiffPosition(
    { row: draggingPiece.value?.row, col: draggingPiece.value?.col },
    dragColDiff.value,
    dragRowDiff.value
  );
  return position;
});

watch(targetingDragPosition, () => {
  if (!draggingPiece.value || !showDragging.value) {
    return;
  }
  props.manager.onPieceDragOverCell(
    targetingDragPosition.value,
    draggingPiece.value
  );
});

watch(showDragging, (newValue) => {
  if (!draggingPiece.value || !newValue) return;
  props.manager.onPieceDragStart(
    targetingDragPosition.value,
    draggingPiece.value
  );
  if (vibrationsEnabled.value) navigator.vibrate(30);
});

const inchPxOffset = computed(() => {
  let offset = inchCmOffset.value * pixelsPerCm;
  if (props.contentRotated !== props.rotated) {
    offset *= -1;
  }
  return offset;
});

let pressTimeout: number | null = null;
let lastDragX = 0;
let lastDragY = 0;
const dragXDiff = ref(0);
const dragYDiff = ref(0);

watch(dragXDiff, dragDiffChange);
watch(dragYDiff, dragDiffChange);

function dragDiffChange() {
  if (showDragging.value || !draggingPiece.value) return;
  if (
    Math.abs(dragXDiff.value) / cellSize.value > 0.5 ||
    Math.abs(dragYDiff.value) / cellSize.value > 0.5
  ) {
    showDragging.value = true;
  }
}

function updatePointerPosition(x: number, y: number) {
  let xDiff = x - lastDragX;
  let yDiff = y - lastDragY;
  if (props.rotated) {
    xDiff = -xDiff;
    yDiff = -yDiff;
  }

  dragXDiff.value = dragXDiff.value + xDiff;
  dragYDiff.value = dragYDiff.value + yDiff;

  lastDragX = x;
  lastDragY = y;
}

function initDrag(event: PointerEvent, pieceProps: BoardPieceProps) {
  pressTimeout = null;
  draggingPiece.value = pieceProps;

  const x = event.clientX;
  const y = event.clientY;

  lastDragX = x;
  lastDragY = y;
  updatePointerPosition(x, y);
}

function onPiecePointerStart(event: PointerEvent, pieceProps: BoardPieceProps) {
  if (event.pointerType === "touch") {
    if (pressTimeout !== null || draggingPiece.value !== null) return;
    inchCmOffset.value = 1.8;
  } else {
    if (
      event.button !== 0 ||
      pressTimeout !== null ||
      draggingPiece.value !== null
    )
      return;
    inchCmOffset.value = 0;
  }

  pressTimeout = window.setTimeout(() => {
    initDrag(event, pieceProps);
  }, pieceLongPressTimeout.value);
}

function onPointerMove(event: PointerEvent) {
  if (!draggingPiece.value) {
    return;
  }
  updatePointerPosition(event.clientX, event.clientY);
}

function onPointerUp() {
  if (!draggingPiece.value) {
    if (pressTimeout === null) return;
    clearTimeout(pressTimeout);
    pressTimeout = null;
    return;
  }
  if (showDragging.value) {
    props.manager.onPieceDragEnd(
      targetingDragPosition.value,
      draggingPiece.value
    );
    showDragging.value = false;
  }
  draggingPiece.value = null;
  resetDragDiff();
}

onMounted(() => {
  const observer = new ResizeObserver(updateContainerSize);
  if (container.value) {
    observer.observe(container.value);
  } else {
    console.error(
      "Board container element reference is null. Cannot set observer."
    );
  }

  addEventListener("pointerup", onPointerUp, {
    passive: true,
  });
  addEventListener("pointermove", onPointerMove, {
    passive: true,
  });
});
</script>

<template>
  <div class="board-container" ref="container">
    <table
      role="grid"
      class="board"
      :class="{
        rotated: props.rotated,
        contentRotated: props.contentRotated,
        active: draggingPiece,
      }"
      :style="`--board-size: ${containerSize}px;`"
    >
      <div v-if="primary" class="black captured-pieces">
        <CapturedPieces :piece-ids="blackCapturedPieces" color="white" />
      </div>
      <div v-if="primary" class="white captured-pieces">
        <CapturedPieces :piece-ids="whiteCapturedPieces" color="black" />
      </div>
      <tr class="row" v-for="row in 8" :key="`row-${row}`">
        <Cell
          v-for="col in 8"
          @keyup.enter="onCellClick({ row, col })"
          @click="onCellClick({ row, col })"
          :key="`cell-${row}-${col}`"
          :row="9 - row"
          :col="col"
          :mark="props.marksState[8 - row][col - 1]"
          :highlighted="
            isInArrayOfBoardPositions(
              { row: 8 - row, col: col - 1 },
              props.highlightedCells
            )
          "
          :selected="
            isInArrayOfBoardPositions(
              { row: 8 - row, col: col - 1 },
              props.selectedCells
            )
          "
          :drag-over="
            isInArrayOfBoardPositions(
              { row: 8 - row, col: col - 1 },
              props.draggingOverCells
            )
          "
        />
      </tr>

      <TransitionGroup name="piece">
        <BoardPiece
          v-for="pieceProps in props.allPieceProps"
          :key="pieceProps.piece.id"
          @click="props.manager.onPieceClick(pieceProps)"
          @pointerdown="onPiecePointerStart($event, pieceProps)"
          :selected="
            isInArrayOfBoardPositions(
              {
                row: pieceProps.row,
                col: pieceProps.col,
              },
              props.selectedPieces
            )
          "
          :dragging="
            isPieceDragged({
              row: pieceProps.row,
              col: pieceProps.col,
            })
          "
          :drag-x-diff="dragXDiff"
          :drag-y-diff="shiftedDragYDiff"
          :inch-offset="inchCmOffset"
          :row="pieceProps.row"
          :col="pieceProps.col"
          :piece="pieceProps.piece"
          :cell-size="cellSize"
          :piece-padding="piecePadding"
          :rotated="props.contentRotated"
          :board-rotated="props.rotated"
          :size="pieceSize"
        />
      </TransitionGroup>

      <svg id="class">
        <line
          v-for="arrow in props.arrows"
          :x1="`${
            BORDER_PERCENT_DELTA / 2 + CELL_PERCENT_DELTA * arrow.origin.col
          }%`"
          :y1="`${
            BORDER_PERCENT_DELTA / 2 + CELL_PERCENT_DELTA * arrow.origin.row
          }%`"
          :x2="`calc(${
            BORDER_PERCENT_DELTA / 2 + CELL_PERCENT_DELTA * arrow.target.col
          }% + ${props.pieceBorder * 4}px)`"
          :y2="`calc(${
            BORDER_PERCENT_DELTA / 2 + CELL_PERCENT_DELTA * arrow.target.col
          }% + ${props.pieceBorder * 4}px)`"
          :stroke="`var(--color-piece-stroke-${arrow.color})`"
          :stroke-width="`calc(1% + ${props.pieceBorder * 8}px)`"
        />
        <line
          v-for="arrow in props.arrows"
          :x1="`${
            BORDER_PERCENT_DELTA / 2 + CELL_PERCENT_DELTA * arrow.origin.col
          }%`"
          :y1="`${
            BORDER_PERCENT_DELTA / 2 + CELL_PERCENT_DELTA * arrow.origin.row
          }%`"
          :x2="`${
            BORDER_PERCENT_DELTA / 2 + CELL_PERCENT_DELTA * arrow.target.col
          }%`"
          :y2="`${
            BORDER_PERCENT_DELTA / 2 + CELL_PERCENT_DELTA * arrow.target.col
          }%`"
          :stroke="`var(--color-piece-fill-${arrow.color})`"
          stroke-width="1%"
        />
      </svg>
    </table>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.board-container {
  @include stretch;
  @include flex-center;
  flex-grow: 1;

  .board-wrapper {
    position: absolute;
  }
}

.board {
  @include round-border;
  @include shadow;
  width: var(--board-size);
  height: var(--board-size);
  position: absolute;
  background-color: var(--color-cell-black);
  display: flex;
  flex-direction: column;

  &.rotated {
    rotate: -0.5turn;
  }

  &.active {
    z-index: var(--z-index-piece-top);
  }

  .row {
    height: 100%;
    padding: 0;
    display: flex;
  }
}

#boards-area {
  .board-container {
    padding: 0 var(--spacing-small);
  }
}

.arrows {
  @include stretch;
  position: absolute;
  pointer-events: none;
}
</style>
