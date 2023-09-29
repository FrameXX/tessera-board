import type { BoardPosition } from "../../components/Board.vue";
import type Move from "../moves/move";
import Shift from "../moves/shift";
import type { BoardStateValue } from "../user_data/board_state";
import { Bishop } from "./bishop";
import Piece, { type BoardPositionValue } from "./piece";
import { type PlayerColor } from "./piece";
import Rook from "./rook";

export class Queen extends Piece {
  constructor(color: PlayerColor) {
    super(color, "queen");
  }

  public getCapturingPositions(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): BoardPosition[] {
    // NOTE: Capturing positions of qeen are same as capturing positions of rook and bishop in same state joined together. There's no overlap between rook and bishop capturing positions which is also great.
    const rook = new Rook(this.color);
    const bishop = new Bishop(this.color);
    const capturingPositions: BoardPosition[] = [
      ...rook.getCapturingPositions(position, boardStateValue),
      ...bishop.getCapturingPositions(position, boardStateValue),
    ];
    return capturingPositions;
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[] {
    const moves: Move[] = [];
    const capturingPositions = this.getCapturingPositions(
      position,
      boardStateValue
    );

    for (const target of capturingPositions) {
      let captures: BoardPositionValue | undefined = undefined;
      const piece = boardStateValue[target.row][target.col];
      if (piece) captures = { ...target, value: piece };
      moves.push(new Shift(this.pieceId, position, target, captures));
    }

    return moves;
  }
}

export default Queen;
