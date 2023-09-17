import { getPieceFromGeneric, isGamePiece, isGenericPiece } from "../pieces";
import { ComplexUserData } from "./user_data";
import type Piece from "../pieces";
import type ToastManager from "../toast_manager";

export type BoardStateValue = (Piece | null)[][];

class BoardStateData extends ComplexUserData<BoardStateValue> {
  constructor(
    value: BoardStateValue,
    valueReactive: BoardStateValue,
    toastManager: ToastManager
  ) {
    super("game_board_state", value, valueReactive, toastManager);
  }

  public dump(): string {
    // Save piece as GamePiece
    return JSON.stringify(
      this.value.map((row) =>
        row.map((piece) =>
          piece
            ? { pieceId: piece.pieceId, color: piece.color, moved: piece.moved }
            : null
        )
      )
    );
  }

  public load(dumped: string, fromGeneric: boolean = false): void {
    let value;
    try {
      value = JSON.parse(dumped);
    } catch (error) {
      console.error(
        "An error occured while trying to parse board state.",
        error
      );
      this.handleInvalidLoadValue(dumped);
    }
    for (const rowIndex in value) {
      for (const colIndex in value[rowIndex]) {
        const pieceObject = value[rowIndex][colIndex];
        if (pieceObject) {
          if (
            (!isGamePiece(pieceObject) && !fromGeneric) ||
            (!isGenericPiece(pieceObject) && fromGeneric)
          ) {
            console.error(
              `Could not restore piece of ${this.id} on row ${rowIndex}, ${colIndex}. The piece does not match its type. Data are invalid or corrupted. Setting piece to null.`
            );
            value[rowIndex][colIndex] = null;
            continue;
          }
          const piece = getPieceFromGeneric({
            pieceId: pieceObject.pieceId,
            color: pieceObject.color,
          });
          fromGeneric
            ? (piece.moved = false)
            : (piece.moved = pieceObject.moved);
          value[rowIndex][colIndex] = piece;
        }
      }
    }
    this.value = value;
  }
}

export default BoardStateData;
