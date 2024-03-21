import {
  PIECE_DEFAULT_IMPORTANCES,
  PIECE_IDS,
  type PieceImportanceValues,
} from "./pieces/piece";
import NumberOption from "./options/number_option";

export default class PieceImportances {
  public values: PieceImportanceValues;

  constructor() {
    const values = {} as any;
    for (const pieceId of PIECE_IDS) {
      values[pieceId] = new NumberOption(
        PIECE_DEFAULT_IMPORTANCES[pieceId],
        `${pieceId} - importance`
      );
    }
    this.values = values;
  }
}
