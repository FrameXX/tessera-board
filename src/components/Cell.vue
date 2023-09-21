<script lang="ts" setup>
import { PropType, computed } from "vue";
import Icon from "./Icon.vue";
import { CHAR_INDEXES } from "../modules/board_manager";

export type Mark = "availible" | "capture";

const props = defineProps({
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  mark: { type: [String, null] as PropType<Mark | null>, required: true },
});

const cellIsWhite = computed(() => (-1) ** (props.col + props.row) === 1);
const rowText = computed(() => props.row);
const colText = computed(() => CHAR_INDEXES[props.col - 1].toUpperCase());

const cornerClass = computed(() => {
  if (rowText.value === 1) {
    if (colText.value === "A") {
      return "bottom-left";
    } else if (colText.value === "H") {
      return "bottom-right";
    }
  } else if (rowText.value === 8) {
    if (colText.value === "A") {
      return "top-left";
    } else if (colText.value === "H") {
      return "top-right";
    }
  } else {
    return "";
  }
});

const markIconId = computed(() => {
  let iconId: string;
  switch (props.mark) {
    case "capture":
      iconId = "close";
      break;
    case "availible":
      iconId = "circle-small";
      break;
    default:
      iconId = "";
      break;
  }
  return iconId;
});
</script>

<template>
  <td
    :data-row="props.row"
    :data-col="props.col"
    :class="`cell ${cornerClass} ${cellIsWhite ? 'white' : 'black'}`"
    tabindex="0"
    role="gridcell"
    :aria-label="`${colText}${rowText}`"
    :title="`${colText}${rowText}`"
  >
    <!-- Show indexes only at borders of the board -->
    <span class="index-row-left" v-if="colText === 'A'">{{ rowText }}</span>
    <span class="index-row-right" v-if="colText === 'H'">{{ rowText }}</span>
    <span class="index-col-top" v-if="rowText === 8">{{ colText }}</span>
    <span class="index-col-bottom" v-if="rowText === 1">{{ colText }}</span>
    <Transition name="scale">
      <Icon class="mark" :icon-id="markIconId" v-show="props.mark" />
    </Transition>
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
    mix-blend-mode: overlay;
    filter: brightness(2);
    color: var(--color-cell-white);
    z-index: var(--z-index-mark);
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
