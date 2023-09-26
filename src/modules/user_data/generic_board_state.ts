import { getPieceFromGeneric, isGenericPiece } from "../pieces/piece_utils";
import { ComplexUserData } from "./user_data";
import type ToastManager from "../toast_manager";
import type { BoardStateValue } from "./board_state";

class GenericBoardStateData extends ComplexUserData<BoardStateValue> {
  constructor(
    value: BoardStateValue,
    valueReactive: BoardStateValue,
    toastManager: ToastManager
  ) {
    super("default_board_state", value, valueReactive, toastManager);
  }

  public dump(): string {
    // Save piece as GenericPiece
    return JSON.stringify(
      this.value.map((row) =>
        row.map((piece) =>
          piece ? { pieceId: piece.pieceId, color: piece.color } : null
        )
      )
    );
  }

  public load(dumped: string): void {
    let value;
    try {
      value = JSON.parse(dumped);
    } catch (error) {
      console.error(
        "An error occured while trying to parse generic board state.",
        error
      );
      this.handleInvalidLoadValue(dumped);
    }
    for (const rowIndex in value) {
      for (const colIndex in value[rowIndex]) {
        const pieceObject = value[rowIndex][colIndex];
        if (pieceObject) {
          if (!isGenericPiece(pieceObject)) {
            console.error(
              `Could not restore generic piece of ${this.id} on row ${rowIndex}, ${colIndex}. The piece does not match its type. Data are invalid or corrupted. Setting piece to null.`
            );
            value[rowIndex][colIndex] = null;
            continue;
          }
          const piece = getPieceFromGeneric({
            pieceId: pieceObject.pieceId,
            color: pieceObject.color,
          });
          value[rowIndex][colIndex] = piece;
        }
      }
    }
    this.value = value;
  }
}

export default GenericBoardStateData;