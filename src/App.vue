<script lang="ts" setup>
import moveAudioEffectUrl from "./assets/audio/move.ogg";
import removeAudioEffectUrl from "./assets/audio/remove.ogg";

// Import from packages
import { ref, reactive, onMounted, watch, computed } from "vue";
import { Howl } from "howler";

// Import user data
import SelectUserData from "./modules/user_data/select_user_data";
import BooleanUserData from "./modules/user_data/boolean_user_data";
import UserDataManager from "./modules/user_data_manager";
import ThemeData, { type ThemeValue } from "./modules/user_data/theme";
import TransitionsData, {
  type TransitionsValue,
} from "./modules/user_data/transitions";
import HueData from "./modules/user_data/hue";
import PieceSetData, {
  type PieceSetValue,
} from "./modules/user_data/piece_set";
import BoardStateData, {
  type BoardStateValue,
} from "./modules/user_data/board_state";
import PiecePaddingData from "./modules/user_data/piece_padding";
import PieceBorderData from "./modules/user_data/piece_border";
import TransitionDurationData from "./modules/user_data/transition_duration";
import CellIndexOpacityData from "./modules/user_data/cell_index_opacity";
import PlayerColorOptionData, {
  type PlayerColorOptionValue,
} from "./modules/user_data/preferred_player_color";
import OpponentOverLanData from "./modules/user_data/opponent_over_lan";
import SecondCheckboardData from "./modules/user_data/second_checkboard";
import RequireMoveConfirmData from "./modules/user_data/require_move_confirm";
import CapturedPiecesData from "./modules/user_data/captured_pieces";
import BooleanBoardStateData from "./modules/user_data/boolean_board_state";
import NumberUserData from "./modules/user_data/number_user_data";

// Import other classes and functions
import ToastManager, { type ToastProps } from "./modules/toast_manager";
import ThemeManager from "./modules/theme_manager";
import TransitionsManager from "./modules/transitions_manager";
import ConfirmDialog from "./modules/dialogs/confirm";
import DefaultBoardManager from "./modules/default_board_manager";
import GameBoardManager from "./modules/game_board_manager";
import ConfigPieceDialog from "./modules/dialogs/config_piece";
import SelectPieceDilog from "./modules/dialogs/select_piece";
import { PIECE_IDS } from "./modules/pieces/piece";
import {
  activateColors,
  hideSplashscreen,
  setCSSVariable,
  updatePrimaryHue,
  updatePieceColors,
} from "./modules/utils/elements";
import ConfigInventory from "./modules/config_inventory";
import ConfigManager from "./modules/config_manager";
import type { BoardPosition, MarkBoardState } from "./components/Board.vue";
import type { BooleanBoardState } from "./modules/user_data/boolean_board_state";
import ConfigPrintDialog from "./modules/dialogs/config_print";
import { PREDEFINED_DEFAULT_BOARD_CONFIGS } from "./modules/predefined_configs";
import EscapeManager from "./modules/escape_manager";
import Game, {
  isPlayerColor,
  isMoveSecondsLimitRunOutPunishment,
  isWinner,
  type PlayerColor,
  type MoveSecondsLimitRunOutPunishment,
  type Winner,
  type WinReason,
  isWinReason,
} from "./modules/game";
import RawBoardStateData from "./modules/user_data/raw_board_state";
import { PieceId } from "./modules/pieces/piece";
import Bishop from "./modules/pieces/bishop";
import King from "./modules/pieces/king";
import Knight from "./modules/pieces/knight";
import Pawn from "./modules/pieces/pawn";
import Queen from "./modules/pieces/queen";
import Rook from "./modules/pieces/rook";
import { RawPiece } from "./modules/pieces/rawPiece";
import { isEven } from "./modules/utils/misc";

// Import components
import Board from "./components/Board.vue";
import Icon from "./components/Icon.vue";
import ConfigDrawer from "./components/ConfigDrawer.vue";
import Category from "./components/Category.vue";
import UserOption from "./components/UserOption.vue";
import Checkbox from "./components/Checkbox.vue";
import Modal from "./components/Modal.vue";
import ToastStack from "./components/ToastStack.vue";
import ConfigItem from "./components/ConfigItem.vue";
import ConfigsDialog from "./modules/dialogs/configs";
import ActionPanel from "./components/ActionPanel.vue";
import Status from "./components/Status.vue";
import SelectPiece from "./components/SelectPiece.vue";
import TimeDurationInput from "./components/TimeDurationInput.vue";
import SectionTitle from "./components/SectionTitle.vue";
import { UserDataError } from "./modules/user_data/user_data";

function toggleActionsPanel() {
  actionPanelOpen.value = !actionPanelOpen.value;
  actionPanelOpen.value
    ? escapeManager.addLayer(toggleActionsPanel)
    : escapeManager.removeLayer();

  if (!actionPanelOpen.value) {
    if (configDrawerOpen.value) {
      toggleConfigDrawer();
    }
  }
}

function toggleConfigDrawer() {
  configDrawerOpen.value = !configDrawerOpen.value;
  configDrawerOpen.value
    ? escapeManager.addLayer(toggleActionsPanel)
    : escapeManager.removeLayer();
}

function updateScreenRotation(rotate: boolean): void {
  rotate
    ? setCSSVariable("app-transform", "rotate(-0.5turn)")
    : setCSSVariable("app-transform", "");
}

function tryRecoverData() {
  if (!navigator.cookieEnabled) {
    toastManager.showToast(
      "Cookies are disabled. -> No changes will be restored in next session.",
      "error",
      "cookie-alert"
    );
    return false;
  }
  userDataManager.recoverData();
  return true;
}

async function onGameRestart() {
  const confirmed = await confirmDialog.show(
    "Currently played game will be lost. Are you sure?"
  );
  if (!confirmed) return;
  actionPanelOpen.value = false;
  game.restart();
}

const VERSION = "0.0.0";
const BUILD = "3";

