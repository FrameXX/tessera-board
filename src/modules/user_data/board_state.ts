import {
  Bishop,
  King,
  Knight,
  Pawn,
  Queen,
  Rook,
  getPieceById,
} from "../pieces";
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
    super("board_state", value, valueReactive, toastManager);
  }

  public dump(): string {
    return JSON.stringify(
      this.value.map((row) =>
        row.map((piece) => (piece ? piece.genericObject : null))
      )
    );
  }

  public load(dumped: string): void {
    try {
      const value = JSON.parse(dumped);
      for (const rowIndex in value) {
        for (const colIndex in value[rowIndex]) {
          const pieceObject = value[rowIndex][colIndex];
          if (pieceObject) {
            value[rowIndex][colIndex] = getPieceById(
              pieceObject.pieceId,
              pieceObject.color
            );
          }
        }
      }
      this.value = value;
    } catch (error) {
      console.error("Loading board state data resulted in an error", error);
      this.handleInvalidLoadValue(dumped);
    }
  }
}

export default BoardStateData;
