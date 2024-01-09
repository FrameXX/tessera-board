import type { Ref } from "vue";
import type Piece from "../pieces/piece";
import { getPieceFromRaw, type RawPiece } from "../pieces/raw_piece";
import Move, {
  clearPositionValue,
  getCleanBoardPosition,
  handleInvalidRawMove,
  movePositionValue,
  pieceHasMovedProperty,
  setPieceMoveProperty,
} from "./move";
import { transformPiece } from "./move";
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
import { chooseBestPiece, GameLogicError, isRawPiece } from "../utils/game";
import type { PieceId } from "../pieces/piece";
import type Game from "../game";
import { getBoardPositionPiece } from "../utils/game";
import type CapturedPieces from "../capturedPieces";

export function isMovePromotion(move: Move): move is Promotion {
  return move.moveId === "promotion";
}

export interface RawPromotion extends RawMove {
  firstMove: boolean;
  originalPiece: RawPiece;
  origin: BoardPosition;
  target: BoardPosition;
  transformOptions: [RawPiece, ...RawPiece[]];
  newRawPiece: RawPiece | null;
  captures?: RawBoardpieceContext;
}

export function isRawPromotion(rawMove: RawMove): rawMove is RawPromotion {
  if (typeof rawMove.firstMove !== "boolean") return false;
  if (typeof rawMove.originalPiece !== "object") return false;
  if (typeof rawMove.origin !== "object") return false;
  if (typeof rawMove.target !== "object") return false;
  if (typeof rawMove.transformOptions !== "object") return false;

  if (!isRawPiece(rawMove.originalPiece)) return false;
  if (!isBoardPosition(rawMove.origin)) return false;
  if (!isBoardPosition(rawMove.target)) return false;
  if (!Array.isArray(rawMove.transformOptions)) return false;
  return true;
}

class Promotion extends Move {
  private firstMove = false;
  private newRawPiece: RawPiece | null = null;

  constructor(
    private readonly originalPiece: Piece,
    private readonly origin: BoardPosition,
    private readonly target: BoardPosition,
    private readonly transformOptions: [RawPiece, ...RawPiece[]],
    private readonly captures?: PieceContext
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
      originalPiece: this.originalPiece.getRawPiece(),
      origin: getCleanBoardPosition(this.origin),
      target: getCleanBoardPosition(this.target),
      transformOptions: this.transformOptions,
      newRawPiece: this.newRawPiece,
      captures,
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

    const piece = getPieceFromRaw(rawMove.originalPiece);
    piece.loadCustomProps(rawMove.originalPiece);

    return new Promotion(
      piece,
      rawMove.origin,
      rawMove.target,
      rawMove.transformOptions,
      captures
    );
  }

  private getLimitedTransformOptions(capturedPieces: Ref<PieceId[]>) {
    return this.transformOptions.filter((option) => {
      return capturedPieces.value.includes(option.pieceId);
    });
  }

  get highlightedBoardPositions() {
    return [this.origin, this.target];
  }

  private getTransformOptions(
    reviveFromCapturedPieces: Ref<boolean>,
    capturedPieces: CapturedPieces
  ): RawPiece[] {
    const deadPieces =
      this.originalPiece.color === "white"
        ? capturedPieces.white
        : capturedPieces.black;

    let limitedTransformOptions: RawPiece[] = [];

    if (reviveFromCapturedPieces.value)
      limitedTransformOptions = this.getLimitedTransformOptions(deadPieces);

    if (limitedTransformOptions.length !== 0) return limitedTransformOptions;

    return this.transformOptions;
  }

  private forwardMovedProperty(piece: Piece) {
    if (!pieceHasMovedProperty(piece)) return;
    this.firstMove = !piece.moved;
    setPieceMoveProperty(piece, true);
  }

  protected async _redo(game: Game) {
    if (this.captures) {
      game.capturePosition(this.captures);

      if (game.settings.audioEffectsEnabled.value)
        game.audioEffects.pieceRemove.play();
      if (game.settings.vibrationsEnabled.value) navigator.vibrate(30);
    }

    const piece = getBoardPositionPiece(this.origin, game.boardState);
    await game.movePiece(piece, this.origin, this.target);
    this.forwardMovedProperty(piece);

    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();

    if (!this.newRawPiece) {
      const transformOptions = this.getTransformOptions(
        game.settings.reviveFromCapturedPieces,
        game.capturedPieces
      );

      this.newRawPiece =
        transformOptions.length === 1
          ? transformOptions[0]
          : chooseBestPiece(
              transformOptions,
              game.settings.piecesImportances.values
            );
    }

    const newPiece = getPieceFromRaw(this.newRawPiece);

    if (game.settings.reviveFromCapturedPieces.value) {
      game.capturedPieces.add(this.originalPiece);
      game.capturedPieces.remove(newPiece);
    }

    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceRemove.play();

    transformPiece(this.target, newPiece, game.boardState);

    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();
    if (game.settings.vibrationsEnabled) navigator.vibrate([40, 60, 20]);
  }

