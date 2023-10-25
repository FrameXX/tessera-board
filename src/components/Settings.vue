<script lang="ts" setup>
import { type PropType, inject } from "vue";
import Backdrop from "./Backdrop.vue";
import UserOption from "./UserOption.vue";
import Category from "./Category.vue";
import Icon from "./Icon.vue";
import TimeDurationInput from "./TimeDurationInput.vue";
import Board from "./Board.vue";
import SectionTitle from "./SectionTitle.vue";
import Checkbox from "./Checkbox.vue";
import FragmentTitle from "./FragmentTitle.vue";

import type { ThemeValue } from "../modules/user_data/theme";
import type { TransitionsValue } from "../modules/user_data/transitions";
import type { PieceSetValue } from "../modules/user_data/piece_set";
import type {
  MoveSecondsLimitRunOutPunishment,
  PlayerColor,
} from "../modules/game";
import type DurationDialog from "../modules/dialogs/duration";
import type ConfigsDialog from "../modules/dialogs/configs";
import ConfigManager from "../modules/config_manager";
import DefaultBoardManager from "../modules/default_board_manager";
import { BoardStateValue } from "../modules/user_data/board_state";
import UserDataManager from "../modules/user_data_manager";

const props = defineProps({
  open: { type: Boolean, default: false },
  defaultBoardConfigManager: {
    type: Object as PropType<ConfigManager>,
    required: true,
  },
  defaultBoardManager: {
    type: Object as PropType<DefaultBoardManager>,
    required: true,
  },
  defaultBoardState: {
    type: Object as PropType<BoardStateValue>,
    required: true,
  },
  userDataManager: {
    type: Object as PropType<UserDataManager>,
    required: true,
  },
});

const theme = inject("theme") as ThemeValue;
const transitions = inject("transitions") as TransitionsValue;
const playerHue = inject("playerHue") as number;
const opponentHue = inject("opponentHue") as number;
const pieceSet = inject("pieceSet") as PieceSetValue;
const piecePadding = inject("piecePadding") as number;
const pieceBorder = inject("pieceBorder") as number;
const transitionDuration = inject("transitionDuration") as number;
const cellIndexOpacity = inject("cellIndexOpacity") as number;
const preferredPlayerColor = inject("preferredPlayerColor") as PlayerColor;
const opponentOverLan = inject("opponentOverLan") as boolean;
const secondCheckboard = inject("secondCheckboard") as boolean;
const tableMode = inject("tableMode") as boolean;
const requireMoveConfirm = inject("requireMoveConfirm") as boolean;
const audioEffects = inject("audioEffects") as boolean;
const showCapturingPieces = inject("showCapturingPieces") as boolean;
const banPromotionToUncapturedPieces = inject<boolean>(
  "banPromotionToUncapturedPieces"
);
const playerMoveSecondsLimit = inject("playerMoveSecondsLimit") as number;
const opponentMoveSecondsLimit = inject("opponentMoveSecondsLimit") as number;
const playerMatchSecondsLimit = inject("playerMatchSecondsLimit") as number;
const opponentMatchSecondsLimit = inject("opponentMatchSecondsLimit") as number;
const showOtherAvailibleMoves = inject("showOtherAvailibleMoves") as boolean;
const secondsMoveLimitRunOutPunishment = inject(
  "secondsMoveLimitRunOutPunishment"
) as MoveSecondsLimitRunOutPunishment;
const prefferedFirstMoveColor = inject(
  "prefferedFirstMoveColor"
) as PlayerColor;
const useVibrations = inject("useVibrations") as boolean;

const durationDialog = inject<DurationDialog>(
  "durationDialog"
) as DurationDialog;
const configsDialog = inject("configsDialog") as ConfigsDialog;
</script>

