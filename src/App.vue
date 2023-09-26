<script setup lang="ts">
// Import from packages
import { ref, reactive, onMounted, watch } from "vue";
import { Howl } from "howler";

// Import user data
import { BooleanUserData, SelectUserData } from "./modules/user_data/user_data";
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
import PreferredPlayerColorData, {
  type PreferredPlayerColorValue,
} from "./modules/user_data/preferred_player_color";
import OpponentOverLanData from "./modules/user_data/opponent_over_lan";
import SecondCheckboardData from "./modules/user_data/second_checkboard";
import RotateScreenData from "./modules/user_data/rotate_screen";
import RequireMoveConfirmData from "./modules/user_data/require_move_confirm";
import CapturedPiecesData from "./modules/user_data/captured_pieces";

// Import other classes and functions
import ToastManager, { type ToastProps } from "./modules/toast_manager";
import SplashscreenManager from "./modules/splashscreen_manager";
import ThemeManager from "./modules/theme_manager";
import TransitionsManager from "./modules/transitions_manager";
import ConfirmDialog from "./modules/confirm_dialog";
import DefaultBoardManager from "./modules/default_board_manager";
import GameBoardManager from "./modules/game_board_manager";
import ConfigPieceDialog from "./modules/config_piece_dialog";
import { type PlayerColor, isPlayerColor } from "./modules/pieces/piece_utils";
import { activateColors, setCSSVariable } from "./modules/utils/elements";
import ConfigInventory from "./modules/config_inventory";
import ConfigManager from "./modules/config_manager";
import type { MarkBoardState, BooleanBoardState } from "./components/Board.vue";
import ConfigPrintDialog from "./modules/config_print_dialog";
import { PREDEFINED_DEFAULT_BOARD_CONFIGS } from "./modules/predefined_configs";
import EscapeManager from "./modules/escape_manager";
import Game from "./modules/game";
import GenericBoardStateData from "./modules/user_data/generic_board_state";
import { PieceId } from "./modules/pieces/piece_utils";
import Bishop from "./modules/pieces/bishop";
import King from "./modules/pieces/king";
import Knight from "./modules/pieces/knight";
import Pawn from "./modules/pieces/pawn";
import Queen from "./modules/pieces/queen";
import Rook from "./modules/pieces/rook";

// Import components
import Board from "./components/Board.vue";
import Icon from "./components/Icon.vue";
import ConfigDrawer from "./components/ConfigDrawer.vue";
import Category from "./components/Category.vue";
import UserOption from "./components/UserOption.vue";
import Checkbox from "./components/Checkbox.vue";
import Modal from "./components/Modal.vue";
import ToastStack from "./components/ToastStack.vue";
import PieceIcon from "./components/PieceIcon.vue";
import ConfigItem from "./components/ConfigItem.vue";
import ConfigsDialog from "./modules/configs_dialog";
import ActionPanel from "./components/ActionPanel.vue";
import Timers from "./components/Timers.vue";

const moveAudioEffect = new Howl({ src: ["./assets/audio/move.ogg"] });

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
const DEFAULT_CELL_INDEX_OPACITY_VALUE = 80;
const DEFAULT_PLAYER_HUE_VALUE = 37;
const DEFAULT_OPPONENT_HUE_VALUE = 212;
const DEFAULT_OPPONENT_OVER_LAN_VALUE = false;
const DEFAULT_PIECE_BORDER_VALUE = 1.1;
const DEFAULT_PIECE_PADDING_VALUE = 6;
const DEFAULT_PIECE_SET_VALUE: PieceSetValue = "material_design";
const DEFAULT_PREFERRED_PLAYER_COLOR_VALUE: PreferredPlayerColorValue =
  "random";
const DEFAULT_REQUIRE_MOVE_CONFIRM_VALUE = false;
const DEFAULT_ROTATE_SCREEN_VALUE = false;
const DEFAULT_SECOND_CHECKBOARD_VALUE = false;
const DEFAULT_THEME_VALUE: ThemeValue = "auto";
const DEFAULT_TRANSITION_DURATION_VALUE = 100;
const DEFAULT_TRANSITIONS_VALUE: TransitionsValue = "auto";
const DEFAULT_PLAYER_COLOR_VALUE: PlayerColor = "white";
const DEFAULT_WHITE_CAPTURED_PIECES_VALUE: PieceId[] = [];
const DEFAULT_BLACK_CAPTURED_PIECES_VALUE: PieceId[] = [];
const DEFAULT_PLAYER_PLAYING_VALUE = true;
const DEFAULT_GAME_PAUSED_VALUE = false;
const DEFAULT_AUDIO_EFFECTS_VALUE = true;

