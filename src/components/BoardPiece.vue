<script lang="ts" setup>
import PieceIcon from "./PieceIcon.vue";
import {
  type PropType,
  computed,
  ref,
  watch,
  type ComponentPublicInstance,
  onBeforeUnmount,
  inject,
  onMounted,
  type Ref,
} from "vue";
import { waitForTransitionEnd } from "../modules/utils/elements";
import type Piece from "../modules/pieces/piece";
import { getDeltaPosition } from "../modules/pieces/piece";
import { BoardPosition } from "./Board.vue";
import { isBoardPosition } from "../modules/board_manager";

let inchOffset = ref(1.8);

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
});

const longPressTimeout = inject("longPressTimeout") as Ref<number>;
const useVibrations = inject("useVibrations") as Ref<boolean>;
const pixelsPerCm = inject("pixelsPerCm") as number;

const emit = defineEmits({
  dragStart: (event: BoardPosition) => {
    return isBoardPosition(event);
  },
  dragEnd: (event: BoardPosition) => {
    return isBoardPosition(event);
  },
  dragTargetChange: (event: BoardPosition) => {
    return isBoardPosition(event);
  },
  move: null,
  remove: null,
});

const zIndex = ref<"" | "var(--z-index-piece-top)">("");
const element = ref<null | ComponentPublicInstance>(null);
const dragging = ref(false);

// Values for translating pieces to their right position from the absolute position at top left corner of the board
const translateX = computed(() => {
  return props.col * props.cellSize + dragXDelta.value;
});
const translateY = computed(() => {
  return (7 - props.row) * props.cellSize + dragYDelta.value;
});

// Values for setting the translate origin of piece wrapper
const originX = computed(() => {
  return translateX.value + props.cellSize / 2;
});
const originY = computed(() => {
  return translateY.value + props.cellSize / 2;
});

const translate = computed(() => {
  if (!dragging.value) {
    return `translate(${translateX.value}px, ${translateY.value}px)`;
  }
  return `translate(${translateX.value}px, calc(${translateY.value}px + ${
    props.rotated ? inchOffset.value + "cm" : -inchOffset.value + "cm"
  }))`;
});

const scale = computed(() => {
  if (!dragging.value) {
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

watch(dragging, async (newValue) => {
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
});

async function temporarilyMoveToTop(boardPieceElement: SVGElement) {
  zIndex.value = "var(--z-index-piece-top)";
  await waitForTransitionEnd(boardPieceElement, "transform");
  zIndex.value = "";
}

const inchPxOffset = computed(() => {
  return inchOffset.value * pixelsPerCm;
});
let pressTimeout: number = 0;
let lastDragX: number = 0;
let lastDragY: number = 0;
const dragXDelta = ref(0);
const dragYDelta = ref(0);

const dragRowDelta = computed(() => {
  let totalDelta;
  props.rotated
    ? (totalDelta = -inchPxOffset.value - dragYDelta.value)
    : (totalDelta = inchPxOffset.value - dragYDelta.value);
  let delta = Math.round(totalDelta / props.cellSize);
  if (delta === -0) {
    delta = 0;
  }
  return delta;
});
const dragColDelta = computed(() => {
  let delta = Math.round(dragXDelta.value / props.cellSize);
  if (delta === -0) {
    delta = 0;
  }
  return delta;
});
const targetingDragPosition = computed(() => {
  const position = getDeltaPosition(
    { row: props.row, col: props.col },
    dragColDelta.value,
    dragRowDelta.value
  );
  return position;
});
watch(targetingDragPosition, () => {
  if (!dragging.value) {
    return;
  }
  emit("dragTargetChange", targetingDragPosition.value);
});

function resetDragDelta() {
  dragXDelta.value = 0;
  dragYDelta.value = 0;
}

function onMouseDown(event: MouseEvent) {
  if (event.button !== 0) {
    return;
  }
  inchOffset.value = 0;
  onPressStart(event.clientX, event.clientY);
}

function onTouchStart(event: TouchEvent) {
  const touch = event.touches[0];
  inchOffset.value = 1.8;
  onPressStart(touch.clientX, touch.clientY);
}

function onPressStart(x: number, y: number) {
  pressTimeout = window.setTimeout(() => {
    dragging.value = true;
    emit("dragStart", targetingDragPosition.value);
    lastDragX = x;
    lastDragY = y;
    if (useVibrations.value) navigator.vibrate(30);
  }, longPressTimeout.value);
}

function onPressEnd() {
  if (!dragging.value) {
    clearTimeout(pressTimeout);
    return;
  }
  dragging.value = false;
  emit("dragEnd", targetingDragPosition.value);
  resetDragDelta();
}

function onMouseMove(event: MouseEvent) {
  if (!dragging.value) {
    return;
  }
  onMove(event.clientX, event.clientY);
}

function onTouchMove(event: TouchEvent) {
  if (!dragging.value) {
    return;
  }
  const touch = event.touches[0];
  onMove(touch.clientX, touch.clientY);
}

function onMove(x: number, y: number) {
  let xDelta = x - lastDragX;
  let yDelta = y - lastDragY;
  if (props.boardRotated) {
    xDelta = -xDelta;
    yDelta = -yDelta;
  }
  lastDragX = x;
  lastDragY = y;
  dragXDelta.value = dragXDelta.value + xDelta;
  dragYDelta.value = dragYDelta.value + yDelta;
}

onMounted(() => {
  const pieceIconElement = element.value?.$el;
  if (!(pieceIconElement instanceof SVGElement)) {
    console.error(
      "Element of Piece Icon is not accessible, so its z-index cannot be altered."
    );
    return;
  }
  pieceIconElement.addEventListener("mousedown", onMouseDown);
  pieceIconElement.addEventListener("touchstart", onTouchStart, {
    passive: true,
  });
  addEventListener("mouseup", onPressEnd);
  addEventListener("touchend", onPressEnd, {
    passive: true,
  });
  addEventListener("mousemove", onMouseMove);
  addEventListener("touchmove", onTouchMove, {
    passive: true,
  });
});

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
      :data-id="`piece-${props.piece.id}`"
      ref="element"
      class="piece"
      :class="[
        { dragging: dragging },
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
