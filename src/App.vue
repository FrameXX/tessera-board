<script lang="ts" setup>
import moveAudioEffectUrl from "./assets/audio/move.ogg";
import removeAudioEffectUrl from "./assets/audio/remove.ogg";

// Import from packages
import { ref, reactive, onMounted, watch, computed, provide, Ref } from "vue";
import { Howl } from "howler";

// Import user data
import SelectUserData from "./modules/user_data/select_user_data";
import BooleanUserData from "./modules/user_data/boolean_user_data";
import UserDataManager from "./modules/user_data_manager";
import HueData from "./modules/user_data/hue";
import PieceIconPackData from "./modules/user_data/piece_set";
import BoardStateData from "./modules/user_data/board_state";
import PiecePaddingData from "./modules/user_data/piece_padding";
import PieceBorderData from "./modules/user_data/piece_border";
import TransitionDurationData from "./modules/user_data/transition_duration";
import CellIndexOpacityData from "./modules/user_data/cell_index_opacity";
import PlayerColorOptionData from "./modules/user_data/preferred_player_color";
import RequireMoveConfirmData from "./modules/user_data/require_move_confirm";
import CapturedPiecesData from "./modules/user_data/captured_pieces";
import NumberUserData from "./modules/user_data/number_user_data";
import GamePausedData from "./modules/user_data/game_paused";
import RawBoardStateData from "./modules/user_data/raw_board_state";
import MoveListData from "./modules/user_data/move_list";
import defaultUserDataValues from "./modules/user_data/default_user_data_values";

// Import other classes and functions
import ToastManager, { type ToastProps } from "./modules/toast_manager";
import ThemeManager, { isTheme } from "./modules/theme_manager";
import TransitionsManager, {
  isTransitions,
} from "./modules/transitions_manager";
import ConfirmDialog from "./modules/dialogs/confirm";
import DefaultBoardManager from "./modules/default_board_manager";
import GameBoardManager from "./modules/game_board_manager";
import ConfigPieceDialog from "./modules/dialogs/config_piece";
import SelectPieceDilog from "./modules/dialogs/select_piece";
import { PIECE_IDS, PiecesImportance, type Path } from "./modules/pieces/piece";
import {
  setSaturationMultiplier,
  hideSplashscreen,
  updatePieceColors,
} from "./modules/utils/elements";
import ConfigInventory from "./modules/config_inventory";
import ConfigManager from "./modules/config_manager";
import ConfigPrintDialog from "./modules/dialogs/config_print";
import { PREDEFINED_DEFAULT_BOARD_CONFIGS } from "./modules/predefined_configs";
import Game, {
  isPlayerColor,
  isSecondsPerMovePenalty,
  type PlayerColor,
  type GameOverReason,
  isGameOverReason,
  getAllPieceProps,
} from "./modules/game";
import { getPixelsPerCm, isEven } from "./modules/utils/misc";
import DurationDialog from "./modules/dialogs/duration";
import InteractionManager from "./modules/interaction_manager";
import { RawPiece } from "./modules/pieces/raw_piece";
import {
  BoardPosition,
  BoardStateValue,
  MarkBoardState,
} from "./modules/board_manager";
import Move from "./modules/moves/move";

// Import components
import Board from "./components/Board.vue";
import Icon from "./components/Icon.vue";
import Settings from "./components/Settings.vue";
import UserOption from "./components/UserOption.vue";
import Modal from "./components/Modal.vue";
import ToastStack from "./components/ToastStack.vue";
import ConfigItem from "./components/ConfigItem.vue";
import ConfigsDialog from "./modules/dialogs/configs";
import ActionPanel from "./components/ActionPanel.vue";
import Status from "./components/Status.vue";
import SelectPiece from "./components/SelectPiece.vue";
import About from "./components/About.vue";
import FragmentTitle from "./components/FragmentTitle.vue";
import InfoCard from "./components/InfoCard.vue";

const pixelsPerCm = getPixelsPerCm();
provide("pixelsPerCm", pixelsPerCm);

