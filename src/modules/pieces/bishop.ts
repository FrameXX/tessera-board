import { BoardPosition } from "../../components/Board.vue";
import { CHAR_INDEXES } from "../board_manager";
import { BoardStateValue } from "../user_data/board_state";
import Piece from "./piece";
import {
  type BoardPositionValue,
  type PlayerColor,
  type Turn,
  getTarget,
  isTargetOnBoard,
} from "./piece_utils";
import Rook from "./rook";

export class Bishop extends Piece {
  public static notationSign: string = "B";
  constructor(color: PlayerColor) {
    super(color, "bishop");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Turn[] {
    const turns: Turn[] = [];
    let piece: Piece | null;

    // Check row
    for (const xDelta of [-1, 1]) {
      for (const yDelta of [-1, 1]) {
        let totalXDelta = 0;
        let totalYDelta = 0;
        while (true) {
          totalXDelta += xDelta;
          totalYDelta += yDelta;
          const target = getTarget(position, totalXDelta, totalYDelta);
          if (!isTargetOnBoard(target)) {
            break;
          }
          let captures: BoardPositionValue[] = [];
          piece = boardStateValue[target.row][target.col];
          if (piece) {
            if (piece.color === this.color) {
              break;
            }
            captures = [{ ...target, value: piece }];
          }

          turns.push({
            move: {
              captures: captures,
              action: "move",
              notation: `${Rook.notationSign}${CHAR_INDEXES[target.col - 1]}${
                target.row
              }`,
              origin: position,
              target: target,
            },
            clickablePositions: [target],
          });

          if (piece) {
            break;
          }
        }
      }
    }

    return turns;
  }
}

export default Bishop;
