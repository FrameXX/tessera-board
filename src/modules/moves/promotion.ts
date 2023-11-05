import type { Ref } from "vue";
import type { BoardPosition, MarkBoardState } from "../../components/Board.vue";
import type { BoardPositionValue, PieceId } from "../pieces/piece";
import type { RawPiece } from "../pieces/rawPiece";
import type { BoardStateValue } from "../user_data/board_state";
import Move from "./move";
import type SelectPieceDialog from "../dialogs/select_piece";
import {
  capturePosition,
  movePositionValue,
  transformPositionValue,
} from "./move";
import { getPieceNotation, getPositionNotation } from "../board_manager";
import type { PlayerColor } from "../game";

export function isMovePromotion(move: Move): move is Promotion {
  return move.moveId === "promotion";
}

class Promotion extends Move {
  constructor(
    private readonly pieceId: PieceId,
    private readonly pieceColor: PlayerColor,
    private readonly origin: BoardPosition,
    private readonly target: BoardPosition,
    private readonly transformOptions: [RawPiece, ...RawPiece[]],
    private readonly captures?: BoardPositionValue
  ) {
    super("promotion");
  }

  private getRelevantCapturedPieces(
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>
  ) {
    return this.pieceColor === "white"
      ? blackCapturedPieces
      : whiteCapturedPieces;
  }

  private getLimitedTransformOptions(capturedPieces: Ref<PieceId[]>) {
    return this.transformOptions.filter((option) => {
      return capturedPieces.value.includes(option.pieceId);
    });
  }

  get highlightedBoardPositions() {
    return [this.origin, this.target];
  }

  public async perform(
    boardStateValue: BoardStateValue,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    selectPieceDialog: SelectPieceDialog,
    reviveFromCapturedPieces: Ref<boolean>,
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

    let transformOptions: RawPiece[];
    let limitedTransformOptions: RawPiece[] = [];
    const capturedPieces = this.getRelevantCapturedPieces(
      blackCapturedPieces,
      whiteCapturedPieces
    );

    if (reviveFromCapturedPieces.value) {
      limitedTransformOptions = this.getLimitedTransformOptions(capturedPieces);
    }

    const limitedTransformOptionsAvailible =
      limitedTransformOptions.length !== 0;

    if (limitedTransformOptionsAvailible) {
      transformOptions = limitedTransformOptions;
    } else {
      transformOptions = this.transformOptions;
    }

    let newPiece: RawPiece | null = null;
    transformOptions.length === 1
      ? (newPiece = transformOptions[0])
      : (newPiece = await selectPieceDialog.open(transformOptions));

    transformPositionValue(this.target, newPiece, boardStateValue);
    if (useVibrations) navigator.vibrate([40, 60, 20]);

    if (limitedTransformOptionsAvailible)
      capturedPieces.value.splice(
        capturedPieces.value.indexOf(newPiece.pieceId),
        1
      );
    if (reviveFromCapturedPieces.value) capturedPieces.value.push(this.pieceId);

    let notation: string;
    this.captures
      ? (notation = `${getPieceNotation(this.pieceId)}x${getPositionNotation(
          this.captures
        )}=${getPieceNotation(newPiece.pieceId)}`)
      : (notation = `${getPositionNotation(this.target)}=${getPieceNotation(
          newPiece.pieceId
        )}`);
    return notation;
  }

  public getClickablePositions(): BoardPosition[] {
    return [this.target];
  }

  public showCellMarks(cellMarks: MarkBoardState): void {
    this.captures
      ? (cellMarks[this.target.row][this.target.col] = "capture")
      : (cellMarks[this.target.row][this.target.col] = "availible");
  }
}

export default Promotion;
