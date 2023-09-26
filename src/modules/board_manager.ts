import { BoardPieceProps, BoardPosition } from "../components/Board.vue";

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

export default BoardManager;
