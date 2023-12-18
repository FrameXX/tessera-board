import type { Ref } from "vue";
import type Piece from "../pieces/piece";
import { getPieceFromRaw, type RawPiece } from "../pieces/raw_piece";
import Move, {
  clearPositionValue,
  getCleanBoardPosition,
  handleInvalidRawMove,
  movePositionValue,
  tellPieceItMoved,
} from "./move";
import { capturePosition, movePiece, transformPiece } from "./move";
import type {
  PieceContext,
  BoardPosition,
  BoardStateValue,
  MarkBoardState,
  RawBoardpieceContext,
} from "../board_manager";
import {
  getPieceNotation,
  getPositionNotation,
  isBoardPosition,
} from "../board_manager";
import type { RawMove } from "./raw_move";
import {
  chooseBestPiece,
  getBoardPositionPiece,
  isRawPiece,
} from "../utils/game";
import { PieceId } from "../pieces/piece";
import Game from "../game";

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
  captures?: RawBoardpieceContext;
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
    private readonly captures?: PieceContext,
    private readonly id?: string
  ) {
    super("promotion");
  }

  public getRaw(): RawPromotion {
    let captures: RawBoardpieceContext | undefined = undefined;
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

    let captures: PieceContext | undefined = undefined;
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

  public forward(boardState: BoardStateValue, game: Game): void {
    this.onForward(boardState);

    if (this.captures) {
      clearPositionValue(this.captures, boardState);
    }

    movePositionValue(this.piece, this.origin, this.target, boardState);

    const capturedPieces = this.getRelevantCapturedPieces(
      game.blackCapturedPieces,
      game.whiteCapturedPieces
    );
    const transformOptions = this.getTransformOptions(
      game.settings.reviveFromCapturedPieces,
      capturedPieces
    );
    if (!this.newRawPiece) {
      this.newRawPiece =
        transformOptions.length === 1
          ? transformOptions[0]
          : chooseBestPiece(transformOptions, game.piecesImportance);
    }
    const newPiece = getPieceFromRaw(this.newRawPiece);

    transformPiece(this.target, newPiece, boardState);
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
    const piece = getBoardPositionPiece(this.target, boardStateValue);
    movePositionValue(piece, this.target, this.origin, boardStateValue);

    if (this.captures) {
      boardStateValue[this.captures.row][this.captures.col] =
        this.captures.piece;
    }
  }

  public async perform(game: Game): Promise<void> {
    this.onForward(game.boardState);

    if (this.captures) {
      capturePosition(
        this.captures,
        game.boardState,
        game.blackCapturedPieces,
        game.whiteCapturedPieces
      );
      if (game.settings.audioEffectsEnabled.value)
        game.audioEffects.pieceRemove.play();
      if (game.settings.vibrationsEnabled.value) navigator.vibrate(30);
    }

    await movePiece(this.origin, this.target, game.boardState);
    game.updateGameBoardAllPiecesContext();

    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();

    const capturedPieces = this.getRelevantCapturedPieces(
      game.blackCapturedPieces,
      game.whiteCapturedPieces
    );

    const transformOptions = this.getTransformOptions(
      game.settings.reviveFromCapturedPieces,
      capturedPieces
    );

    this.newRawPiece =
      transformOptions.length === 1
        ? transformOptions[0]
        : await game.ui.selectPieceDialog.open(transformOptions);
    const newPiece = getPieceFromRaw(this.newRawPiece);

    if (game.settings.reviveFromCapturedPieces.value) {
      capturedPieces.value.splice(
        capturedPieces.value.indexOf(newPiece.pieceId),
        1
      );
      capturedPieces.value.push(this.piece.pieceId);
    }

    transformPiece(this.target, newPiece, game.boardState);
    if (game.settings.vibrationsEnabled) navigator.vibrate([40, 60, 20]);

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
