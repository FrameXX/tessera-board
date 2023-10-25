<script lang="ts" setup>
import { PropType, inject } from "vue";
import type { PieceSetValue } from "../modules/user_data/piece_set";
import PieceIcon from "./PieceIcon.vue";
import type { PieceId } from "../modules/pieces/piece";
import { getRandomId } from "../modules/utils/misc";
import type { PlayerColor } from "../modules/game";

const props = defineProps({
  pieceIds: { type: Array as PropType<PieceId[]> },
  color: { type: String as PropType<PlayerColor>, required: true },
});

const pieceSet = inject<PieceSetValue>("pieceSet");
</script>

<template>
  <div class="captured-pieces">
    <TransitionGroup name="slide-left">
      <PieceIcon
        v-for="pieceId in props.pieceIds"
        :key="getRandomId()"
        :color="props.color"
        :piece-set="pieceSet"
        :piece-id="pieceId"
      ></PieceIcon>
    </TransitionGroup>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.captured-pieces {
  @include flex-center;
  position: absolute;
  height: 40px;
  width: 100%;

  &.white {
    top: 100%;
    left: 0;
  }

  &.black {
    bottom: 100%;
    right: 0;
  }

  .icon {
    width: var(--font-size-big);
    height: var(--font-size-big);
    flex-shrink: 1;
    margin: 0;
  }
}

.board.rotated {
  .captured-pieces {
    transform: rotate(-0.25turn);
  }
}
</style>
