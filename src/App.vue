<script setup lang="ts">
// Vue
import { ref, reactive } from "vue";

// User data
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

// Classes
import ToastManager, { type ToastElement } from "./modules/toast_manager";
import SplashscreenManager from "./modules/splashscreen_manager";
import ThemeManager from "./modules/theme_manager";
import TransitionsManager from "./modules/transitions_manager";
import ConfirmDialog, { type Dialog } from "./modules/confirm_dialog";
import DefaultBoardManager from "./modules/default_board_manager";
import ConfigPieceDialog from "./modules/config_piece_dialog";
import { Piece, PieceId, PlayerColor } from "./modules/pieces";
import { activateColors } from "./modules/utils/elements";
import type { CommonConfigPrint } from "./modules/config_inventory";
import ConfigInventory from "./modules/config_inventory";
import ConfigManager, {
  DEFAULT_BOARD_CONFIG_DEFAULT,
  DEFAULT_BOARD_CONFIG_PHILIDOR_DEFENCE,
} from "./modules/config_manager";
import type { PositionedMark } from "./components/Board.vue";

// Custom components
import Board from "./components/Board.vue";
import Icon from "./components/Icon.vue";
import Drawer from "./components/Drawer.vue";
import Category from "./components/Category.vue";
import Option from "./components/Option.vue";
import Checkbox from "./components/Checkbox.vue";
import DialogWindow from "./components/DialogWindow.vue";
import ToastStack from "./components/ToastStack.vue";
import PieceIcon from "./components/PieceIcon.vue";
import ConfigItem from "./components/ConfigItem.vue";
import ConfigDialog from "./modules/config_dialog";
import Info from "./components/Info.vue";

// Define refs
const themeValueRef = ref(DEFAULT_THEME_VALUE);
const transitionsValueRef = ref(DEFAULT_TRANSITIONS_VALUE);
const playerHueRef = ref(DEFAULT_PLAYER_HUE_VALUE);
const opponentHueRef = ref(DEFAULT_OPPONENT_HUE_VALUE);
const pieceSetRef = ref(DEFAULT_PIECE_SET_VALUE);
const defaultBoardStateReactive: BoardStateValue = reactive(
  DEFAULT_BOARD_STATE_VALUE
);
const piecePaddingRef = ref(DEFAULT_PIECE_PADDING_VALUE);
const pieceBorderRef = ref(DEFAULT_PIECE_BORDER_VALUE);
const transitionDurationRef = ref(DEFAULT_TRANSITION_DURATION_VALUE);
const cellIndexOpacityRef = ref(DEFAULT_CELL_INDEX_OPACITY_VALUE);

const toastsRef = ref<ToastElement[]>([]);
const drawerOpenRef = ref(false);
const confirmDialogRef = ref<Dialog>({
  message: "",
  confirmText: "",
  cancelText: "",
});
const showConfirmDialogRef = ref(false);
const configPieceIdRef = ref<PieceId>("pawn");
const configPieceColorRef = ref<PlayerColor>("white");
const showConfigPieceDialogRef = ref(false);
const configsListRef = ref<CommonConfigPrint[]>([]);
const showConfigsRef = ref(false);
const showNameConfigRef = ref(false);
const configNameRef = ref("");
const configDescriptionRef = ref("");
const escCallback = ref(toggleDrawer);
const configNameInput = ref<null | HTMLInputElement>(null);
const playerCapturedPieces = ref<Piece[]>([]);
const opponentCapturedPieces = ref<Piece[]>([]);
const playerBoardMarks = ref<PositionedMark[]>([]);
const OpponentBoardMarks = ref<PositionedMark[]>([]);

// Define user data
const defaultBoardStateData = new BoardStateData(
  defaultBoardStateReactive,
  defaultBoardStateReactive
);