<template>
  <Backdrop v-show="props.open" />
  <Transition name="slide-up">
    <div id="settings" v-show="props.open">
      <div class="content">
        <FragmentTitle icon-id="cog-outline">Configure game</FragmentTitle>
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
              If this option is enabled an algorythm will play instead of a
              human player.
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
              If this option is enabled the opponent won't play on the same
              device, but instead play on another device connected to the same
              network after peer connection is established.</template
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
              If this option is enabled an algorythm will play instead of a
              human player.
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
            option-id="input-player-seconds-per-move"
          >
            <TimeDurationInput
              id="input-player-seconds-per-move"
              v-model="playerMoveSecondsLimit"
              :duration-dialog="durationDialog"
            />
            <template #description
              >Limits player's time per move. If the time runs out (expires) an
              action specified in the option below will be performed.
              <b
                >The limit is disabled when both values are set to 0.</b
              ></template
            >
          </UserOption>
          <UserOption
            name="Opponent time per move"
            icon-id="timer-outline"
            option-id="input-opponent-seconds-per-move"
          >
            <TimeDurationInput
              id="input-opponent-seconds-per-move"
              v-model="opponentMoveSecondsLimit"
              :duration-dialog="durationDialog"
            />
            <template #description
              >Limits opponent's time per move. If the time runs out (expires)
              an action specified in the option below will be performed.
              <b
                >The limit is disabled when both values are set to 0.</b
              ></template
            >
          </UserOption>
          <UserOption
            name="Player time per match"
            icon-id="clock-outline"
            option-id="input-player-seconds-per-match"
          >
            <TimeDurationInput
              id="input-player-seconds-per-match"
              v-model="playerMatchSecondsLimit"
              :duration-dialog="durationDialog"
            />
            <template #description
              >Limits player's time for whole match (game). If the time runs out
              the player looses and opponent wins.
              <b
                >The limit is disabled when both values are set to 0.</b
              ></template
            >
          </UserOption>
          <UserOption
            name="Opponent time per match"
            icon-id="clock-outline"
            option-id="input-opponent-seconds-per-match"
          >
            <TimeDurationInput
              id="input-opponent-seconds-per-match"
              v-model="opponentMatchSecondsLimit"
              :duration-dialog="durationDialog"
            />
            <template #description
              >Limits opponent's time for whole match (game). If the time runs
              out the opponent looses and player wins.
              <b
                >The limit is disabled when both values are set to 0.</b
              ></template
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
              If a cell on the board is selected, the game will highlight the
              pieces that are checking that position. This feature helps the
              player recognize which pieces are endangering the cell, but it is
              considered a game rule, because it can give the player an
              advantage.
            </template>
          </UserOption>
          <UserOption
            name="show availible piece moves of not playing player"
            icon-id="circle-small"
            option-id="show-other-availible-moves"
          >
            <Checkbox
              id="show-other-availible-moves"
              v-model="showOtherAvailibleMoves"
            />
            <template #description>
              The player will be able to display the possible moves and board
              marks of pieces of the other player after clicking on them and not
              only his/her own pieces.
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
              Defines which color makes the first move. According to official
              chess rules white player should be the one to make the first move.
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
              When a piece promotes (in chess it is a pawn) it is only allowed
              to promote to pieces that were that the player already lost. In
              the very rare case when the player lost no pieces and pawn it to
              be promoted he will be again able to choose any piece as a
              fallback.
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
                board-id="default"
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
            name="table mode"
            icon-id="table-furniture"
            option-id="check-table-mode"
          >
            <Checkbox id="check-table-mode" v-model="tableMode" />
            <template #description>
              The game will behave as if the screen was a table and both players
              were sitting opossite of each other. If only 1 board is enabled
              the pieces will get rotated to the currently playing player.
            </template>
          </UserOption>
          <UserOption
            name="second checkboard"
            icon-id="checkerboard-plus"
            option-id="check-second-checkboard"
          >
            <Checkbox id="check-second-checkboard" v-model="secondCheckboard" />
            <template #description>
              Shows second checkboard on the screen rotated for the second
              player. This option is great for separating player zone for each
              player especially if you are playing on a larger screen, but it's
              not recommended on a smaller screen.
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
              Requires player to confirm move using buttons that appear next to
              the action button. This can be useful when you are playing on a
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
              >Makes the whole webpage colors appear more light or dark, which
              can strain your eyes less when you are in dark environment. When
              set to "Automatic" the app will try to follow theme preferred by
              your browser.
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
              >The UI transitions the overall hue of the app to this hue when
              you are currently playing. The value is a hue degree from 0 to
              360.
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
              >The UI transitions the overall hue of the app to this hue when
              you are currently playing. The value is a hue degree from 0 to
              360.
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
              >Chooses what vector icons are used for pieces. Different icon
              sets have different shapes.
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
              >Increases padding of the pieces relative to its cell, but that
              also decreases their overall size.
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
              >Increases border/stroke width of the pieces vector, which can
              improve their visibility.
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
              >Opacity of the cell indexes (numbers and letters) written on
              borders of checkboard.
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
              starting animation). This can help people who have problems with
              focus because of transitions being distracting to them or just
              don't like them. When set to "Automatic" the app will keep
              tansition effects disabled only if your browser requests it.
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
              >Changes duration of all the transitions and animations (except
              for the splashscreen animation) in the same ratio.
            </template>
          </UserOption>
          <UserOption
            name="haptic feedback"
            icon-id="vibrate"
            option-id="check-use-vibrations"
          >
            <Checkbox id="check-use-vibrations" v-model="useVibrations" />
            <template #description>
              Vibrations will be performed on devices that have a vibration
              motor when pieces is captured, removed, long-pressed etc...
            </template>
          </UserOption>
        </Category>
        <div class="action-buttons-drawer">
          <button @click="userDataManager.requestClearData()">
            <Icon icon-id="delete-forever-outline" side />
            Clear all data
          </button>
        </div>
        <div class="nav-placeholder"></div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

header {
  margin-bottom: var(--spacing-huge);
}

#settings {
  @include fix-centered;
  @include scrollable;
  @include shadow;
  overflow-x: hidden;
  z-index: var(--z-index-top-fragment);
  height: 100%;
  background-color: var(--color-primary-surface);

  > .content {
    padding: var(--spacing-big);
    left: 0;
    right: 0;
    margin: auto;
    max-width: 900px;
  }
}

.board-box {
  aspect-ratio: 1;
  height: auto;
}
</style>
