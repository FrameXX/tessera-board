import type { BoardPosition } from "../../components/Board.vue";
import type { BoardStateValue } from "../user_data/board_state";
import Piece from "./piece";
import { type PlayerColor, type Turn } from "./piece_utils";

export class King extends Piece {
  public static notationSign: string = "K";
  constructor(color: PlayerColor) {
    super(color, "king");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Turn[] {
    return [];
  }
}

export default King;
