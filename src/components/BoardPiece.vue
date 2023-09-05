<script lang="ts" setup>
import PieceIcon from "./PieceIcon.vue";
import type { PositionedPiece } from "./Board.vue";
import {
  type PropType,
  computed,
  ref,
  watch,
  reactive,
  type ComponentPublicInstance,
} from "vue";
import type { PieceSetValue } from "../modules/user_data/piece_set";
import { waitForTransitionEnd } from "../modules/utils/elements";

const props = defineProps({
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
  boardPiece: { type: Object as PropType<PositionedPiece>, required: true },
  cellSize: { type: Number, required: true },
  piecePadding: { type: Number, required: true },
});
const zIndex = ref<"" | "1">("");
const element = ref<null | ComponentPublicInstance>(null);

// Values for translating pieces to their right position from the absolute position at top left corner of the board
const translateX = computed(() => {
  return props.boardPiece.col * props.cellSize;
});
const translateY = computed(() => {
  return (7 - props.boardPiece.row) * props.cellSize;
});
const pieceSize = computed(() => {
  return props.cellSize - props.piecePadding * 2;
});

// Convert prop to reactive so it can be watched without problems
const reactiveBoardPiece = computed(() => {
  return reactive(props.boardPiece);
});

// Watch piece for changes in rows, columns or both and set z-index to 1 while moving so it appears on top of other pieces
watch(reactiveBoardPiece, (newValue, oldValue) => {
  if (newValue.row !== oldValue.row || newValue.col !== oldValue.col) {
    const boardPieceElement = element.value?.$el;
    if (!boardPieceElement) {
      console.error(
        "Cannot obtain SVGElement instance of boardPiece, thus cannot alter zIndex."
      );
      return;
    }
    temporarilyMoveToTop(boardPieceElement);
  }
});

async function temporarilyMoveToTop(boardPieceElement: SVGElement) {
  zIndex.value = "1";
  await waitForTransitionEnd(boardPieceElement);
  zIndex.value = "";
}
</script>

<template>
  <PieceIcon
    ref="element"
    class="piece"
    :style="`transform: translate(${translateX}px,${translateY}px); width: ${pieceSize}px; height: ${pieceSize}px; z-index: ${zIndex};`"
    :piece-set="props.pieceSet"
    :piece-id="props.boardPiece.piece.pieceId"
    :color="props.boardPiece.piece.color"
  />
</template>

<style lang="scss">
@import "../partials/mixins";

.piece {
  @include clickable;
  filter: var(--svg-shadow-filter);
  outline: none;
  pointer-events: all;
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  padding: var(--piece-padding);
  transition: transform var(--transition-duration-medium) ease-in-out,
    opacity var(--transition-duration-short) linear;

  &:hover {
    opacity: 0.3;
  }
}

// .piece-enter-active {
//   transition: transform var(--transition-duration-medium)
//       var(--transition-timing-jump),
//     opacity var(--transition-duration-medium) linear;
// }

.piece-leave-active,
.piece-enter-active {
  transition: transform var(--transition-duration-long)
      var(--transition-timing-jump),
    opacity var(--transition-duration-long) linear;
}

.piece-enter-from {
  opacity: 0;
  transform: translateY(-15px) scale(1.1);
}

.piece-leave-to {
  opacity: 0;
  transform: translateY(-100px) rotate(135deg) scale(2);
}
</style>