const DEFAULT_DEFAULT_BOARD_STATE_VALUE: BoardStateValue = [
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
];
const DEFAULT_GAME_BOARD_STATE_VALUE = Array(8).fill(Array(8).fill(null));
const DEFAULT_CELL_INDEX_OPACITY_VALUE = 90;
const DEFAULT_PLAYER_HUE_VALUE = 30;
const DEFAULT_OPPONENT_HUE_VALUE = 198;
const DEFAULT_OPPONENT_OVER_LAN_VALUE = false;
const DEFAULT_PIECE_BORDER_VALUE = 1.1;
const DEFAULT_PIECE_PADDING_VALUE = 6;
const DEFAULT_PIECE_SET_VALUE: PieceSetValue = "material_design";
const DEFAULT_PREFERRED_PLAYER_COLOR_VALUE: PlayerColorOptionValue = "random";
const DEFAULT_REQUIRE_MOVE_CONFIRM_VALUE = false;
const DEFAULT_ROTATE_SCREEN_VALUE = false;
const DEFAULT_SECOND_CHECKBOARD_VALUE = false;
const DEFAULT_THEME_VALUE: ThemeValue = "auto";
const DEFAULT_TRANSITION_DURATION_VALUE = 100;
const DEFAULT_TRANSITIONS_VALUE: TransitionsValue = "auto";
const DEFAULT_PLAYER_COLOR_VALUE: PlayerColor = "white";
const DEFAULT_WHITE_CAPTURED_PIECES_VALUE: PieceId[] = [];
const DEFAULT_BLACK_CAPTURED_PIECES_VALUE: PieceId[] = [];
const DEFAULT_GAME_PAUSED_VALUE = false;
const DEFAULT_AUDIO_EFFECTS_VALUE = true;
const DEFAULT_FIRST_MOVE_COLOR: PlayerColorOptionValue = "white";
const DEFAULT_SHOW_CAPTURING_PIECES_VALUE = true;
const DEFAULT_BAN_PROMOTION_TO_UNCAPTURED_PIECES_VALUE = false;
const DEFAULT_PLAYER_SECONDS_PER_MOVE = 0;
const DEFAULT_OPPONENT_SECONDS_PER_MOVE = 0;
const DEFAULT_PLAYER_SECONDS_PER_MATCH = 0;
const DEFAULT_OPPONENT_SECONDS_PER_MATCH = 0;
const DEFAULT_SHOW_OTHER_AVAILIBLE_MOVES = true;
const DEFAULT_SECONDS_PER_MOVE_RUNOUT_PUNISHMENT: MoveSecondsLimitRunOutPunishment =
  "random_move";
const DEFAULT_WIN_REASON_VALUE: WinReason = "none";

// UI refs are temporary. They are not part of any user data and won't be restored after load.
const pieceMoveAudioEffect = new Howl({ src: [moveAudioEffectUrl] });
const pieceRemoveAudioEffect = new Howl({ src: [removeAudioEffectUrl] });
const configDrawerOpen = ref(false);
const actionPanelOpen = ref(false);
const toasts = ref<ToastProps[]>([]);
const configNameInput = ref<null | HTMLInputElement>(null);
const configsNameFilter = ref("");
const filteredConfigsPrints = computed(() => {
  return configsDialog.props.configsPrints.filter((print) =>
    print.name.toLowerCase().includes(configsNameFilter.value.toLowerCase())
  );
});
const playerCellMarks: MarkBoardState = reactive(
  Array(8)
    .fill(null)
    .map(() => new Array(8).fill(null))
);
const OpponentCellMarks: MarkBoardState = reactive(
  Array(8)
    .fill(null)
    .map(() => new Array(8).fill(null))
);
const configPieceSelectOptions = computed(() => {
  const pieces: RawPiece[] = [];
  for (const pieceId of PIECE_IDS) {
    pieces.push({ pieceId, color: configPieceDialog.props.color });
  }
  return pieces;
});
const playingColor = computed(() => {
  let color: PlayerColor;
  (isEven(moveIndex.value) && firstMoveColor.value === "white") ||
  (!isEven(moveIndex.value) && firstMoveColor.value === "black")
    ? (color = "white")
    : (color = "black");
  return color;
});
const playerPlaying = computed(() => {
  return playerColor.value === playingColor.value;
});
const playerMoveSecondsLimitSet = computed(() => {
  return playerMoveSecondsLimit.value !== 0;
});
const opponentMoveSecondsLimitSet = computed(() => {
  return opponentMoveSecondsLimit.value !== 0;
});
const playerMatchSecondsLimitSet = computed(() => {
  return playerMatchSecondsLimit.value !== 0;
});
const opponentMatchSecondsLimitSet = computed(() => {
  return opponentMatchSecondsLimit.value !== 0;
});
const statusText = computed(() => {
  let text: string;
  switch (winner.value) {
    case "none":
      text = playingColor.value === "white" ? "White plays" : "Black plays";
      break;
    case "draw":
      text = "draw";
      break;
    case "opponent":
      text = playerColor.value === "white" ? "Black won" : "White won";
      break;
    case "player":
      text = playerColor.value === "white" ? "White won" : "Black won";
      break;
    default:
      throw new UserDataError(
        `Winner value is of an invalid type. value: ${winner.value}`
      );
  }
  return text;
});
const playerSelectedPieces = ref<BoardPosition[]>([]);
const opponentSelectedPieces = ref<BoardPosition[]>([]);
const playerSelectedCells = ref<BoardPosition[]>([]);
const opponentSelectedCells = ref<BoardPosition[]>([]);

