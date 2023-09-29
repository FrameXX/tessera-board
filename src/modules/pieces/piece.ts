import type { BoardPosition } from "../../components/Board.vue";
import type Move from "../moves/move";
import type { BoardStateValue } from "../user_data/board_state";
import { getRandomId, sumPositions } from "../utils/misc";
import { RawPiece, getRawPiece } from "./rawPiece";

export type PlayerColor = "white" | "black";
export function isPlayerColor(string: string): string is PlayerColor {
  return string === "white" || string === "black";
}

export type PieceId = "rook" | "knight" | "bishop" | "queen" | "king" | "pawn";
export function isPieceId(string: string): string is PieceId {
  return (
    string === "rook" ||
    string === "knight" ||
    string === "bishop" ||
    string === "queen" ||
    string === "king" ||
    string === "pawn"
  );
}

export interface BoardPositionValue extends BoardPosition {
  value: Piece | null;
}

export interface BoardPositionPath {
  origin: BoardPosition;
  target: BoardPosition;
}

export abstract class Piece {
  public readonly id: string;

  constructor(
    public readonly color: PlayerColor,
    public readonly pieceId: PieceId
  ) {
    this.id = getRandomId();
  }

  // Every piece can override this method and possibly load some custom properties from the restored raw piece object.
  // @ts-ignore
  public loadCustomProps(rawPiece: RawPiece) {}

  // Every piece can override this method and return object with extra custom props.
  public dumpObject(): object {
    return getRawPiece(this);
  }

  public abstract getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[];

  public abstract getCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[];
}

export function getTarget(
  position: BoardPosition,
  colDelta: number,
  rowDelta: number
): BoardPosition {
  return sumPositions(position, { row: rowDelta, col: colDelta });
}

export function isTargetOnBoard(target: BoardPosition) {
  return (
    target.row >= 0 && target.row <= 7 && target.col >= 0 && target.col <= 7
  );
}

export const PIECE_IDS: PieceId[] = [
  "rook",
  "knight",
  "bishop",
  "queen",
  "king",
  "pawn",
];

export default Piece;
