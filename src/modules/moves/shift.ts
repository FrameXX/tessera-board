import type { Ref } from "vue";
import type { BoardPosition, MarkBoardState } from "../../components/Board.vue";
import type { BoardPositionValue, PieceId } from "../pieces/piece";
import type { BoardStateValue } from "../user_data/board_state";
import Move, { movePositionValue } from "./move";
import { getPieceNotation, getPositionNotation } from "../board_manager";
import { capturePosition, movePiece } from "./move";
import { GameLogicError } from "../game";

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

  get highlightedBoardPositions() {
    return [this.origin, this.target];
  }

  public forward(boardStateValue: BoardStateValue): void {
    const piece = boardStateValue[this.origin.row][this.origin.col];
    if (!piece) {
      throw new GameLogicError(
        `Board position is missing a piece to shift. Position ${JSON.stringify(
          this.origin
        )}`
      );
    }
    movePositionValue(piece, this.origin, this.target, boardStateValue);
  }

  public async perform(
    boardStateValue: BoardStateValue,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
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
    await movePiece(this.origin, this.target, boardStateValue);
    if (audioEffects) moveAudioEffect.play();
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
