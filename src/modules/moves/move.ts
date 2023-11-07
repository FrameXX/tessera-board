import type { Ref } from "vue";
import type { BoardPosition, MarkBoardState } from "../../components/Board.vue";
import type Piece from "../pieces/piece";
import type { PieceId } from "../pieces/piece";
import { type RawPiece, getPieceFromRaw } from "../pieces/rawPiece";
import type { BoardStateValue } from "../user_data/board_state";
import {
  getElementInstanceById,
  waitForTransitionEnd,
} from "../utils/elements";
import { GameLogicError } from "../game";

type MoveId = "shift" | "castling" | "promotion";

abstract class Move {
  public notation?: string;
  constructor(public readonly moveId: MoveId) {}

  public abstract get highlightedBoardPositions(): BoardPosition[];

  public abstract forward(...args: any): void;

  public abstract perform(...args: any): Promise<string>;

  public abstract getClickablePositions(): BoardPosition[];

  public abstract showCellMarks(
    cellMarks: MarkBoardState,
    boardStateValue: BoardStateValue
  ): void;
}

export function addCapturedPiece(
  piece: Piece,
  blackCapturedPieces: Ref<PieceId[]>,
  whiteCapturedPieces: Ref<PieceId[]>
) {
  if (piece.color === "white") {
    blackCapturedPieces.value.push(piece.pieceId);
  } else {
    whiteCapturedPieces.value.push(piece.pieceId);
  }
}

export function transformPiece(
  position: BoardPosition,
  piece: RawPiece,
  boardStateValue: BoardStateValue
) {
  boardStateValue[position.row][position.col] = getPieceFromRaw(piece);
}

export function movePositionValue(
  piece: Piece,
  origin: BoardPosition,
  target: BoardPosition,
  boardStateValue: BoardStateValue
) {
  boardStateValue[target.row][target.col] = piece;
  boardStateValue[origin.row][origin.col] = null;
}

export async function movePiece(
  origin: BoardPosition,
  target: BoardPosition,
  boardStateValue: BoardStateValue,
  boardId: string = "player-board"
) {
  const piece = boardStateValue[origin.row][origin.col];
  if (!piece) {
    throw new GameLogicError(
      `Board position is missing a piece to move. Position: ${JSON.stringify(
        origin
      )}`
    );
  }
  movePositionValue(piece, origin, target, boardStateValue);
  // Player board is always visible so it's ok to observe the transition only on player board
  const board = getElementInstanceById(boardId);
  const pieceElement = board.querySelector(`[data-id="piece-${piece.id}"]`);
  if (!(pieceElement instanceof SVGElement)) {
    console.error(`Could not find piece element of piece ${piece.id}`);
    return;
  }
  await waitForTransitionEnd(pieceElement);
}

export function capturePosition(
  position: BoardPosition,
  boardStateValue: BoardStateValue,
  blackCapturedPieces: Ref<PieceId[]>,
  whiteCapturedPieces: Ref<PieceId[]>
) {
  const piece = boardStateValue[position.row][position.col];
  if (!piece) {
    return;
  }
  boardStateValue[position.row][position.col] = null;
  addCapturedPiece(piece, blackCapturedPieces, whiteCapturedPieces);
}

export default Move;
