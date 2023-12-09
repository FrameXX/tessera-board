<script lang="ts" setup>
import pieceUrl from "../assets/img/pieces.svg";
import Icon from "./Icon.vue";
import { PropType, computed, inject } from "vue";
import { PieceId } from "../modules/pieces/piece";
import { capitalizeFirst } from "../modules/utils/misc";
import { PieceIconPack } from "../modules/user_data/piece_set";
import { PlayerColor } from "../modules/utils/game";

const props = defineProps({
  pieceId: { type: String as PropType<PieceId>, required: true },
  color: { type: String as PropType<PlayerColor>, required: true },
});

const pieceIconPack = inject<PieceIconPack>("pieceIconPack");

const label = computed(() => {
  return `${capitalizeFirst(props.color)} ${props.pieceId}`;
});
</script>

<template>
  <Icon
    :aria-label="label"
    :title="label"
    :source-file="pieceUrl"
    :icon-id="`${pieceIconPack}-${props.pieceId}-${props.color}`"
  />
</template>