// User data refs
// Simple values
const theme = ref(DEFAULT_THEME_VALUE);
const transitions = ref(DEFAULT_TRANSITIONS_VALUE);
const playerHue = ref(DEFAULT_PLAYER_HUE_VALUE);
const opponentHue = ref(DEFAULT_OPPONENT_HUE_VALUE);
const pieceSet = ref(DEFAULT_PIECE_SET_VALUE);
const piecePadding = ref(DEFAULT_PIECE_PADDING_VALUE);
const pieceBorder = ref(DEFAULT_PIECE_BORDER_VALUE);
const transitionDuration = ref(DEFAULT_TRANSITION_DURATION_VALUE);
const cellIndexOpacity = ref(DEFAULT_CELL_INDEX_OPACITY_VALUE);
const preferredPlayerColor = ref(DEFAULT_PREFERRED_PLAYER_COLOR_VALUE);
const opponentOverLan = ref(DEFAULT_OPPONENT_OVER_LAN_VALUE);
const secondCheckboard = ref(DEFAULT_SECOND_CHECKBOARD_VALUE);
const rotateScreen = ref(DEFAULT_ROTATE_SCREEN_VALUE);
const requireMoveConfirm = ref(DEFAULT_REQUIRE_MOVE_CONFIRM_VALUE);
const audioEffects = ref(DEFAULT_AUDIO_EFFECTS_VALUE);
const showCapturingPieces = ref(DEFAULT_SHOW_CAPTURING_PIECES_VALUE);
const banPromotionToUncapturedPieces = ref(
  DEFAULT_BAN_PROMOTION_TO_UNCAPTURED_PIECES_VALUE
);
const playerMoveSecondsLimit = ref(DEFAULT_PLAYER_SECONDS_PER_MOVE);
const opponentMoveSecondsLimit = ref(DEFAULT_OPPONENT_SECONDS_PER_MOVE);
const playerMatchSecondsLimit = ref(DEFAULT_PLAYER_SECONDS_PER_MATCH);
const opponentMatchSecondsLimit = ref(DEFAULT_OPPONENT_SECONDS_PER_MATCH);
const showOtherAvailibleMoves = ref(DEFAULT_SHOW_OTHER_AVAILIBLE_MOVES);
const secondsMoveLimitRunOutPunishment = ref(
  DEFAULT_SECONDS_PER_MOVE_RUNOUT_PUNISHMENT
);

// Game specific
const winner = ref<Winner>("none");
const winReason = ref<WinReason>(DEFAULT_WIN_REASON_VALUE);
const moveIndex = ref(0);
const prefferedFirstMoveColor = ref(DEFAULT_FIRST_MOVE_COLOR);
const firstMoveColor = ref<PlayerColor>(DEFAULT_PLAYER_COLOR_VALUE);
const playerColor = ref<PlayerColor>(DEFAULT_PLAYER_COLOR_VALUE);
const gamePaused = ref(DEFAULT_GAME_PAUSED_VALUE);
const whiteCapturedPieces = ref<PieceId[]>(DEFAULT_WHITE_CAPTURED_PIECES_VALUE);
const blackCapturedPieces = ref<PieceId[]>(DEFAULT_BLACK_CAPTURED_PIECES_VALUE);
const highlightedCells: BooleanBoardState = reactive(
  Array(8)
    .fill(null)
    .map(() => new Array(8).fill(false))
);
const playerMoveSeconds = ref(0);
const opponentMoveSeconds = ref(0);
const playerMatchSeconds = ref(0);
const opponentMatchSeconds = ref(0);
const playerRemainingMoveSeconds = computed(() => {
  return playerMoveSecondsLimit.value - playerMoveSeconds.value;
});
const opponentRemainingMoveSeconds = computed(() => {
  return opponentMoveSecondsLimit.value - opponentMoveSeconds.value;
});
const playerRemainingMatchSeconds = computed(() => {
  return playerMatchSecondsLimit.value - playerMatchSeconds.value;
});
const opponentRemainingMatchSeconds = computed(() => {
  return opponentMatchSecondsLimit.value - opponentMatchSeconds.value;
});

// Complex values (reactive)
const defaultBoardState: BoardStateValue = reactive(
  DEFAULT_DEFAULT_BOARD_STATE_VALUE
);
const gameBoardState: BoardStateValue = reactive(
  DEFAULT_GAME_BOARD_STATE_VALUE
);

const confirmDialog = new ConfirmDialog();
const configPieceDialog = new ConfigPieceDialog();
const toastManager = new ToastManager(toasts);
const selectPieceDialog = new SelectPieceDilog(toastManager);
const configPrintDialog = new ConfigPrintDialog(toastManager);
const configsDialog = new ConfigsDialog(
  confirmDialog,
  configPrintDialog,
  toastManager
);
const themeManger = new ThemeManager(DEFAULT_THEME_VALUE);
const transitionsManager = new TransitionsManager(DEFAULT_TRANSITIONS_VALUE);

// Data
const defaultBoardStateData = new RawBoardStateData(
  DEFAULT_DEFAULT_BOARD_STATE_VALUE,
  defaultBoardState,
  toastManager
);
const gameBoardStateData = new BoardStateData(
  DEFAULT_GAME_BOARD_STATE_VALUE,
  gameBoardState,
  toastManager,
  false
);

