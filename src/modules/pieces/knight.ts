import { BoardPosition } from "../../components/Board.vue";
import { CHAR_INDEXES } from "../board_manager";
import { BoardStateValue } from "../user_data/board_state";
import Piece from "./piece";
import {
  BoardPositionValue,
  PlayerColor,
  Turn,
  getTarget,
  isTargetOnBoard,
} from "./piece";

export class Knight extends Piece {
  public static notationSign: string = "N";

  constructor(color: PlayerColor) {
    super(color, "knight");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Turn[] {
    const turns: Turn[] = [];

    for (const xDelta of [-2, -1, 1, 2]) {
      for (const yDelta of [-2, -1, 1, 2]) {
        if (Math.abs(xDelta) === Math.abs(yDelta)) {
          continue;
        }
        const target = getTarget(position, xDelta, yDelta);
        if (!isTargetOnBoard(target)) {
          continue;
        }
        let captures: BoardPositionValue[] = [];
        const piece = boardStateValue[target.row][target.col];
        if (piece) {
          if (piece.color !== this.color) {
            captures.push({ ...target, value: piece });
          } else {
            continue;
          }
        }

        turns.push({
          move: {
            captures: captures,
            action: "move",
            notation: `${Knight.notationSign}${CHAR_INDEXES[target.col - 1]}${
              target.row
            }`,
            origin: position,
            target: target,
          },
          clickablePositions: [target],
          author: this,
        });
      }
    }

    return turns;
  }
}

export default Knight;
