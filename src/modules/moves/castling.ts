import type {
  BoardPosition,
  BoardStateValue,
  MarkBoardState,
} from "../board_manager";
import { isBoardPosition } from "../board_manager";
import type Game from "../game";
import type Piece from "../pieces/piece";
import { getBoardPositionPiece } from "../utils/game";
import Move, {
  getCleanBoardPosition,
  handleInvalidRawMove,
  movePiece,
  movePositionValue,
  pieceHasMovedProperty,
  setPieceMoveProperty,
} from "./move";
import type { RawMove } from "./raw_move";

export function isMoveCastling(move: Move): move is Castling {
  return move.moveId == "castling";
}

export interface RawCastling extends RawMove {
  firstMove: boolean;
  firstCastling: boolean;
  king: boolean;
  kingSide: boolean;
  kingOrigin: BoardPosition;
  kingTarget: BoardPosition;
  rookOrigin: BoardPosition;
  rookTarget: BoardPosition;
}

export function isRawCastling(rawMove: RawMove): rawMove is RawCastling {
  if (typeof rawMove.firstMove !== "boolean") return false;
  if (typeof rawMove.firstCastling !== "boolean") return false;
  if (typeof rawMove.king !== "boolean") return false;
  if (typeof rawMove.kingSide !== "boolean") return false;
  if (typeof rawMove.kingOrigin !== "object") return false;
  if (typeof rawMove.kingTarget !== "object") return false;
  if (typeof rawMove.rookOrigin !== "object") return false;
  if (typeof rawMove.rookOrigin !== "object") return false;
  if (!isBoardPosition(rawMove.kingOrigin)) return false;
  if (!isBoardPosition(rawMove.kingTarget)) return false;
  if (!isBoardPosition(rawMove.rookOrigin)) return false;
  if (!isBoardPosition(rawMove.rookOrigin)) return false;
  return true;
}

class Castling extends Move {
  private firstMove = false;
  private firstCastling = false;

  constructor(
    private readonly king: boolean,
    private readonly kingSide: boolean,
    private readonly kingOrigin: BoardPosition,
    private readonly kingTarget: BoardPosition,
    private readonly rookOrigin: BoardPosition,
    private readonly rookTarget: BoardPosition,
    private readonly id?: string
  ) {
    super("castling");
  }

  public getRaw(): RawCastling {
    return {
      firstMove: this.firstMove,
      firstCastling: this.firstCastling,
      performed: this.performed,
      moveId: this.moveId,
      king: this.king,
      kingSide: this.kingSide,
      kingOrigin: getCleanBoardPosition(this.kingOrigin),
      kingTarget: getCleanBoardPosition(this.kingTarget),
      rookOrigin: getCleanBoardPosition(this.rookOrigin),
      rookTarget: getCleanBoardPosition(this.rookTarget),
      id: this.id,
    };
  }

  public static restore(rawMove: RawMove): Castling {
    if (!isRawCastling(rawMove)) {
      handleInvalidRawMove(rawMove);
    }

    let id: string | undefined = undefined;
    if (rawMove.id) id = rawMove.id;

    return new Castling(
      rawMove.king,
      rawMove.kingSide,
      rawMove.kingOrigin,
      rawMove.kingTarget,
      rawMove.rookOrigin,
      rawMove.rookTarget,
      id
    );
  }

  public loadCustomProps(rawMove: RawCastling): void {
    super.loadCustomProps(rawMove);
    this.firstMove = rawMove.firstMove;
    this.firstCastling = rawMove.firstCastling;
  }

  get highlightedBoardPositions() {
    return [this.kingOrigin, this.kingTarget, this.rookOrigin, this.rookTarget];
  }

  private forwardMovedProperty(piece: Piece) {
    if (!pieceHasMovedProperty(piece)) return;
    this.firstMove = !piece.moved;
    setPieceMoveProperty(piece, true);
  }

  protected async redo(game: Game): Promise<void> {
    const king = getBoardPositionPiece(this.kingOrigin, game.boardState);
    this.forwardMovedProperty(king);
    const rook = getBoardPositionPiece(this.rookOrigin, game.boardState);
    this.forwardMovedProperty(rook);

    movePositionValue(king, this.kingOrigin, this.kingTarget, game.boardState);
    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();
    movePositionValue(rook, this.rookOrigin, this.rookTarget, game.boardState);
    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();
  }

  protected _forward(boardState: BoardStateValue): void {
    const king = getBoardPositionPiece(this.kingOrigin, boardState);
    this.forwardMovedProperty(king);
    const rook = getBoardPositionPiece(this.rookOrigin, boardState);
    this.forwardMovedProperty(rook);

    movePositionValue(king, this.kingOrigin, this.kingTarget, boardState);
    movePositionValue(rook, this.rookOrigin, this.rookTarget, boardState);
  }

  private reverseMovedProperty(piece: Piece) {
    if (!pieceHasMovedProperty(piece)) return;
    setPieceMoveProperty(piece, !this.firstMove);
  }

  protected async undo(game: Game): Promise<void> {
    const king = getBoardPositionPiece(this.kingTarget, game.boardState);
    const rook = getBoardPositionPiece(this.rookTarget, game.boardState);

    movePositionValue(king, this.kingTarget, this.kingOrigin, game.boardState);
    this.reverseMovedProperty(king);
    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();
    movePositionValue(rook, this.rookTarget, this.rookOrigin, game.boardState);
    this.reverseMovedProperty(rook);
    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();
  }

  protected _reverse(boardState: BoardStateValue): void {
    const king = getBoardPositionPiece(this.kingTarget, boardState);
    this.reverseMovedProperty(king);
    const rook = getBoardPositionPiece(this.rookTarget, boardState);
    this.reverseMovedProperty(rook);

    movePositionValue(king, this.kingTarget, this.kingOrigin, boardState);
    movePositionValue(rook, this.rookTarget, this.rookOrigin, boardState);
  }

  protected async _perform(game: Game) {
    const king = getBoardPositionPiece(this.kingOrigin, game.boardState);
    const rook = getBoardPositionPiece(this.rookOrigin, game.boardState);

    movePiece(king, this.kingOrigin, this.kingTarget, game.boardState);
    this.forwardMovedProperty(king);
    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();
    await movePiece(rook, this.rookOrigin, this.rookTarget, game.boardState);
    this.forwardMovedProperty(rook);
    if (game.settings.audioEffectsEnabled.value)
      game.audioEffects.pieceMove.play();

    return true;
  }

  public getNotation(): string {
    return this.kingSide ? "0-0" : "0-0-0";
  }

  public get clickablePositions(): BoardPosition[] {
    if (this.king) {
      return [this.kingTarget, this.rookOrigin];
    } else {
      return [this.kingOrigin];
    }
  }

  public showCellMarks(cellMarks: MarkBoardState): void {
    if (this.king) {
      cellMarks[this.kingTarget.row][this.kingTarget.col] = "availible";
      cellMarks[this.rookOrigin.row][this.rookOrigin.col] = "capture";
    } else {
      cellMarks[this.kingOrigin.row][this.kingOrigin.col] = "capture";
    }
  }
}

export default Castling;
