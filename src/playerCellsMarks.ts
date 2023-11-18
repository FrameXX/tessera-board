import { reactive } from "vue";

export const playerCellsMarks: MarkBoardState = reactive(
  Array(8)
    .fill(null)
    .map(() => new Array(8).fill(null))
);
