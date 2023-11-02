import type { Ref } from "vue";
import type { BoardPosition, MarkBoardState } from "../../components/Board.vue";
import type { BooleanBoardState } from "../user_data/boolean_board_state";
import type { BoardPositionValue, PieceId } from "../pieces/piece";
import type { BoardStateValue } from "../user_data/board_state";
import Move, { highlightBoardPosition } from "./move";
import { getPieceNotation, getPositionNotation } from "../board_manager";
import { capturePosition, movePositionValue } from "./move";

export function isMoveShift(move: Move): move is Shift {
  return move.moveId == "shift";
}

class Shift extends Move {
  constructor(
    private readonly pieceId: PieceId,
    private readonly origin: BoardPosition,
    private readonly target: BoardPosition,
    public readonly captures?: BoardPositionValue,
    private readonly onPerform?: (move: Move) => void
  ) {
    super("shift");
  }

  public async perform(
    boardStateValue: BoardStateValue,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    higlightedCells: BooleanBoardState,
    audioEffects: boolean,
    moveAudioEffect: Howl,
    removeAudioEffect: Howl,
    useVibrations: boolean
  ): Promise<string> {
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
    await movePositionValue(this.origin, this.target, boardStateValue);
    if (audioEffects) moveAudioEffect.play();

    highlightBoardPosition(this.origin, higlightedCells);
    highlightBoardPosition(this.target, higlightedCells);

    if (this.onPerform) this.onPerform(this);

    let notation: string;
    this.captures
      ? (notation = `${getPieceNotation(this.pieceId)}x${getPositionNotation(
        this.captures
      )}`)
      : (notation = `${getPieceNotation(this.pieceId)}${getPositionNotation(
        this.target
      )}`);
    return notation;
  }

  public getClickablePositions(): BoardPosition[] {
    return [this.target];
  }

  public showCellMarks(cellMarks: MarkBoardState): void {
    cellMarks[this.target.row][this.target.col] = "availible";
    if (this.captures)
      cellMarks[this.captures.row][this.captures.col] = "capture";
  }
}

export default Shift;