// UI refs are temporary. They are not part of any user data and won't be restored after load.
const pieceMoveAudioEffect = new Howl({ src: [moveAudioEffectUrl] });
const pieceRemoveAudioEffect = new Howl({ src: [removeAudioEffectUrl] });
const settingsOpen = ref(false);
const aboutOpen = ref(false);
const actionPanelOpen = ref(false);
const toasts = ref<ToastProps[]>([]);
const configNameInput = ref<HTMLElement | null>(null);
const minutesDurationInput = ref<HTMLElement | null>(null);
const configsNameFilter = ref("");
const filteredConfigsPrints = computed(() => {
  return configsDialog.props.configsPrints.filter((print) =>
    print.name.toLowerCase().includes(configsNameFilter.value.toLowerCase())
  );
});
const playerCellsMarks: MarkBoardState = reactive(
  Array(8)
    .fill(null)
    .map(() => new Array(8).fill(null))
);
const opponentCellsMarks: MarkBoardState = reactive(
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
  let color: PlayerColor =
    (isEven(lastMoveIndex.value) &&
      preferredFirstMoveColor.value === "black") ||
    (!isEven(lastMoveIndex.value) && preferredFirstMoveColor.value === "white")
      ? "white"
      : "black";
  return color;
});
const playerSecondsPerMoveSet = computed(() => {
  return playerSecondsPerMove.value !== 0;
});
const opponentSecondsPerMoveSet = computed(() => {
  return opponentSecondsPerMove.value !== 0;
});
const playerSecondsPerMatchSet = computed(() => {
  return playerSecondsPerMatch.value !== 0;
});
const opponentSecondsPerMatchSet = computed(() => {
  return opponentSecondsPerMatch.value !== 0;
});
const playerSelectedPieces = ref<BoardPosition[]>([]);
const opponentSelectedPieces = ref<BoardPosition[]>([]);
const playerSelectedCells = ref<BoardPosition[]>([]);
const opponentSelectedCells = ref<BoardPosition[]>([]);
const playerDraggingOverCells = ref<BoardPosition[]>([]);
const opponentDraggingOverCells = ref<BoardPosition[]>([]);
const defaultDraggingOverCells = ref<BoardPosition[]>([]);

// User data refs
// Simple values
const theme = ref(defaultUserDataValues.theme);
provide("theme", theme);
const transitions = ref(defaultUserDataValues.transitions);
provide("transitions", transitions);
const playerHue = ref(defaultUserDataValues.playerHue);
provide("playerHue", playerHue);
const opponentHue = ref(defaultUserDataValues.opponentHue);
provide("opponentHue", opponentHue);
const pieceIconPack = ref(defaultUserDataValues.pieceIconPack);
provide("pieceIconPack", pieceIconPack);
const piecePadding = ref(defaultUserDataValues.piecePadding);
provide("piecePadding", piecePadding);
const pieceBorder = ref(defaultUserDataValues.pieceBorder);
provide("pieceBorder", pieceBorder);
const transitionDuration = ref(defaultUserDataValues.transitionDuration);
provide("transitionDuration", transitionDuration);
const cellIndexOpacity = ref(defaultUserDataValues.cellIndexOpacity);
provide("cellIndexOpacity", cellIndexOpacity);
const preferredPlayerColor = ref(defaultUserDataValues.preferredPlayerColor);
provide("preferredPlayerColor", preferredPlayerColor);
const secondCheckboardEnabled = ref(
  defaultUserDataValues.secondCheckboardEnabled
);
provide("secondCheckboard", secondCheckboardEnabled);
const tableMode = ref(defaultUserDataValues.tableMode);
provide("tableMode", tableMode);
const requireMoveConfirm = ref(defaultUserDataValues.requireMoveConfirm);
provide("requireMoveConfirm", requireMoveConfirm);
const audioEffectsEnabled = ref(defaultUserDataValues.audioEffectsEnabled);
provide("audioEffectsEnabled", audioEffectsEnabled);
const showCapturingPieces = ref(defaultUserDataValues.showCapturingPieces);
provide("showCapturingPieces", showCapturingPieces);
const reviveFromCapturedPieces = ref(
  defaultUserDataValues.reviveFromCapturedPieces
);
provide("reviveFromCapturedPieces", reviveFromCapturedPieces);
const playerSecondsPerMove = ref(defaultUserDataValues.playerSecondsPerMove);
provide("playerSecondsPerMove", playerSecondsPerMove);
const opponentSecondsPerMove = ref(
  defaultUserDataValues.opponentSecondsPerMove
);
provide("opponentSecondsPerMove", opponentSecondsPerMove);
const playerSecondsPerMatch = ref(defaultUserDataValues.playerSecondsPerMatch);
provide("playerSecondsPerMatch", playerSecondsPerMatch);
const opponentSecondsPerMatch = ref(
  defaultUserDataValues.opponentSecondsPerMatch
);
provide("opponentSecondsPerMatch", opponentSecondsPerMatch);
const showOtherAvailibleMoves = ref(
  defaultUserDataValues.showOtherAvailibleMoves
);
provide("showOtherAvailibleMoves", showOtherAvailibleMoves);
const secondsPerMovePenalty = ref(defaultUserDataValues.secondsPerMovePenalty);
provide("secondsPerMovePenalty", secondsPerMovePenalty);
const preferredFirstMoveColor = ref(
  defaultUserDataValues.preferredFirstMoveColor
);
provide("preferredFirstMoveColor", preferredFirstMoveColor);
const vibrationsEnabled = ref(defaultUserDataValues.vibrationsEnabled);
provide("vibrationsEnabled", vibrationsEnabled);
const pieceLongPressTimeout = ref(defaultUserDataValues.pieceLongPressTimeout);
provide("pieceLongPressTimeout", pieceLongPressTimeout);
const autoPauseGame = ref(defaultUserDataValues.autoPauseGame);
provide("autoPauseGame", autoPauseGame);
const pawnImportance = ref(defaultUserDataValues.pawnImportance);
provide("pawnImportance", pawnImportance);
const knightImportance = ref(defaultUserDataValues.kingImportance);
provide("knightImportance", knightImportance);
const bishopImportance = ref(defaultUserDataValues.bishopImportance);
provide("bishopImportance", bishopImportance);
const rookImportance = ref(defaultUserDataValues.bishopImportance);
provide("rookImportance", rookImportance);
const queenImportance = ref(defaultUserDataValues.rookImportance);
provide("queenImportance", queenImportance);
const kingImportance = ref(defaultUserDataValues.kingImportance);
provide("kingImportance", kingImportance);
const ignorePiecesGuardedProperty = ref(
  defaultUserDataValues.ignorePiecesGuardedProperty
);
provide("ignorePiecesGuardedProperty", ignorePiecesGuardedProperty);
const moveList = ref(defaultUserDataValues.moveList) as Ref<Move[]>;

