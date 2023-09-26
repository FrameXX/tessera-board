<script lang="ts" setup>
import Icon from "./Icon.vue";
import { PropType, computed } from "vue";
import { type PieceSetValue } from "../modules/user_data/piece_set";
import { PieceId, PlayerColor } from "../modules/pieces/piece";
import { capitalizeFirst } from "../modules/utils/misc";

const PIECE_SETS_DIR = "assets/img/";

const props = defineProps({
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
  pieceId: { type: String as PropType<PieceId>, required: true },
  color: { type: String as PropType<PlayerColor>, required: true },
});

const label = computed(() => {
  return `${capitalizeFirst(props.color)} ${props.pieceId}`;
});
</script>

<template>
  <Icon
    :aria-label="label"
    :title="label"
    :source-file="`${PIECE_SETS_DIR}pieces_${props.pieceSet}.svg`"
    :icon-id="`${props.pieceId}-${props.color}`"
  />
</template>
