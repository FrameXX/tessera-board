import type { BoardPosition, MarkBoardState } from "../../components/Board.vue";
import type { BoardStateValue } from "../user_data/board_state";

type MoveId = "shift" | "castling" | "transform";

abstract class Move {
  public notation?: string;
  constructor(public readonly moveId: MoveId) {}

  public abstract perform(...args: any): string | Promise<string>;

  public abstract getClickablePositions(): BoardPosition[];

  public abstract showCellMarks(
    cellMarks: MarkBoardState,
    boardStateValue: BoardStateValue
  ): void;
}

export default Move;
