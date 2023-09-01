<script lang="ts" setup>
import Icon from "./Icon.vue";
import type { BoardPiece } from "./Board.vue";
import { type PropType, computed, ref } from "vue";
import type { PieceSetValue } from "../modules/user_data/piece_set";
import { capitalizeFirst } from "../modules/utils/misc";

const PIECE_SETS_DIR = "assets/img/";

const props = defineProps({
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
  boardPiece: { type: Object as PropType<BoardPiece>, required: true },
  cellSize: { type: Number, required: true },
  piecePadding: { type: Number, required: true },
});
const zIndex = ref("");

const translateX = computed(() => {
  return props.boardPiece.col * props.cellSize;
});
const translateY = computed(() => {
  return (7 - props.boardPiece.row) * props.cellSize;
});
const pieceSize = computed(() => {
  return props.cellSize - props.piecePadding * 2;
});

const label = computed(() => {
  return `${capitalizeFirst(props.boardPiece.piece.color)} ${
    props.boardPiece.piece.pieceId
  }`;
});
</script>

<template>
  <Icon
    :aria-label="label"
    :title="label"
    tabindex="0"
    class="piece"
    :style="`transform: translate(${translateX}px,${translateY}px); width: ${pieceSize}px; height: ${pieceSize}px; z-index: ${zIndex};`"
    :icon-id="`${props.boardPiece.piece.pieceId}-${props.boardPiece.piece.color}`"
    :source-file="`${PIECE_SETS_DIR}pieces_${props.pieceSet}.svg`"
  />
</template>

<style lang="scss">
@import "../partials/mixins";

.piece {
  @include clickable;
  outline: none;
  pointer-events: all;
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  padding: var(--piece-padding);
  transition: transform var(--transition-duration-medium)
    var(--transition-timing-function-display);
}

.piece-move,
.piece-enter-active,
.piece-leave-active {
  transition: transform var(--transition-duration-medium)
    var(--transition-timing-function-display);
}

.piece-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(1.1);
}

.piece-leave-to {
  opacity: 0;
  transform: translateY(-100px) rotate(215deg) scale(2);
}

.piece-leave-active {
  position: absolute;
}
</style>
