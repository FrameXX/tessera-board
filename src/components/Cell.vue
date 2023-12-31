<script lang="ts" setup>
import { PropType, computed } from "vue";
import Icon from "./Icon.vue";
import { CHAR_INDEXES } from "../modules/board_manager";
import { Mark } from "../modules/utils/game";

const props = defineProps({
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  mark: { type: [String, null] as PropType<Mark | null>, required: true },
  highlighted: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  dragOver: { type: Boolean, default: false },
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
      iconId = "circle-outline";
      break;
    case "availible":
      iconId = "circle-small";
      break;
    case "capturing":
      iconId = "rhombus-outline";
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
      <div class="title" v-show="props.selected">
        {{ `${colText}${rowText}` }}
      </div>
    </Transition>
    <Transition name="scale">
      <Icon class="mark" :icon-id="markIconId" v-show="props.mark" />
    </Transition>
    <Transition name="scale">
      <Icon icon-id="rhombus" class="selected" v-show="props.highlighted" />
    </Transition>
    <Transition name="scale">
      <Icon
        icon-id="square-outline"
        class="drag-over"
        v-show="props.dragOver"
      />
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

  .title {
    @include stretch;
    @include flex-center;
    @include no-select;
    position: absolute;
    font-weight: 600;
    font-size: calc(var(--board-size) * 0.04);
  }

  &.white {
    background-color: var(--color-cell-white);

    .mark,
    .title,
    .selected,
    .drag-over {
      color: var(--color-cell-black);
    }
  }

  &.black {
    background-color: var(--color-cell-black);

    .mark,
    .title,
    .selected,
    .drag-over {
      color: var(--color-cell-white);
    }
  }

  &:hover {
    .index-whole {
      opacity: 1;
    }
  }

  .selected,
  .drag-over,
  .mark {
    @include absolute-centered;
    pointer-events: none;
    opacity: 0.65;
  }

  .mark {
    z-index: var(--z-index-mark);
    width: 100%;
    height: 100%;
  }

  .selected {
    width: 85%;
    height: 85%;
  }

  .drag-over {
    @include stretch;
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

.index-row-left,
.index-row-right,
.index-col-bottom,
.index-col-top {
  @include flex-center;
  @include no-select;
  color: var(--color-cell-white);
  position: absolute;
  transition: transform var(--transition-duration-short)
    var(--transition-timing-bounce);
  width: 15%;
  height: 15%;
  font-size: calc(var(--board-size) * 0.02);
  font-weight: 600;
  padding: calc(var(--board-size) * 0.008);
  opacity: var(--cell-index-opacity);
}

.cell.white {
  .index-row-left,
  .index-row-right,
  .index-col-bottom,
  .index-col-top {
    color: var(--color-cell-black);
  }
}

.cell.black {
  .index-row-left,
  .index-row-right,
  .index-col-bottom,
  .index-col-top {
    color: var(--color-cell-white);
  }
}

.board.contentRotated {
  .index-row-left,
  .index-row-right,
  .index-col-bottom,
  .index-col-top,
  .title {
    rotate: -0.5turn;
  }
}

.index-col-bottom,
.index-row-left {
  left: 0;
}

.index-row-left,
.index-col-top {
  top: 0;
}

.index-col-top,
.index-row-right {
  right: 0;
}

.index-row-right,
.index-col-bottom {
  bottom: 0;
}

.index-col-top {
  top: 0;
}
</style>
