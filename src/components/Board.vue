<script lang="ts" setup>
import { computed, type PropType, ref, onMounted } from "vue";
import type { BoardStateValue } from "../modules/user_data/board_state";
import Piece from "../modules/classes/pieces";
import Cell from "./Cell.vue";
import PieceIcon from "./PieceIcon.vue";
import type { PieceSetValue } from "../modules/user_data/piece_set";
import type BoardManager from "../modules/classes/board_manager";

export interface BoardPiece {
  row: number;
  col: number;
  piece: Piece;
}

const props = defineProps({
  state: { type: Object as PropType<BoardStateValue>, required: true },
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
  piecePadding: { type: Number, required: true },
  manager: { type: Object as PropType<BoardManager>, required: true },
});
const boardPieces = computed(() => {
  const boardPieces: BoardPiece[] = [];
  for (const [rowIndex, row] of props.state.entries()) {
    for (const [colIndex, piece] of row.entries()) {
      if (piece) {
        boardPieces.push({
          row: rowIndex,
          col: colIndex,
          piece: piece,
        });
      }
    }
  }
  boardPieces.sort((a, b) => a.piece.id.localeCompare(b.piece.id));
  return boardPieces;
});

const container = ref<HTMLDivElement | null>(null);
const containerMinSize = ref<number>(0);

const cellSize = computed(() => {
  return containerMinSize.value / 8;
});
const halfCell = computed(() => {
  return cellSize.value / 2;
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

function getPieceX(col: number) {
  return col * cellSize.value;
}

function getPieceY(row: number) {
  return (7 - row) * cellSize.value;
}
</script>

<template>
  <div class="board-container" ref="container">
    <table
      role="grid"
      class="board"
      :style="`width: ${containerMinSize}px; height: ${containerMinSize}px;`"
    >
      <tr class="row" v-for="row in 8" :key="`row-${row}`">
        <Cell
          v-for="col in 8"
          @click="props.manager.onCellClick(8 - row, col - 1)"
          :key="`cell-${row}-${col}`"
          :row="9 - row"
          :col="col"
        ></Cell>
      </tr>
      <TransitionGroup name="piece">
        <div
          class="piece-wrapper"
          v-for="boardPiece in boardPieces"
          :key="boardPiece.piece.id"
          :style="`transform-origin: ${
            getPieceX(boardPiece.col) + halfCell
          }px ${getPieceY(boardPiece.row) + halfCell}px`"
        >
          <PieceIcon
            @click="props.manager.onPieceClick(boardPiece)"
            :board-piece="boardPiece"
            :piece-set="props.pieceSet"
            :cell-size="cellSize"
            :piece-padding="piecePadding"
          />
        </div>
      </TransitionGroup>
    </table>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.piece-wrapper {
  position: absolute;
  pointer-events: none;
  @include stretch;
}

.board-container {
  @include stretch;
  @include flex-center;
  flex-grow: 1;
  padding: 0 var(--spacing-small);

  .board-wrapper {
    position: absolute;
  }
}

.board {
  @include round-border;
  @include shadow;
  // flex-grow: 1;
  position: absolute;
  background-color: var(--color-cell-black);
  display: flex;
  flex-direction: column;

  caption {
    @include no-select;
    text-transform: uppercase;
    padding: var(--spacing-medium);
    color: var(--color-cell-white);
    border-bottom: var(--border-width) solid var(--color-cell-white);
  }

  .row {
    height: 100%;
    padding: 0;
    display: flex;
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
    var(--transition-timing-function-motion);
  width: 0.7rem;
  height: 0.7rem;
  font-size: var(--font-size-tiny);
  padding: calc(var(--spacing-tiny) / 2);
  opacity: var(--cell-index-opacity);
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
