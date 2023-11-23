import { type PlayerColor, isPlayerColor } from "../game";
import { UserDataError } from "../user_data/user_data";
import Bishop from "./bishop";
import King from "./king";
import Knight from "./knight";
import Pawn from "./pawn";
import type Piece from "./piece";
import { type PieceId, isPieceId } from "./piece";
import Queen from "./queen";
import Rook from "./rook";

export interface RawPiece {
  // Raw Piece can possibly have extra custom properties
  [extra: string]: any;
  pieceId: PieceId;
  color: PlayerColor;
  id?: string;
}

export function isRawPiece(object: any): object is RawPiece {
  if (typeof object.pieceId !== "string") return false;
  if (typeof object.color !== "string") return false;
  if (!isPieceId(object.pieceId)) return false;
  if (!isPlayerColor(object.color)) return false;
  return true;
}

export function getRawPiece(piece: Piece): RawPiece {
  return { color: piece.color, pieceId: piece.pieceId, id: piece.id };
}

export function getPieceFromRaw(rawPiece: RawPiece): Piece {
  let piece: Piece | null;
  switch (rawPiece.pieceId) {
    case "bishop":
      piece = new Bishop(rawPiece.color, rawPiece.id);
      break;
    case "king":
      piece = new King(rawPiece.color, rawPiece.id);
      break;
    case "knight":
      piece = new Knight(rawPiece.color, rawPiece.id);
      break;
    case "pawn":
      piece = new Pawn(rawPiece.color, rawPiece.id);
      break;
    case "queen":
      piece = new Queen(rawPiece.color, rawPiece.id);
      break;
    case "rook":
      piece = new Rook(rawPiece.color, rawPiece.id);
      break;
    default:
      throw new UserDataError(
        `Provided pieceId "${rawPiece.pieceId}" is invalid.`
      );
  }
  return piece;
}
