<script lang="ts" setup>
import { ref, type PropType, watch } from "vue";
import type { RawPiece } from "../modules/pieces/rawPiece";
import { PieceSetValue } from "../modules/user_data/piece_set";
import PieceIcon from "./PieceIcon.vue";

type SelectPieceValue = RawPiece | null;

const props = defineProps({
  pieces: { type: Object as PropType<RawPiece[]>, required: true },
  modelValue: { type: Object as PropType<SelectPieceValue>, default: null },
  pieceSet: { type: String as PropType<PieceSetValue>, required: true },
});
const emit = defineEmits(["update:modelValue"]);

const selectedPiece = ref<RawPiece | null>(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    selectedPiece.value = newValue;
  }
);

function isSelected(piece: RawPiece) {
  if (!selectedPiece.value) {
    return false;
  }
  return (
    selectedPiece.value.pieceId === piece.pieceId &&
    selectedPiece.value.color === piece.color
  );
}

function selectPiece(piece: RawPiece) {
  selectedPiece.value = piece;
  emit("update:modelValue", selectedPiece.value);
}
</script>

<template>
  <div role="radiogroup" class="select-piece-group">
    <div
      v-for="piece in props.pieces"
      @click="selectPiece(piece)"
      :class="{ selected: isSelected(piece) }"
      tabindex="0"
      class="piece-option"
      role="radio"
    >
      <PieceIcon
        :piece-set="props.pieceSet"
        :piece-id="piece.pieceId"
        :color="piece.color"
      />
    </div>
  </div>
</template>
