import { PIECE_IDS, type PiecesImportanceValues } from "./pieces/piece";
import { ref } from "vue";

export default class PiecesImportance {
  public values: PiecesImportanceValues;

  constructor() {
    const values = {} as any;
    for (const pieceId of PIECE_IDS) {
      values[pieceId] = ref(0);
    }
    this.values = values;
  }
}
