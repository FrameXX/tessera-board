import type { Ref } from "vue";
import type Piece from "../pieces/piece";
import {
  chooseBestPiece,
  isPieceId,
  type PieceId,
  type PiecesImportance,
} from "../pieces/piece";
import {
  getPieceFromRaw,
  isRawPiece,
  type RawPiece,
} from "../pieces/raw_piece";
import Move, {
  clearPositionValue,
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
  RawBoardPieceProps,
} from "../board_manager";
import {
  getPieceNotation,
  getPositionNotation,
  isBoardPosition,
} from "../board_manager";
import { isPlayerColor } from "../game";
import { getPositionPiece } from "../game_board_manager";
import type { RawMove } from "./raw_move";

export function isMovePromotion(move: Move): move is Promotion {
  return move.moveId === "promotion";
}

export interface RawPromotion extends RawMove {
  firstMove: boolean;
  piece: RawPiece;
  origin: BoardPosition;
  target: BoardPosition;
  transformOptions: [RawPiece, ...RawPiece[]];
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
      captures,
      id: this.id,
    };
  }

  public loadCustomProps(rawMove: RawPromotion): void {
    super.loadCustomProps(rawMove);
    this.firstMove = rawMove.firstMove;
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

  public forward(
    boardStateValue: BoardStateValue,
    piecesImportance: PiecesImportance,
    blackCapturedPieces: Ref<PieceId[]>,
    whiteCapturedPieces: Ref<PieceId[]>,
    reviveFromCapturedPieces: Ref<boolean>
  ): void {
    this.onForward(boardStateValue);

    if (this.captures) {
      clearPositionValue(this.captures, boardStateValue);
    }

    movePositionValue(this.piece, this.origin, this.target, boardStateValue);

    const capturedPieces = this.getRelevantCapturedPieces(
      blackCapturedPieces,
      whiteCapturedPieces
    );
    const transformOptions = this.getTransformOptions(
      reviveFromCapturedPieces,
      capturedPieces
    );
    const newRawPiece =
      transformOptions.length === 1
        ? transformOptions[0]
        : chooseBestPiece(transformOptions, piecesImportance);
    const newPiece = getPieceFromRaw(newRawPiece);

    transformPiece(this.target, newPiece, boardStateValue);
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

    const capturedPieces = this.getRelevantCapturedPieces(
      blackCapturedPieces,
      whiteCapturedPieces
    );
    const transformOptions = this.getTransformOptions(
      reviveFromCapturedPieces,
      capturedPieces
    );
    const newRawPiece =
      transformOptions.length === 1
        ? transformOptions[0]
        : await selectPieceDialog.open(transformOptions);
    const newPiece = getPieceFromRaw(newRawPiece);

    if (reviveFromCapturedPieces.value) {
      capturedPieces.value.splice(
        capturedPieces.value.indexOf(newPiece.pieceId),
        1
      );
      capturedPieces.value.push(this.piece.pieceId);
    }

    transformPiece(this.target, newPiece, boardStateValue);
    if (useVibrations) navigator.vibrate([40, 60, 20]);

    this.notation = this.captures
      ? `${getPieceNotation(this.piece.pieceId)}x${getPositionNotation(
          this.captures
        )}=${getPieceNotation(newRawPiece.pieceId)}`
      : `${getPositionNotation(this.target)}=${getPieceNotation(
          newRawPiece.pieceId
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
