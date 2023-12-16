import { isPieceId, type PieceId } from "../pieces/piece";
import Move, {
  clearPositionValue,
  getCleanBoardPosition,
  handleInvalidRawMove,
  movePositionValue,
  tellPieceItMoved,
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
import { capturePosition, movePiece } from "./move";
import type { RawMove } from "./raw_move";
import { getPieceFromRaw } from "../pieces/raw_piece";
import { getBoardPositionPiece, positionsEqual } from "../utils/game";
import Game from "../game";

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
    public readonly captures?: PieceContext,
    private readonly id?: string
  ) {
    super("shift");
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
      id: this.id,
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

    let id: string | undefined = undefined;
    if (rawMove.id) id = rawMove.id;

    return new Shift(
      rawMove.pieceId,
      rawMove.origin,
      rawMove.target,
      captures,
      id
    );
  }

  public loadCustomProps(rawMove: RawShift): void {
    super.loadCustomProps(rawMove);
    this.firstMove = rawMove.firstMove;
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

  public forward(boardState: BoardStateValue): void {
    this.onForward(boardState);

    if (this.captures) {
      clearPositionValue(this.captures, boardState);
    }
    const piece = getBoardPositionPiece(this.origin, boardState);
    movePositionValue(piece, this.origin, this.target, boardState);
  }

  private onReverse(boardStateValue: BoardStateValue) {
    super.beforePerformReverse();
    if (this.id) {
      tellPieceItMoved(this.id, boardStateValue, !this.firstMove);
    }
  }

  public reverse(boardStateValue: BoardStateValue): void {
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
    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();

    this.notation = this.captures
      ? `${getPieceNotation(this.pieceId)}x${getPositionNotation(
          this.captures
        )}`
      : `${getPieceNotation(this.pieceId)}${getPositionNotation(this.target)}`;
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
