<script setup lang="ts">
// Import Vue
import { ref, reactive, onMounted } from "vue";

// Import user data
import UserDataManager from "./modules/user_data_manager";
import ThemeData, { DEFAULT_THEME_VALUE } from "./modules/user_data/theme";
import TransitionsData, {
  DEFAULT_TRANSITIONS_VALUE,
} from "./modules/user_data/transitions";
import HueData, {
  DEFAULT_PLAYER_HUE_VALUE,
  DEFAULT_OPPONENT_HUE_VALUE,
} from "./modules/user_data/hue";
import PieceSetData, {
  DEFAULT_PIECE_SET_VALUE,
} from "./modules/user_data/piece_set";
import BoardStateData, {
  type BoardStateValue,
  DEFAULT_BOARD_STATE_VALUE,
} from "./modules/user_data/board_state";
import PiecePaddingData, {
  DEFAULT_PIECE_PADDING_VALUE,
} from "./modules/user_data/piece_padding";
import PieceBorderData, {
  DEFAULT_PIECE_BORDER_VALUE,
} from "./modules/user_data/piece_border";
import TransitionDurationData, {
  DEFAULT_TRANSITION_DURATION_VALUE,
} from "./modules/user_data/transition_duration";
import CellIndexOpacityData, {
  DEFAULT_CELL_INDEX_OPACITY_VALUE,
} from "./modules/user_data/cell_index_opacity";

// Import other classes
import ToastManager, { type ToastProps } from "./modules/toast_manager";
import SplashscreenManager from "./modules/splashscreen_manager";
import ThemeManager from "./modules/theme_manager";
import TransitionsManager from "./modules/transitions_manager";
import ConfirmDialog from "./modules/confirm_dialog";
import DefaultBoardManager from "./modules/default_board_manager";
import ConfigPieceDialog from "./modules/config_piece_dialog";
import { Piece } from "./modules/pieces";
import { activateColors } from "./modules/utils/elements";
import ConfigInventory from "./modules/config_inventory";
import ConfigManager from "./modules/config_manager";
import type { PositionedMark } from "./components/Board.vue";
import ConfigPrintDialog from "./modules/config_print_dialog";
import { PREDEFINED_DEFAULT_BOARD_CONFIGS } from "./modules/predefined_configs";

// Import components
import Board from "./components/Board.vue";
import Icon from "./components/Icon.vue";
import Drawer from "./components/Drawer.vue";
import Category from "./components/Category.vue";
import UserOption from "./components/UserOption.vue";
import Checkbox from "./components/Checkbox.vue";
import DialogWindow from "./components/DialogWindow.vue";
import ToastStack from "./components/ToastStack.vue";
import PieceIcon from "./components/PieceIcon.vue";
import ConfigItem from "./components/ConfigItem.vue";
import ConfigsDialog from "./modules/configs_dialog";
import ActionsPanel from "./components/ActionsPanel.vue";
import PlayerInfo from "./components/PlayerInfo.vue";

// UI refs
const drawerOpen = ref(false);
const actionPanelOpen = ref(false);
const escCallbackRef = ref(toggleDrawer);

const configNameInput = ref<null | HTMLInputElement>(null);
const playerCapturedPieces = ref<Piece[]>([]);
const opponentCapturedPieces = ref<Piece[]>([]);
const playerBoardMarks = ref<PositionedMark[]>([]);
const OpponentBoardMarks = ref<PositionedMark[]>([]);

// Toast manager
const toasts = ref<ToastProps[]>([]);
const toastManager = new ToastManager(toasts);

// Theme manager
const themeValue = ref(DEFAULT_THEME_VALUE);
const themeManger = new ThemeManager(DEFAULT_THEME_VALUE);

// Transition manager
const transitionsValue = ref(DEFAULT_TRANSITIONS_VALUE);
const transitionsManager = new TransitionsManager(DEFAULT_TRANSITIONS_VALUE);

