<script lang="ts" setup>
import pieceUrl from "../assets/img/pieces.svg";
import Icon from "./Icon.vue";
import { PropType, computed, inject } from "vue";
import { type PieceSetValue } from "../modules/user_data/piece_set";
import { PieceId } from "../modules/pieces/piece";
import { capitalizeFirst } from "../modules/utils/misc";
import type { PlayerColor } from "../modules/game";

const props = defineProps({
  pieceId: { type: String as PropType<PieceId>, required: true },
  color: { type: String as PropType<PlayerColor>, required: true },
});

const pieceSet = inject<PieceSetValue>("pieceSet");

const label = computed(() => {
  return `${capitalizeFirst(props.color)} ${props.pieceId}`;
});
</script>

<template>
  <Icon
    :aria-label="label"
    :title="label"
    :source-file="pieceUrl"
    :icon-id="`${pieceSet}-${props.pieceId}-${props.color}`"
  />
</template>
