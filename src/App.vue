<script lang="ts" setup>
// Import from packages
import { ref, onMounted, watch, computed, provide, inject } from "vue";

// Import other classes and functions
import { PIECE_IDS } from "./modules/pieces/piece";
import { updatePieceColors } from "./modules/utils/elements";
import ConfigInventory from "./modules/config_inventory";
import ConfigManager from "./modules/config_manager";
import { PREDEFINED_DEFAULT_BOARD_CONFIGS } from "./modules/predefined_configs";
import Game from "./modules/game";
import { getPixelsPerCm } from "./modules/utils/misc";
import { RawPiece } from "./modules/pieces/raw_piece";

// Import components
import Board from "./components/Board.vue";
import Icon from "./components/Icon.vue";
import Settings from "./components/Settings.vue";
import UserOption from "./components/UserOption.vue";
import Modal from "./components/Modal.vue";
import ToastStack from "./components/ToastStack.vue";
import ConfigItem from "./components/ConfigItem.vue";
import ActionPanel from "./components/ActionPanel.vue";
import Status from "./components/Status.vue";
import SelectPiece from "./components/SelectPiece.vue";
import About from "./components/About.vue";
import FragmentTitle from "./components/FragmentTitle.vue";
import InfoCard from "./components/InfoCard.vue";

const game = new Game();

provide("durationDialog", game.ui.durationDialog);
provide("pieceIconPack", game.settings.pieceIconPack);
const pixelsPerCm = getPixelsPerCm();
provide("pixelsPerCm", pixelsPerCm);

// UI refs are temporary. They are not part of any user data and won't be restored after load.
const configNameInput = ref<HTMLElement | null>(null);
const minutesDurationInput = ref<HTMLElement | null>(null);
const configsNameFilter = ref("");
const filteredConfigsPrints = computed(() => {
  return game.ui.configsDialog.props.configsPrints.filter((print) =>
    print.name.toLowerCase().includes(configsNameFilter.value.toLowerCase())
  );
});
const configPieceSelectOptions = computed(() => {
  const pieces: RawPiece[] = [];
  for (const pieceId of PIECE_IDS) {
    pieces.push({ pieceId, color: game.ui.configPieceDialog.props.color });
  }
  return pieces;
});
const playerSecondsPerMoveSet = computed(() => {
  return game.settings.playerSecondsPerMove.value !== 0;
});
const opponentSecondsPerMoveSet = computed(() => {
  return game.settings.opponentSecondsPerMove.value !== 0;
});
const playerSecondsPerMatchSet = computed(() => {
  return game.settings.playerSecondsPerMatch.value !== 0;
});
const opponentSecondsPerMatchSet = computed(() => {
  return game.settings.opponentSecondsPerMatch.value !== 0;
});
const playerRemainingMoveSeconds = computed(() => {
  return (
    game.settings.playerSecondsPerMove.value - game.playerMoveSeconds.value
  );
});
const opponentRemainingMoveSeconds = computed(() => {
  return (
    game.settings.opponentSecondsPerMove.value - game.opponentMoveSeconds.value
  );
});
const playerRemainingMatchSeconds = computed(() => {
  return (
    game.settings.playerSecondsPerMatch.value - game.playerMatchSeconds.value
  );
});
const opponentRemainingMatchSeconds = computed(() => {
  return (
    game.settings.opponentSecondsPerMatch.value -
    game.opponentMatchSeconds.value
  );
});

const defaultBoardConfigInventory = new ConfigInventory(
  "default-board",
  PREDEFINED_DEFAULT_BOARD_CONFIGS,
  game.ui.toastManager
);
const defaultBoardConfigManager = new ConfigManager(
  defaultBoardConfigInventory,
  [game.defaultBoardStateData],
  game.ui.toastManager
);

watch(game.rotated, (newValue) => {
  game.ui.updateScreenRotation(newValue);
});
watch(game.playerPlaying, (newValue) => {
  game.ui.updatePrimaryHue(newValue, game.winner.value);
});
watch(game.winner, (newValue) => {
  game.ui.updatePrimaryHue(game.playerPlaying.value, newValue);
});
watch(game.playerColor, (newValue) => {
  updatePieceColors(newValue);
});