// Splashscreen manager
const splashscreenManager = new SplashscreenManager(transitionsManager);

// Confirm dialog
const confirmDialog = new ConfirmDialog();

// Config piece dialog
const configPieceDialog = new ConfigPieceDialog();

// Configs dialog
const configPrintDialog = new ConfigPrintDialog(toastManager);
const configsDialog = new ConfigsDialog(
  confirmDialog,
  configPrintDialog,
  toastManager
);

// Options refs
// Simple values (ref)
const playerHue = ref(DEFAULT_PLAYER_HUE_VALUE);
const opponentHue = ref(DEFAULT_OPPONENT_HUE_VALUE);
const pieceSet = ref(DEFAULT_PIECE_SET_VALUE);
const piecePadding = ref(DEFAULT_PIECE_PADDING_VALUE);
const pieceBorder = ref(DEFAULT_PIECE_BORDER_VALUE);
const transitionDuration = ref(DEFAULT_TRANSITION_DURATION_VALUE);
const cellIndexOpacity = ref(DEFAULT_CELL_INDEX_OPACITY_VALUE);

// Complex values (reactive)
const defaultBoardState: BoardStateValue = reactive(DEFAULT_BOARD_STATE_VALUE);
const defaultBoardStateData = new BoardStateData(
  DEFAULT_BOARD_STATE_VALUE,
  defaultBoardState,
  toastManager
);

// NOTE: Most of the UserData instances use Ref but some of them may use Reactive if their value is more complex. These classes are extending ComplexUserData class.
const userDataManager = new UserDataManager(confirmDialog, toastManager);
userDataManager.entries = [
  new ThemeData(DEFAULT_THEME_VALUE, themeValue, themeManger, toastManager),
  new TransitionsData(
    DEFAULT_TRANSITIONS_VALUE,
    transitionsValue,
    transitionsManager,
    toastManager
  ),
  new HueData(DEFAULT_PLAYER_HUE_VALUE, playerHue, false, toastManager),
  new HueData(DEFAULT_OPPONENT_HUE_VALUE, opponentHue, true, toastManager),
  new PieceSetData(DEFAULT_PIECE_SET_VALUE, pieceSet, toastManager),
  new PiecePaddingData(DEFAULT_PIECE_PADDING_VALUE, piecePadding, toastManager),
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
  defaultBoardStateData,
];

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

// Default board manager
const defaultBoardManager = new DefaultBoardManager(
  defaultBoardState,
  configPieceDialog
);

// On first mount
onMounted(() => {
  console.log("App mounted");

  // Let the app wait another 600ms to make its fully loaded.
  setTimeout(() => {
    splashscreenManager.hideSplashscreen();
    navigator.cookieEnabled
      ? userDataManager.recoverData()
      : toastManager.showToast(
          "Cookies are disabled. -> No changes will be restored in next session.",
          "error",
          "cookie-alert"
        );
    userDataManager.applyData();
    userDataManager.updateReferences();

    // NOTE: Sets CSS Saturation variables from 0 to their appropriate user configured values
    activateColors();

    addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        escCallbackRef.value();
      }
    });
  }, 600);
});

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
}
</script>

