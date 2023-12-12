<script lang="ts" setup>
import { computed, type PropType, ref, onMounted, watch, inject } from "vue";
import Cell from "./Cell.vue";
import BoardPiece from "./BoardPiece.vue";
import type BoardManager from "../modules/board_manager";
import CapturedPieces from "./CapturedPieces.vue";
import { getElementSizes } from "../modules/utils/elements";
import { BoardPosition, PieceContext } from "../modules/board_manager";
import {
  PlayerColor,
  getDiffPosition,
  positionsArrayHasPosition,
  positionsEqual,
} from "../modules/utils/game";
import Game from "../modules/game";

interface Arrow {
  color: PlayerColor;
  origin: BoardPosition;
  target: BoardPosition;
}

const pixelsPerCm = inject("pixelsPerCm") as number;

const borderPercentDelta = 100 / 7;
const cellPercentDelta = (100 - borderPercentDelta) / 7;

const props = defineProps({
  game: { type: Object as PropType<Game>, required: true },
  allPiecesContext: {
    type: Object as PropType<PieceContext[]>,
    required: true,
  },
  manager: { type: Object as PropType<BoardManager>, required: true },
  arrows: {
    type: Array as PropType<Arrow[]>,
    default: [],
  },
  primary: { type: Boolean, default: false },
});

const container = ref<HTMLDivElement | null>(null);
const containerSize = ref<number>(0);
const draggingPiece = ref<PieceContext | null>(null);
const showDragging = ref<boolean>(false);
let inchCmOffset = ref(1.8);

const cellSize = computed(() => {
  return containerSize.value / 8;
});
const pieceSize = computed(() => {
  return (
    cellSize.value -
    (props.game.settings.piecePadding.value / 50) * cellSize.value
  );
});

function updateContainerSize() {
  const minSize = getContainerMinSize();
  if (minSize) {
    containerSize.value = minSize;
  }
}

function cellIsPosition(
  row: number,
  col: number,
  position: BoardPosition | null
) {
  if (!position) return false;
  const cellPosition: BoardPosition = { row: 8 - row, col: col - 1 };
  return positionsEqual(cellPosition, position);
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
  if (props.game.settings.vibrationsEnabled.value) navigator.vibrate(30);
});

const inchPxOffset = computed(() => {
  let offset = inchCmOffset.value * pixelsPerCm;
  if (props.manager.contentRotated.value !== props.game.rotated.value) {
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
  if (props.game.rotated.value) {
    xDiff = -xDiff;
    yDiff = -yDiff;
  }

  dragXDiff.value = dragXDiff.value + xDiff;
  dragYDiff.value = dragYDiff.value + yDiff;

  lastDragX = x;
  lastDragY = y;
}

function initDrag(event: PointerEvent, pieceContext: PieceContext) {
  pressTimeout = null;
  draggingPiece.value = pieceContext;

  const x = event.clientX;
  const y = event.clientY;

  lastDragX = x;
  lastDragY = y;
  updatePointerPosition(x, y);
}

function onPiecePointerStart(event: PointerEvent, pieceContext: PieceContext) {
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
    initDrag(event, pieceContext);
  }, props.game.settings.pieceLongPressTimeout.value);
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
        rotated: props.game.rotated.value,
        contentRotated: props.manager.contentRotated.value,
        active: draggingPiece,
      }"
      :style="`--board-size: ${containerSize}px;`"
    >
      <div v-if="primary" class="black captured-pieces">
        <CapturedPieces
          :piece-ids="props.game.blackCapturedPieces.value"
          color="white"
        />
      </div>
      <div v-if="primary" class="white captured-pieces">
        <CapturedPieces
          :piece-ids="props.game.whiteCapturedPieces.value"
          color="black"
        />
      </div>
      <tr class="row" v-for="row in 8" :key="`row-${row}`">
        <Cell
          v-for="col in 8"
          @keyup.enter="onCellClick({ row, col })"
          @click="onCellClick({ row, col })"
          :key="`cell-${row}-${col}`"
          :row="9 - row"
          :col="col"
          :mark="props.manager.cellMarks[8 - row][col - 1]"
          :highlighted="
            positionsArrayHasPosition(props.game.highlightedCells.value, {
              row: 8 - row,
              col: col - 1,
            }) && props.primary
          "
          :selected="cellIsPosition(row, col, props.manager.selectedCell.value)"
          :drag-over="
            cellIsPosition(row, col, props.manager.draggingOverCell.value)
          "
        />
      </tr>

      <TransitionGroup name="piece">
        <BoardPiece
          v-for="pieceContext in props.allPiecesContext"
          :key="pieceContext.piece.id"
          @click="props.manager.onPieceClick(pieceContext)"
          @pointerdown="onPiecePointerStart($event, pieceContext)"
          :selected="
            cellIsPosition(
              8 - pieceContext.row,
              pieceContext.col + 1,
              props.manager.selectedPiece.value
            )
          "
          :dragging="
            isPieceDragged({
              row: pieceContext.row,
              col: pieceContext.col,
            })
          "
          :drag-x-diff="dragXDiff"
          :drag-y-diff="shiftedDragYDiff"
          :inch-offset="inchCmOffset"
          :row="pieceContext.row"
          :col="pieceContext.col"
          :piece="pieceContext.piece"
          :cell-size="cellSize"
          :piece-padding="props.game.settings.piecePadding.value"
          :rotated="props.manager.contentRotated.value"
          :board-rotated="props.game.rotated.value"
          :size="pieceSize"
        />
      </TransitionGroup>

      <svg id="class">
        <line
          v-for="arrow in props.arrows"
          :x1="`${
            borderPercentDelta / 2 + cellPercentDelta * arrow.origin.col
          }%`"
          :y1="`${
            borderPercentDelta / 2 + cellPercentDelta * arrow.origin.row
          }%`"
          :x2="`calc(${
            borderPercentDelta / 2 + cellPercentDelta * arrow.target.col
          }% + ${props.game.settings.pieceBorder.value * 4}px)`"
          :y2="`calc(${
            borderPercentDelta / 2 + cellPercentDelta * arrow.target.col
          }% + ${props.game.settings.pieceBorder.value * 4}px)`"
          :stroke="`var(--color-piece-stroke-${arrow.color})`"
          :stroke-width="`calc(1% + ${
            props.game.settings.pieceBorder.value * 8
          }px)`"
        />
        <line
          v-for="arrow in props.arrows"
          :x1="`${
            borderPercentDelta / 2 + cellPercentDelta * arrow.origin.col
          }%`"
          :y1="`${
            borderPercentDelta / 2 + cellPercentDelta * arrow.origin.row
          }%`"
          :x2="`${
            borderPercentDelta / 2 + cellPercentDelta * arrow.target.col
          }%`"
          :y2="`${
            borderPercentDelta / 2 + cellPercentDelta * arrow.target.col
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
