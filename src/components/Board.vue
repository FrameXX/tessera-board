<script lang="ts" setup>
import { computed, type PropType, ref, onMounted } from "vue";
import type { BoardStateValue } from "../modules/user_data/board_state";
import Piece from "../modules/pieces";
import Cell, { type Mark } from "./Cell.vue";
import BoardPiece from "./BoardPiece.vue";
import type { PieceSetValue } from "../modules/user_data/piece_set";
import type BoardManager from "../modules/board_manager";
import CapturedPieces from "./CapturedPieces.vue";

export type MarkState = (Mark | null)[][];

export interface BoardPieceProps {
  row: number;
  col: number;
  piece: Piece;
}

const props = defineProps({
  state: { type: Object as PropType<BoardStateValue>, required: true },
  marksState: {
    type: Array as PropType<MarkState>,
    default: Array(8).fill(Array(8).fill(null)),
  },
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
  piecePadding: { type: Number, required: true },
  manager: { type: Object as PropType<BoardManager>, required: true },
  playerCapturedPieces: { type: Array as PropType<Piece[]> },
  opponentCapturedPieces: { type: Array as PropType<Piece[]> },
  rotated: { type: Boolean, default: false },
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
const containerMinSize = ref<number>(0);

const cellSize = computed(() => {
  return containerMinSize.value / 8;
});

onMounted(() => {
  const observer = new ResizeObserver(updateContainerMinSize);
  if (container.value) {
    observer.observe(container.value);
  } else {
    console.error(
      "Board container element reference is null. Cannot set observer."
    );
  }
});

function updateContainerMinSize() {
  const minSize = getContainerMinSize();
  if (minSize !== null) {
    containerMinSize.value = minSize;
  } else {
    console.error(
      "Board container element reference is null. Cannot update minSize."
    );
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
    return null;
  }
}
</script>

<template>
  <div class="board-container" ref="container">
    <table
      role="grid"
      :class="`board ${props.rotated ? 'rotated' : ''}`"
      :style="`width: ${containerMinSize}px; height: ${containerMinSize}px;`"
    >
      <div class="black captured-pieces"><CapturedPieces /></div>
      <div class="white captured-pieces"><CapturedPieces /></div>
      <tr class="row" v-for="row in 8" :key="`row-${row}`">
        <Cell
          v-for="col in 8"
          @click="props.manager.onCellClick(8 - row, col - 1)"
          :key="`cell-${row}-${col}`"
          :row="9 - row"
          :col="col"
          :mark="props.marksState[row - 1][col - 1]"
        />
      </tr>

      <TransitionGroup name="piece">
        <BoardPiece
          v-for="pieceProps in allPieceProps"
          :key="pieceProps.piece.id"
          @click="props.manager.onPieceClick(pieceProps)"
          :row="pieceProps.row"
          :col="pieceProps.col"
          :piece="pieceProps.piece"
          :piece-set="props.pieceSet"
          :cell-size="cellSize"
          :piece-padding="piecePadding"
          :rotated="props.rotated"
        />
      </TransitionGroup>
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

.captured-pieces {
  @include flex-center;
  position: absolute;
  height: 40px;
  width: 100%;

  &.white {
    top: 100%;
    left: 0;
  }

  &.black {
    bottom: 100%;
    right: 0;
  }
}

.board.rotated {
  .captured-pieces {
    transform: rotate(-0.5turn);
  }
}

.index-row-left,
.index-row-right,
.index-col-bottom,
.index-col-top {
  @include flex-center;
  @include no-select;
  color: var(--color-cell-white);
  position: absolute;
  mix-blend-mode: exclusion;
  transition: transform var(--transition-duration-short)
    var(--transition-timing-bounce);
  width: 0.7rem;
  height: 0.7rem;
  font-size: var(--font-size-tiny);
  padding: calc(var(--spacing-tiny) / 2);
  opacity: var(--cell-index-opacity);
}

.board.rotated {
  .index-row-left,
  .index-row-right,
  .index-col-bottom,
  .index-col-top {
    transform: rotate(-0.5turn);
  }
}

.index-row-left,
.index-row-right {
  top: 0;
  bottom: 0;
  margin: auto;
}

.index-row-left {
  left: 0;
}

.index-row-right {
  right: 0;
}

.index-col-bottom,
.index-col-top {
  right: 0;
  left: 0;
  margin: auto;
}

.index-col-bottom {
  bottom: 0;
}

.index-col-top {
  top: 0;
}
</style>
