import type { Ref } from "vue";
import { isPieceId, type PieceId } from "../pieces/piece";
import Move, { movePositionValue, tellPieceItMoved } from "./move";
import {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
  getPieceNotation,
  getPositionNotation,
  isBoardPosition,
  MarkBoardState,
} from "../board_manager";
import { capturePosition, movePiece } from "./move";
import { getPositionPiece } from "../game_board_manager";
import { RawMove } from "./raw_move";
import { GameLogicError } from "../game";

export function isMoveShift(move: Move): move is Shift {
  return move.moveId == "shift";
}

export interface RawShift extends RawMove {
  pieceId: PieceId;
  origin: BoardPosition;
  target: BoardPosition;
  captures?: BoardPieceProps;
  id?: string;
}

export function isRawShift(rawMove: RawMove): rawMove is RawShift {
  if (typeof rawMove.pieceId !== "string") return false;
  if (typeof rawMove.origin !== "object") return false;
  if (typeof rawMove.target !== "object") return false;
  if (!isPieceId(rawMove.pieceId)) return false;
  if (!isBoardPosition(rawMove.origin)) return false;
  if (!isBoardPosition(rawMove.target)) return false;
  return true;
}

class Shift extends Move {
  private firstMove = false;

  constructor(
    private readonly pieceId: PieceId,
    private readonly origin: BoardPosition,
    private readonly target: BoardPosition,
    public readonly captures?: BoardPieceProps,
    private readonly id?: string
  ) {
    super("shift");
  }

  public static restoreShift(rawMove: RawMove) {
    if (!isRawShift(rawMove)) {
      console.log(rawMove);
      throw new GameLogicError(
        "Provided rawMove is not a rawShift. No props were loaded."
      );
    }
  }

  get highlightedBoardPositions() {
    return [this.origin, this.target];
  }

  private onForward(boardStateValue: BoardStateValue) {
    super.onPerformForward();
    if (this.id) {
      this.firstMove = !tellPieceItMoved(this.id, boardStateValue, true);
    }
  }

  public forward(boardStateValue: BoardStateValue): void {
    this.onForward(boardStateValue);

    const piece = getPositionPiece(this.origin, boardStateValue);
    movePositionValue(piece, this.origin, this.target, boardStateValue);
  }

  private onReverse(boardStateValue: BoardStateValue) {
    super.onPerformReverse();
    if (this.id) {
      tellPieceItMoved(this.id, boardStateValue, !this.firstMove);
    }
  }

  public reverse(boardStateValue: BoardStateValue): void {
    this.onReverse(boardStateValue);

    const piece = getPositionPiece(this.target, boardStateValue);
    movePositionValue(piece, this.target, this.origin, boardStateValue);

    if (this.captures) {
      boardStateValue[this.captures.row][this.captures.col] =
        this.captures.piece;
    }
  }

  public async perform(
    boardStateValue: BoardStateValue,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    audioEffects: boolean,
    moveAudioEffect: Howl,
    removeAudioEffect: Howl,
    useVibrations: boolean
  ): Promise<void> {
    this.onForward(boardStateValue);

    if (this.captures) {
      capturePosition(
        this.captures,
        boardStateValue,
        blackCapturedPieces,
        whiteCapturedPieces
      );
      if (audioEffects) removeAudioEffect.play();
      if (useVibrations) navigator.vibrate(30);
    }
    await movePiece(this.origin, this.target, boardStateValue);
    if (audioEffects) moveAudioEffect.play();

    this.notation = this.captures
      ? `${getPieceNotation(this.pieceId)}x${getPositionNotation(
          this.captures
        )}`
      : `${getPieceNotation(this.pieceId)}${getPositionNotation(this.target)}`;
  }

  public get clickablePositions(): BoardPosition[] {
    return [this.target];
  }

  public showCellMarks(cellMarks: MarkBoardState): void {
    cellMarks[this.target.row][this.target.col] = "availible";
    if (this.captures)
      cellMarks[this.captures.row][this.captures.col] = "capture";
  }
}

export default Shift;
