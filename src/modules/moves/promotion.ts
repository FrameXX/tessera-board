import type { Ref } from "vue";
import type { BoardPosition, MarkBoardState } from "../../components/Board.vue";
import {
  chooseBestPiece,
  type BoardPositionValue,
  type PieceId,
  type PiecesImportance,
} from "../pieces/piece";
import type { RawPiece } from "../pieces/rawPiece";
import type { BoardStateValue } from "../user_data/board_state";
import Move, { movePositionValue } from "./move";
import type SelectPieceDialog from "../dialogs/select_piece";
import { capturePosition, movePiece, transformPiece } from "./move";
import { getPieceNotation, getPositionNotation } from "../board_manager";
import { GameLogicError, type PlayerColor } from "../game";
import { getPositionPiece } from "../game_board_manager";

export function isMovePromotion(move: Move): move is Promotion {
  return move.moveId === "promotion";
}

class Promotion extends Move {
  private newPieceId?: PieceId;

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

  public forward(
    boardStateValue: BoardStateValue,
    piecesImportance: PiecesImportance,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    reviveFromCapturedPieces: Ref<boolean>
  ): void {
    this.onPerformForward();

    const piece = getPositionPiece(this.origin, boardStateValue);
    movePositionValue(piece, this.origin, this.target, boardStateValue);
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

    const newPiece =
      transformOptions.length === 1
        ? transformOptions[0]
        : chooseBestPiece(transformOptions, piecesImportance);

    transformPiece(this.target, newPiece, boardStateValue);

    this.newPieceId = newPiece.pieceId;
    this.performed = true;
  }

  private get oldPiece() {
    return { pieceId: this.pieceId, color: this.pieceColor };
  }

  public reverse(boardStateValue: BoardStateValue): void {
    this.onPerformReverse();
    if (!this.newPieceId) {
      throw new GameLogicError(
        "newPieceId is not availible thus cannot reverse the promotion."
      );
    }
    transformPiece(this.target, this.oldPiece, boardStateValue);
    const piece = getPositionPiece(this.target, boardStateValue);
    movePositionValue(piece, this.target, this.origin, boardStateValue);
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

    const newPiece =
      transformOptions.length === 1
        ? transformOptions[0]
        : await selectPieceDialog.open(transformOptions);

    if (limitedTransformOptionsAvailible)
      capturedPieces.value.splice(
        capturedPieces.value.indexOf(newPiece.pieceId),
        1
      );
    if (reviveFromCapturedPieces.value) capturedPieces.value.push(this.pieceId);

    transformPiece(this.target, newPiece, boardStateValue);
    if (useVibrations) navigator.vibrate([40, 60, 20]);

    this.notation = this.captures
      ? `${getPieceNotation(this.pieceId)}x${getPositionNotation(
        this.captures
      )}=${getPieceNotation(newPiece.pieceId)}`
      : `${getPositionNotation(this.target)}=${getPieceNotation(
        newPiece.pieceId
      )}`;
    this.performed = true;
  }

  public get clickablePositions(): BoardPosition[] {
    return [this.target];
  }

  public showCellMarks(cellMarks: MarkBoardState): void {
    this.captures
      ? (cellMarks[this.target.row][this.target.col] = "capture")
      : (cellMarks[this.target.row][this.target.col] = "availible");
  }
}

export default Promotion;
