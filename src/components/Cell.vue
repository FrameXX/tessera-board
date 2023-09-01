<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  row: { type: Number, required: true },
  col: { type: Number, required: true },
});

const charIndexes = ["A", "B", "C", "D", "E", "F", "G", "H"];

const cellIsWhite = (-1) ** (props.col + props.row) === 1;
const boardRow = props.row;
const boardCol = charIndexes[props.col - 1];

const cornerClass = computed(() => {
  if (boardRow === 1) {
    if (boardCol === "A") {
      return "bottom-left";
    } else if (boardCol === "H") {
      return "bottom-right";
    }
  } else if (boardRow === 8) {
    if (boardCol === "A") {
      return "top-left";
    } else if (boardCol === "H") {
      return "top-right";
    }
  } else {
    return "";
  }
});
</script>

<template>
  <td
    :class="`cell ${cornerClass} ${cellIsWhite ? 'white' : 'black'}`"
    tabindex="0"
    role="gridcell"
    :aria-label="`${boardCol}${boardRow}`"
    :title="`${boardCol}${boardRow}`"
  >
    <!-- Show indexes only at borders of the board -->
    <span class="index-row-left" v-if="boardCol === 'A'">{{ boardRow }}</span>
    <span class="index-row-right" v-if="boardCol === 'H'">{{ boardRow }}</span>
    <span class="index-col-top" v-if="boardRow === 8">{{ boardCol }}</span>
    <span class="index-col-bottom" v-if="boardRow === 1">{{ boardCol }}</span>
  </td>
</template>

<style lang="scss">
@import "../partials/mixins";

.cell {
  @include flex-center;
  @include clickable;
  aspect-ratio: 1;
  width: 100%;
  position: relative;

  &.white {
    background-color: var(--color-cell-white);
  }

  &.black {
    background-color: var(--color-cell-black);
  }

  &:hover {
    .index-whole {
      opacity: 1;
    }
  }

  .mark {
    @include absolute-centered;
    mix-blend-mode: exclusion;
    width: 100%;
    height: 100%;
  }

  &.bottom-left {
    border-radius: 0 0 0 var(--border-radius);
  }

  &.bottom-right {
    border-radius: 0 0 var(--border-radius) 0;
  }

  &.top-right {
    border-radius: 0 var(--border-radius) 0 0;
  }

  &.top-left {
    border-radius: var(--border-radius) 0 0 0;
  }
}
</style>
