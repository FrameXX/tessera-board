import type { BoardStateValue } from "../board_manager";
import type {
  SecondsPerMovePenalty,
  PlayerColor,
  GameOverReason,
  Winner,
} from "../game";
import type Move from "../moves/move";
import Bishop from "../pieces/bishop";
import King from "../pieces/king";
import Knight from "../pieces/knight";
import Pawn from "../pieces/pawn";
import type { PieceId } from "../pieces/piece";
import Queen from "../pieces/queen";
import Rook from "../pieces/rook";
import type { Theme } from "../theme_manager";
import type { Transitions } from "../transitions_manager";
import type { GamePausedState } from "./game_paused";
import type { PieceIconPack } from "./piece_set";
import type { PreferredPlayerColor } from "./preferred_player_color";

const defaultUserDataValues = {
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
  ] as BoardStateValue,
  gameBoardState: [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ] as BoardStateValue,
  cellIndexOpacity: 90,
  playerHue: 30,
  opponentHue: 198,
  pieceBorder: 1.1,
  piecePadding: 10,
  pieceIconPack: "font_awesome" as PieceIconPack,
  preferredPlayerColor: "random" as PreferredPlayerColor,
  requireMoveConfirm: false,
  tableMode: false,
  secondCheckboardEnabled: false,
  theme: "auto" as Theme,
  transitionDuration: 100,
  transitions: "auto" as Transitions,
  playerColor: "white" as PlayerColor,
  whiteCapturedPieces: [] as PieceId[],
  blackCapturedPieces: [] as PieceId[],
  gamePaused: "not" as GamePausedState,
  audioEffectsEnabled: true,
  firstMoveColor: "white" as PlayerColor,
  preferredFirstMoveColor: "white" as PreferredPlayerColor,
  showCapturingPieces: false,
  reviveFromCapturedPieces: false,
  playerSecondsPerMove: 0,
  opponentSecondsPerMove: 0,
  playerSecondsPerMatch: 0,
  opponentSecondsPerMatch: 0,
  showOtherAvailibleMoves: false,
  secondsPerMovePenalty: "random_move" as SecondsPerMovePenalty,
  gameOverReason: "none" as GameOverReason,
  vibrationsEnabled: true,
  pieceLongPressTimeout: 0,
  autoPauseGame: true,
  pawnImportance: 1,
  knightImportance: 3,
  bishopImportance: 3.25,
  rookImportance: 5,
  queenImportance: 9,
  kingImportance: 25,
  ignorePiecesGuardedProperty: false,
  moveList: [] as Move[],
  moveIndex: 0,
  winner: "none" as Winner,
};

export default defaultUserDataValues;
