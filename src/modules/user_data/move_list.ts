import type { Ref } from "vue";
import type Move from "../moves/move";
import { isRawMove } from "../moves/raw_move";
import type Toaster from "../toaster/toaster";
import UserData from "./user_data";
import Shift from "../moves/shift";
import Promotion from "../moves/promotion";
import Castling from "../moves/castling";

class MoveListData extends UserData<Move[]> {
  constructor(id: string, value: Move[], valueRef: Ref<Move[]>) {
    super(id, value, valueRef, false);
  }

  get rawVersion() {
    return this.value.map((move) => {
      return move.getRaw();
    });
  }

  public dump(): string {
    return JSON.stringify(this.rawVersion);
  }

  public load(dumped: string, toaster: Toaster): void {
    const rawMoves = this.safelyParse(dumped, toaster);
    if (!rawMoves) {
      return;
    }
    if (!Array.isArray(rawMoves)) {
      console.error("The parsed value of move list is not an array");
      this.handleInvalidLoadValue(dumped, toaster);
      return;
    }
    const moves: Move[] = [];
    for (const rawMove of rawMoves) {
      if (!isRawMove(rawMove)) {
        console.error("The parsed value of move list is not an array");
        this.handleInvalidLoadValue(dumped, toaster);
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
      move.loadCustomProps(rawMove);
      moves.push(move);
    }
    this.value = moves;
  }

  public apply(): void {}
}

export default MoveListData;
