import {
  Bishop,
  King,
  Knight,
  Pawn,
  Queen,
  Rook,
  getPieceById,
} from "../classes/pieces";
import UserData from "./user_data";
import type { SaveCallBack } from "./user_data";
import type Piece from "../classes/pieces";
import type { Ref } from "vue";

export type BoardStateValue = (Piece | null)[][];

export const DEFAULT_BOARD_STATE_VALUE: BoardStateValue = [
  [
    new Rook("white"),
    new Knight("white"),
    new Bishop("white"),
    new Queen("white"),
    new King("white"),
    new Bishop("white"),
    new Knight("white"),
    new Rook("white"),
  ],
  [
    new Pawn("white"),
    new Pawn("white"),
    new Pawn("white"),
    new Pawn("white"),
    new Pawn("white"),
    new Pawn("white"),
    new Pawn("white"),
    new Pawn("white"),
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    new Pawn("black"),
    new Pawn("black"),
    new Pawn("black"),
    new Pawn("black"),
    new Pawn("black"),
    new Pawn("black"),
    new Pawn("black"),
    new Pawn("black"),
  ],
  [
    new Rook("black"),
    new Knight("black"),
    new Bishop("black"),
    new Queen("black"),
    new King("black"),
    new Bishop("black"),
    new Knight("black"),
    new Rook("black"),
  ],
];

class BoardStateData extends UserData<BoardStateValue> {
  constructor(
    saveCallBack: SaveCallBack,
    value: BoardStateValue,
    valueRef: Ref<BoardStateValue>
  ) {
    super(saveCallBack, "board_state", value, valueRef);
  }

  public dump(): string {
    return JSON.stringify(this.value);
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
    } catch (error) {
      console.error("Loading board state data resulted in an error", error);
      this.handleInvalidLoadValue(dumped);
    }
  }

  public apply(): void {}
}

export default BoardStateData;
