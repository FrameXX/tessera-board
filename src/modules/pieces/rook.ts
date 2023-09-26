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

export class Rook extends Piece {
  public static notationSign: string = "R";

  constructor(color: PlayerColor) {
    super(color, "rook");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateValue: BoardStateValue
  ): Turn[] {
    const turns: Turn[] = [];
    let piece: Piece | null;

    // Check row
    for (const axis of ["x", "y"]) {
      for (const delta of [-1, 1]) {
        let totalDelta = 0;
        while (true) {
          totalDelta += delta;
          let target: BoardPosition;
          axis === "x"
            ? (target = getTarget(position, totalDelta, 0))
            : (target = getTarget(position, 0, totalDelta));
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
            author: this,
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

export default Rook;
