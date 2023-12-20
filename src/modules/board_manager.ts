import type { ComputedRef } from "vue";
import { computed, reactive, ref } from "vue";
import type { Piece, PieceId } from "./pieces/piece";
import type { RawPiece } from "./pieces/raw_piece";
import type { Mark} from "./utils/game";
import { isRawPiece } from "./utils/game";

export type BoardStateValue = (Piece | null)[][];

export type MarkBoardState = (Mark | null)[][];

export interface BoardPosition {
  row: number;
  col: number;
}

// export class BoardPosition {
//   constructor(public readonly row: number, public readonly col: number) {}

//   public equals(position: BoardPosition) {
//     return this.row === position.row && this.col === position.col;
//   }

//   isInList(positions: BoardPosition[]) {
//     for (const position of positions) {
//       if (position.equals(this)) return true;
//     }
//     return false;
//   }
// }

export function isBoardPosition(object: any): object is BoardPosition {
  if (typeof object.row !== "number") return false;
  if (typeof object.col !== "number") return false;
  return true;
}

export interface PieceContext extends BoardPosition {
  piece: Piece;
}

export interface RawBoardpieceContext extends BoardPosition {
  piece: RawPiece;
}
export function isRawBoardpieceContext(
  object: any
): object is RawBoardpieceContext {
  if (typeof object.row !== "number") return false;
  if (typeof object.col !== "number") return false;
  if (typeof object.piece !== "object") return false;
  if (!isRawPiece(object.piece)) return false;
  return true;
}

export const CHAR_INDEXES = ["a", "b", "c", "d", "e", "f", "g", "h"];

abstract class BoardManager {
  public readonly cellMarks: MarkBoardState = reactive(
    Array(8)
      .fill(null)
      .map(() => new Array(8).fill(null))
  );
  public readonly contentRotated: ComputedRef<boolean> = computed(() => false);
  public readonly boardRotated: ComputedRef<boolean> = computed(() => false);
  public readonly selectedCell = ref<BoardPosition | null>(null);
  public readonly draggingOverCell = ref<BoardPosition | null>(null);
  public readonly selectedPiece = ref<PieceContext | null>(null);

  constructor() {}

  public abstract onPieceClick(boardPiece: PieceContext): void;

  public abstract onCellClick(position: BoardPosition): void;

  public abstract onPieceDragStart(
    targetPosition: BoardPosition,
    pieceContext: PieceContext
  ): void;

  public abstract onPieceDragEnd(
    targetPosition: BoardPosition,
    pieceContext: PieceContext
  ): void;

  public abstract onPieceDragOverCell(
    targetPosition: BoardPosition,
    pieceContext: PieceContext
  ): void;

  protected clearCellMarks() {
    for (const rowIndex in this.cellMarks) {
      for (const colIndex in this.cellMarks[rowIndex]) {
        this.cellMarks[+rowIndex][+colIndex] = null;
      }
    }
  }
}

export function getPositionNotation(position: BoardPosition) {
  return `${CHAR_INDEXES[position.col]}${position.row + 1}`;
}

export function getPieceNotation(pieceId: PieceId) {
  return `{${pieceId}}`;
}

export default BoardManager;
