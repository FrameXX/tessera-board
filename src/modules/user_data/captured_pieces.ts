import type { Ref } from "vue";
import { isPieceId, type PieceId } from "../pieces/piece";
import UserData from "./user_data";
import type ToastManager from "../toast_manager";
import type { PlayerColor } from "../game";

class CapturedPiecesData extends UserData<PieceId[]> {
  constructor(
    value: PieceId[],
    valueRef: Ref<PieceId[]>,
    playerColor: PlayerColor,
    toastManager: ToastManager
  ) {
    super(`${playerColor}_captured_pieces`, value, toastManager, valueRef);
  }

  public dump(): string {
    return JSON.stringify(this.value);
  }

  public load(dumped: string): void {
    const value: PieceId[] = [];
    if (!value) {
      return;
    }
    const pieceIds = this.safelyParse(dumped);
    if (!Array.isArray(pieceIds)) {
      console.error("Captured pieces didn't parse into an array.");
      this.handleInvalidLoadValue(dumped);
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

export default CapturedPiecesData;
