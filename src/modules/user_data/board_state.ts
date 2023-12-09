import ComplexUserData from "./complex_user_data";
import { getPieceFromRaw } from "../pieces/raw_piece";
import type ToastManager from "../toast_manager";
import type { BoardStateValue } from "../board_manager";
import { isRawPiece } from "../utils/game";

class BoardStateData extends ComplexUserData<BoardStateValue> {
  constructor(
    value: BoardStateValue,
    reactiveValue?: BoardStateValue,
    toastManager?: ToastManager,
    autoSave: boolean = true
  ) {
    super("game_board_state", value, reactiveValue, toastManager, autoSave);
  }

  get rawVersion() {
    return this.value.map((row) =>
      row.map((piece) => (piece ? piece.getRawPiece() : null))
    );
  }

  public dump(): string {
    return JSON.stringify(this.rawVersion);
  }

  public load(dumped: string, fromRaw: boolean = false): void {
    const value = this.safelyParse(dumped);
    if (!value) {
      return;
    }
    if (!Array.isArray(value)) {
      console.error("The parsed value of board state is not an array");
      this.handleInvalidLoadValue(dumped);
      return;
    }
    for (const rowIndex in value) {
      for (const colIndex in value[rowIndex]) {
        const pieceObject = value[rowIndex][colIndex];
        if (!pieceObject) {
          continue;
        }
        if (!isRawPiece(pieceObject)) {
          console.error(
            `Could not restore piece of ${this.id} on row ${rowIndex}, ${colIndex}. The piece does not match its type. Data are invalid or corrupted. Setting piece to null.`
          );
          value[rowIndex][colIndex] = null;
          continue;
        }
        const piece = getPieceFromRaw(pieceObject);
        if (!fromRaw) piece.loadCustomProps(pieceObject);
        value[rowIndex][colIndex] = piece;
      }
    }
    this.value = value;
  }
}

export default BoardStateData;
