import type { Ref } from "vue";
import type Piece from "../pieces/piece";
import { getPieceFromRaw, type RawPiece } from "../pieces/raw_piece";
import type { MoveForwardContext, MovePerformContext } from "./move";
import Move, {
  clearPositionValue,
  getCleanBoardPosition,
  handleInvalidRawMove,
  movePositionValue,
  tellPieceItMoved,
} from "./move";
import { capturePosition, movePiece, transformPiece } from "./move";
import type {
  BoardPieceProps,
  BoardPosition,
  BoardStateValue,
  MarkBoardState,
  RawBoardPieceProps,
} from "../board_manager";
import {
  getPieceNotation,
  getPositionNotation,
  isBoardPosition,
} from "../board_manager";
import type { RawMove } from "./raw_move";
import { chooseBestPiece, getPositionPiece, isRawPiece } from "../utils/game";
import { PieceId } from "../pieces/piece";

export function isMovePromotion(move: Move): move is Promotion {
  return move.moveId === "promotion";
}

export interface RawPromotion extends RawMove {
  firstMove: boolean;
  piece: RawPiece;
  origin: BoardPosition;
  target: BoardPosition;
  transformOptions: [RawPiece, ...RawPiece[]];
  newRawPiece: RawPiece | null;
  captures?: RawBoardPieceProps;
  id?: string;
}

export function isRawPromotion(rawMove: RawMove): rawMove is RawPromotion {
  if (typeof rawMove.firstMove !== "boolean") return false;
  if (typeof rawMove.piece !== "object") return false;
  if (typeof rawMove.origin !== "object") return false;
  if (typeof rawMove.target !== "object") return false;
  if (typeof rawMove.transformOptions !== "object") return false;

  if (!isRawPiece(rawMove.piece)) return false;
  if (!isBoardPosition(rawMove.origin)) return false;
  if (!isBoardPosition(rawMove.target)) return false;
  if (!Array.isArray(rawMove.transformOptions)) return false;
  return true;
}

class Promotion extends Move {
  private firstMove = false;
  private newRawPiece: RawPiece | null = null;

  constructor(
    private readonly piece: Piece,
    private readonly origin: BoardPosition,
    private readonly target: BoardPosition,
    private readonly allTransformOptions: [RawPiece, ...RawPiece[]],
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
      firstMove: this.firstMove,
      performed: this.performed,
      moveId: this.moveId,
      piece: this.piece.getRawPiece(),
      origin: getCleanBoardPosition(this.origin),
      target: getCleanBoardPosition(this.target),
      transformOptions: this.allTransformOptions,
      newRawPiece: this.newRawPiece,
      captures,
      id: this.id,
    };
  }

  public loadCustomProps(rawMove: RawPromotion): void {
    super.loadCustomProps(rawMove);
    this.firstMove = rawMove.firstMove;
    if (typeof rawMove.newRawPiece !== "object") return;
    this.newRawPiece = rawMove.newRawPiece;
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

    const piece = getPieceFromRaw(rawMove.piece);
    piece.loadCustomProps(rawMove.piece);

    let id: string | undefined = undefined;
    if (rawMove.id) {
      id = rawMove.id;
    }

    return new Promotion(
      piece,
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
    return this.piece.color === "white"
      ? blackCapturedPieces
      : whiteCapturedPieces;
  }

  private getLimitedTransformOptions(capturedPieces: Ref<PieceId[]>) {
    return this.allTransformOptions.filter((option) => {
      return capturedPieces.value.includes(option.pieceId);
    });
  }

  get highlightedBoardPositions() {
    return [this.origin, this.target];
  }

  private getTransformOptions(
    reviveFromCapturedPieces: Ref<boolean>,
    capturedPieces: Ref<PieceId[]>
  ): RawPiece[] {
    let limitedTransformOptions: RawPiece[] = [];

    if (reviveFromCapturedPieces.value) {
      limitedTransformOptions = this.getLimitedTransformOptions(capturedPieces);
    }

    if (limitedTransformOptions.length !== 0) {
      return limitedTransformOptions;
    }
    return this.allTransformOptions;
  }

  private onForward(boardStateValue: BoardStateValue) {
    super.onPerformForward();
    if (this.id) {
      this.firstMove = !tellPieceItMoved(this.id, boardStateValue, true);
    }
  }

  public forward(context: MoveForwardContext): void {
    this.onForward(context.boardStateValue);

    if (this.captures) {
      clearPositionValue(this.captures, context.boardStateValue);
    }

    movePositionValue(
      this.piece,
      this.origin,
      this.target,
      context.boardStateValue
    );

    const capturedPieces = this.getRelevantCapturedPieces(
      context.blackCapturedPieces,
      context.whiteCapturedPieces
    );
    const transformOptions = this.getTransformOptions(
      context.reviveFromCapturedPieces,
      capturedPieces
    );
    if (!this.newRawPiece) {
      this.newRawPiece =
        transformOptions.length === 1
          ? transformOptions[0]
          : chooseBestPiece(transformOptions, context.piecesImportance);
    }
    const newPiece = getPieceFromRaw(this.newRawPiece);

    transformPiece(this.target, newPiece, context.boardStateValue);
  }

  private onReverse(boardStateValue: BoardStateValue) {
    if (this.id) {
      tellPieceItMoved(this.id, boardStateValue, !this.firstMove);
    }
  }

  public reverse(boardStateValue: BoardStateValue): void {
    this.beforePerformReverse();
    transformPiece(this.target, this.piece, boardStateValue);
    this.onReverse(boardStateValue);
    const piece = getPositionPiece(this.target, boardStateValue);
    movePositionValue(piece, this.target, this.origin, boardStateValue);

    if (this.captures) {
      boardStateValue[this.captures.row][this.captures.col] =
        this.captures.piece;
    }
  }

  public async perform(context: MovePerformContext): Promise<void> {
    this.onForward(context.boardStateValue);

    if (this.captures) {
      capturePosition(
        this.captures,
        context.boardStateValue,
        context.blackCapturedPieces,
        context.whiteCapturedPieces
      );
      if (context.audioEffectsEnabled.value) context.removeAudioEffect.play();
      if (context.vibrationsEnabled.value) navigator.vibrate(30);
    }
    await movePiece(this.origin, this.target, context.boardStateValue);
    if (context.audioEffectsEnabled.value) context.moveAudioEffect.play();

    const capturedPieces = this.getRelevantCapturedPieces(
      context.blackCapturedPieces,
      context.whiteCapturedPieces
    );
    const transformOptions = this.getTransformOptions(
      context.reviveFromCapturedPieces,
      capturedPieces
    );
    this.newRawPiece =
      transformOptions.length === 1
        ? transformOptions[0]
        : await context.selectPieceDialog.open(transformOptions);
    const newPiece = getPieceFromRaw(this.newRawPiece);

    if (context.reviveFromCapturedPieces.value) {
      capturedPieces.value.splice(
        capturedPieces.value.indexOf(newPiece.pieceId),
        1
      );
      capturedPieces.value.push(this.piece.pieceId);
    }

    transformPiece(this.target, newPiece, context.boardStateValue);
    if (context.vibrationsEnabled) navigator.vibrate([40, 60, 20]);

    this.notation = this.captures
      ? `${getPieceNotation(this.piece.pieceId)}x${getPositionNotation(
          this.captures
        )}=${getPieceNotation(this.newRawPiece.pieceId)}`
      : `${getPositionNotation(this.target)}=${getPieceNotation(
          this.newRawPiece.pieceId
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
