import type { BoardPosition } from "../../components/Board.vue";
import { positionsEqual } from "../game_board_manager";
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

export interface Path {
  origin: BoardPosition;
  target: BoardPosition;
}

export abstract class Piece {
  protected capturingPositionsCache?: BoardPosition[];
  protected possibleMovesCache?: Move[];
  public readonly id: string;

  constructor(
    public readonly color: PlayerColor,
    public readonly pieceId: PieceId,
    id?: string
  ) {
    id ? (this.id = id) : (this.id = getRandomId());
  }

  // Every piece can override this method and possibly load some custom properties from the restored raw piece object.
  // @ts-ignore
  public loadCustomProps(rawPiece: RawPiece) {}

  // Every piece can override this method and return object with extra custom props.
  public dumpObject(): object {
    return getRawPiece(this);
  }

  public invalidateCache() {
    this.capturingPositionsCache = undefined;
    this.possibleMovesCache = undefined;
  }

  public getCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[] {
    if (!this.capturingPositionsCache)
      this.capturingPositionsCache = this.getNewCapturingPositions(
        position,
        boardStateValue
      );
    return this.capturingPositionsCache;
  }

  public abstract getNewCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[];

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue,
    opponentCapturingPaths: Path[]
  ): Move[] {
    if (!this.possibleMovesCache)
      this.possibleMovesCache = this.getNewPossibleMoves(
        position,
        boardStateValue,
        opponentCapturingPaths
      );
    return this.possibleMovesCache;
  }

  public abstract getNewPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue,
    opponentCapturingPaths: Path[]
  ): Move[];
}

export function getDeltaPosition(
  position: BoardPosition,
  colDelta: number,
  rowDelta: number
): BoardPosition {
  return sumPositions(position, { row: rowDelta, col: colDelta });
}

export function getBoardPositionPiece(
  position: BoardPosition,
  boardStateValue: BoardStateValue
) {
  return boardStateValue[position.row][position.col];
}

export function isFriendlyPiece(
  piece: Piece | null,
  friendlyColor: PlayerColor
) {
  if (!piece) {
    return false;
  }
  return piece.color === friendlyColor;
}

export function isTargetOnBoard(target: BoardPosition) {
  return (
    target.row >= 0 && target.row <= 7 && target.col >= 0 && target.col <= 7
  );
}

export function getTargetMatchingPaths(
  target: BoardPosition,
  capturingPaths: Path[]
) {
  return capturingPaths.filter((path) => positionsEqual(path.target, target));
}

export function positionWillBeCaptured(
  target: BoardPosition,
  capturingPaths: Path[]
): boolean {
  const matchingPositions = getTargetMatchingPaths(target, capturingPaths);
  return matchingPositions.length !== 0;
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