<template>
  <!-- Relative -->
  <div id="game-area">
    <PlayerInfo
      :player-captured-pieces="playerCapturedPieces"
      :opponent-captured-pieces="opponentCapturedPieces"
      :piece-set="pieceSet"
    />
    <div id="boards-area">
      <Board
        :manager="defaultBoardManager"
        :state="defaultBoardState"
        :piece-set="pieceSet"
        :piece-padding="piecePadding"
        id="primary-board"
      />
      <Board
        :manager="defaultBoardManager"
        :state="defaultBoardState"
        :piece-set="pieceSet"
        :piece-padding="piecePadding"
        id="primary-board"
      />
    </div>
  </div>

  <!-- Fixed -->
  <Drawer :open="drawerOpen">
    <header>
      <h1>Tessera board</h1>
      <small class="version">v0.0.0 (0)</small>
    </header>
    <!-- Player -->
    <Category name="Player" icon-id="account">
      <UserOption
        name="color"
        icon-id="invert-colors"
        option-id="select-player-color"
      >
        <select id="select-player-color">
          <option value="random">Random</option>
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
        <template #description>
          Defines color of your pieces be it black or white.
        </template>
      </UserOption>
      <UserOption
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
        <Checkbox id="check-remote-opponent" />
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
      <UserOption
        :simple="false"
        name="default piece positions"
        icon-id="checkerboard"
        option-id="default-board"
      >
        <button
          class="button-configs"
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
      <!-- Colors -->
      <span class="category-section">Colors</span>
      <UserOption
        name="UI mode"
        icon-id="brightness-6"
        option-id="select-ui-mode"
      >
        <select id="select-ui-mode" v-model="themeValue">
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
      <span class="category-section">Checkboard</span>
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
        option-id="select-cell-index-opacity"
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
      <!-- Elements -->
      <span class="category-section">Elements</span>
      <!-- Transitions -->
      <span class="category-section">Transitions</span>
      <UserOption
        name="transitions"
        icon-id="transition"
        option-id="select-transitions"
      >
        <select id="select-transitions" v-model="transitionsValue">
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
        option-id="select-transition-duration"
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
    <div class="action-buttons-drawer">
      <button @click="userDataManager.requestClearData()">
        <Icon icon-id="delete-forever-outline" side />
        Clear all data
      </button>
    </div>
    <div class="menu-button-placeholder"></div
  ></Drawer>
  <ActionsPanel
    @open="escCallbackRef = () => (actionPanelOpen = !actionPanelOpen)"
    @close="escCallbackRef = toggleDrawer"
    @backdrop-click="actionPanelOpen = false"
    :open="actionPanelOpen"
  />
  <nav>
    <button
      @click="actionPanelOpen = !actionPanelOpen"
      aria-label="Quick actions"
      title="Quick actions"
    >
      <Icon icon-id="flash-outline" />
    </button>
    <button
      @click="toggleDrawer"
      aria-label="Game configuration"
      title="Game configuration"
    >
      <Icon
        id="open-menu-chevron"
        :class="drawerOpen ? 'open' : ''"
        icon-id="chevron-up"
      />
    </button>
  </nav>
  <DialogWindow
    id="config-piece"
    title="Configure new piece"
    :open="configPieceDialog.props.open"
    @open="escCallbackRef = configPieceDialog.cancel"
    @close="escCallbackRef = toggleDrawer"
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
  </DialogWindow>
  <DialogWindow
    id="configs"
    title="Manage configurations"
    :open="configsDialog.props.open"
    @open="escCallbackRef = configsDialog.cancel"
    @close="escCallbackRef = toggleDrawer"
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
  </DialogWindow>
  <DialogWindow
    id="name-config"
    title="Set configuration name and description"
    :open="configPrintDialog.props.open"
    :focus-on-open="configNameInput"
    @open="escCallbackRef = configPrintDialog.cancel"
    @close="escCallbackRef = configsDialog.cancel"
  >
    <input
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
  </DialogWindow>
  <DialogWindow
    id="confirm"
    title="Confirm"
    :open="confirmDialog.props.open"
    @open="escCallbackRef = confirmDialog.cancel"
    @close="escCallbackRef = toggleDrawer"
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
  </DialogWindow>
  <ToastStack
    :toasts="toasts"
    @toast-dismiss="toastManager.hideToastId($event.id)"
  />
</template>

<style lang="scss">
@import "./partials/mixins";
@import "./partials/transitions";
@import "./partials/nav";

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

#open-menu-chevron {
  transition: transform var(--transition-duration-medium)
    var(--transition-timing-bounce);

  &.open {
    transform: rotateX(0.5turn);
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
</style>
./modules/configs_dialog