// NOTE: Most of the UserData instances use Ref but some of them may use reactive if their value is more complex. These classes are extending ComplexUserData class.
const userDataManager = new UserDataManager(
  [
    new ThemeData(DEFAULT_THEME_VALUE, theme, themeManger, toastManager),
    new TransitionsData(
      DEFAULT_TRANSITIONS_VALUE,
      transitions,
      transitionsManager,
      toastManager
    ),
    new HueData(DEFAULT_PLAYER_HUE_VALUE, playerHue, false, toastManager),
    new HueData(DEFAULT_OPPONENT_HUE_VALUE, opponentHue, true, toastManager),
    new PieceSetData(DEFAULT_PIECE_SET_VALUE, pieceSet, toastManager),
    new PiecePaddingData(
      DEFAULT_PIECE_PADDING_VALUE,
      piecePadding,
      toastManager
    ),
    new PieceBorderData(DEFAULT_PIECE_BORDER_VALUE, pieceBorder, toastManager),
    new TransitionDurationData(
      DEFAULT_TRANSITION_DURATION_VALUE,
      transitionDuration,
      toastManager
    ),
    new CellIndexOpacityData(
      DEFAULT_CELL_INDEX_OPACITY_VALUE,
      cellIndexOpacity,
      toastManager
    ),
    new PlayerColorOptionData(
      "preferred_player_color",
      DEFAULT_PREFERRED_PLAYER_COLOR_VALUE,
      preferredPlayerColor,
      toastManager
    ),
    new PlayerColorOptionData(
      "preferred_first_move_color",
      DEFAULT_FIRST_MOVE_COLOR,
      prefferedFirstMoveColor,
      toastManager
    ),
    new BooleanUserData(
      "show_capturing_pieces",
      DEFAULT_SHOW_CAPTURING_PIECES_VALUE,
      toastManager,
      showCapturingPieces
    ),
    new OpponentOverLanData(
      DEFAULT_OPPONENT_OVER_LAN_VALUE,
      opponentOverLan,
      toastManager
    ),
    new SecondCheckboardData(
      DEFAULT_SECOND_CHECKBOARD_VALUE,
      secondCheckboard,
      toastManager
    ),
    new BooleanUserData(
      "rotate_screen",
      DEFAULT_ROTATE_SCREEN_VALUE,
      toastManager,
      rotateScreen
    ),
    new RequireMoveConfirmData(
      DEFAULT_REQUIRE_MOVE_CONFIRM_VALUE,
      requireMoveConfirm,
      toastManager
    ),
    new SelectUserData(
      "player_color",
      DEFAULT_PLAYER_COLOR_VALUE,
      isPlayerColor,
      toastManager,
      playerColor
    ),
    new SelectUserData(
      "win_reason",
      DEFAULT_WIN_REASON_VALUE,
      isWinReason,
      toastManager,
      winReason
    ),
    new SelectUserData("winner", "none", isWinner, toastManager, winner),
    new SelectUserData(
      "seconds_per_move_runout_punishment",
      "random_move",
      isMoveSecondsLimitRunOutPunishment,
      toastManager,
      secondsMoveLimitRunOutPunishment
    ),
    new BooleanUserData(
      "game_paused",
      DEFAULT_GAME_PAUSED_VALUE,
      toastManager,
      gamePaused
    ),
    new BooleanUserData(
      "ban_promotion_to_uncaptured_pieces",
      DEFAULT_BAN_PROMOTION_TO_UNCAPTURED_PIECES_VALUE,
      toastManager,
      banPromotionToUncapturedPieces
    ),
    new BooleanUserData(
      "audio_effects",
      DEFAULT_AUDIO_EFFECTS_VALUE,
      toastManager,
      audioEffects
    ),
    new CapturedPiecesData(
      DEFAULT_WHITE_CAPTURED_PIECES_VALUE,
      whiteCapturedPieces,
      "white",
      toastManager
    ),
    new CapturedPiecesData(
      DEFAULT_BLACK_CAPTURED_PIECES_VALUE,
      blackCapturedPieces,
      "black",
      toastManager
    ),
    new NumberUserData("move_index", 0, toastManager, moveIndex),
    new BooleanBoardStateData(
      "highlighted_cells",
      highlightedCells,
      highlightedCells,
      toastManager
    ),
    new NumberUserData(
      "player_seconds_per_move",
      DEFAULT_PLAYER_SECONDS_PER_MOVE,
      toastManager,
      playerMoveSecondsLimit
    ),
    new NumberUserData(
      "opponent_seconds_per_move",
      DEFAULT_OPPONENT_SECONDS_PER_MOVE,
      toastManager,
      opponentMoveSecondsLimit
    ),
    new NumberUserData(
      "player_seconds_per_match",
      DEFAULT_PLAYER_SECONDS_PER_MATCH,
      toastManager,
      playerMatchSecondsLimit
    ),
    new NumberUserData(
      "opponent_seconds_per_match",
      DEFAULT_OPPONENT_SECONDS_PER_MATCH,
      toastManager,
      opponentMatchSecondsLimit
    ),
    new NumberUserData(
      "player_move_seconds",
      0,
      toastManager,
      playerMoveSeconds
    ),
    new NumberUserData(
      "opponent_move_seconds",
      0,
      toastManager,
      opponentMoveSeconds
    ),
    new NumberUserData(
      "player_match_seconds",
      0,
      toastManager,
      playerMatchSeconds
    ),
    new NumberUserData(
      "opponent_match_seconds",
      0,
      toastManager,
      opponentMatchSeconds
    ),
    new BooleanUserData(
      "show_other_availible_moves",
      DEFAULT_SHOW_OTHER_AVAILIBLE_MOVES,
      toastManager,
      showOtherAvailibleMoves
    ),
    defaultBoardStateData,
    gameBoardStateData,
  ],
  confirmDialog,
  toastManager
);

const screenRotated = computed(() => {
  let rotated: boolean;
  if (!rotateScreen.value) {
    return false;
  }
  rotated = playingColor.value === "black";
  return rotated;
});
watch(screenRotated, (newValue) => {
  updateScreenRotation(newValue);
});
watch(playerPlaying, (newValue) => {
  updatePrimaryHue(newValue);
});
watch(playerColor, (newValue) => {
  updatePieceColors(newValue);
});

const defaultBoardConfigInventory = new ConfigInventory(
  "default-board",
  PREDEFINED_DEFAULT_BOARD_CONFIGS,
  toastManager
);
const defaultBoardConfigManager = new ConfigManager(
  defaultBoardConfigInventory,
  [defaultBoardStateData],
  toastManager
);

const escapeManager = new EscapeManager(toggleActionsPanel);
const defaultBoardManager = new DefaultBoardManager(
  defaultBoardState,
  configPieceDialog,
  audioEffects,
  pieceMoveAudioEffect,
  pieceRemoveAudioEffect
);
const gameBoardManager = new GameBoardManager(
  playingColor,
  gameBoardState,
  whiteCapturedPieces,
  blackCapturedPieces,
  playerCellMarks,
  OpponentCellMarks,
  playerSelectedPieces,
  opponentSelectedPieces,
  playerSelectedCells,
  opponentSelectedCells,
  highlightedCells,
  selectPieceDialog,
  audioEffects,
  pieceMoveAudioEffect,
  pieceRemoveAudioEffect,
  showCapturingPieces,
  banPromotionToUncapturedPieces,
  showOtherAvailibleMoves,
  moveIndex,
  toastManager
);

const visited = localStorage.getItem("tessera_board-visited");
if (visited === null) {
  localStorage.setItem("tessera_board-visited", "1");
} else {
  tryRecoverData();
}
userDataManager.onRecoverCheck();
userDataManager.applyData();
userDataManager.updateReferences();