// Define classes
const themeManger = new ThemeManager(DEFAULT_THEME_VALUE);
const toastManager = new ToastManager(toastsRef);
const transitionsManager = new TransitionsManager(DEFAULT_TRANSITIONS_VALUE);
const confirmDialog = new ConfirmDialog(confirmDialogRef, showConfirmDialogRef);
const configPieceDialog = new ConfigPieceDialog(
  configPieceIdRef,
  configPieceColorRef,
  showConfigPieceDialogRef
);
const configDialog = new ConfigDialog(
  showConfigsRef,
  configsListRef,
  showNameConfigRef,
  configNameRef,
  configDescriptionRef,
  confirmDialog,
  toastManager
);
const userDataManager = new UserDataManager(confirmDialog, toastManager);
const splashscreenManager = new SplashscreenManager(transitionsManager);
const defaultBoardManager = new DefaultBoardManager(
  defaultBoardStateReactive,
  configPieceDialog
);
const defaultBoardConfigInventory = new ConfigInventory(
  "default-board",
  [
    {
      id: "default",
      name: "Default",
      description: "Classic checkboard setup as you know it.",
      values: DEFAULT_BOARD_CONFIG_DEFAULT,
    },
    {
      id: "philidor_defence",
      name: "Philidor Defence",
      description: `The Philidor Defence (or Philidor's Defence) is a chess opening characterised by the moves: \n1. e4 e5\n2. Nf3 d6.\nThe opening is named after the famous 18th-century player François-André Danican Philidor, who advocated it as an alternative to the common 2...Nc6. His original idea was to challenge White's centre by the pawn thrust ...f7–f5. Source: Wikipedia.`,
      values: DEFAULT_BOARD_CONFIG_PHILIDOR_DEFENCE,
    },
  ],
  toastManager
);
const defaultBoardConfigManager = new ConfigManager(
  defaultBoardConfigInventory,
  [defaultBoardStateData],
  toastManager
);

userDataManager.entries = [
  new ThemeData(themeValueRef.value, themeValueRef, themeManger),
  new TransitionsData(
    transitionsValueRef.value,
    transitionsValueRef,
    transitionsManager
  ),
  new HueData(playerHueRef.value, playerHueRef, false),
  new HueData(opponentHueRef.value, opponentHueRef, true),
  new PieceSetData(pieceSetRef.value, pieceSetRef),
  defaultBoardStateData,
  new PiecePaddingData(piecePaddingRef.value, piecePaddingRef),
  new PieceBorderData(pieceBorderRef.value, pieceBorderRef),
  new TransitionDurationData(
    transitionDurationRef.value,
    transitionDurationRef
  ),
  new CellIndexOpacityData(cellIndexOpacityRef.value, cellIndexOpacityRef),
];

addEventListener("load", () => {
  splashscreenManager.hideSplashscreen();
  if (navigator.cookieEnabled) {
    userDataManager.recoverData();
  } else {
    toastManager.showToast(
      "Cookies are disabled. -> No changes will be restored in next session.",
      "error",
      "cookie-alert"
    );
  }
  userDataManager.applyData();
  userDataManager.updateReferences();
  activateColors();
  addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      escCallback.value();
    }
  });
});

function toggleDrawer() {
  drawerOpenRef.value = !drawerOpenRef.value;
}
</script>

