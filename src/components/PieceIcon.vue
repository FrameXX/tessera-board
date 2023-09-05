<script lang="ts" setup>
import Icon from "./Icon.vue";
import { PropType, computed } from "vue";
import {
  PIECE_SETS_DIR,
  type PieceSetValue,
} from "../modules/user_data/piece_set";
import { PieceId, PlayerColor } from "../modules/pieces";
import { capitalizeFirst } from "../modules/utils/misc";

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
