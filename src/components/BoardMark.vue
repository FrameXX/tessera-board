<script lang="ts" setup>
import { computed, type PropType } from "vue";
import { BoardMarkProps } from "./Board.vue";
import Icon from "./Icon.vue";

const props = defineProps({
  boardMark: { type: Object as PropType<BoardMarkProps>, required: true },
  cellSize: { type: Number, required: true },
});

const translateX = computed(() => {
  return props.boardMark.col * props.cellSize;
});
const translateY = computed(() => {
  return (7 - props.boardMark.row) * props.cellSize;
});
const size = computed(() => {
  return props.cellSize - 8;
});
const iconId = computed(() => {
  return props.boardMark.mark === "availible" ? "circle-small" : "close";
});
</script>

<template>
  <Icon
    :style="`transform: translate(${translateX}px,${translateY}px); width: ${size}px; height: ${size}px;`"
    :icon-id="iconId"
  />
</template>