<template>
  <!-- Relative -->
  <div id="game-area">
    <div class="player-info">
      <div id="player-info-player">
        <div class="player">Player</div>
        <div class="content">
          <Info name="captured pieces" class="captured-pieces">
            <TransitionGroup name="list">
              <PieceIcon
                v-for="piece in playerCapturedPieces"
                :color="piece.color"
                :piece-set="pieceSetRef"
                :piece-id="piece.pieceId"
              ></PieceIcon>
            </TransitionGroup>
          </Info>
          <Info name="remaining time">00:00</Info>
        </div>
      </div>
      <div id="player-info-opponent">
        <div class="player">Opponent</div>
        <div class="content">
          <Info name="captured pieces" class="captured-pieces">
            <TransitionGroup name="list">
              <PieceIcon
                v-for="piece in opponentCapturedPieces"
                :color="piece.color"
                :piece-set="pieceSetRef"
                :piece-id="piece.pieceId"
              ></PieceIcon>
            </TransitionGroup>
          </Info>
          <Info name="remaining time">00:00</Info>
        </div>
      </div>
    </div>
    <div id="boards-area">
      <Board
        :manager="defaultBoardManager"
        :state="defaultBoardStateReactive"
        :piece-set="pieceSetRef"
        :piece-padding="piecePaddingRef"
        id="primary-board"
      />
      <Board
        :manager="defaultBoardManager"
        :state="defaultBoardStateReactive"
        :piece-set="pieceSetRef"
        :piece-padding="piecePaddingRef"
        id="primary-board"
      />
    </div>
  </div>

  <!-- Fixed -->
  <Drawer :open="drawerOpenRef">
    <header>
      <h1>Tessera board</h1>
      <small class="version">v0.0.0 (0)</small>
    </header>
    <div role="status" id="game-status">Loading...</div>
    <div class="action-buttons-drawer">
      <button>
        <Icon icon-id="play-outline" side />
        Start new game
      </button>
      <button>
        <Icon icon-id="flag-outline" side />
        Draw
      </button>
    </div>
    <!-- Player -->
    <Category name="Player" icon-id="account">
      <Option
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
      </Option>
      <Option
        name="computer"
        icon-id="memory"
        option-id="check-computer-player"
      >
        <Checkbox id="check-computer-player" />
        <template #description>
          If this option is enabled an algorythm will play instead of a human
          player.
        </template>
      </Option>
    </Category>
    <!-- Opponent -->
    <Category name="Opponent" icon-id="target-account">
      <Option
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
      </Option>
      <Option
        name="computer"
        icon-id="memory"
        option-id="check-computer-opponent"
      >
        <Checkbox id="check-computer-opponent" />
        <template #description>
          If this option is enabled an algorythm will play instead of a human
          player.
        </template>
      </Option>
    </Category>
    <!-- Game rules -->
    <Category name="Game rules" icon-id="rule">
      <Option
        :simple="false"
        name="default piece positions"
        icon-id="checkerboard"
        option-id="default-board"
      >
        <button
          class="button-configs"
          @click="configDialog.show(defaultBoardConfigManager)"
        >
          <Icon icon-id="tune" side />Configurations
        </button>
        <div class="board-box">
          <Board
            :manager="defaultBoardManager"
            :state="defaultBoardStateReactive"
            :piece-set="pieceSetRef"
            :piece-padding="piecePaddingRef"
            id="default-board"
          />
        </div>
        <template #description>
          Defines position of each piece at the start of the game. Click on
          piece to remove it. Click on empty cell to add a piece.
        </template>
      </Option>
    </Category>
    <!-- Look and feel -->
    <Category name="look and feel" icon-id="palette-advanced">
      <!-- Colors -->
      <span class="category-section">Colors</span>
      <Option name="UI mode" icon-id="brightness-6" option-id="select-ui-mode">
        <select id="select-ui-mode" v-model="themeValueRef">
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
      </Option>
      <Option
        name="Player hue"
        icon-id="format-color-fill"
        option-id="input-hue-player"
      >
        <input
          type="number"
          min="0"
          max="360"
          id="input-hue-player"
          v-model="playerHueRef"
        />
        <template #description
          >The UI transitions the overall hue of the app to this hue when you
          are currently playing. The value is a hue degree from 0 to 360.
        </template>
      </Option>
      <Option
        name="Opponent hue"
        icon-id="format-color-fill"
        option-id="input-hue-opponent"
      >
        <input
          type="number"
          min="0"
          max="360"
          id="input-hue-opponent"
          v-model="opponentHueRef"
        />
        <template #description
          >The UI transitions the overall hue of the app to this hue when you
          are currently playing. The value is a hue degree from 0 to 360.
        </template>
      </Option>
      <!-- Checkboard -->
      <span class="category-section">Checkboard</span>
      <Option
        name="piece set"
        icon-id="chess-pawn"
        option-id="select-piece-set"
      >
        <select id="select-piece-set" v-model="pieceSetRef">
          <option value="material_design">Material Design</option>
          <option value="font_awesome">Font Awesome</option>
        </select>
        <template #description
          >Chooses what vector icons are used for pieces. Different icon sets
          have different shapes.
        </template>
      </Option>
      <Option
        name="piece padding (px)"
        icon-id="padding-piece"
        option-id="input-piece-padding"
      >
        <input
          type="number"
          min="0"
          max="20"
          id="input-piece-padding"
          v-model="piecePaddingRef"
        />
        <template #description
          >Increases padding of the pieces relative to its cell, but that also
          decreases their overall size.
        </template>
      </Option>
      <Option
        name="piece border (px)"
        icon-id="border-piece"
        option-id="input-piece-border"
      >
        <input
          type="number"
          min="0"
          max="3"
          id="input-piece-border"
          v-model="pieceBorderRef"
        />
        <template #description
          >Increases border/stroke width of the pieces vector, which can improve
          their visibility.
        </template>
      </Option>
      <Option
        name="cell index opacity (%)"
        icon-id="code-array"
        option-id="select-cell-index-opacity"
      >
        <input
          type="number"
          min="0"
          max="100"
          id="input-cell-index-opacity"
          v-model="cellIndexOpacityRef"
        />
        <template #description
          >Opacity of the cell indexes (numbers and letters) written on borders
          of checkboard.
        </template>
      </Option>
      <!-- Elements -->
      <span class="category-section">Elements</span>
      <!-- Transitions -->
      <span class="category-section">Transitions</span>
      <Option
        name="transitions"
        icon-id="transition"
        option-id="select-transitions"
      >
        <select id="select-transitions" v-model="transitionsValueRef">
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
      </Option>
      <Option
        name="transition duration (%)"
        icon-id="play-speed"
        option-id="select-transition-duration"
      >
        <input
          type="number"
          min="0"
          max="300"
          id="input-transition-duration"
          v-model="transitionDurationRef"
        />
        <template #description
          >Changes duration of all the transitions and animations (except for
          the splashscreen animation) in the same ratio.
        </template>
      </Option>
    </Category>
    <div class="action-buttons-drawer">
      <button @click="userDataManager.requestClearData()">
        <Icon icon-id="delete-forever-outline" side />
        Clear all data
      </button>
    </div>
    <div class="menu-button-placeholder"></div
  ></Drawer>
  <div class="primary-buttons">
    <button
      @click="toggleDrawer"
      id="menu-button"
      aria-label="Menu"
      title="Menu"
    >
      <Icon
        id="open-menu-chevron"
        :class="drawerOpenRef ? 'open' : ''"
        icon-id="chevron-up"
      />
    </button>
  </div>
  <DialogWindow
    id="config-piece"
    title="Configure new piece"
    :open="showConfigPieceDialogRef"
    @open="escCallback = configPieceDialog.onCancel"
    @close="escCallback = toggleDrawer"
    @backdrop-click="configPieceDialog.onCancel()"
  >
    <div class="piece-preview">
      <PieceIcon
        :piece-set="pieceSetRef"
        :piece-id="configPieceIdRef"
        :color="configPieceColorRef"
      />
    </div>
    <div class="config">
      <Option name="piece" option-id="select-piece-id">
        <select id="select-piece-id" v-model="configPieceIdRef">
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
      </Option>
      <Option name="color" option-id="select-piece-color">
        <select id="select-piece-color" v-model="configPieceColorRef">
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
        <template #description
          >Piece color determines its player. Although pieces here are not
          usually entirely black or white they are darker or brighter.</template
        >
      </Option>
    </div>
    <template #action-buttons>
      <button @click="configPieceDialog.onCancel()" title="Cancel">
        <Icon side icon-id="close-circle-outline" />Cancel
      </button>
      <button @click="configPieceDialog.onConfirm()" title="Add piece">
        <Icon side icon-id="check-circle-outline" />Add piece
      </button>
    </template>
  </DialogWindow>
  <DialogWindow
    id="configs"
    title="Manage configurations"
    :open="showConfigsRef"
    @open="escCallback = configDialog.onCancel"
    @close="escCallback = toggleDrawer"
    @backdrop-click="configDialog.onCancel()"
  >
    <TransitionGroup name="list">
      <ConfigItem
        @delete="configDialog.onDeleteConfig($event.id)"
        @rename="
          configDialog.onRenameConfig(
            $event.id,
            $event.currentName,
            $event.currentDescription
          )
        "
        @restore="configDialog.onRestoreConfig($event.id, $event.predefined)"
        v-for="config in configsListRef"
        :key="config.id"
        :id="config.id"
        :name="config.name"
        :description="config.description"
        :predefined="config.predefined"
      />
    </TransitionGroup>
    <template #action-buttons>
      <button title="Close" @click="configDialog.onCancel()">
        <Icon side icon-id="close-circle-outline" />Close
      </button>
      <button
        title="Save current configuration"
        @click="configDialog.onSaveConfig()"
      >
        <Icon side icon-id="content-save-outline" />New config
      </button>
    </template>
  </DialogWindow>
  <DialogWindow
    id="name-config"
    title="Set configuration name and description"
    :open="showNameConfigRef"
    :focus-on-open="configNameInput"
    @open="escCallback = configDialog.onCancelName"
    @close="escCallback = configDialog.onCancel"
  >
    <input
      type="text"
      id="input-config-name"
      ref="configNameInput"
      v-model="configNameRef"
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
      v-model="configDescriptionRef"
    />
    <label for="input-config-description">Description is not required.</label>
    <template #action-buttons>
      <button title="Cancel" @click="configDialog.onCancelName()">
        <Icon side icon-id="close-circle-outline" />Cancel
      </button>
      <button
        title="Save current configuration"
        @click="configDialog.onConfirmName()"
      >
        <Icon side icon-id="content-save-outline" />Save
      </button>
    </template>
  </DialogWindow>
  <DialogWindow
    id="confirm"
    title="Confirm"
    :open="showConfirmDialogRef"
    @open="escCallback = confirmDialog.onCancel"
    @close="escCallback = toggleDrawer"
  >
    <p class="message">{{ confirmDialogRef.message }}</p>
    <template #action-buttons>
      <button @click="confirmDialog.onCancel()" title="Cancel">
        <Icon side icon-id="close-circle-outline" />{{
          confirmDialogRef.cancelText
        }}
      </button>
      <button @click="confirmDialog.onConfirm()" title="Confirm">
        <Icon side icon-id="check-circle-outline" />{{
          confirmDialogRef.confirmText
        }}
      </button>
    </template>
  </DialogWindow>
  <ToastStack
    :toasts="toastsRef"
    @toast-dismiss="toastManager.hideToastId($event.id)"
  />
</template>

<style lang="scss">
@import "./partials/mixins";

#game-area {
  @include flex-center;
  @include stretch;
  flex-direction: column;
}

.player-info {
  @include shadow;
  @include no-overrender;
  margin: 0 var(--spacing-small);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  display: flex;
  align-items: baseline;

  .info {
    display: inline-flex;
  }
}

#player-info-player,
#player-info-opponent {
  height: 100%;
  display: inline-block;

  .player {
    padding: var(--spacing-medium);
    padding-bottom: 0;
    font-size: var(--font-size-big);

    &.playing {
      text-decoration: underline;
    }
  }
}

#player-info-player {
  background-color: var(--color-player-surface-accent);
}

#player-info-opponent {
  background-color: var(--color-opponent-surface-accent);
}

.captured-pieces {
  .icon {
    width: var(--font-size-big);
    height: var(--font-size-big);
    margin: 0;
  }
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

.primary-buttons {
  @include no-shrink;
  @include flex-center;
  width: 100%;

  #menu-button {
    margin: var(--spacing-medium);
    width: 100px;

    .icon {
      width: 40px;
      height: 40px;
    }
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

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all var(--transition-duration-medium) ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.list-leave-active {
  position: absolute;
}
</style>