const game = new Game(
  gameBoardManager,
  gameBoardStateData,
  defaultBoardStateData,
  playerColor,
  firstMoveColor,
  prefferedFirstMoveColor,
  playerPlaying,
  moveIndex,
  preferredPlayerColor,
  playerMoveSecondsLimit,
  opponentMoveSecondsLimit,
  playerMatchSecondsLimit,
  opponentMatchSecondsLimit,
  playerMoveSeconds,
  opponentMoveSeconds,
  playerMatchSeconds,
  opponentMatchSeconds,
  secondsMoveLimitRunOutPunishment,
  winner,
  winReason,
  toastManager
);

onMounted(() => {
  // Sets CSS Saturation variables from 0 to their appropriate user configured values
  activateColors();

  addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") escapeManager.escape();
    if (event.key === "R" && event.shiftKey) game.restart();
    if (event.key === "C" && event.shiftKey) {
      toggleActionsPanel();
      toggleConfigDrawer();
    }
  });

  // Let the app wait another 600ms to make sure its fully loaded.
  setTimeout(() => {
    gameBoardManager.updateCapturingPaths();
    if (visited === null) {
      game.restart();
    } else {
      game.resume();
    }
    hideSplashscreen(transitionsManager.preferredTransitions);
  }, 600);
});
</script>

