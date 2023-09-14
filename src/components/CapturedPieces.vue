<script lang="ts" setup>
import { PropType } from "vue";
import type Piece from "../modules/pieces";
import type { PieceSetValue } from "../modules/user_data/piece_set";
import PieceIcon from "./PieceIcon.vue";

const props = defineProps({
  pieces: { type: Array as PropType<Piece[]> },
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
});
</script>

<template>
  <div class="captured-pieces">
    <TransitionGroup name="list">
      <PieceIcon
        v-for="piece in props.pieces"
        :color="piece.color"
        :piece-set="props.pieceSet"
        :piece-id="piece.pieceId"
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
