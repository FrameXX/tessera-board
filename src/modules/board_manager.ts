import type { BoardPieceProps, BoardPosition } from "../components/Board.vue";
import type { PieceId } from "./pieces/piece";

export const CHAR_INDEXES = ["a", "b", "c", "d", "e", "f", "g", "h"];

abstract class BoardManager extends EventTarget {
  constructor(private readonly pieceMoveAudioEffect: Howl) {
    super();
  }

  public abstract onPieceClick(boardPiece: BoardPieceProps): void;

  public abstract onCellClick(position: BoardPosition): void;

  public onPieceMove() {
    this.pieceMoveAudioEffect.play();
  }
}

export function getPositionNotation(position: BoardPosition) {
  return `${CHAR_INDEXES[position.col - 1]}${position.row}`;
}

export function getPieceNotation(pieceId: PieceId) {
  return `{${pieceId}}`;
}

export default BoardManager;
