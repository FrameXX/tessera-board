import { Ref } from "vue";
import Move from "../moves/move";
import { isRawMove } from "../moves/raw_move";
import ToastManager from "../toast_manager";
import UserData from "./user_data";

class MoveListData extends UserData<Move[]> {
  constructor(
    id: string,
    value: Move[],
    toastManager: ToastManager,
    valueRef?: Ref<Move[]>
  ) {
    super(id, value, toastManager, valueRef);
  }

  public dump(): string {
    return JSON.stringify(this.value);
  }

  public load(dumped: string): void {
    const moves = this.safelyParse(dumped);
    if (!moves) {
      return;
    }
    if (!Array.isArray(moves)) {
      console.error("The parsed value of move list is not an array");
      this.handleInvalidLoadValue(dumped);
      return;
    }
    for (const move of moves) {
      if (!isRawMove(move)) {
        console.error("The parsed value of move list is not an array");
        this.handleInvalidLoadValue(dumped);
        return;
      }
      switch (move.moveId) {
        case "shift":
          break;
        case "promotion":
          break;
        case "castling":
          break;
        default:
          return;
      }
    }
  }

  public apply(): void {}
}

export default MoveListData;