const gameOverReason = ref<GameOverReason>(
  defaultUserDataValues.gameOverReason
);
const lastMoveIndex = ref(defaultUserDataValues.lastMoveIndex);
const firstMoveColor = ref<PlayerColor>(defaultUserDataValues.firstMoveColor);
const playerColor = ref(defaultUserDataValues.playerColor);
const gamePaused = ref(defaultUserDataValues.gamePaused);
const whiteCapturedPieces = ref(defaultUserDataValues.whiteCapturedPieces);
const blackCapturedPieces = ref(defaultUserDataValues.blackCapturedPieces);
const playerMoveSeconds = ref(0);
const opponentMoveSeconds = ref(0);
const playerMatchSeconds = ref(0);
const opponentMatchSeconds = ref(0);
const playerRemainingMoveSeconds = computed(() => {
  return playerSecondsPerMove.value - playerMoveSeconds.value;
});
const opponentRemainingMoveSeconds = computed(() => {
  return opponentSecondsPerMove.value - opponentMoveSeconds.value;
});
const playerRemainingMatchSeconds = computed(() => {
  return playerSecondsPerMatch.value - playerMatchSeconds.value;
});
const opponentRemainingMatchSeconds = computed(() => {
  return opponentSecondsPerMatch.value - opponentMatchSeconds.value;
});

// Complex values (reactive)
const defaultBoardState: BoardStateValue = reactive(
  defaultUserDataValues.defaultBoardState
);
const gameBoardState: BoardStateValue = reactive(
  defaultUserDataValues.gameBoardState
);

const durationDialog = new DurationDialog();
provide("durationDialog", durationDialog);
const confirmDialog = new ConfirmDialog();
provide("confirmDialog", confirmDialog);
const configPieceDialog = new ConfigPieceDialog();
provide("configPieceDialog", configPieceDialog);
const toastManager = new ToastManager(toasts);
provide("toastManager", toastManager);
const selectPieceDialog = new SelectPieceDilog(toastManager);
provide("selectPieceDialog", selectPieceDialog);
const configPrintDialog = new ConfigPrintDialog(toastManager);
provide("configPrintDialog", configPrintDialog);
const configsDialog = new ConfigsDialog(
  confirmDialog,
  configPrintDialog,
  toastManager
);
provide("configsDialog", configsDialog);

// @ts-ignore
const themeManger = new ThemeManager(theme);
const transitionsManager = new TransitionsManager(transitions);

