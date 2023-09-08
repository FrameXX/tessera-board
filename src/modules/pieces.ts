import { UserDataError } from "./user_data/user_data";
import { getRandomId } from "./utils/misc";

export type PlayerColor = "white" | "black";
export type PieceId = "rook" | "knight" | "bishop" | "queen" | "king" | "pawn";

export abstract class Piece {
  public readonly id: string;

  constructor(
    public readonly color: PlayerColor,
    public readonly pieceId: PieceId
  ) {
    this.id = getRandomId();
  }

  public get genericObject() {
    return { pieceId: this.pieceId, color: this.color };
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

export function getPieceById(id: PieceId, color: PlayerColor): Piece {
  let piece: Piece | null;
  switch (id) {
    case "bishop":
      piece = new Bishop(color);
      break;
    case "king":
      piece = new King(color);
      break;
    case "knight":
      piece = new Knight(color);
      break;
    case "pawn":
      piece = new Pawn(color);
      break;
    case "queen":
      piece = new Queen(color);
      break;
    case "rook":
      piece = new Rook(color);
      break;
    default:
      throw new UserDataError(`Provided pieceId "${id}" is invalid.`);
  }
  return piece;
}

export default Piece;