<template>
  <a
    tabindex="0"
    href="#action-button"
    id="skip-to-navigation"
    title="Skip to navigation"
    >Skip to navigation</a
  >
  <!-- Relative -->
  <div id="game-area">
    <Status
      :player-secs-move="playerRemainingMoveSeconds"
      :opponent-secs-move="opponentRemainingMoveSeconds"
      :player-secs-match="playerRemainingMatchSeconds"
      :opponent-secs-match="opponentRemainingMatchSeconds"
      :player-move-seconds-limit-set="playerMoveSecondsLimitSet"
      :player-match-seconds-limit-set="playerMatchSecondsLimitSet"
      :opponent-move-seconds-limit-set="opponentMoveSecondsLimitSet"
      :opponent-match-seconds-limit-set="opponentMatchSecondsLimitSet"
      :player-playing="playerPlaying"
      :move-index="moveIndex"
      :status-text="statusText"
    />
    <div class="captured-pieces-placeholder"></div>
    <div id="boards-area">
      <Board
        :selected-pieces="playerSelectedPieces"
        :selected-cells="playerSelectedCells"
        :highlighted-cells-state="highlightedCells"
        :marks-state="playerCellMarks"
        :rotated="screenRotated"
        :manager="gameBoardManager"
        :state="gameBoardState"
        :piece-set="pieceSet"
        :piece-padding="piecePadding"
        :piece-border="pieceBorder"
        :white-captured-pieces="whiteCapturedPieces"
        :black-captured-pieces="blackCapturedPieces"
        primary
        id="player-board"
      />
      <Board
        v-if="secondCheckboard"
        :selected-pieces="opponentSelectedPieces"
        :selected-cells="opponentSelectedCells"
        :highlighted-cells-state="highlightedCells"
        :rotated="screenRotated"
        :manager="gameBoardManager"
        :state="gameBoardState"
        :piece-set="pieceSet"
        :piece-padding="piecePadding"
        :piece-border="pieceBorder"
        :white-captured-pieces="whiteCapturedPieces"
        :black-captured-pieces="blackCapturedPieces"
        primary
        id="opponent-board"
      />
    </div>
    <div class="captured-pieces-placeholder"></div>
  </div>

  <!-- Fixed -->
  <ActionPanel
    @backdrop-click="toggleActionsPanel"
    @configure-game="toggleConfigDrawer"
    @restart-game="onGameRestart()"
    :open="actionPanelOpen"
    :status-text="statusText"
  />

  <ConfigDrawer :open="configDrawerOpen">
    <header>
      <h1>Tessera board</h1>
      <small class="version">v{{ VERSION }} ({{ BUILD }})</small>
    </header>
    <!-- Player -->
    <Category name="Player (you)" icon-id="account">
      <UserOption
        name="color"
        icon-id="invert-colors"
        option-id="select-player-color"
      >
        <select id="select-player-color" v-model="preferredPlayerColor">
          <option value="random">Random</option>
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
        <template #description>
          Defines color of your pieces be it black or white.
        </template>
      </UserOption>
      <UserOption
        v-if="false"
        name="computer"
        icon-id="memory"
        option-id="check-computer-player"
      >
        <Checkbox id="check-computer-player" />
        <template #description>
          If this option is enabled an algorythm will play instead of a human
          player.
        </template>
      </UserOption>
    </Category>
    <!-- Opponent -->
    <Category name="Opponent" icon-id="target-account">
      <UserOption
        name="over local network"
        icon-id="lan-connect"
        option-id="check-remote-opponent"
      >
        <Checkbox id="check-remote-opponent" v-model="opponentOverLan" />
        <template #description>
          If this option is enabled the opponent won't play on the same device,
          but instead play on another device connected to the same network after
          peer connection is established.</template
        >
      </UserOption>
      <UserOption
        name="computer"
        icon-id="memory"
        option-id="check-computer-opponent"
        v-if="false"
      >
        <Checkbox id="check-computer-opponent" />
        <template #description>
          If this option is enabled an algorythm will play instead of a human
          player.
        </template>
      </UserOption>
    </Category>
    <!-- Game rules -->
    <Category name="Game rules" icon-id="rule">
      <!-- Time restrictions -->
      <SectionTitle title="Time restrictions" />
      <UserOption
        name="Player time per move"
        icon-id="timer-outline"
        option-id="minutes-input-player-seconds-per-move"
      >
        <TimeDurationInput
          id="input-player-seconds-per-move"
          v-model="playerMoveSecondsLimit"
        />
        <template #description
          >Limits player's time per move. If the time runs out (expires) an
          action specified in the option below will be performed.
          <b>The limit is disabled when both values are set to 0.</b></template
        >
      </UserOption>
      <UserOption
        name="Opponent time per move"
        icon-id="timer-outline"
        option-id="minutes-input-opponent-seconds-per-move"
      >
        <TimeDurationInput
          id="input-opponent-seconds-per-move"
          v-model="opponentMoveSecondsLimit"
        />
        <template #description
          >Limits opponent's time per move. If the time runs out (expires) an
          action specified in the option below will be performed.
          <b>The limit is disabled when both values are set to 0.</b></template
        >
      </UserOption>
      <UserOption
        name="Player time per match"
        icon-id="clock-outline"
        option-id="minutes-input-player-seconds-per-match"
      >
        <TimeDurationInput
          id="input-player-seconds-per-match"
          v-model="playerMatchSecondsLimit"
        />
        <template #description
          >Limits player's time for whole match (game). If the time runs out the
          player looses and opponent wins.
          <b>The limit is disabled when both values are set to 0.</b></template
        >
      </UserOption>
      <UserOption
        name="Opponent time per match"
        icon-id="clock-outline"
        option-id="minutes-input-opponent-seconds-per-match"
      >
        <TimeDurationInput
          id="input-opponent-seconds-per-match"
          v-model="opponentMatchSecondsLimit"
        />
        <template #description
          >Limits opponent's time for whole match (game). If the time runs out
          the opponent looses and player wins.
          <b>The limit is disabled when both values are set to 0.</b></template
        >
      </UserOption>
      <UserOption
        name="Time per move expiration punishment"
        icon-id="timer-alert-outline"
        option-id="seconds-per-move-runout-punishment"
      >
        <select
          id="seconds-per-move-runout-punishment"
          v-model="secondsMoveLimitRunOutPunishment"
        >
          <option value="random_move">Random move</option>
          <option value="game_loss">Game loss</option>
        </select>
        <template #description
          >Defines how to punish the player when he/she run out of time per
          move.
        </template>
      </UserOption>
      <!-- Assistance -->
      <SectionTitle title="Assistance" />
      <UserOption
        name="show pieces checking selected cell"
        icon-id="rhombus-outline"
        option-id="check-show-capturing-pieces"
      >
        <Checkbox
          id="check-show-capturing-pieces"
          v-model="showCapturingPieces"
        />
        <template #description>
          If a cell on the board is selected, the game will highlight the pieces
          that are checking that position. This feature helps the player
          recognize which pieces are endangering the cell, but it is considered
          a game rule, because it can give the player an advantage.
        </template>
      </UserOption>
      <UserOption
        name="show availible moves of pieces of other player"
        icon-id="circle-small"
        option-id="show-other-availible-moves"
      >
        <Checkbox
          id="show-other-availible-moves"
          v-model="showOtherAvailibleMoves"
        />
        <template #description>
          The player will be able to display the possible moves and board marks
          of pieces of the other player after clicking on them and not only
          his/her own pieces.
        </template>
      </UserOption>
      <!-- Other -->
      <SectionTitle title="Other" />
      <UserOption
        name="First move color"
        icon-id="numeric-1-box-outline"
        option-id="first-move-color"
      >
        <select id="first-move-color" v-model="prefferedFirstMoveColor">
          <option value="random">Random</option>
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
        <template #description>
          Defines which color makes the first move. According to official chess
          rules white player should be the one to make the first move.
        </template>
      </UserOption>
      <UserOption
        name="Ban promotion to uncaptured pieces"
        icon-id="plus-lock"
        option-id="promotion-to-uncaptured-pieces"
      >
        <Checkbox
          id="promotion-to-uncaptured-pieces"
          v-model="banPromotionToUncapturedPieces"
        />
        <template #description>
          When a piece promotes (in chess it is a pawn) it is only allowed to
          promote to pieces that were that the player already lost. In the very
          rare case when the player lost no pieces and pawn it to be promoted he
          will be again able to choose any piece as a fallback.
        </template>
      </UserOption>
      <!-- Checkboard -->
      <SectionTitle title="Checkboard" />
      <UserOption
        :simple="false"
        name="default piece positions"
        icon-id="checkerboard"
        option-id="default-board"
      >
        <button
          class="single"
          @click="configsDialog.open(defaultBoardConfigManager)"
        >
          <Icon icon-id="tune" side />Checkboard configurations
        </button>
        <div class="board-box">
          <Board
            :manager="defaultBoardManager"
            :state="defaultBoardState"
            :piece-set="pieceSet"
            :piece-padding="piecePadding"
            :piece-border="pieceBorder"
            id="default-board"
          />
        </div>
        <template #description>
          Defines position of each piece at the start of the game. Click on
          piece to remove it. Click on empty cell to add a piece.
        </template>
      </UserOption>
    </Category>
    <!-- Look and feel -->
    <Category name="look and feel" icon-id="palette-advanced">
      <!-- Behavior and elements -->
      <SectionTitle title="Behavior and elements" />
      <UserOption
        name="second checkboard"
        icon-id="checkerboard-plus"
        option-id="check-second-checkboard"
      >
        <Checkbox id="check-second-checkboard" v-model="secondCheckboard" />
        <template #description>
          Shows second checkboard on the screen rotated for the second player.
          This option is great for separating player zone for each player
          especially if you are playing on a larger screen, but it's not
          recommended on a smaller screen. The second checkboard won't show if
          you are playing with your opponent over a local network.
        </template>
      </UserOption>
      <UserOption
        name="rotate screen"
        icon-id="screen-rotation"
        option-id="check-rotate-screen"
      >
        <Checkbox id="check-rotate-screen" v-model="rotateScreen" />
        <template #description>
          The whole user interface will get rotated (excluding the checkboard)
          when the black player plays. This can be useful when you are playing
          on a mobile phone sitting opposite to each other and the screen
          rotates automatically instead of you having to rotate it every time
          the other player plays.
        </template>
      </UserOption>
      <UserOption
        name="require move confirm"
        icon-id="check-all"
        option-id="check-require-move-confirm"
      >
        <Checkbox
          id="check-require-move-confirm"
          v-model="requireMoveConfirm"
        />
        <template #description>
          Requires player to confirm move using buttons that appear next to the
          action button. This can be useful when you are playing on a
          touchscreen and you often click accidentally in wrong positions.
        </template>
      </UserOption>
      <!-- Colors -->
      <SectionTitle title="Colors" />
      <UserOption
        name="UI mode"
        icon-id="brightness-6"
        option-id="select-ui-mode"
      >
        <select id="select-ui-mode" v-model="theme">
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <template #description
          >Makes the whole webpage colors appear more light or dark, which can
          strain your eyes less when you are in dark environment. When set to
          "Automatic" the app will try to follow theme preferred by your
          browser.
        </template>
      </UserOption>
      <UserOption
        name="Player hue"
        icon-id="format-color-fill"
        option-id="input-hue-player"
      >
        <input
          type="number"
          min="0"
          max="360"
          id="input-hue-player"
          v-model="playerHue"
        />
        <template #description
          >The UI transitions the overall hue of the app to this hue when you
          are currently playing. The value is a hue degree from 0 to 360.
        </template>
      </UserOption>
      <UserOption
        name="Opponent hue"
        icon-id="format-color-fill"
        option-id="input-hue-opponent"
      >
        <input
          type="number"
          min="0"
          max="360"
          id="input-hue-opponent"
          v-model="opponentHue"
        />
        <template #description
          >The UI transitions the overall hue of the app to this hue when you
          are currently playing. The value is a hue degree from 0 to 360.
        </template>
      </UserOption>
      <!-- Checkboard -->
      <SectionTitle title="Checkboard" />
      <UserOption
        name="piece set"
        icon-id="chess-pawn"
        option-id="select-piece-set"
      >
        <select id="select-piece-set" v-model="pieceSet">
          <option value="material_design">Material Design</option>
          <option value="font_awesome">Font Awesome</option>
          <option value="tabler">Tabler</option>
        </select>
        <template #description
          >Chooses what vector icons are used for pieces. Different icon sets
          have different shapes.
        </template>
      </UserOption>
      <UserOption
        name="piece padding (px)"
        icon-id="padding-piece"
        option-id="input-piece-padding"
      >
        <input
          type="number"
          min="0"
          max="20"
          id="input-piece-padding"
          v-model="piecePadding"
        />
        <template #description
          >Increases padding of the pieces relative to its cell, but that also
          decreases their overall size.
        </template>
      </UserOption>
      <UserOption
        name="piece border (px)"
        icon-id="border-piece"
        option-id="input-piece-border"
      >
        <input
          type="number"
          min="0"
          max="3"
          id="input-piece-border"
          v-model="pieceBorder"
        />
        <template #description
          >Increases border/stroke width of the pieces vector, which can improve
          their visibility.
        </template>
      </UserOption>
      <UserOption
        name="cell index opacity (%)"
        icon-id="code-array"
        option-id="input-cell-index-opacity"
      >
        <input
          type="number"
          min="0"
          max="100"
          id="input-cell-index-opacity"
          v-model="cellIndexOpacity"
        />
        <template #description
          >Opacity of the cell indexes (numbers and letters) written on borders
          of checkboard.
        </template>
      </UserOption>
      <!-- Effects -->
      <SectionTitle title="Effects" />
      <UserOption
        name="audio effects"
        icon-id="surround-sound"
        option-id="check-audio-effects"
      >
        <Checkbox id="check-audio-effects" v-model="audioEffects" />
        <template #description>
          Enables simple audio effects when a piece is moved and similiar.
        </template>
      </UserOption>
      <UserOption
        name="transitions"
        icon-id="transition"
        option-id="select-transitions"
      >
        <select id="select-transitions" v-model="transitions">
          <option value="auto">Auto</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
        <template #description
          >Disables or enables all transitions (excluding the splashcreen
          starting animation). This can help people who have problems with focus
          because of transitions being distracting to them or just don't like
          them. When set to "Automatic" the app will keep tansition effects
          disabled only if your browser requests it.
        </template>
      </UserOption>
      <UserOption
        name="transition duration (%)"
        icon-id="play-speed"
        option-id="input-transition-duration"
      >
        <input
          type="number"
          min="0"
          max="300"
          id="input-transition-duration"
          v-model="transitionDuration"
        />
        <template #description
          >Changes duration of all the transitions and animations (except for
          the splashscreen animation) in the same ratio.
        </template>
      </UserOption>
    </Category>
    <Category name="about game" icon-id="information-outline">
      <p id="about">
        Made with ❤️ by Jiří Král.
        <br />
        Source code is availible at
        <a href="https://github.com/FrameXX/tessera-board" target="_blank"
          >Github repository</a
        >.
        <br />
        This work is licensed under
        <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank"
          >General Public License v3</a
        >.
      </p>
    </Category>
    <div class="action-buttons-drawer">
      <button @click="userDataManager.requestClearData()">
        <Icon icon-id="delete-forever-outline" side />
        Clear all data
      </button>
    </div>
    <div class="nav-placeholder"></div
  ></ConfigDrawer>

  <!-- Relative -->
  <!-- Primary buttons -->
  <div class="primary-buttons">
    <Transition name="counter">
      <button aria-label="Previous move" title="Previous move">
        <Icon icon-id="arrow-left"></Icon>
      </button>
    </Transition>
    <Transition name="slide-up">
      <button aria-label="Cancel move" title="Cancel move" v-show="false">
        <Icon icon-id="close"></Icon>
      </button>
    </Transition>
    <button
      id="action-button"
      @click="toggleActionsPanel"
      aria-label="Menu"
      title="Menu"
    >
      <Icon
        icon-id="plus"
        id="action-icon"
        :class="{ close: actionPanelOpen }"
        side
      />
      Menu
    </button>
    <Transition name="counter">
      <button aria-label="Next move" title="Next move">
        <Icon icon-id="arrow-right"></Icon>
      </button>
    </Transition>
    <Transition name="slide-up">
      <button aria-label="Confirm move" title="Confirm move" v-show="false">
        <Icon icon-id="check"></Icon>
      </button>
    </Transition>
  </div>

  <!-- Fixed -->
  <!-- Select piece -->
  <Modal
    id="select-piece"
    title="Select promotion piece"
    :open="selectPieceDialog.props.open"
    @open="escapeManager.addLayer(selectPieceDialog.cancel)"
    @close="escapeManager.removeLayer()"
  >
    <SelectPiece
      :pieces="selectPieceDialog.props.pieceOptions"
      :piece-set="pieceSet"
      v-model="selectPieceDialog.props.selectedPiece"
    />
    <template #action-buttons>
      <button title="Choose piece" @click="selectPieceDialog.confirm">
        <Icon side icon-id="check-circle-outline" />Choose piece
      </button>
    </template>
  </Modal>

  <!-- Config piece -->
  <Modal
    id="config-piece"
    title="Configure new piece"
    :open="configPieceDialog.props.open"
    @open="escapeManager.addLayer(configPieceDialog.cancel)"
    @close="escapeManager.removeLayer()"
    @backdrop-click="configPieceDialog.cancel()"
  >
    <SelectPiece
      :pieces="configPieceSelectOptions"
      :piece-set="pieceSet"
      v-model="configPieceDialog.props.selectedPiece"
    />
    <div class="config">
      <UserOption name="color" option-id="select-piece-color">
        <select id="select-piece-color" v-model="configPieceDialog.props.color">
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
        <template #description
          >Piece color determines its player. Although pieces are colored and
          not usually entirely black or white they are darker or
          brighter.</template
        >
      </UserOption>
    </div>
    <template #action-buttons>
      <button @click="configPieceDialog.cancel()" title="Cancel">
        <Icon side icon-id="close-circle-outline" />Cancel
      </button>
      <button @click="configPieceDialog.confirm()" title="Add piece">
        <Icon side icon-id="check-circle-outline" />Add piece
      </button>
    </template>
  </Modal>

  <!-- Configurations -->
  <Modal
    id="configs"
    title="Manage configurations"
    :open="configsDialog.props.open"
    @open="escapeManager.addLayer(configsDialog.cancel)"
    @close="escapeManager.removeLayer()"
    @backdrop-click="configsDialog.cancel()"
  >
    <input
      type="search"
      class="single"
      placeholder="Search configs names"
      v-model="configsNameFilter"
    />
    <h3 v-show="!filteredConfigsPrints.length">
      No config name includes the searched string.
    </h3>
    <TransitionGroup name="opacity">
      <ConfigItem
        @delete="configsDialog.deleteConfig($event.id)"
        @rename="
          configsDialog.renameConfig(
            $event.id,
            $event.currentName,
            $event.currentDescription
          )
        "
        @restore="configsDialog.restoreConfig($event.id, $event.predefined)"
        v-for="print in filteredConfigsPrints"
        :key="print.id"
        :id="print.id"
        :name="print.name"
        :description="print.description"
        :predefined="print.predefined"
      />
    </TransitionGroup>
    <template #action-buttons>
      <button title="Close" @click="configsDialog.cancel()">
        <Icon side icon-id="close-circle-outline" />Close
      </button>
      <button
        title="Save current configuration"
        @click="configsDialog.saveConfig()"
      >
        <Icon side icon-id="content-save-outline" />New config
      </button>
    </template>
  </Modal>

  <!-- New Configuration -->
  <Modal
    id="config-print"
    title="Set configuration name and description"
    :open="configPrintDialog.props.open"
    :focus-on-open="configNameInput"
    @open="escapeManager.addLayer(configPrintDialog.cancel)"
    @close="escapeManager.removeLayer()"
    @backdrop-click="configPrintDialog.cancel()"
  >
    <input
      autocapitalize="on"
      type="text"
      id="input-config-name"
      ref="configNameInput"
      v-model="configPrintDialog.props.name"
      placeholder="Name"
    />
    <label for="input-config-name"
      >Although the configuration name can be any string, even an already used
      one, I won't be the one who struggles with recognising one configuration
      from another.</label
    >
    <textarea
      placeholder="Description"
      id="input-config-description"
      v-model="configPrintDialog.props.description"
    />
    <label for="input-config-description">Description is not required.</label>
    <template #action-buttons>
      <button title="Cancel" @click="configPrintDialog.cancel()">
        <Icon side icon-id="close-circle-outline" />Cancel
      </button>
      <button
        title="Save current configuration"
        @click="configPrintDialog.confirm()"
      >
        <Icon side icon-id="content-save-outline" />Save
      </button>
    </template>
  </Modal>

  <!-- Confirm -->
  <Modal
    id="confirm"
    title="Confirm"
    :open="confirmDialog.props.open"
    @open="escapeManager.addLayer(confirmDialog.cancel)"
    @close="escapeManager.removeLayer()"
  >
    <p class="message">{{ confirmDialog.props.message }}</p>
    <template #action-buttons>
      <button @click="confirmDialog.cancel()" title="Cancel">
        <Icon side icon-id="close-circle-outline" />{{
          confirmDialog.props.cancelText
        }}
      </button>
      <button @click="confirmDialog.confirm()" title="Confirm">
        <Icon side icon-id="check-circle-outline" />{{
          confirmDialog.props.confirmText
        }}
      </button>
    </template>
  </Modal>

  <!-- Toast stack -->
  <ToastStack
    :toasts="toasts"
    @toast-dismiss="toastManager.hideToastId($event.id)"
  />
