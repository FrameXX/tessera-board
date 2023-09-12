<script lang="ts" setup>
import { computed, type PropType } from "vue";
import Icon from "./Icon.vue";

type Mark = "availible" | "capture";

const props = defineProps({
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  mark: { type: String as PropType<Mark>, required: true },
  cellSize: { type: Number, required: true },
});

const iconId = computed(() => {
  return props.mark === "availible" ? "circle-small" : "close";
});

// Values for translating marks to their right position from the absolute position at top left corner of the board
const translateX = computed(() => {
  return props.col * props.cellSize;
});
const translateY = computed(() => {
  return (7 - props.row) * props.cellSize;
});
const size = computed(() => {
  return props.cellSize - 8;
});
</script>

<template>
  <Icon
    :style="`transform: translate(${translateX}px,${translateY}px); width: ${size}px; height: ${size}px;`"
    :icon-id="iconId"
  />
</template>