// Data
const defaultBoardStateData = new RawBoardStateData(
  defaultUserDataValues.defaultBoardState,
  defaultBoardState,
  toastManager
);
const gameBoardStateData = new BoardStateData(
  defaultUserDataValues.gameBoardState,
  gameBoardState,
  toastManager,
  false
);
const moveListData = new MoveListData(
  "move_list",
  defaultUserDataValues.moveList,
  moveList,
  toastManager
);
const lastMoveIndexData = new NumberUserData(
  "move_index",
  defaultUserDataValues.lastMoveIndex,
  toastManager,
  lastMoveIndex,
  undefined,
  undefined,
  false
);

// NOTE: Most of the UserData instances use Ref but some of them may use reactive if their value is more complex. These classes are extending ComplexUserData class.
const userDataManager = new UserDataManager(
  [
    new BooleanUserData(
      "vibrations_enabled",
      defaultUserDataValues.vibrationsEnabled,
      toastManager,
      vibrationsEnabled
    ),
    new BooleanUserData(
      "auto_pause",
      defaultUserDataValues.autoPauseGame,
      toastManager,
      autoPauseGame
    ),
    new HueData(
      defaultUserDataValues.playerHue,
      playerHue,
      false,
      toastManager
    ),
    new HueData(
      defaultUserDataValues.opponentHue,
      opponentHue,
      true,
      toastManager
    ),
    new PieceIconPackData(
      defaultUserDataValues.pieceIconPack,
      pieceIconPack,
      toastManager
    ),
    new PiecePaddingData(
      defaultUserDataValues.piecePadding,
      piecePadding,
      toastManager
    ),
    new PieceBorderData(
      defaultUserDataValues.pieceBorder,
      pieceBorder,
      toastManager
    ),
    new TransitionDurationData(
      defaultUserDataValues.transitionDuration,
      transitionDuration,
      toastManager
    ),
    new CellIndexOpacityData(
      defaultUserDataValues.cellIndexOpacity,
      cellIndexOpacity,
      toastManager
    ),
    new PlayerColorOptionData(
      "preferred_player_color",
      defaultUserDataValues.preferredPlayerColor,
      preferredPlayerColor,
      toastManager
    ),
    new PlayerColorOptionData(
      "preferred_first_move_color",
      defaultUserDataValues.preferredFirstMoveColor,
      preferredFirstMoveColor,
      toastManager
    ),
    new BooleanUserData(
      "show_capturing_pieces",
      defaultUserDataValues.showCapturingPieces,
      toastManager,
      showCapturingPieces
    ),
    new BooleanUserData(
      "second_checkboard",
      defaultUserDataValues.secondCheckboardEnabled,
      toastManager,
      secondCheckboardEnabled
    ),
    new NumberUserData(
      "piece_long_press_timeout",
      defaultUserDataValues.pieceLongPressTimeout,
      toastManager,
      pieceLongPressTimeout,
      0,
      600
    ),
    new BooleanUserData(
      "table_mode",
      defaultUserDataValues.tableMode,
      toastManager,
      tableMode
    ),
    new BooleanUserData(
      "ignore_pieces_guarded_property",
      defaultUserDataValues.ignorePiecesGuardedProperty,
      toastManager,
      ignorePiecesGuardedProperty
    ),
    new RequireMoveConfirmData(
      defaultUserDataValues.requireMoveConfirm,
      requireMoveConfirm,
      toastManager
    ),
    new SelectUserData(
      "player_color",
      defaultUserDataValues.playerColor,
      isPlayerColor,
      toastManager,
      playerColor
    ),
    new SelectUserData(
      "theme",
      defaultUserDataValues.theme,
      isTheme,
      toastManager,
      theme
    ),
    new SelectUserData(
      "transitions_enabled",
      defaultUserDataValues.transitions,
      isTransitions,
      toastManager,
      transitions
    ),
    new SelectUserData(
      "game_over_reason",
      defaultUserDataValues.gameOverReason,
      isGameOverReason,
      toastManager,
      gameOverReason
    ),
    new SelectUserData(
      "seconds_per_move_runout_punishment",
      "random_move",
      isSecondsPerMovePenalty,
      toastManager,
      secondsPerMovePenalty
    ),
    new GamePausedData(
      defaultUserDataValues.gamePaused,
      toastManager,
      gamePaused
    ),
    new BooleanUserData(
      "revive_from_captured_pieces",
      defaultUserDataValues.reviveFromCapturedPieces,
      toastManager,
      reviveFromCapturedPieces
    ),
    new BooleanUserData(
      "audio_effects_enabled",
      defaultUserDataValues.audioEffectsEnabled,
      toastManager,
      audioEffectsEnabled
    ),
    new CapturedPiecesData(
      defaultUserDataValues.whiteCapturedPieces,
      whiteCapturedPieces,
      "white",
      toastManager
    ),
    new CapturedPiecesData(
      defaultUserDataValues.blackCapturedPieces,
      blackCapturedPieces,
      "black",
      toastManager
    ),
    lastMoveIndexData,
    new NumberUserData(
      "player_seconds_per_move",
      defaultUserDataValues.playerSecondsPerMove,
      toastManager,
      playerSecondsPerMove
    ),
    new NumberUserData(
      "opponent_seconds_per_move",
      defaultUserDataValues.opponentSecondsPerMove,
      toastManager,
      opponentSecondsPerMove
    ),
    new NumberUserData(
      "player_seconds_per_match",
      defaultUserDataValues.playerSecondsPerMatch,
      toastManager,
      playerSecondsPerMatch
    ),
    new NumberUserData(
      "opponent_seconds_per_match",
      defaultUserDataValues.opponentSecondsPerMatch,
      toastManager,
      opponentSecondsPerMatch
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
    new NumberUserData(
      "pawn_importance",
      defaultUserDataValues.pawnImportance,
      toastManager,
      pawnImportance
    ),
    new NumberUserData(
      "knight_importance",
      defaultUserDataValues.knightImportance,
      toastManager,
      knightImportance
    ),
    new NumberUserData(
      "bishop_importance",
      defaultUserDataValues.bishopImportance,
      toastManager,
      bishopImportance
    ),
    new NumberUserData(
      "rook_importance",
      defaultUserDataValues.rookImportance,
      toastManager,
      rookImportance
    ),
    new NumberUserData(
      "queen_importance",
      defaultUserDataValues.queenImportance,
      toastManager,
      queenImportance
    ),
    new NumberUserData(
      "king_importance",
      defaultUserDataValues.kingImportance,
      toastManager,
      kingImportance
    ),
    new NumberUserData(
      "knight_importance",
      defaultUserDataValues.knightImportance,
      toastManager,
      knightImportance
    ),
    new BooleanUserData(
      "show_other_availible_moves",
      defaultUserDataValues.showOtherAvailibleMoves,
      toastManager,
      showOtherAvailibleMoves
    ),
    defaultBoardStateData,
    gameBoardStateData,
    moveListData,
  ],
  confirmDialog,
  toastManager
);

const lastMove = computed(() => {
  if (lastMoveIndex.value === -1) {
    return null;
  }
  return moveList.value[lastMoveIndex.value];
});
const highlightedCells = computed(() => {
  if (!lastMove.value) {
    return [];
  }
  return lastMove.value.highlightedBoardPositions;
});

const screenRotated = computed(() => {
  let rotated: boolean;
  if (!tableMode.value) {
    return false;
  }
  rotated = playingColor.value === "black";
  return rotated;
});

const playerBoardContentRotated = computed(() => {
  if (!secondCheckboardEnabled.value) {
    return screenRotated.value;
  }
  if (!tableMode.value) {
    return playerColor.value === "black";
  }
  return playerColor.value === "black";
});

const opponentBoardContentRotated = computed(() => {
  if (!secondCheckboardEnabled.value) {
    return !screenRotated.value;
  }
  if (!tableMode.value) {
    return playerColor.value === "white";
  }
  return playerColor.value === "white";
});

const playerBoardRotated = computed(() => {
  if (tableMode.value || !secondCheckboardEnabled.value) {
    return false;
  }
  return playerColor.value === "black";
});

const opponentBoardRotated = computed(() => {
  if (tableMode.value) {
    return false;
  }
  return playerColor.value === "white";
});

/**
 * All pieces are extracted from the boardStateValue 2D array into a list of objects with row and col attached. They are simpler too loop through and therefore also simpler to render using v-for in this form. They are sorted according to their unique id so, Vue transitions them smoothly as they appear and disappear from the checkboard.
 */
const gamePieceProps = computed(() => {
  return getAllPieceProps(gameBoardState);
});

const defaultPieceProps = computed(() => {
  return getAllPieceProps(defaultBoardState);
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

const defaultBoardManager = new DefaultBoardManager(
  defaultBoardState,
  configPieceDialog,
  defaultDraggingOverCells,
  audioEffectsEnabled,
  pieceMoveAudioEffect,
  pieceRemoveAudioEffect,
  vibrationsEnabled
);

const whiteCapturingPaths = ref<Path[]>([]);
const blackCapturingPaths = ref<Path[]>([]);

const piecesImportance: PiecesImportance = {
  rook: rookImportance,
  knight: knightImportance,
  bishop: bishopImportance,
  pawn: pawnImportance,
  queen: queenImportance,
  king: kingImportance,
};

const game = new Game(
  gamePaused,
  gameBoardStateData,
  gameBoardState,
  gamePieceProps,
  whiteCapturingPaths,
  blackCapturingPaths,
  defaultBoardStateData,
  playerColor,
  firstMoveColor,
  preferredFirstMoveColor,
  preferredPlayerColor,
  playerSecondsPerMove,
  opponentSecondsPerMove,
  playerSecondsPerMatch,
  opponentSecondsPerMatch,
  playerMoveSeconds,
  opponentMoveSeconds,
  playerMatchSeconds,
  opponentMatchSeconds,
  secondsPerMovePenalty,
  gameOverReason,
  piecesImportance,
  blackCapturedPieces,
  whiteCapturedPieces,
  reviveFromCapturedPieces,
  lastMoveIndex,
  lastMoveIndexData,
  moveList,
  moveListData,
  lastMove,
  selectPieceDialog,
  audioEffectsEnabled,
  pieceMoveAudioEffect,
  pieceRemoveAudioEffect,
  vibrationsEnabled,
  ignorePiecesGuardedProperty,
  confirmDialog,
  toastManager
);

const playerBoardManager = new GameBoardManager(
  game,
  whiteCapturingPaths,
  blackCapturingPaths,
  playerColor,
  game.winner,
  secondCheckboardEnabled,
  true,
  playingColor,
  gameBoardState,
  gameBoardStateData,
  whiteCapturedPieces,
  blackCapturedPieces,
  playerCellsMarks,
  playerSelectedPieces,
  playerSelectedCells,
  playerDraggingOverCells,
  showCapturingPieces,
  reviveFromCapturedPieces,
  showOtherAvailibleMoves,
  ignorePiecesGuardedProperty,
  piecesImportance,
  lastMove
);

const opponentBoardManager = new GameBoardManager(
  game,
  whiteCapturingPaths,
  blackCapturingPaths,
  playerColor,
  game.winner,
  secondCheckboardEnabled,
  false,
  playingColor,
  gameBoardState,
  gameBoardStateData,
  whiteCapturedPieces,
  blackCapturedPieces,
  opponentCellsMarks,
  opponentSelectedPieces,
  opponentSelectedCells,
  opponentDraggingOverCells,
  showCapturingPieces,
  reviveFromCapturedPieces,
  showOtherAvailibleMoves,
  ignorePiecesGuardedProperty,
  piecesImportance,
  lastMove
);

const interactionManager = new InteractionManager(
  toastManager,
  userDataManager,
  game,
  confirmDialog,
  actionPanelOpen,
  settingsOpen,
  aboutOpen,
  gamePaused,
  autoPauseGame
);

watch(screenRotated, (newValue) => {
  interactionManager.updateScreenRotation(newValue);
});
watch(game.playerPlaying, (newValue) => {
  interactionManager.updatePrimaryHue(newValue, game.winner.value);
});
watch(game.winner, (newValue) => {
  interactionManager.updatePrimaryHue(game.playerPlaying.value, newValue);
});
watch(playerColor, (newValue) => {
  updatePieceColors(newValue);
});

const visited = localStorage.getItem("tessera_board-visited");
if (visited === null) {
  localStorage.setItem("tessera_board-visited", "1");
} else {
  interactionManager.tryRecoverData();
}
userDataManager.onRecoverCheck();
userDataManager.applyData();
userDataManager.updateReferences();

onMounted(() => {
  // Sets CSS Saturation variables from 0 to their appropriate user configured values
  setSaturationMultiplier(1);
  interactionManager.updatePrimaryHue(
    game.playerPlaying.value,
    game.winner.value
  );

  addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") interactionManager.escapeManager.escape();
    if (event.key === "R" && event.shiftKey) game.restart();
    if (event.key === "C" && event.shiftKey) {
      interactionManager.toggleActionsPanel();
      if (actionPanelOpen.value) {
        interactionManager.toggleSettings();
      }
    }
  });

  addEventListener("visibilitychange", () => {
    interactionManager.onDistractionChange();
  });

  // Let the app wait another 600ms to make sure its fully loaded.
  setTimeout(() => {
    if (visited === null) {
      game.restart();
    } else {
      game.restore();
    }
    hideSplashscreen(
      transitionsManager.getApplyedTransitions(transitions.value)
    );
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
      :player-seconds-per-move-set="playerSecondsPerMoveSet"
      :player-seconds-per-match-set="playerSecondsPerMatchSet"
      :opponent-seconds-per-move-set="opponentSecondsPerMoveSet"
      :opponent-seconds-per-match-set="opponentSecondsPerMatchSet"
      :player-playing="game.playerPlaying.value"
      :last-move-index="lastMoveIndex"
      :status-text="game.status.value"
      :winner="game.winner.value"
    />
    <div class="captured-pieces-placeholder"></div>
    <div id="boards-area" :class="{ rotated: screenRotated }">
      <Board
        :selected-pieces="playerSelectedPieces"
        :selected-cells="playerSelectedCells"
        :highlighted-cells="highlightedCells"
        :dragging-over-cells="playerDraggingOverCells"
        :marks-state="playerCellsMarks"
        :content-rotated="playerBoardContentRotated"
        :rotated="playerBoardRotated"
        :manager="playerBoardManager"
        :state="gameBoardState"
        :piece-set="pieceIconPack"
        :piece-padding="piecePadding"
        :piece-border="pieceBorder"
        :white-captured-pieces="whiteCapturedPieces"
        :black-captured-pieces="blackCapturedPieces"
        primary
        :all-piece-props="gamePieceProps"
        id="player-board"
      />
      <Board
        v-if="secondCheckboardEnabled"
        :selected-pieces="opponentSelectedPieces"
        :selected-cells="opponentSelectedCells"
        :highlighted-cells="highlightedCells"
        :dragging-over-cells="opponentDraggingOverCells"
        :marks-state="opponentCellsMarks"
        :content-rotated="opponentBoardContentRotated"
        :rotated="opponentBoardRotated"
        :manager="opponentBoardManager"
        :state="gameBoardState"
        :piece-set="pieceIconPack"
        :piece-padding="piecePadding"
        :piece-border="pieceBorder"
        :white-captured-pieces="whiteCapturedPieces"
        :black-captured-pieces="blackCapturedPieces"
        primary
        :all-piece-props="gamePieceProps"
        id="opponent-board"
      />
      <Transition name="slide-side">
        <div id="game-paused" v-show="gamePaused === 'manual'">
          <div class="content">
            <FragmentTitle icon-id="pause">Game paused</FragmentTitle>
            <button @click="gamePaused = 'not'">
              <Icon icon-id="play-outline" side />
              Resume game
            </button>
          </div>
        </div>
      </Transition>
    </div>
    <div class="captured-pieces-placeholder"></div>
  </div>

  <!-- Fixed -->
  <ActionPanel
    @about-game="interactionManager.toggleAbout()"
    @backdrop-click="interactionManager.toggleActionsPanel()"
    @configure-game="interactionManager.toggleSettings()"
    @restart-game="interactionManager.onGameRestart()"
    @pause="interactionManager.manuallyTogglePause()"
    @resign="game.resign()"
    :open="actionPanelOpen"
    :status-text="game.status.value"
    :game-paused="gamePaused"
  />

  <Settings
    :open="settingsOpen"
    :default-board-config-manager="defaultBoardConfigManager"
    :default-board-manager="defaultBoardManager"
    :default-board-state="defaultBoardState"
    :user-data-manager="userDataManager"
    :default-dragging-over-cells="defaultDraggingOverCells"
    :default-board-all-piece-props="defaultPieceProps"
  />
  <About :open="aboutOpen" />

  <!-- Relative -->
  <!-- Primary buttons -->
  <div class="primary-buttons">
    <Transition name="counter">
      <button
        @click="game.reverseMove()"
        aria-label="Previous move"
        title="Previous move"
      >
        <Icon icon-id="arrow-left"></Icon>
      </button>
    </Transition>
    <Transition name="counter">
      <button aria-label="Cancel move" title="Cancel move" v-show="false">
        <Icon icon-id="close"></Icon>
      </button>
    </Transition>
    <button
      id="action-button"
      @click="interactionManager.toggleActionsPanel"
      aria-label="Actions"
      title="Actions"
    >
      <Icon
        icon-id="plus"
        id="action-icon"
        :class="{ close: actionPanelOpen }"
        side
      />
      Actions
    </button>
    <Transition name="counter">
      <button
        @click="game.forwardMove()"
        aria-label="Next move"
        title="Next move"
      >
        <Icon icon-id="arrow-right"></Icon>
      </button>
    </Transition>
    <Transition name="counter">
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
    title-icon-id="arrow-up-bold-box-outline"
    :open="selectPieceDialog.props.open"
    @open="interactionManager.escapeManager.addLayer(selectPieceDialog.cancel)"
    @close="interactionManager.escapeManager.removeLayer()"
  >
    <SelectPiece
      :pieces="selectPieceDialog.props.pieceOptions"
      :piece-icon-pack="pieceIconPack"
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
    title-icon-id="plus"
    :open="configPieceDialog.props.open"
    @open="interactionManager.escapeManager.addLayer(configPieceDialog.cancel)"
    @close="interactionManager.escapeManager.removeLayer()"
    @backdrop-click="configPieceDialog.cancel()"
  >
    <SelectPiece
      :pieces="configPieceSelectOptions"
      :piece-icon-pack="pieceIconPack"
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
    title-icon-id="folder-outline"
    :open="configsDialog.props.open"
    @open="interactionManager.escapeManager.addLayer(configsDialog.cancel)"
    @close="interactionManager.escapeManager.removeLayer()"
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
        <Icon side icon-id="folder-plus-outline" />New config
      </button>
    </template>
  </Modal>

  <!-- New Configuration -->
  <Modal
    id="config-print"
    title="Set configuration name and description"
    :open="configPrintDialog.props.open"
    :focus-on-open="configNameInput"
    title-icon-id="folder-plus-outline"
    @open="interactionManager.escapeManager.addLayer(configPrintDialog.cancel)"
    @close="interactionManager.escapeManager.removeLayer()"
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

  <!-- Duration input -->
  <Modal
    id="duration-input"
    title="Enter time duration"
    title-icon-id="clock-outline"
    :open="durationDialog.props.open"
    :focus-on-open="minutesDurationInput"
    @open="interactionManager.escapeManager.addLayer(durationDialog.cancel)"
    @close="interactionManager.escapeManager.removeLayer()"
    @backdrop-click="durationDialog.cancel"
  >
    <div class="duration-inputs">
      <input
        placeholder="min"
        class="minutes"
        title="Enter duration minutes"
        min="0"
        type="number"
        ref="minutesDurationInput"
        v-model="durationDialog.props.minutes"
      />:<input
        placeholder="sec"
        class="seconds"
        title="Enter duration seconds"
        min="0"
        max="59"
        type="number"
        v-model="durationDialog.props.seconds"
      />
    </div>
    <template #action-buttons>
      <button @click="durationDialog.disable()" title="Cancel">
        <Icon side icon-id="cancel" />Disable
      </button>
      <button @click="durationDialog.cancel()" title="Cancel">
        <Icon side icon-id="close-circle-outline" />Cancel
      </button>
      <button @click="durationDialog.confirm()" title="Confirm">
        <Icon side icon-id="check-circle-outline" />Confirm
      </button>
    </template>
  </Modal>

  <!-- Confirm -->
  <Modal
    id="confirm"
    title="Confirm"
    :open="confirmDialog.props.open"
    title-icon-id="check-all"
    @open="interactionManager.escapeManager.addLayer(confirmDialog.cancel)"
    @close="interactionManager.escapeManager.removeLayer()"
  >
    <p class="message">{{ confirmDialog.props.message }}</p>
    <InfoCard v-show="confirmDialog.props.showHint">{{
      confirmDialog.props.hint
    }}</InfoCard>
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
  position: relative;
  width: 100%;
  flex-grow: 1;
  padding: var(--spacing-small) 0;

  &.column {
    flex-direction: column;
  }

  &.rotated {
    rotate: -0.5turn;
  }
}

#game-paused {
  @include centered;
  @include flex-center;
  margin: auto;
  z-index: var(--z-index-top-fragment);
  flex-direction: column;
  position: absolute;
  text-align: center;
  background-color: var(--color-primary-surface);

  .fragment-title {
    justify-content: center;
  }

  h2 {
    flex-grow: 0;
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

.nav-placeholder {
  height: 90px;
}
</style>
./modules/pieces/raw_piece
