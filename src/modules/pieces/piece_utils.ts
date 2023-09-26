import { BoardPosition } from "../../components/Board.vue";
import { UserDataError } from "../user_data/user_data";
import { sumPositions } from "../utils/misc";
import Bishop from "./bishop";
import King from "./king";
import Knight from "./knight";
import Pawn from "./pawn";
import Piece from "./piece";
import Queen from "./queen";
import { Rook } from "./rook";

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

export interface BoardPositionValue extends BoardPosition {
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
