import ComplexUserData from "./complex_user_data";
import type { BoardStateValue } from "../board_manager";
import { getPieceFromRaw } from "../pieces/raw_piece";
import { getRawPiece, isRawPiece } from "../utils/game";
import type Toaster from "../toast_manager";

class RawBoardStateData extends ComplexUserData<BoardStateValue> {
  constructor(value: BoardStateValue, reactiveValue: BoardStateValue) {
    super("default_board_state", value, reactiveValue, true, true);
  }

  get rawVersion() {
    return this.value.map((row) =>
      row.map((piece) => (piece ? piece.getRawPiece() : null))
    );
  }

  public dump(): string {
    return JSON.stringify(this.rawVersion);
  }

  public load(dumped: string, toaster: Toaster): void {
    const value = this.safelyParse(dumped, toaster);
    if (!value) {
      return;
    }
    if (!Array.isArray(value)) {
      console.error("The parsed value of raw board state is not an array");
      this.handleInvalidLoadValue(dumped, toaster);
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
