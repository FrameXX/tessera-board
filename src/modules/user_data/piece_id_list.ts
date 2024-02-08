import type { Ref } from "vue";
import { isPieceId, type PieceId } from "../pieces/piece";
import UserData from "./user_data";
import type Toaster from "../toast_manager";
import type { PlayerColor } from "../utils/game";

class PieceIdListData extends UserData<PieceId[]> {
  constructor(
    id: string,
    value: PieceId[],
    valueRef: Ref<PieceId[]>,
    autoSave = true
  ) {
    super(id, value, valueRef, autoSave);
  }

  public dump(): string {
    return JSON.stringify(this.value);
  }

  public load(dumped: string, toaster: Toaster): void {
    const value: PieceId[] = [];
    if (!value) {
      return;
    }
    const pieceIds = this.safelyParse(dumped, toaster);
    if (!Array.isArray(pieceIds)) {
      console.error("Captured pieces didn't parse into an array.");
      this.handleInvalidLoadValue(dumped, toaster);
    }
    for (const i in pieceIds) {
      const pieceId = pieceIds[i];
      if (!isPieceId(pieceId)) {
        console.error(
          `Parsed captured pieces contained an invalid PieceId ${pieceId}`
        );
        continue;
      }
      value.push(pieceId);
    }
    this.value = value;
  }

  public apply(): void {}
}

export default PieceIdListData;