onMounted(game.mount);
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
      :last-move-index="game.lastMoveIndex.value"
      :status-text="game.status.value"
      :winner="game.winner.value"
    />
    <div class="captured-pieces-placeholder"></div>
    <div id="boards-area" :class="{ rotated: game.rotated.value }">
      <Board
        :game="game"
        :manager="game.playerBoardManager"
        :all-pieces-context="game.gameBoardAllPiecesContext.value"
        primary
        id="player-board"
      />
      <Board
        v-if="game.settings.secondCheckboardEnabled.value"
        primary
        :game="game"
        :manager="game.opponentBoardManager"
        :all-pieces-context="game.gameBoardAllPiecesContext.value"
        id="opponent-board"
      />
      <Transition name="slide-side">
        <div id="game-paused" v-show="game.paused.value === 'manual'">
          <div class="content">
            <FragmentTitle icon-id="pause">Game paused</FragmentTitle>
            <button @click="game.paused.value = 'not'">
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
    @about-game="game.ui.toggleAbout()"
    @backdrop-click="game.ui.toggleActionsPanel()"
    @configure-game="game.ui.toggleSettings()"
    @restart-game="game.ui.onGameRestart()"
    @pause="game.ui.manuallyTogglePause()"
    @resign="game.resign()"
    :open="game.ui.actionPanelOpen.value"
    :status-text="game.status.value"
    :game-paused="game.paused.value"
  />
  <Settings
    v-model="game.settings"
    :open="game.ui.settingsOpen.value"
    :default-board-config-manager="defaultBoardConfigManager"
    :default-board-manager="game.defaultBoardManager"
    :user-data-manager="game.userDataManager"
    :default-board-all-piece-context="game.defaultBoardAllPiecesContext.value"
    :game="game"
  />
  <About :open="game.ui.aboutOpen.value" />

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
      @click="game.ui.toggleActionsPanel"
      aria-label="Actions"
      title="Actions"
    >
      <Icon
        icon-id="plus"
        id="action-icon"
        :class="{ close: game.ui.actionPanelOpen.value }"
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
    :open="game.ui.selectPieceDialog.props.open"
    @open="game.ui.escapeManager.addLayer(game.ui.selectPieceDialog.cancel)"
    @close="game.ui.escapeManager.removeLayer()"
  >
    <SelectPiece
      :pieces="game.ui.selectPieceDialog.props.pieceOptions"
      :piece-icon-pack="game.settings.pieceIconPack.value"
      v-model="game.ui.selectPieceDialog.props.selectedPiece"
    />
    <template #action-buttons>
      <button title="Choose piece" @click="game.ui.selectPieceDialog.confirm">
        <Icon side icon-id="check-circle-outline" />Choose piece
      </button>
    </template>
  </Modal>

  <!-- Config piece -->
  <Modal
    id="config-piece"
    title="Configure new piece"
    title-icon-id="plus"
    :open="game.ui.configPieceDialog.props.open"
    @open="game.ui.escapeManager.addLayer(game.ui.configPieceDialog.cancel)"
    @close="game.ui.escapeManager.removeLayer()"
    @backdrop-click="game.ui.configPieceDialog.cancel()"
  >
    <SelectPiece
      :pieces="configPieceSelectOptions"
      :piece-icon-pack="game.settings.pieceIconPack.value"
      v-model="game.ui.configPieceDialog.props.selectedPiece"
    />
    <div class="config">
      <UserOption name="color" option-id="select-piece-color">
        <select
          id="select-piece-color"
          v-model="game.ui.configPieceDialog.props.color"
        >
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
      <button @click="game.ui.configPieceDialog.cancel()" title="Cancel">
        <Icon side icon-id="close-circle-outline" />Cancel
      </button>
      <button @click="game.ui.configPieceDialog.confirm()" title="Add piece">
        <Icon side icon-id="check-circle-outline" />Add piece
      </button>
    </template>
  </Modal>

  <!-- Configurations -->
  <Modal
    id="configs"
    title="Manage configurations"
    title-icon-id="folder-outline"
    :open="game.ui.configsDialog.props.open"
    @open="game.ui.escapeManager.addLayer(game.ui.configsDialog.cancel)"
    @close="game.ui.escapeManager.removeLayer()"
    @backdrop-click="game.ui.configsDialog.cancel()"
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
        @delete="game.ui.configsDialog.deleteConfig($event.id)"
        @rename="
          game.ui.configsDialog.renameConfig(
            $event.id,
            $event.currentName,
            $event.currentDescription
          )
        "
        @restore="
          game.ui.configsDialog.restoreConfig($event.id, $event.predefined)
        "
        v-for="print in filteredConfigsPrints"
        :key="print.id"
        :id="print.id"
        :name="print.name"
        :description="print.description"
        :predefined="print.predefined"
      />
    </TransitionGroup>
    <template #action-buttons>
      <button title="Close" @click="game.ui.configsDialog.cancel()">
        <Icon side icon-id="close-circle-outline" />Close
      </button>
      <button
        title="Save current configuration"
        @click="game.ui.configsDialog.saveConfig()"
      >
        <Icon side icon-id="folder-plus-outline" />New config
      </button>
    </template>
  </Modal>

  <!-- New Configuration -->
  <Modal
    id="config-print"
    title="Set configuration name and description"
    :open="game.ui.configPrintDialog.props.open"
    :focus-on-open="configNameInput"
    title-icon-id="folder-plus-outline"
    @open="game.ui.escapeManager.addLayer(game.ui.configPrintDialog.cancel)"
    @close="game.ui.escapeManager.removeLayer()"
    @backdrop-click="game.ui.configPrintDialog.cancel()"
  >
    <input
      autocapitalize="on"
      type="text"
      id="input-config-name"
      ref="configNameInput"
      v-model="game.ui.configPrintDialog.props.name"
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
      v-model="game.ui.configPrintDialog.props.description"
    />
    <label for="input-config-description">Description is not required.</label>
    <template #action-buttons>
      <button title="Cancel" @click="game.ui.configPrintDialog.cancel()">
        <Icon side icon-id="close-circle-outline" />Cancel
      </button>
      <button
        title="Save current configuration"
        @click="game.ui.configPrintDialog.confirm()"
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
    :open="game.ui.durationDialog.props.open"
    :focus-on-open="minutesDurationInput"
    @open="game.ui.escapeManager.addLayer(game.ui.durationDialog.cancel)"
    @close="game.ui.escapeManager.removeLayer()"
    @backdrop-click="game.ui.durationDialog.cancel"
  >
    <div class="duration-inputs">
      <input
        placeholder="min"
        class="minutes"
        title="Enter duration minutes"
        min="0"
        type="number"
        ref="minutesDurationInput"
        v-model="game.ui.durationDialog.props.minutes"
      />:<input
        placeholder="sec"
        class="seconds"
        title="Enter duration seconds"
        min="0"
        max="59"
        type="number"
        v-model="game.ui.durationDialog.props.seconds"
      />
    </div>
    <template #action-buttons>
      <button @click="game.ui.durationDialog.disable()" title="Cancel">
        <Icon side icon-id="cancel" />Disable
      </button>
      <button @click="game.ui.durationDialog.cancel()" title="Cancel">
        <Icon side icon-id="close-circle-outline" />Cancel
      </button>
      <button @click="game.ui.durationDialog.confirm()" title="Confirm">
        <Icon side icon-id="check-circle-outline" />Confirm
      </button>
    </template>
  </Modal>

  <!-- Confirm -->
  <Modal
    id="confirm"
    title="Confirm"
    :open="game.ui.confirmDialog.props.open"
    title-icon-id="check-all"
    @open="game.ui.escapeManager.addLayer(game.ui.confirmDialog.cancel)"
    @close="game.ui.escapeManager.removeLayer()"
  >
    <p class="message">{{ game.ui.confirmDialog.props.message }}</p>
    <InfoCard v-show="game.ui.confirmDialog.props.showHint">{{
      game.ui.confirmDialog.props.hint
    }}</InfoCard>
    <template #action-buttons>
      <button @click="game.ui.confirmDialog.cancel()" title="Cancel">
        <Icon side icon-id="close-circle-outline" />{{
          game.ui.confirmDialog.props.cancelText
        }}
      </button>
      <button @click="game.ui.confirmDialog.confirm()" title="Confirm">
        <Icon side icon-id="check-circle-outline" />{{
          game.ui.confirmDialog.props.confirmText
        }}
      </button>
    </template>
  </Modal>

  <!-- Toast stack -->
  <ToastStack
    :toasts="game.ui.toastManager.toasts.value"
    @toast-dismiss="game.ui.toastManager.hideToastId($event.id)"
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
