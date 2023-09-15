<script lang="ts" setup>
import PieceIcon from "./PieceIcon.vue";
import {
  type PropType,
  computed,
  ref,
  watch,
  type ComponentPublicInstance,
} from "vue";
import type { PieceSetValue } from "../modules/user_data/piece_set";
import { waitForTransitionEnd } from "../modules/utils/elements";
import type Piece from "../modules/pieces";

const props = defineProps({
  piece: { type: Object as PropType<Piece>, required: true },
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
  cellSize: { type: Number, required: true },
  piecePadding: { type: Number, required: true },
  rotated: { type: Boolean, default: false },
});
const zIndex = ref<"" | "var(--z-index-piece-top)">("");
const element = ref<null | ComponentPublicInstance>(null);

// Values for translating pieces to their right position from the absolute position at top left corner of the board
const translateX = computed(() => {
  return (props.rotated ? 7 - props.col : props.col) * props.cellSize;
});
const translateY = computed(() => {
  return (props.rotated ? props.row : 7 - props.row) * props.cellSize;
});
const size = computed(() => {
  return props.cellSize - props.piecePadding * 2;
});

// Values for setting the translate origin of piece wrapper
const originX = computed(() => {
  return translateX.value + props.cellSize / 2;
});
const originY = computed(() => {
  return translateY.value + props.cellSize / 2;
});

const piecePosition = computed(() => {
  return { row: props.row, col: props.col };
});

// Watch piece for position changes and set z-index to 1 while moving so it appears on top of other pieces
watch(piecePosition, () => {
  const pieceIconElement = element.value?.$el;
  if (!(pieceIconElement instanceof SVGElement)) {
    console.error(
      "Element of Piece Icon is not accessible, so its z-index cannot be altered."
    );
    return;
  }
  temporarilyMoveToTop(pieceIconElement);
});

function temporarilyMoveToTop(boardPieceElement: SVGElement) {
  zIndex.value = "var(--z-index-piece-top)";
  waitForTransitionEnd(boardPieceElement).then(() => {
    zIndex.value = "";
  });
}
</script>

<template>
  <div class="rotation-wrapper">
    <div
      class="piece-wrapper"
      :style="`transform-origin: ${originX}px ${originY}px`"
    >
      <PieceIcon
        ref="element"
        class="piece"
        :style="`transform: translate(${translateX}px,${translateY}px); width: ${size}px; height: ${size}px; z-index: ${zIndex};`"
        :piece-set="props.pieceSet"
        :piece-id="props.piece.pieceId"
        :color="props.piece.color"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.rotation-wrapper {
  @include stretch;
  position: absolute;
  pointer-events: none;
}

.board.rotated {
  .rotation-wrapper {
    transform: rotate(-0.5turn);
  }
}

.piece-wrapper {
  @include stretch;
  position: absolute;
  pointer-events: none;
}

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
