import type { Ref } from "vue";
import type {
  BoardPieceProps,
  BoardPosition,
  MarkBoardState,
} from "../../components/Board.vue";
import type { PieceId } from "../pieces/piece";
import type { BoardStateValue } from "../user_data/board_state";
import Move, { movePositionValue } from "./move";
import { getPieceNotation, getPositionNotation } from "../board_manager";
import { capturePosition, movePiece } from "./move";
import { getPositionPiece } from "../game_board_manager";

export function isMoveShift(move: Move): move is Shift {
  return move.moveId == "shift";
}

class Shift extends Move {
  constructor(
    private readonly pieceId: PieceId,
    private readonly origin: BoardPosition,
    private readonly target: BoardPosition,
    public readonly captures?: BoardPieceProps,
    private readonly onPerform?: (move: Move) => void
  ) {
    super("shift");
  }

  get highlightedBoardPositions() {
    return [this.origin, this.target];
  }

  public forward(boardStateValue: BoardStateValue): void {
    this.onPerformForward();

    const piece = getPositionPiece(this.origin, boardStateValue);
    movePositionValue(piece, this.origin, this.target, boardStateValue);

    this.performed = true;
  }

  public reverse(boardStateValue: BoardStateValue): void {
    this.onPerformReverse();

    const piece = getPositionPiece(this.target, boardStateValue);
    movePositionValue(piece, this.target, this.origin, boardStateValue);

    if (this.captures) {
      boardStateValue[this.captures.row][this.captures.col] =
        this.captures.piece;
    }

    this.performed = false;
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
    this.onPerformForward();

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

    if (this.onPerform) this.onPerform(this);
    this.performed = true;
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
