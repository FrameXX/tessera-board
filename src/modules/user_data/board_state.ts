import { ComplexUserData } from "./user_data";
import type Piece from "../pieces/piece";
import type ToastManager from "../toast_manager";
import { isRawPiece, getPieceFromRaw } from "../pieces/rawPiece";

export type BoardStateValue = (Piece | null)[][];

class BoardStateData extends ComplexUserData<BoardStateValue> {
  constructor(
    value: BoardStateValue,
    reactiveValue: BoardStateValue,
    toastManager: ToastManager,
    autoSave: boolean = true
  ) {
    super("game_board_state", value, reactiveValue, toastManager, autoSave);
  }

  public dump(): string {
    // Save piece as GamePiece
    return JSON.stringify(
      this.value.map((row) =>
        row.map((piece) => (piece ? piece.dumpObject() : null))
      )
    );
  }

  public load(dumped: string, fromRaw: boolean = false): void {
    let value;
    try {
      value = JSON.parse(dumped);
    } catch (error) {
      console.error(
        "An error occured while trying to parse board state.",
        error
      );
      this.handleInvalidLoadValue(dumped);
      return;
    }
    if (!Array.isArray(value)) {
      console.error("The parsed value of board state is not an array");
      this.handleInvalidLoadValue(dumped);
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
