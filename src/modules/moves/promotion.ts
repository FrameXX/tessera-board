import type { Ref } from "vue";
import {
  chooseBestPiece,
  isPieceId,
  type PieceId,
  type PiecesImportance,
} from "../pieces/piece";
import { getPieceFromRaw, type RawPiece } from "../pieces/raw_piece";
import Move, {
  getCleanBoardPosition,
  handleInvalidRawMove,
  movePositionValue,
  tellPieceItMoved,
} from "./move";
import type SelectPieceDialog from "../dialogs/select_piece";
import { capturePosition, movePiece, transformPiece } from "./move";
import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
  MarkBoardState,
  RawBoardPieceProps} from "../board_manager";
import {
  getPieceNotation,
  getPositionNotation,
  isBoardPosition
} from "../board_manager";
import { isPlayerColor, type PlayerColor } from "../game";
import { getPositionPiece } from "../game_board_manager";
import type { RawMove } from "./raw_move";

export function isMovePromotion(move: Move): move is Promotion {
  return move.moveId === "promotion";
}

export interface RawPromotion extends RawMove {
  pieceId: PieceId;
  pieceColor: PlayerColor;
  origin: BoardPosition;
  target: BoardPosition;
  transformOptions: [RawPiece, ...RawPiece[]];
  captures?: RawBoardPieceProps;
  id?: string;
}

export function isRawPromotion(rawMove: RawMove): rawMove is RawPromotion {
  if (typeof rawMove.pieceId !== "string") return false;
  if (typeof rawMove.pieceColor !== "string") return false;
  if (typeof rawMove.origin !== "object") return false;
  if (typeof rawMove.target !== "object") return false;
  if (typeof rawMove.transformOptions !== "object") return false;

  if (!isPieceId(rawMove.pieceId)) return false;
  if (!isPlayerColor(rawMove.pieceColor)) return false;
  if (!isBoardPosition(rawMove.origin)) return false;
  if (!isBoardPosition(rawMove.target)) return false;
  if (!Array.isArray(rawMove.transformOptions)) return false;
  return true;
}

class Promotion extends Move {
  private firstMove = false;

  constructor(
    private readonly pieceId: PieceId,
    private readonly pieceColor: PlayerColor,
    private readonly origin: BoardPosition,
    private readonly target: BoardPosition,
    private readonly transformOptions: [RawPiece, ...RawPiece[]],
    private readonly captures?: BoardPieceProps,
    private readonly id?: string
  ) {
    super("promotion");
  }

  public getRaw(): RawPromotion {
    let captures: RawBoardPieceProps | undefined = undefined;
    if (this.captures) {
      const rawPiece = this.captures.piece.getRawPiece();
      captures = {
        row: this.captures.row,
        col: this.captures.col,
        piece: rawPiece,
      };
    }
    return {
      performed: this.performed,
      moveId: this.moveId,
      pieceColor: this.pieceColor,
      pieceId: this.pieceId,
      origin: getCleanBoardPosition(this.origin),
      target: getCleanBoardPosition(this.target),
      transformOptions: this.transformOptions,
      captures,
      id: this.id,
    };
  }

  public static restore(rawMove: RawMove): Promotion {
    if (!isRawPromotion(rawMove)) {
      handleInvalidRawMove(rawMove);
    }

    let captures: BoardPieceProps | undefined = undefined;
    if (rawMove.captures) {
      const rawPiece = rawMove.captures.piece;
      const piece = getPieceFromRaw(rawPiece);
      piece.loadCustomProps(rawPiece);
      captures = {
        row: rawMove.captures.row,
        col: rawMove.captures.col,
        piece: piece,
      };
    }

    let id: string | undefined = undefined;
    if (rawMove.id) id = rawMove.id;

    return new Promotion(
      rawMove.pieceId,
      rawMove.pieceColor,
      rawMove.origin,
      rawMove.target,
      rawMove.transformOptions,
      captures,
      id
    );
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

  private onForward(boardStateValue: BoardStateValue) {
    super.onPerformForward();
    if (this.id) {
      this.firstMove = !tellPieceItMoved(this.id, boardStateValue, true);
    }
  }

  public forward(
    boardStateValue: BoardStateValue,
    piecesImportance: PiecesImportance,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    reviveFromCapturedPieces: Ref<boolean>
  ): void {
    this.onForward(boardStateValue);

    if (this.captures) {
      capturePosition(
        this.captures,
        boardStateValue,
        blackCapturedPieces,
        whiteCapturedPieces
      );
    }

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
  }

  private onReverse(boardStateValue: BoardStateValue) {
    super.onPerformReverse();
    if (this.id) {
      tellPieceItMoved(this.id, boardStateValue, !this.firstMove);
    }
  }

  public reverse(boardStateValue: BoardStateValue): void {
    this.onReverse(boardStateValue);
    transformPiece(this.target, this.oldPiece, boardStateValue);
    const piece = getPositionPiece(this.target, boardStateValue);
    movePositionValue(piece, this.target, this.origin, boardStateValue);

    if (this.captures) {
      boardStateValue[this.captures.row][this.captures.col] =
        this.captures.piece;
    }
  }

  private get oldPiece() {
    return { pieceId: this.pieceId, color: this.pieceColor };
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
