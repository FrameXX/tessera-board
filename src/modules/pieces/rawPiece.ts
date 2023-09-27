import { UserDataError } from "../user_data/user_data";
import Bishop from "./bishop";
import King from "./king";
import Knight from "./knight";
import Pawn from "./pawn";
import Piece, {
  type PieceId,
  type PlayerColor,
  isPieceId,
  isPlayerColor,
} from "./piece";
import Queen from "./queen";
import Rook from "./rook";

export interface RawPiece {
  // Raw Piece can possibly have extra custom properties
  [extra: string]: any;
  pieceId: PieceId;
  color: PlayerColor;
}

export function isRawPiece(object: any): object is RawPiece {
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

export function getRawPiece(piece: Piece): RawPiece {
  return { color: piece.color, pieceId: piece.pieceId };
}

export function getPieceFromRaw(genericPiece: RawPiece): Piece {
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
