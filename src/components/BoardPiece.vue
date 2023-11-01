<script lang="ts" setup>
import PieceIcon from "./PieceIcon.vue";
import {
  type PropType,
  computed,
  ref,
  watch,
  type ComponentPublicInstance,
  onBeforeUnmount,
} from "vue";
import { waitForTransitionEnd } from "../modules/utils/elements";
import type Piece from "../modules/pieces/piece";

const props = defineProps({
  piece: { type: Object as PropType<Piece>, required: true },
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  cellSize: { type: Number, required: true },
  piecePadding: { type: Number, required: true },
  rotated: { type: Boolean, default: false },
  boardRotated: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  size: { type: Number, required: true },
  dragging: { type: Boolean, default: false },
  dragXDelta: { type: Number, default: 0 },
  dragYDelta: { type: Number, default: 0 },
});

const emit = defineEmits<{
  (e: "move"): void;
  (e: "remove"): void;
  (e: "pointerdown", data: PointerEvent): void;
}>();

const zIndex = ref<"" | "var(--z-index-piece-top)">("");
const element = ref<null | ComponentPublicInstance>(null);

// Values for translating pieces to their right position from the absolute position at top left corner of the board
const translateX = computed(() => {
  const offset = props.dragging ? props.dragXDelta : 0;
  return props.col * props.cellSize + offset;
});
const translateY = computed(() => {
  const offset = props.dragging ? props.dragYDelta : 0;
  return (7 - props.row) * props.cellSize + offset;
});

// Values for setting the translate origin of piece wrapper
const originX = computed(() => {
  return translateX.value + props.cellSize / 2;
});
const originY = computed(() => {
  return translateY.value + props.cellSize / 2;
});

const translate = computed(() => {
  return `translate(${translateX.value}px, ${translateY.value}px)`;
});

const scale = computed(() => {
  if (!props.dragging) {
    return props.selected ? "scale(1.05)" : " ";
  } else {
    return "scale(1.1)";
  }
});

const piecePosition = computed(() => {
  return { row: props.row, col: props.col };
});

// Watch piece for position changes and set z-index to 1 while moving so it appears on top of other pieces
watch(piecePosition, async () => {
  const pieceIconElement = element.value?.$el;
  if (!(pieceIconElement instanceof SVGElement)) {
    console.error(
      "Element of Piece Icon is not accessible, so its z-index cannot be altered."
    );
    return;
  }
  await temporarilyMoveToTop(pieceIconElement);
  emit("move");
});

watch(
  () => props.dragging,
  async (newValue) => {
    if (newValue) {
      zIndex.value = "var(--z-index-piece-top)";
    } else {
      const pieceIconElement = element.value?.$el;
      if (!(pieceIconElement instanceof SVGElement)) {
        console.error(
          "Element of Piece Icon is not accessible, so its z-index cannot be altered."
        );
        return;
      }
      await waitForTransitionEnd(pieceIconElement, "transform");
      zIndex.value = "";
    }
  }
);

async function temporarilyMoveToTop(boardPieceElement: SVGElement) {
  zIndex.value = "var(--z-index-piece-top)";
  await waitForTransitionEnd(boardPieceElement, "transform");
  zIndex.value = "";
}

onBeforeUnmount(() => {
  emit("remove");
});
</script>

<template>
  <div
    class="piece-wrapper"
    :style="`transform-origin: ${originX}px ${originY}px`"
  >
    <PieceIcon
      @pointerdown.passive="emit('pointerdown', $event)"
      :data-id="`piece-${props.piece.id}`"
      ref="element"
      class="piece"
      :class="[
        { dragging: props.dragging },
        { selected: props.selected },
        props.piece.color,
      ]"
      :style="{
        transform: `${translate} ${scale} ${
          props.rotated ? 'rotate(-0.5turn)' : ' '
        }`,
        width: `${props.size}px`,
        height: `${props.size}px`,
        zIndex: zIndex,
      }"
      :piece-id="props.piece.pieceId"
      :color="props.piece.color"
    />
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.piece-wrapper {
  @include stretch;
  pointer-events: none;
  position: absolute;
}

.piece {
  @include clickable;
  touch-action: none;
  filter: var(--svg-shadow-filter);
  -webkit-tap-highlight-color: transparent;
  z-index: var(--z-index-piece);
  outline: none;
  pointer-events: all;
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  padding: calc(var(--piece-padding) / 8);
  transition: transform var(--transition-duration-medium) ease-in-out,
    filter var(--transition-duration-short) linear;

  &.selected,
  &.dragging {
    filter: var(--piece-selected-shadow-filter);
  }

  &.dragging {
    transition: filter var(--transition-duration-short) linear;
  }
}
</style>
