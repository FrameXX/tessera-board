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
import type { BoardStateValue } from "../modules/user_data/board_state";
import { getDeltaPosition, type PieceId } from "../modules/pieces/piece";
import type Piece from "../modules/pieces/piece";
import Cell, { type Mark } from "./Cell.vue";
import BoardPiece from "./BoardPiece.vue";
import type BoardManager from "../modules/board_manager";
import CapturedPieces from "./CapturedPieces.vue";
import type { BooleanBoardState } from "../modules/user_data/boolean_board_state";
import { positionsEqual } from "../modules/game_board_manager";
import type { PlayerColor } from "../modules/game";

export type MarkBoardState = (Mark | null)[][];

export interface BoardPosition {
  row: number;
  col: number;
}

export interface BoardPieceProps extends BoardPosition {
  piece: Piece;
}

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
    default: Array(8).fill(Array(8).fill(false)),
  },
  selectedCells: {
    type: Array as PropType<BoardPosition[]>,
    default: Array(8).fill(Array(8).fill(false)),
  },
  draggingOverCells: {
    type: Array as PropType<BoardPosition[]>,
    default: Array(8).fill(Array(8).fill(false)),
  },
  highlightedCellsState: {
    type: Array as PropType<BooleanBoardState>,
    default: Array(8).fill(Array(8).fill(false)),
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
});

const longPressTimeout = inject("longPressTimeout") as Ref<number>;
const useVibrations = inject("useVibrations") as Ref<boolean>;
const pixelsPerCm = inject("pixelsPerCm") as number;

// All pieces are extracted from the boardPieces 2D array into a list of objects with row and col attached. They are simpler to render using v-for in this form.
const allPieceProps = computed(() => {
  const allPieceProps: BoardPieceProps[] = [];
  for (const [rowIndex, row] of props.state.entries()) {
    for (const [colIndex, piece] of row.entries()) {
      if (piece) {
        allPieceProps.push({
          row: rowIndex,
          col: colIndex,
          piece: piece,
        });
      }
    }
  }
  allPieceProps.sort((a, b) => a.piece.id.localeCompare(b.piece.id));
  return allPieceProps;
});

const container = ref<HTMLDivElement | null>(null);
const containerSize = ref<number>(0);
const draggingPiece = ref<BoardPieceProps | null>(null);
let inchOffset = ref(1.8);

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
    const minSize = Math.min(
      +getComputedStyle(container.value).width.split("px")[0],
      +getComputedStyle(container.value).height.split("px")[0]
    );
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
  if (draggingPiece.value === null) {
    return false;
  }
  return positionsEqual(draggingPiece.value, position);
}

const dragRowDelta = computed(() => {
  let totalDelta;
  props.rotated
    ? (totalDelta = -inchPxOffset.value - dragYDelta.value)
    : (totalDelta = inchPxOffset.value - dragYDelta.value);
  let delta = Math.round(totalDelta / cellSize.value);
  if (delta === -0) {
    delta = 0;
  }
  return delta;
});
const dragColDelta = computed(() => {
  let delta = Math.round(dragXDelta.value / cellSize.value);
  if (delta === -0) {
    delta = 0;
  }
  return delta;
});
const targetingDragPosition = computed(() => {
  if (draggingPiece.value === null) {
    return { row: 0, col: 0 };
  }
  const position = getDeltaPosition(
    { row: draggingPiece.value?.row, col: draggingPiece.value?.col },
    dragColDelta.value,
    dragRowDelta.value
  );
  return position;
});
watch(targetingDragPosition, () => {
  if (draggingPiece.value === null) {
    return;
  }
  props.manager.onPieceDragOverCell(
    draggingPiece.value,
    targetingDragPosition.value
  );
});

function resetDragDelta() {
  dragXDelta.value = 0;
  dragYDelta.value = 0;
}

const inchPxOffset = computed(() => {
  return inchOffset.value * pixelsPerCm;
});
let pressTimeout: number = 0;
let lastDragX: number = 0;
let lastDragY: number = 0;
const dragXDelta = ref(0);
const dragYDelta = ref(0);

function onPieceMouseDown(event: MouseEvent, pieceProps: BoardPieceProps) {
  if (event.button !== 0 || pressTimeout !== 0) return;
  inchOffset.value = 0;
  onPiecePressStart(event.clientX, event.clientY, pieceProps);
}

function onPieceTouchStart(event: TouchEvent, pieceProps: BoardPieceProps) {
  if (pressTimeout !== 0) return;
  const touch = event.touches[0];
  inchOffset.value = 1.8;
  onPiecePressStart(touch.clientX, touch.clientY, pieceProps);
}

function onPiecePressStart(x: number, y: number, pieceProps: BoardPieceProps) {
  pressTimeout = window.setTimeout(() => {
    draggingPiece.value = pieceProps;
    props.manager.onPieceDragStart(pieceProps, targetingDragPosition.value);
    lastDragX = x;
    lastDragY = y;
    if (useVibrations.value) navigator.vibrate(30);
  }, longPressTimeout.value);
}

function onPiecePressEnd() {
  if (draggingPiece.value === null) {
    clearTimeout(pressTimeout);
    return;
  }
  props.manager.onPieceDragEnd(
    draggingPiece.value,
    targetingDragPosition.value
  );
  draggingPiece.value = null;
  pressTimeout = 0;
  resetDragDelta();
}

function onPieceMouseMove(event: MouseEvent) {
  if (draggingPiece.value === null) {
    return;
  }
  onPieceMove(event.clientX, event.clientY);
}

function onPieceTouchMove(event: TouchEvent) {
  if (draggingPiece.value === null) {
    return;
  }
  const touch = event.touches[0];
  onPieceMove(touch.clientX, touch.clientY);
}

function onPieceMove(x: number, y: number) {
  let xDelta = x - lastDragX;
  let yDelta = y - lastDragY;
  if (props.rotated) {
    xDelta = -xDelta;
    yDelta = -yDelta;
  }
  lastDragX = x;
  lastDragY = y;
  dragXDelta.value = dragXDelta.value + xDelta;
  dragYDelta.value = dragYDelta.value + yDelta;
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

  addEventListener("mouseup", onPiecePressEnd);
  addEventListener("touchend", onPiecePressEnd, {
    passive: true,
  });
  addEventListener("mousemove", onPieceMouseMove);
  addEventListener("touchmove", onPieceTouchMove, {
    passive: true,
  });
});
</script>

<template>
  <div class="board-container" ref="container">
    <table
      role="grid"
      class="board"
      :class="{ rotated: props.rotated, contentRotated: props.contentRotated }"
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
          :highlighted="props.highlightedCellsState[8 - row][col - 1]"
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
          v-for="pieceProps in allPieceProps"
          :key="pieceProps.piece.id"
          @click="props.manager.onPieceClick(pieceProps)"
          @touchstart="onPieceTouchStart($event, pieceProps)"
          @mousedown="onPieceMouseDown($event, pieceProps)"
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
          :drag-x-delta="dragXDelta"
          :drag-y-delta="dragYDelta"
          :inch-offset="inchOffset"
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

  .row {
    height: 100%;
    padding: 0;
    display: flex;
  }
}

.arrows {
  @include stretch;
  position: absolute;
  pointer-events: none;
}
</style>
