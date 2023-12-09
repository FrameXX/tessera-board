import type {
  BoardPosition,
  BoardStateValue,
  MarkBoardState,
} from "../board_manager";
import { isBoardPosition } from "../board_manager";
import { getPositionPiece } from "../utils/game";
import type { MovePerformContext } from "./move";
import Move, {
  getCleanBoardPosition,
  handleInvalidRawMove,
  movePiece,
  movePositionValue,
  tellPieceItCastled,
  tellPieceItMoved,
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

  private onForward(boardStateValue: BoardStateValue) {
    super.onPerformForward();
    if (this.id) {
      this.firstMove = !tellPieceItMoved(this.id, boardStateValue);
      this.firstCastling = !tellPieceItCastled(this.id, boardStateValue);
    }
  }

  public forward(context: MovePerformContext): void {
    this.onForward(context.boardStateValue);

    const king = getPositionPiece(this.kingOrigin, context.boardStateValue);
    const rook = getPositionPiece(this.rookOrigin, context.boardStateValue);

    movePositionValue(
      king,
      this.kingOrigin,
      this.kingTarget,
      context.boardStateValue
    );
    movePositionValue(
      rook,
      this.rookOrigin,
      this.rookTarget,
      context.boardStateValue
    );
  }

  private onReverse(boardStateValue: BoardStateValue) {
    super.beforePerformReverse();
    if (this.id) {
      tellPieceItMoved(this.id, boardStateValue, !this.firstMove);
      tellPieceItCastled(this.id, boardStateValue, !this.firstCastling);
    }
  }

  public reverse(boardStateValue: BoardStateValue): void {
    this.onReverse(boardStateValue);

    const king = getPositionPiece(this.kingTarget, boardStateValue);
    const rook = getPositionPiece(this.rookTarget, boardStateValue);

    movePositionValue(king, this.kingOrigin, this.kingTarget, boardStateValue);
    movePositionValue(rook, this.rookOrigin, this.rookTarget, boardStateValue);
  }

  public async perform(context: MovePerformContext): Promise<void> {
    this.onForward(context.boardStateValue);

    movePiece(this.kingOrigin, this.kingTarget, context.boardStateValue);
    await movePiece(this.rookOrigin, this.rookTarget, context.boardStateValue);
    if (context.audioEffectsEnabled.value) context.moveAudioEffect.play();

    this.notation = this.kingSide ? "0-0" : "0-0-0";
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
