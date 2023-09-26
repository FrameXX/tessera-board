import type { BoardPosition } from "../../components/Board.vue";
import { CHAR_INDEXES } from "../board_manager";
import type { BoardStateValue } from "../user_data/board_state";
import Piece from "./piece";
import { type PlayerColor, type Turn, getTarget } from "./piece_utils";

export class Pawn extends Piece {
  public static notationSign: string = "";

  constructor(color: PlayerColor) {
    super(color, "pawn");
  }

  public getPossibleMoves(
    position: BoardPosition,
    boardStateData: BoardStateValue
  ): Turn[] {
    const turns: Turn[] = [];
    let target: BoardPosition;

    let yDelta: number = 0;
    let xDelta: number = 0;
    let piece: Piece | null;

    let frontIsOccupied = true;

    // Move one cell forward
    this.color === "white" ? (yDelta = 1) : (yDelta = -1);
    target = getTarget(position, xDelta, yDelta);
    if (boardStateData[target.row][target.col] === null) {
      frontIsOccupied = false;
      turns.push({
        move: {
          captures: [],
          action: "move",
          notation: `${Pawn.notationSign}${CHAR_INDEXES[target.col - 1]}${
            target.row
          }`,
          origin: position,
          target: target,
        },
        clickablePositions: [target],
      });
    }

    // Capture
    for (const xDelta of [1, -1]) {
      target = getTarget(position, xDelta, yDelta);
      piece = boardStateData[target.row][target.col];
      if (piece) {
        if (piece.color !== this.color) {
          turns.push({
            move: {
              captures: [{ ...target, value: piece }],
              action: "move",
              notation: `${Pawn.notationSign}${CHAR_INDEXES[target.col - 1]}${
                target.row
              }`,
              origin: position,
              target: target,
            },
            clickablePositions: [target],
          });
        }
      }
    }

    // Move 2 cells forward
    if (!this.moved && !frontIsOccupied) {
      this.color === "white" ? (yDelta = 2) : (yDelta = -2);
      target = getTarget(position, xDelta, yDelta);
      if (boardStateData[target.row][target.col] === null) {
        turns.push({
          move: {
            captures: [],
            action: "move",
            notation: `${Pawn.notationSign}${CHAR_INDEXES[target.col - 1]}${
              target.row
            }`,
            origin: position,
            target: target,
          },
          clickablePositions: [target],
        });
      }
    }

    return turns;
  }
}

export default Pawn;
