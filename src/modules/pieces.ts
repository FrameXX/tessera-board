import { UserDataError } from "./user_data/user_data";
import { getRandomId } from "./utils/misc";

export type PlayerColor = "white" | "black";
export function isPlayerColor(string: string): string is PlayerColor {
  return string === "white" || string === "black";
}
export type PieceId = "rook" | "knight" | "bishop" | "queen" | "king" | "pawn";
function isPieceId(string: string): string is PieceId {
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

export abstract class Piece {
  public readonly id: string;
  public moved?: boolean;

  constructor(
    public readonly color: PlayerColor,
    public readonly pieceId: PieceId
  ) {
    this.id = getRandomId();
  }

  public abstract getPossibleMoves(): unknown;
}

export class Rook extends Piece {
  constructor(color: PlayerColor) {
    super(color, "rook");
  }

  public getPossibleMoves(): unknown {
    return;
  }
}

export class Knight extends Piece {
  constructor(color: PlayerColor) {
    super(color, "knight");
  }

  public getPossibleMoves(): unknown {
    return;
  }
}

export class Bishop extends Piece {
  constructor(color: PlayerColor) {
    super(color, "bishop");
  }

  public getPossibleMoves(): unknown {
    return;
  }
}

export class Queen extends Piece {
  constructor(color: PlayerColor) {
    super(color, "queen");
  }

  public getPossibleMoves(): unknown {
    return;
  }
}

export class King extends Piece {
  constructor(color: PlayerColor) {
    super(color, "king");
  }

  public getPossibleMoves(): unknown {
    return;
  }
}

export class Pawn extends Piece {
  constructor(color: PlayerColor) {
    super(color, "pawn");
  }

  public getPossibleMoves(): unknown {
    return;
  }
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
