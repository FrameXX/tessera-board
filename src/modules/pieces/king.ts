import type { BoardPosition } from "../../components/Board.vue";
import type { BoardStateValue } from "../user_data/board_state";
import Piece from "./piece";
import { type PlayerColor, type move } from "./piece";

export class King extends Piece {
  constructor(color: PlayerColor) {
    super(color, "king");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Move[] {
    return [];
  }
}

export default King;
