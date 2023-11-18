import {
  BoardPosition,
  BoardStateValue,
  MarkBoardState,
  isBoardPosition,
} from "../board_manager";
import { getPositionPiece } from "../game_board_manager";
import Move, {
  movePiece,
  movePositionValue,
  tellPieceItCastled,
  tellPieceItMoved,
} from "./move";
import { RawMove } from "./raw_move";

export function isMoveCastling(move: Move): move is Castling {
  return move.moveId == "castling";
}

export interface RawCastling extends RawMove {
  king: boolean;
  kingSide: boolean;
  kingOrigin: BoardPosition;
  kingTarget: BoardPosition;
  rookOrigin: BoardPosition;
  rookTarget: BoardPosition;
}

export function isRawShift(rawMove: RawMove): rawMove is RawCastling {
  if (typeof rawMove.king !== "boolean") return false;
  if (typeof rawMove.kingSide !== "boolean") return false;
  if (typeof rawMove.kingOrigin !== "object") return false;
  if (typeof rawMove.kingTarget !== "object") return false;
  if (typeof rawMove.rookOrigin !== "object") return false;
  if (typeof rawMove.rookOrigin !== "object") return false;
  if (!isBoardPosition(rawMove.kingOrigin)) return false;
  if (!isBoardPosition(rawMove.kingTarget)) return false;
  if (!isBoardPosition(rawMove.rookOrigin)) return false;
  if (!isBoardPosition(rawMove.rookOrigin)) return false;
  return true;
}

class Castling extends Move {
  private firstMove = false;
  private firstCastling = false;

  constructor(
    private readonly king: boolean,
    private readonly kingSide: boolean,
    private readonly kingOrigin: BoardPosition,
    private readonly kingTarget: BoardPosition,
    private readonly rookOrigin: BoardPosition,
    private readonly rookTarget: BoardPosition,
    private readonly id?: string
  ) {
    super("castling");
  }

  get highlightedBoardPositions() {
    return [this.kingOrigin, this.kingTarget, this.rookOrigin, this.rookTarget];
  }

  private onForward(boardStateValue: BoardStateValue) {
    super.onPerformForward();
    if (this.id) {
      this.firstMove = !tellPieceItMoved(this.id, boardStateValue);
      this.firstCastling = !tellPieceItCastled(this.id, boardStateValue);
    }
  }

  public forward(boardStateValue: BoardStateValue): void {
    this.onForward(boardStateValue);

    const king = getPositionPiece(this.kingOrigin, boardStateValue);
    const rook = getPositionPiece(this.rookOrigin, boardStateValue);

    movePositionValue(king, this.kingOrigin, this.kingTarget, boardStateValue);
    movePositionValue(rook, this.rookOrigin, this.rookTarget, boardStateValue);
  }

  private onReverse(boardStateValue: BoardStateValue) {
    super.onPerformReverse();
    if (this.id) {
      tellPieceItMoved(this.id, boardStateValue, !this.firstMove);
      tellPieceItCastled(this.id, boardStateValue, !this.firstCastling);
    }
  }

  public reverse(boardStateValue: BoardStateValue): void {
    this.onReverse(boardStateValue);

    const king = getPositionPiece(this.kingTarget, boardStateValue);
    const rook = getPositionPiece(this.rookTarget, boardStateValue);

    movePositionValue(king, this.kingOrigin, this.kingTarget, boardStateValue);
    movePositionValue(rook, this.rookOrigin, this.rookTarget, boardStateValue);
  }

  public async perform(
    boardStateValue: BoardStateValue,
    audioEffects: boolean,
    moveAudioEffect: Howl
  ): Promise<void> {
    this.onForward(boardStateValue);

    movePiece(this.kingOrigin, this.kingTarget, boardStateValue);
    await movePiece(this.rookOrigin, this.rookTarget, boardStateValue);
    if (audioEffects) moveAudioEffect.play();

    this.notation = this.kingSide ? "0-0" : "0-0-0";
  }

  public get clickablePositions(): BoardPosition[] {
    if (this.king) {
      return [this.kingTarget, this.rookOrigin];
    } else {
      return [this.kingOrigin];
    }
  }

  public showCellMarks(cellMarks: MarkBoardState): void {
    if (this.king) {
      cellMarks[this.kingTarget.row][this.kingTarget.col] = "availible";
      cellMarks[this.rookOrigin.row][this.rookOrigin.col] = "capture";
    } else {
      cellMarks[this.kingOrigin.row][this.kingOrigin.col] = "capture";
    }
  }
}

export default Castling;
