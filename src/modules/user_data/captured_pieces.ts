import type { Ref } from "vue";
import { isPieceId, type PieceId } from "../pieces/piece";
import UserData from "./user_data";
import type ToastManager from "../toast_manager";
import { PlayerColor } from "../utils/game";

class CapturedPiecesData extends UserData<PieceId[]> {
  constructor(
    value: PieceId[],
    valueRef: Ref<PieceId[]>,
    playerColor: PlayerColor
  ) {
    super(`${playerColor}_captured_pieces`, value, valueRef);
  }

  public dump(): string {
    return JSON.stringify(this.value);
  }

  public load(dumped: string, toastManager: ToastManager): void {
    const value: PieceId[] = [];
    if (!value) {
      return;
    }
    const pieceIds = this.safelyParse(dumped, toastManager);
    if (!Array.isArray(pieceIds)) {
      console.error("Captured pieces didn't parse into an array.");
      this.handleInvalidLoadValue(dumped, toastManager);
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
