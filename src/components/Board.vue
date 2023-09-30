<script lang="ts" setup>
import { computed, type PropType, ref, onMounted } from "vue";
import type { BoardStateValue } from "../modules/user_data/board_state";
import type { PieceId, PlayerColor } from "../modules/pieces/piece";
import type Piece from "../modules/pieces/piece";
import Cell, { type Mark } from "./Cell.vue";
import BoardPiece from "./BoardPiece.vue";
import type { PieceSetValue } from "../modules/user_data/piece_set";
import type BoardManager from "../modules/board_manager";
import CapturedPieces from "./CapturedPieces.vue";
import type { BooleanBoardState } from "../modules/user_data/boolean_board_state";

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
  highlightedPiecesState: {
    type: Array as PropType<BooleanBoardState>,
    default: Array(8).fill(Array(8).fill(false)),
  },
  highlightedCellsState: {
    type: Array as PropType<BooleanBoardState>,
    default: Array(8).fill(Array(8).fill(false)),
  },
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
  piecePadding: { type: Number, required: true },
  pieceBorder: { type: Number, required: true },
  manager: { type: Object as PropType<BoardManager>, required: true },
  whiteCapturedPieces: { type: Array as PropType<PieceId[]> },
  blackCapturedPieces: { type: Array as PropType<PieceId[]> },
  rotated: { type: Boolean, default: false },
  arrows: {
    type: Array as PropType<Arrow[]>,
    default: [],
  },
  primary: { type: Boolean, default: false },
});

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

const cellSize = computed(() => {
  return containerSize.value / 8;
});

onMounted(() => {
  const observer = new ResizeObserver(updateContainerSize);
  if (container.value) {
    observer.observe(container.value);
  } else {
    console.error(
      "Board container element reference is null. Cannot set observer."
    );
  }
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
</script>

<template>
  <div class="board-container" ref="container">
    <table
      role="grid"
      :class="`board ${props.rotated ? 'rotated' : ''}`"
      :style="`width: ${containerSize}px; height: ${containerSize}px;`"
    >
      <div v-if="primary" class="black captured-pieces">
        <CapturedPieces
          :piece-set="props.pieceSet"
          :piece-ids="
            props.rotated ? props.whiteCapturedPieces : blackCapturedPieces
          "
          color="white"
        />
      </div>
      <div v-if="primary" class="white captured-pieces">
        <CapturedPieces
          :piece-set="props.pieceSet"
          :piece-ids="
            props.rotated ? props.blackCapturedPieces : whiteCapturedPieces
          "
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
          :mark="props.marksState[8 - row][col - 1]"
          :highlighted="props.highlightedCellsState[8 - row][col - 1]"
        />
      </tr>

      <TransitionGroup name="piece">
        <BoardPiece
          v-for="pieceProps in allPieceProps"
          :key="pieceProps.piece.id"
          @click="props.manager.onPieceClick(pieceProps)"
          :highlighted="
            props.highlightedPiecesState[pieceProps.row][pieceProps.col]
          "
          :row="pieceProps.row"
          :col="pieceProps.col"
          :piece="pieceProps.piece"
          :piece-set="props.pieceSet"
          :cell-size="cellSize"
          :piece-padding="piecePadding"
          :rotated="props.rotated"
        />
      </TransitionGroup>

      <svg id="arrows">
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
  position: absolute;
  background-color: var(--color-cell-black);
  display: flex;
  flex-direction: column;

  &.rotated {
    transform: rotate(-0.5turn);
  }

  .row {
    height: 100%;
    padding: 0;
    display: flex;
  }
}

#arrows {
  @include stretch;
  position: absolute;
  pointer-events: none;
}
</style>
