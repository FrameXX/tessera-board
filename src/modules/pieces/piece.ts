import type { BoardPosition } from "../../components/Board.vue";
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

type MoveAction = "move" | "switch" | "revive";

export interface Move {
  captures: BoardPositionValue[];
  action: MoveAction;
  notation: string;
  origin: BoardPosition;
  target: BoardPosition;
}

export interface Turn {
  move: Move;
  clickablePositions: BoardPosition[];
  author: Piece;
}

export abstract class Piece {
  public readonly id: string;

  constructor(
    public readonly color: PlayerColor,
    public readonly pieceId: PieceId
  ) {
    this.id = getRandomId();
  }

  // Every piece can override this function which is called after move that has same origin is interpreted
  // @ts-ignore
  public onMove(move: Move) {}

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
  ): Turn[];
}

export function getTarget(
  position: BoardPosition,
  xDelta: number,
  yDelta: number
): BoardPosition {
  return sumPositions(position, { row: yDelta, col: xDelta });
}

export function isTargetOnBoard(target: BoardPosition) {
  return (
    target.row >= 0 && target.row <= 7 && target.col >= 0 && target.col <= 7
  );
}

export default Piece;
