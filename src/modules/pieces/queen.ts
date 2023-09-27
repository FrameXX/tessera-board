import type { BoardPosition } from "../../components/Board.vue";
import type Move from "../moves/move";
import type { BoardStateValue } from "../user_data/board_state";
import { Bishop } from "./bishop";
import Piece from "./piece";
import { type PlayerColor } from "./piece";
import Rook from "./rook";

export class Queen extends Piece {
  constructor(color: PlayerColor) {
    super(color, "queen");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[] {
    const rook = new Rook(this.color);
    const bishop = new Bishop(this.color);
    const rookmoves = rook.getPossibleMoves(position, boardStateValue);
    const bishopmoves = bishop.getPossibleMoves(position, boardStateValue);
    // NOTE: Possible moves of qeen are same as possible moves of rook and bishop in same state joined together. There's no overlap between rook and bishop moves which is great.
    const moves: Move[] = [...rookmoves, ...bishopmoves];
    return moves;
  }
}

export default Queen;
