import { BoardStateValue } from "../board_manager";
import Bishop from "../pieces/bishop";
import King from "../pieces/king";
import Knight from "../pieces/knight";
import Pawn from "../pieces/pawn";
import Queen from "../pieces/queen";
import Rook from "../pieces/rook";

interface DefaultUserDataValues {
  defaultBoardState: BoardStateValue;
  gameBoardState: BoardStateValue;
  cellIndexOpacity: number;
  playerHue: number;
  opponentHue: number;
  pieceBorder: number;
  piecePadding: number;
}

const defaultUserDataValues: DefaultUserDataValues = {
  defaultBoardState: [
    [
      new Rook("white"),
      new Knight("white"),
      new Bishop("white"),
      new Queen("white"),
      new King("white"),
      new Bishop("white"),
      new Knight("white"),
      new Rook("white"),
    ],
    [
      new Pawn("white"),
      new Pawn("white"),
      new Pawn("white"),
      new Pawn("white"),
      new Pawn("white"),
      new Pawn("white"),
      new Pawn("white"),
      new Pawn("white"),
    ],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [
      new Pawn("black"),
      new Pawn("black"),
      new Pawn("black"),
      new Pawn("black"),
      new Pawn("black"),
      new Pawn("black"),
      new Pawn("black"),
      new Pawn("black"),
    ],
    [
      new Rook("black"),
      new Knight("black"),
      new Bishop("black"),
      new Queen("black"),
      new King("black"),
      new Bishop("black"),
      new Knight("black"),
      new Rook("black"),
    ],
  ],
  gameBoardState: Array(8).fill(Array(8).fill(null)),
  cellIndexOpacity: 90,
  playerHue: 30,
  opponentHue: 198,
  pieceBorder: 1.1,
};

export default defaultUserDataValues;
