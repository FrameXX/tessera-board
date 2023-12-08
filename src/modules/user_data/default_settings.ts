import { ref } from "vue";
import type { SecondsPerMovePenalty } from "../game";
import Rook from "../pieces/rook";
import Bishop from "../pieces/bishop";
import King from "../pieces/king";
import Knight from "../pieces/knight";
import Pawn from "../pieces/pawn";
import Queen from "../pieces/queen";
import type { Theme } from "../theme_manager";
import type { Transitions } from "../transitions_manager";
import type { PieceIconPack } from "./piece_set";
import type { PreferredPlayerColor } from "./preferred_player_color";

const defualtSettings = {
  preferredFirstMoveColor: ref<PreferredPlayerColor>("white"),
  preferredPlayerColor: ref<PreferredPlayerColor>("random"),
  playerSecondsPerMove: ref<number>(0),
  opponentSecondsPerMove: ref<number>(0),
  playerSecondsPerMatch: ref<number>(0),
  opponentSecondsPerMatch: ref<number>(0),
  secondsMoveLimitRunOutPunishment: ref<SecondsPerMovePenalty>("random_move"),
  reviveFromCapturedPieces: ref(false),
  audioEffectsEnabled: ref(true),
  vibrationsEnabled: ref(true),
  secondCheckboardEnabled: ref(false),
  ignorePiecesGuardedProperty: ref(false),
  showCapturingPieces: ref(true),
  autoPauseGame: ref(true),
  showOtherAvailibleMoves: ref(false),
  tableModeEnabled: ref(false),
  pawnImportance: ref(1),
  knightImportance: ref(3),
  bishopImportance: ref(3.25),
  rookImportance: ref(5),
  queenImportance: ref(9),
  kingImportance: ref(25),
  theme: ref<Theme>("auto"),
  transitions: ref<Transitions>("auto"),
  playerHue: ref(37),
  opponentHue: ref(200),
  pieceIconPack: ref<PieceIconPack>("font_awesome"),
  piecePadding: ref(10),
  pieceBorder: ref(1.1),
  transitionDuration: ref(100),
  cellIndexOpacity: ref(90),
  pieceLongPressTimeout: ref(0),
  requireMoveConfirm: ref(false),
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
};

export default defualtSettings;
