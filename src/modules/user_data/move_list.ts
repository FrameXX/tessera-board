import { Ref } from "vue";
import Move from "../moves/move";
import { isRawMove } from "../moves/raw_move";
import ToastManager from "../toast_manager";
import UserData from "./user_data";
import Shift from "../moves/shift";
import Promotion from "../moves/promotion";
import Castling from "../moves/castling";

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
    const rawMoves = this.safelyParse(dumped);
    if (!rawMoves) {
      return;
    }
    if (!Array.isArray(rawMoves)) {
      console.error("The parsed value of move list is not an array");
      this.handleInvalidLoadValue(dumped);
      return;
    }
    const moves: Move[] = [];
    for (const rawMove of rawMoves) {
      if (!isRawMove(rawMove)) {
        console.error("The parsed value of move list is not an array");
        this.handleInvalidLoadValue(dumped);
        return;
      }
      let move: Move;
      switch (rawMove.moveId) {
        case "shift":
          move = Shift.restore(rawMove);
          break;
        case "promotion":
          move = Promotion.restore(rawMove);
          break;
        case "castling":
          move = Castling.restore(rawMove);
          break;
        default:
          return;
      }
      moves.push(move);
    }
    this.value = moves;
  }

  public apply(): void {}
}

export default MoveListData;
