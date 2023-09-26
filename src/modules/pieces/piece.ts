import type { BoardPosition } from "../../components/Board.vue";
import type { BoardStateValue } from "../user_data/board_state";
import { getRandomId } from "../utils/misc";
import type { PieceId, PlayerColor, Turn } from "./piece_utils";

export abstract class Piece {
  public readonly id: string;
  public moved?: boolean;

  constructor(
    public readonly color: PlayerColor,
    public readonly pieceId: PieceId
  ) {
    this.id = getRandomId();
  }

  public abstract getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Turn[];
}

export default Piece;
