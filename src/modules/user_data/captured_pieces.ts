import type { Ref } from "vue";
import { isPieceId, type PieceId, type PlayerColor } from "../pieces/piece";
import UserData from "./user_data";
import type ToastManager from "../toast_manager";

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
    let pieceIds;
    try {
      pieceIds = JSON.parse(dumped);
    } catch (error) {
      console.error(
        `An error occured while parsing ${this.id}. Data are invalid or corrupted`
      );
      this.handleInvalidLoadValue(dumped);
    }
    if (!Array.isArray(pieceIds)) {
      console.error(`Captured pieces didn't parse into an array.`);
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
