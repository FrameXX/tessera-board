import type Piece from "../pieces/piece";
import { isPieceId, type PieceId } from "../pieces/piece";
import Move, {
  clearPositionValue,
  getCleanBoardPosition,
  handleInvalidRawMove,
  movePositionValue,
  pieceHasMovedProperty,
  setPieceMoveProperty,
} from "./move";
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
  isRawBoardpieceContext,
  isBoardPosition,
} from "../board_manager";
import type { RawMove } from "./raw_move";
import { getPieceFromRaw } from "../pieces/raw_piece";
import {
  getBoardPositionPiece,
  getOpossitePlayerColor,
  positionsEqual,
} from "../utils/game";
import type Game from "../game";
import type { Player } from "../game";
import type PiecesImportance from "../pieces_importance";

export function isMoveShift(move: Move): move is Shift {
  return move.moveId == "shift";
}

export interface RawShift extends RawMove {
  firstMove: boolean;
  pieceId: PieceId;
  origin: BoardPosition;
  target: BoardPosition;
  captures?: RawBoardpieceContext;
  id?: string;
}

export function isRawShift(rawMove: RawMove): rawMove is RawShift {
  if (typeof rawMove.firstMove !== "boolean") return false;
  if (typeof rawMove.pieceId !== "string") return false;
  if (typeof rawMove.origin !== "object") return false;
  if (typeof rawMove.target !== "object") return false;
  if (!isPieceId(rawMove.pieceId)) return false;
  if (!isBoardPosition(rawMove.origin)) return false;
  if (!isBoardPosition(rawMove.target)) return false;
  if (rawMove.captures) {
    if (!isRawBoardpieceContext(rawMove.captures)) {
      return false;
    }
  }
  return true;
}

class Shift extends Move {
  private firstMove = false;

  constructor(
    public readonly pieceId: PieceId,
    public readonly origin: BoardPosition,
    public readonly target: BoardPosition,
    public readonly captures?: PieceContext
  ) {
    super("shift");
  }

  protected _getScore(
    game: Game,
    boardState: BoardStateValue,
    piecesImportance: PiecesImportance,
    forPlayer: Player,
    playerMove = true
  ): number {
    const captureScore = this.captures
      ? piecesImportance.values[this.captures.piece.pieceId].value
      : 0;
    const moveOpponentColor = playerMove
      ? getOpossitePlayerColor(forPlayer.color.value)
      : forPlayer.color.value;
    const checkScore = this.getCheckingScore(
      game,
      moveOpponentColor,
      boardState,
      piecesImportance
    );
    return captureScore + checkScore;
  }

  public getRaw(): RawShift {
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
      pieceId: this.pieceId,
      origin: getCleanBoardPosition(this.origin),
      target: getCleanBoardPosition(this.target),
      captures,
    };
  }

  public static restore(rawMove: RawMove): Shift {
    if (!isRawShift(rawMove)) {
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

    return new Shift(rawMove.pieceId, rawMove.origin, rawMove.target, captures);
  }

  public getNotation(): string {
    return this.captures
      ? `${getPieceNotation(this.pieceId)}x${getPositionNotation(
        this.captures
      )}`
      : `${getPieceNotation(this.pieceId)}${getPositionNotation(this.target)}`;
  }

  public loadCustomProps(rawMove: RawShift): void {
    super.loadCustomProps(rawMove);
    this.firstMove = rawMove.firstMove;
  }

  get highlightedBoardPositions() {
    return [this.origin, this.target];
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
  }

  private forwardMovedProperty(piece: Piece) {
    if (!pieceHasMovedProperty(piece)) return;
    this.firstMove = !piece.moved;
    setPieceMoveProperty(piece, true);
  }

  protected _forward(boardState: BoardStateValue): void {
    if (this.captures) {
      clearPositionValue(this.captures, boardState);
    }

    const piece = getBoardPositionPiece(this.origin, boardState);
    movePositionValue(piece, this.origin, this.target, boardState);
    this.forwardMovedProperty(piece);
  }

  protected async _undo(game: Game) {
    const piece = getBoardPositionPiece(this.target, game.boardState);
    await game.movePiece(piece, this.target, this.origin);
    this.reverseMovedProperty(piece);
    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();

    if (this.captures) {
      game.unCapturePosition(this.captures, this.captures.piece);
      if (game.settings.audioEffectsEnabled.value)
        game.audioEffects.pieceMove.play();
    }
  }

  private reverseMovedProperty(piece: Piece) {
    if (!pieceHasMovedProperty(piece)) return;
    setPieceMoveProperty(piece, !this.firstMove);
  }

  protected _reverse(boardState: BoardStateValue): void {
    const piece = getBoardPositionPiece(this.target, boardState);
    movePositionValue(piece, this.target, this.origin, boardState);
    this.reverseMovedProperty(piece);

    if (this.captures)
      boardState[this.captures.row][this.captures.col] = this.captures.piece;
  }

  public async _perform(game: Game) {
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
  }

  public get clickablePositions(): BoardPosition[] {
    if (!this.captures) return [this.target];
    if (positionsEqual(this.target, this.captures)) return [this.target];
    return [this.target, this.captures];
  }

  public showCellMarks(cellMarks: MarkBoardState): void {
    cellMarks[this.target.row][this.target.col] = "availible";
    if (this.captures)
      cellMarks[this.captures.row][this.captures.col] = "capture";
  }
}

export default Shift;
