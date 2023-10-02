import ComplexUserData from "./complex_user_data";
import type ToastManager from "../toast_manager";
import type { BoardStateValue } from "./board_state";
import { getRawPiece, isRawPiece, getPieceFromRaw } from "../pieces/rawPiece";

class RawBoardStateData extends ComplexUserData<BoardStateValue> {
  constructor(
    value: BoardStateValue,
    valueReactive: BoardStateValue,
    toastManager: ToastManager
  ) {
    super("default_board_state", value, valueReactive, toastManager);
  }

  get rawVersion() {
    return this.value.map((row) =>
      row.map((piece) => (piece ? getRawPiece(piece) : null))
    );
  }

  public dump(): string {
    return JSON.stringify(this.rawVersion);
  }

  public load(dumped: string): void {
    let value = this.safelyParse(dumped);
    if (!value) {
      return;
    }
    if (!Array.isArray(value)) {
      console.error("The parsed value of raw board state is not an array");
      this.handleInvalidLoadValue(dumped);
      return;
    }
    for (const rowIndex in value) {
      for (const colIndex in value[rowIndex]) {
        const pieceObject = value[rowIndex][colIndex];
        if (pieceObject) {
          if (!isRawPiece(pieceObject)) {
            console.error(
              `Could not restore generic piece of ${this.id} on row ${rowIndex}, ${colIndex}. The piece does not match its type. Data are invalid or corrupted. Setting piece to null.`
            );
            value[rowIndex][colIndex] = null;
            continue;
          }
          const piece = getPieceFromRaw(pieceObject);
          value[rowIndex][colIndex] = piece;
        }
      }
    }
    this.value = value;
  }
}

export default RawBoardStateData;