// UI refs are temporary. They are not part of any user data and won't be restored after load.
const configDrawerOpen = ref(false);
const actionPanelOpen = ref(false);
const screenRotated = ref(false);
watch(screenRotated, (newValue) => {
  updateScreenRotation(newValue);
});
const toasts = ref<ToastProps[]>([]);
const configNameInput = ref<null | HTMLInputElement>(null);
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
const playerHighlightedPieces: BooleanBoardState = reactive(
  Array(8)
    .fill(null)
    .map(() => new Array(8).fill(false))
);
const opponentHighlightedPieces: BooleanBoardState = reactive(
  Array(8)
    .fill(null)
    .map(() => new Array(8).fill(false))
);
const highlightedCells: BooleanBoardState = reactive(
  Array(8)
    .fill(null)
    .map(() => new Array(8).fill(false))
);

// Other options refs
// Simple values (ref)
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

// Game specific
const playerColor = ref<PlayerColor>(DEFAULT_PLAYER_COLOR_VALUE);
const playerPlaying = ref(DEFAULT_PLAYER_PLAYING_VALUE);
const gamePaused = ref(DEFAULT_GAME_PAUSED_VALUE);
const whiteCapturedPieces = ref<PieceId[]>(DEFAULT_WHITE_CAPTURED_PIECES_VALUE);
const blackCapturedPieces = ref<PieceId[]>(DEFAULT_BLACK_CAPTURED_PIECES_VALUE);

// Complex values (reactive)
const defaultBoardState: BoardStateValue = reactive(
  DEFAULT_DEFAULT_BOARD_STATE_VALUE
);
const gameBoardState: BoardStateValue = reactive(
  DEFAULT_GAME_BOARD_STATE_VALUE
);

// Confirm dialog
const confirmDialog = new ConfirmDialog();

// Config piece dialog
const configPieceDialog = new ConfigPieceDialog();

// Toast manager
const toastManager = new ToastManager(toasts);

// Configs dialog
const configPrintDialog = new ConfigPrintDialog(toastManager);
const configsDialog = new ConfigsDialog(
  confirmDialog,
  configPrintDialog,
  toastManager
);

// Theme manager
const themeManger = new ThemeManager(DEFAULT_THEME_VALUE);

// Transition manager
const transitionsManager = new TransitionsManager(DEFAULT_TRANSITIONS_VALUE);

// Data
const defaultBoardStateData = new GenericBoardStateData(
  DEFAULT_DEFAULT_BOARD_STATE_VALUE,
  defaultBoardState,
  toastManager
);
const gameBoardStateData = new BoardStateData(
  DEFAULT_GAME_BOARD_STATE_VALUE,
  gameBoardState,
  toastManager
);

// NOTE: Most of the UserData instances use Ref but some of them may use Reactive if their value is more complex. These classes are extending ComplexUserData class.
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
    new PreferredPlayerColorData(
      DEFAULT_PREFERRED_PLAYER_COLOR_VALUE,
      preferredPlayerColor,
      toastManager
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
    new RotateScreenData(
      DEFAULT_ROTATE_SCREEN_VALUE,
      rotateScreen,
      toastManager
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
    new BooleanUserData(
      "player_playing",
      DEFAULT_PLAYER_PLAYING_VALUE,
      toastManager,
      playerPlaying
    ),
    new BooleanUserData(
      "game_paused",
      DEFAULT_GAME_PAUSED_VALUE,
      toastManager,
      gamePaused
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
    defaultBoardStateData,
    gameBoardStateData,
  ],
  confirmDialog,
  toastManager
);

// Default board configurations
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

// Splashscreen manager
const splashscreenManager = new SplashscreenManager(transitionsManager);

// Escape manager
const escapeManager = new EscapeManager(toggleActionsPanel);

// Board managers
const defaultBoardManager = new DefaultBoardManager(
  defaultBoardState,
  configPieceDialog
);

const gameBoardManager = new GameBoardManager(
  gameBoardStateData,
  gameBoardState,
  whiteCapturedPieces,
  blackCapturedPieces,
  playerCellMarks,
  OpponentCellMarks,
  playerHighlightedPieces,
  opponentHighlightedPieces,
  highlightedCells
);

// Game manager
const game = new Game(
  gameBoardManager,
  gameBoardStateData,
  defaultBoardStateData,
  playerColor,
  playerPlaying,
  preferredPlayerColor
);

// Load data
if (localStorage.length !== 0) {
  navigator.cookieEnabled
    ? userDataManager.recoverData()
    : toastManager.showToast(
        "Cookies are disabled. -> No changes will be restored in next session.",
        "error",
        "cookie-alert"
      );
} else {
  game.restart();
}

userDataManager.applyData();
userDataManager.updateReferences();

// On first mount
onMounted(() => {
  console.log("App mounted");

  // NOTE: Sets CSS Saturation variables from 0 to their appropriate user configured values
  activateColors();

  addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      escapeManager.escape();
    }
  });

  // Let the app wait another 600ms to make sure its fully loaded.
  setTimeout(() => {
    splashscreenManager.hideSplashscreen();
  }, 600);
});

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

