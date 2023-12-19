import type {
  PieceContext,
  BoardPosition,
  BoardStateValue,
} from "../board_manager";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import { Bishop } from "./bishop";
import Piece from "./piece";
import Rook from "./rook";
import { isFriendlyPiece, type PlayerColor } from "../utils/game";
import type Game from "../game";

export class Queen extends Piece {
  constructor(color: PlayerColor, id?: string) {
    super(color, "queen", id);
  }

  public getNewCapturingPositions(
    position: BoardPosition,
    boardState: BoardStateValue
  ): BoardPosition[] {
    // NOTE: Capturing positions of qeen are same as capturing positions of rook and bishop in same state joined together. There's no overlap between rook and bishop capturing positions which is also great.
    const rook = new Rook(this.color);
    const bishop = new Bishop(this.color);
    const capturingPositions: BoardPosition[] = [
      ...rook.getCapturingPositions(position, boardState),
      ...bishop.getCapturingPositions(position, boardState),
    ];
    return capturingPositions;
  }

  public getNewPossibleMoves(position: BoardPosition, game: Game): Move[] {
    const moves: Move[] = [];
    const capturingPositions = this.getNewCapturingPositions(
      position,
      game.boardState
    );

    for (const target of capturingPositions) {
      let captures: PieceContext | undefined = undefined;
      const piece = game.boardState[target.row][target.col];
      if (isFriendlyPiece(piece, this.color)) {
        continue;
      }
      if (piece) captures = { ...target, piece: piece };
      moves.push(new Shift(this.pieceId, position, target, captures));
    }

    return moves;
  }

  public loadCustomProps(): void {}
}

export default Queen;