</template>

<style lang="scss">
@import "./partials/mixins";
@import "./partials/transitions";

#skip-to-navigation {
  box-shadow: var(--box-shadow);
  position: fixed;
  z-index: var(--z-index-splashscreen);
  top: 0;
  left: 0;
  display: none;
  border-radius: 0 0 var(--border-radius) 0;
  padding: var(--spacing-small);
  background-color: var(--color-primary-surface-top);
  border: var(--color-primary-accent);
  border-style: solid;
  border-width: 0 var(--border-width) var(--border-width) 0;

  &:focus,
  &:active {
    display: block;
  }
}

#game-area {
  @include flex-center;
  @include stretch;
  flex-direction: column;
}

#boards-area {
  @include flex-center;
  width: 100%;
  flex-grow: 1;
  padding: var(--spacing-small) 0;

  .board-container {
    padding: 0 var(--spacing-small);
  }
}

.captured-pieces-placeholder {
  height: 40px;
}

.primary-buttons {
  @include no-shrink;
  @include flex-center;
  margin: var(--spacing-medium);
  width: 100%;

  #action-button {
    z-index: var(--z-index-top-fragment);
  }
}

#action-icon {
  transition: transform var(--transition-duration-medium)
    var(--transition-timing-jump);

  &.close {
    transform: rotate(-45deg);
  }
}

.action-buttons-drawer {
  button {
    margin: var(--spacing-medium) var(--spacing-medium) var(--spacing-medium) 0;
  }
}

#about {
  break-inside: avoid;
  text-align: left;
  column-span: all;
  line-height: 30px;
  margin: 0;
}
</style>