function onPieceMove() {
  if (audioEffects.value) {
    moveAudioEffect.play();
  }
}
</script>

<template>
  <!-- Relative -->
  <div id="game-area">
    <Timers :player-secs-move="168" />
    <div class="captured-pieces-placeholder"></div>
    <div id="boards-area">
      <Board
        @piece-move="onPieceMove()"
        :highlighted-pieces-state="playerHighlightedPieces"
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
        id="primary-board"
      />
      <Board
        v-if="secondCheckboard"
        :highlighted-pieces-state="opponentHighlightedPieces"
        :highlighted-cells-state="highlightedCells"
        :rotated="screenRotated"
        :manager="gameBoardManager"
        :state="gameBoardState"
        :piece-set="pieceSet"
        :piece-padding="piecePadding"
        :piece-border="pieceBorder"
        :white-captured-pieces="whiteCapturedPieces"
        :black-captured-pieces="blackCapturedPieces"
        id="primary-board"
      />
    </div>
    <div class="captured-pieces-placeholder"></div>
  </div>

  <!-- Fixed -->
  <ActionPanel
    @backdrop-click="toggleActionsPanel"
    @configure-game="toggleConfigDrawer"
    @restart-game="game.restart()"
    :open="actionPanelOpen"
  />

  <ConfigDrawer :open="configDrawerOpen">
    <header>
      <h1>Tessera board</h1>
      <small class="version">v0.0.0 (0)</small>
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
      <span class="section-title">Time restrictions</span>
      <UserOption
        name="Player seconds per move"
        icon-id="timer-outline"
        option-id="input-player-seconds-per-move"
      >
        <input type="number" min="0" id="input-player-seconds-per-move" />
        <template #description
          >Limits player's time per move. If the time runs out (expires) an
          action specified in the option below will be performed.
          <b>The limit is disabled when the value is set to 0.</b></template
        >
      </UserOption>
      <UserOption
        name="Opponent seconds per move"
        icon-id="timer-outline"
        option-id="input-opponent-seconds-per-move"
      >
        <input type="number" min="0" id="input-opponent-seconds-per-move" />
        <template #description
          >Limits opponent's time per move. If the time runs out (expires) an
          action specified in the option below will be performed.
          <b>The limit is disabled when the value is set to 0.</b></template
        >
      </UserOption>
      <UserOption
        name="Player seconds per match"
        icon-id="clock-outline"
        option-id="input-player-seconds-per-match"
      >
        <input type="number" min="0" id="input-player-seconds-per-match" />
        <template #description
          >Limits player's time for whole match (game). If the time runs out the
          player looses and opponent wins.
          <b>The limit is disabled when the value is set to 0.</b></template
        >
      </UserOption>
      <UserOption
        name="Opponent seconds per match"
        icon-id="clock-outline"
        option-id="input-opponent-seconds-per-match"
      >
        <input type="number" min="0" id="input-opponent-seconds-per-match" />
        <template #description
          >Limits opponent's time for whole match (game). If the time runs out
          the opponent looses and player wins.
          <b>The limit is disabled when the value is set to 0.</b></template
        >
      </UserOption>
      <UserOption
        name="Seconds per move expiration punishment"
        icon-id="timer-alert-outline"
        option-id="seconds-per-move-expiration-punishment"
      >
        <select id="seconds-per-move-expiration-punishment">
          <option value="lose_game">Random move</option>
          <option value="light">Lose game</option>
        </select>
        <template #description
          >Defines how to punish the player or opponent when they run out of
          seconds per move.
        </template>
      </UserOption>
      <!-- Checkboard -->
      <span class="section-title">Checkboard</span>
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
          <Icon icon-id="tune" side />Configurations
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
      <!-- Elements and behavior -->
      <span class="section-title">Elements and behavior</span>
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
          Requires player or opponent (if also playing on this device) to
          confirm move using buttons that appear next to the action button. This
          can be useful when you are playing on a touchscreen and you often
          click accidentally in wrong positions.
        </template>
      </UserOption>
      <!-- Colors -->
      <span class="section-title">Colors</span>
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
      <span class="section-title">Checkboard</span>
      <UserOption
        name="piece set"
        icon-id="chess-pawn"
        option-id="select-piece-set"
      >
        <select id="select-piece-set" v-model="pieceSet">
          <option value="material_design">Material Design</option>
          <option value="font_awesome">Font Awesome</option>
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
      <span class="section-title">Effects</span>
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
      <p>Made with ❤️ by Jiří Král</p>
      <p>
        Source code is availible at
        <a href="https://github.com/FrameXX/tessera-board" target="_blank"
          >Github repository</a
        >.
      </p>
      <p>
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
    <Transition name="slide-up">
      <button aria-label="Cancel move" title="Cancel move" v-show="false">
        <Icon icon-id="close"></Icon>
      </button>
    </Transition>
    <button
      id="action-button"
      @click="toggleActionsPanel"
      aria-label="Quick actions"
      title="Quick actions"
    >
      <Icon
        icon-id="plus"
        id="action-icon"
        :class="actionPanelOpen ? 'close' : ''"
        side
      />
      Actions
    </button>
    <Transition name="slide-up">
      <button aria-label="Confirm move" title="Confirm move" v-show="false">
        <Icon icon-id="check"></Icon>
      </button>
    </Transition>
  </div>

  <!-- Fixed -->
  <!-- Config piece -->
  <Modal
    id="config-piece"
    title="Configure new piece"
    :open="configPieceDialog.props.open"
    @open="escapeManager.addLayer(configPieceDialog.cancel)"
    @close="escapeManager.removeLayer()"
    @backdrop-click="configPieceDialog.cancel()"
  >
    <div class="piece-preview">
      <PieceIcon
        :piece-set="pieceSet"
        :piece-id="configPieceDialog.props.pieceId"
        :color="configPieceDialog.props.color"
      />
    </div>
    <div class="config">
      <UserOption name="piece" option-id="select-piece-id">
        <select id="select-piece-id" v-model="configPieceDialog.props.pieceId">
          <option value="rook">Rook</option>
          <option value="knight">Knight</option>
          <option value="bishop">Bishop</option>
          <option value="queen">Queen</option>
          <option value="king">King</option>
          <option value="pawn">Pawn</option>
        </select>
        <template #description>
          Different pieces have different look, but mainly their abilities and
          strategic differ.
        </template>
      </UserOption>
      <UserOption name="color" option-id="select-piece-color">
        <select id="select-piece-color" v-model="configPieceDialog.props.color">
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
        <template #description
          >Piece color determines its player. Although pieces here are not
          usually entirely black or white they are darker or brighter.</template
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
        v-for="print in configsDialog.props.configsPrints"
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
    id="name-config"
    title="Set configuration name and description"
    :open="configPrintDialog.props.open"
    :focus-on-open="configNameInput"
    @open="escapeManager.addLayer(configPrintDialog.cancel)"
    @close="escapeManager.removeLayer()"
  >
    <input
      autocapitalize="on"
      type="text"
      id="input-config-name"
      ref="configNameInput"
      v-model="configPrintDialog.props.name"
      placeholder="name"
    />
    <label for="input-config-name"
      >Although the configuration name can be any string, even an already used
      one, I won't be the one who struggles with recognising one configuration
      from another.</label
    >
    <textarea
      placeholder="description"
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
  z-index: var(--z-index-top-fragment);
  margin: var(--spacing-medium);
  width: 100%;
}

#action-icon {
  transition: transform var(--transition-duration-medium)
    var(--transition-timing-jump);

  &.close {
    transform: rotate(-45deg);
  }
}

#game-status {
  @include round-border;
  margin: var(--spacing-medium) 0;
  padding: var(--spacing-medium);
  background-color: var(--color-primary-surface-accent);
}

.action-buttons-drawer {
  button {
    margin: var(--spacing-medium) var(--spacing-medium) var(--spacing-medium) 0;
  }
}

.section-title {
  @include shadow;
  @include round-border;
  @include inverted-accent;
  margin: var(--spacing-big) 0;
  font-size: var(--font-size-small);
  font-weight: bold;
  padding: var(--spacing-small);
}
</style>
./modules/user_data/rotate_screen
