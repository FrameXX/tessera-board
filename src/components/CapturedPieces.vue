<script lang="ts" setup>
import { PropType } from "vue";
import type { PieceSetValue } from "../modules/user_data/piece_set";
import PieceIcon from "./PieceIcon.vue";
import type { PieceId, PlayerColor } from "../modules/pieces";

const props = defineProps({
  pieceIds: { type: Array as PropType<PieceId[]> },
  color: { type: String as PropType<PlayerColor>, required: true },
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
});
</script>

<template>
  <div class="captured-pieces">
    <TransitionGroup name="list">
      <PieceIcon
        v-for="pieceId in props.pieceIds"
        :color="props.color"
        :piece-set="props.pieceSet"
        :piece-id="pieceId"
      ></PieceIcon>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.icon {
  width: var(--font-size-big);
  height: var(--font-size-big);
  flex-shrink: 1;
  margin: 0;
}
</style>
