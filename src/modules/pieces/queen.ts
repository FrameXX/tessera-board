import type { BoardPosition } from "../../components/Board.vue";
import type { BoardStateValue } from "../user_data/board_state";
import { Bishop } from "./bishop";
import Piece from "./piece";
import { type PlayerColor, type Turn } from "./piece_utils";
import Rook from "./rook";

export class Queen extends Piece {
  public static notationSign: string = "Q";
  constructor(color: PlayerColor) {
    super(color, "queen");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Turn[] {
    const rook = new Rook(this.color);
    const bishop = new Bishop(this.color);
    const rookMoves = rook.getPossibleMoves(position, boardStateValue);
    const bishopMoves = bishop.getPossibleMoves(position, boardStateValue);
    // NOTE: Possible moves of qeen are same as possible moves of rook and bishop in same state joined together. There's no overlap between rook and bishop moves which is great.
    const turns: Turn[] = [...rookMoves, ...bishopMoves];
    return turns;
  }
}

export default Queen;
