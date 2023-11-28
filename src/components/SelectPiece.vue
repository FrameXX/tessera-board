<script lang="ts" setup>
import { ref, type PropType, watch } from "vue";
import type { RawPiece } from "../modules/pieces/raw_piece";
import PieceIcon from "./PieceIcon.vue";
import { PieceIconPack } from "../modules/user_data/piece_set";

type SelectPieceValue = RawPiece | null;

const props = defineProps({
  pieces: { type: Object as PropType<RawPiece[]>, required: true },
  modelValue: { type: Object as PropType<SelectPieceValue>, default: null },
  pieceIconPack: {
    type: String as PropType<PieceIconPack>,
    required: true,
  },
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
  <div role="select" class="select-piece-group">
    <div
      v-for="piece in props.pieces"
      @click="selectPiece(piece)"
      :class="{ selected: isSelected(piece) }"
      :aria-selected="isSelected(piece)"
      tabindex="0"
      class="piece-option"
      role="option"
    >
      <PieceIcon
        :piece-set="props.pieceIconPack"
        :piece-id="piece.pieceId"
        :color="piece.color"
      />
    </div>
  </div>
</template>
../modules/pieces/raw_piece