  protected _forward(boardState: BoardStateValue, game: Game): void {
    if (this.captures) {
      clearPositionValue(this.captures, boardState);
    }

    const piece = getBoardPositionPiece(this.origin, game.boardState);
    movePositionValue(piece, this.origin, this.target, boardState);
    this.forwardMovedProperty(piece);

    if (!this.newRawPiece) {
      const transformOptions = this.getTransformOptions(
        game.settings.reviveFromCapturedPieces,
        game.capturedPieces
      );

      this.newRawPiece =
        transformOptions.length === 1
          ? transformOptions[0]
          : chooseBestPiece(
              transformOptions,
              game.settings.piecesImportances.values
            );
    }

    const newPiece = getPieceFromRaw(this.newRawPiece);

    transformPiece(this.target, newPiece, boardState);
  }

  private reverseMovedProperty(piece: Piece) {
    if (!pieceHasMovedProperty(piece)) return;
    setPieceMoveProperty(piece, !this.firstMove);
  }

  protected async _undo(game: Game) {
    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceRemove.play();

    const newPiece = getBoardPositionPiece(this.target, game.boardState);

    transformPiece(this.target, this.originalPiece, game.boardState);
    game.updateGameBoardAllPiecesContext();

    if (game.settings.reviveFromCapturedPieces.value) {
      game.capturedPieces.remove(this.originalPiece);
      game.capturedPieces.add(newPiece);
    }

    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();
    if (game.settings.vibrationsEnabled) navigator.vibrate([40, 60, 20]);

    const piece = getBoardPositionPiece(this.target, game.boardState);
    await game.movePiece(piece, this.target, this.origin);
    this.reverseMovedProperty(piece);

    if (this.captures) {
      game.unCapturePosition(this.captures, this.captures.piece);
      if (game.settings.audioEffectsEnabled.value)
        game.audioEffects.pieceMove.play();
    }
  }

  protected _reverse(boardState: BoardStateValue): void {
    transformPiece(this.target, this.originalPiece, boardState);

    const piece = getBoardPositionPiece(this.target, boardState);
    movePositionValue(piece, this.target, this.origin, boardState);
    this.reverseMovedProperty(piece);

    if (this.captures) {
      boardState[this.captures.row][this.captures.col] = this.captures.piece;
    }
  }

  protected async _perform(game: Game) {
    if (this.captures) {
      game.capturePosition(this.captures);
      if (game.settings.audioEffectsEnabled.value)
        game.audioEffects.pieceRemove.play();
      if (game.settings.vibrationsEnabled.value) navigator.vibrate(30);
    }

    const piece = getBoardPositionPiece(this.origin, game.boardState);

    await game.movePiece(piece, this.origin, this.target);
    this.forwardMovedProperty(piece);
    game.updateGameBoardAllPiecesContext();

    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();

    const transformOptions = this.getTransformOptions(
      game.settings.reviveFromCapturedPieces,
      game.capturedPieces
    );

    this.newRawPiece =
      transformOptions.length === 1
        ? transformOptions[0]
        : await game.ui.selectPieceDialog.open(transformOptions);

    const newPiece = getPieceFromRaw(this.newRawPiece);

    if (game.settings.reviveFromCapturedPieces.value) {
      game.capturedPieces.add(this.originalPiece);
      game.capturedPieces.remove(newPiece);
    }

    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceRemove.play();

    transformPiece(this.target, newPiece, game.boardState);

    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();
    if (game.settings.vibrationsEnabled) navigator.vibrate([40, 60, 20]);
    game.updateGameBoardAllPiecesContext();
  }

  public getNotation(): string {
    if (!this.newRawPiece) {
      throw new GameLogicError(
        "Cannot get promotion notation if it's not performed already at least once."
      );
    }

    return this.captures
      ? `${getPieceNotation(this.originalPiece.pieceId)}x${getPositionNotation(
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
