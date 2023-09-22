import type { BoardPosition } from "../components/Board.vue";
import { CHAR_INDEXES } from "./board_manager";
import type { BoardStateValue } from "./user_data/board_state";
import { UserDataError } from "./user_data/user_data";
import { getRandomId, sumPositions } from "./utils/misc";

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

export interface GenericPiece {
  pieceId: PieceId;
  color: PlayerColor;
}
export function isGenericPiece(object: any): object is GenericPiece {
  if (typeof object.pieceId !== "string") {
    return false;
  }
  if (typeof object.color !== "string") {
    return false;
  }
  if (!isPieceId(object.pieceId)) {
    return false;
  }
  if (!isPlayerColor(object.color)) {
    return false;
  }
  return true;
}

export interface GamePiece extends GenericPiece {
  moved: boolean;
}
export function isGamePiece(object: any): object is GamePiece {
  if (!isGenericPiece(object)) {
    return false;
  }
  // @ts-ignore
  if (typeof object.moved !== "boolean") {
    return false;
  }
  return true;
}

interface BoardPositionValue extends BoardPosition {
  value: Piece | null;
}

type MoveAction = "move" | "switch" | "transform";

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
}

export abstract class Piece {
  public readonly id: string;
  public moved?: boolean;

  constructor(
    public readonly color: PlayerColor,
    public readonly pieceId: PieceId
  ) {
    this.id = getRandomId();
  }

  public abstract getPossibleMoves(
    position: BoardPosition,
    gameBoardState: BoardStateValue
  ): Turn[];
}

export class Rook extends Piece {
  public static notationSign: string = "R";

  constructor(color: PlayerColor) {
    super(color, "rook");
  }

  public getPossibleMoves(
    position: BoardPosition,
    gameBoardState: BoardStateValue
  ): Turn[] {
    return [];
  }
}

export class Knight extends Piece {
  public static notationSign: string = "N";

  constructor(color: PlayerColor) {
    super(color, "knight");
  }

  public getPossibleMoves(
    position: BoardPosition,
    gameBoardState: BoardStateValue
  ): Turn[] {
    return [];
  }
}

export class Bishop extends Piece {
  public static notationSign: string = "B";
  constructor(color: PlayerColor) {
    super(color, "bishop");
  }

  public getPossibleMoves(
    position: BoardPosition,
    gameBoardState: BoardStateValue
  ): Turn[] {
    return [];
  }
}

export class Queen extends Piece {
  public static notationSign: string = "Q";
  constructor(color: PlayerColor) {
    super(color, "queen");
  }

  public getPossibleMoves(
    position: BoardPosition,
    gameBoardState: BoardStateValue
  ): Turn[] {
    return [];
  }
}

export class King extends Piece {
  public static notationSign: string = "K";
  constructor(color: PlayerColor) {
    super(color, "king");
  }

  public getPossibleMoves(
    position: BoardPosition,
    gameBoardState: BoardStateValue
  ): Turn[] {
    return [];
  }
}

export class Pawn extends Piece {
  public static notationSign: string = "";
  constructor(color: PlayerColor) {
    super(color, "pawn");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateData: BoardStateValue
  ): Turn[] {
    const turns: Turn[] = [];
    let target: BoardPosition;

    let yDelta: number = 0;
    let xDelta: number = 0;
    let piece: Piece | null;

    let frontIsOccupied = true;

    // Move one cell forward
    this.color === "white" ? (yDelta = 1) : (yDelta = -1);
    target = getTarget(position, xDelta, yDelta);
    if (boardStateData[target.row][target.col] === null) {
      frontIsOccupied = false;
      turns.push({
        move: {
          captures: [],
          action: "move",
          notation: `${Pawn.notationSign}${CHAR_INDEXES[target.col - 1]}${
            target.row
          }`,
          origin: position,
          target: target,
        },
        clickablePositions: [target],
      });
    }

    // Capture
    for (const xDelta of [1, -1]) {
      target = getTarget(position, xDelta, yDelta);
      piece = boardStateData[target.row][target.col];
      if (piece) {
        turns.push({
          move: {
            captures: [{ ...target, value: piece }],
            action: "move",
            notation: `${Pawn.notationSign}${CHAR_INDEXES[target.col - 1]}${
              target.row
            }`,
            origin: position,
            target: target,
          },
          clickablePositions: [target],
        });
      }
    }

    // Move 2 cells forward
    if (!this.moved && !frontIsOccupied) {
      this.color === "white" ? (yDelta = 2) : (yDelta = -2);
      target = getTarget(position, xDelta, yDelta);
      if (boardStateData[target.row][target.col] === null) {
        turns.push({
          move: {
            captures: [],
            action: "move",
            notation: `${Pawn.notationSign}${CHAR_INDEXES[target.col - 1]}${
              target.row
            }`,
            origin: position,
            target: target,
          },
          clickablePositions: [target],
        });
      }
    }

    return turns;
  }
}

function getTarget(
  position: BoardPosition,
  xDelta: number,
  yDelta: number
): BoardPosition {
  return sumPositions(position, { row: yDelta, col: xDelta });
}

export function getPieceFromGeneric(genericPiece: GenericPiece): Piece {
  let piece: Piece | null;
  switch (genericPiece.pieceId) {
    case "bishop":
      piece = new Bishop(genericPiece.color);
      break;
    case "king":
      piece = new King(genericPiece.color);
      break;
    case "knight":
      piece = new Knight(genericPiece.color);
      break;
    case "pawn":
      piece = new Pawn(genericPiece.color);
      break;
    case "queen":
      piece = new Queen(genericPiece.color);
      break;
    case "rook":
      piece = new Rook(genericPiece.color);
      break;
    default:
      throw new UserDataError(
        `Provided pieceId "${genericPiece.pieceId}" is invalid.`
      );
  }
  return piece;
}

export default Piece;
