<script lang="ts" setup>
import { type PropType } from "vue";
import Backdrop from "./Backdrop.vue";
import UserOption from "./UserOption.vue";
import Category from "./Category.vue";
import Icon from "./Icon.vue";
import TimeDurationInput from "./TimeDurationInput.vue";
import SectionTitle from "./SectionTitle.vue";
import Checkbox from "./Checkbox.vue";
import InfoCard from "./InfoCard.vue";
import Board from "./Board.vue";
import Time from "./Time.vue";
import FragmentTitle from "./FragmentTitle.vue";
import Game, { GameSettings } from "../modules/game";

const props = defineProps({
  open: { type: Boolean, default: false },
  modelValue: { type: Object as PropType<GameSettings>, required: true },
  game: { type: Object as PropType<Game>, required: true },
});
</script>

<template>
  <Backdrop v-show="props.open" />
  <Transition name="slide-up">
    <div class="fragment" id="settings" v-show="props.open">
      <div class="content">
        <FragmentTitle icon-id="cog-outline">Configuration</FragmentTitle>
        <!-- Player -->
        <Category name="Primary player" icon-id="account">
          <UserOption
            name="color"
            icon-id="invert-colors"
            option-id="select-player-color"
          >
            <select
              id="select-player-color"
              v-model="props.modelValue.preferredPlayerColor.value"
            >
              <option value="random">Random</option>
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
            <template #description>
              Specifies the colour of your pieces, whether black or white.
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
              If this feature is activated, an algorithm will play instead of a
              human player.
            </template>
          </UserOption>
        </Category>
        <!-- Secondary player -->
        <Category name="Secondary player" icon-id="target-account">
          <UserOption
            name="computer"
            icon-id="memory"
            option-id="check-computer-secondary-player"
            v-if="false"
          >
            <Checkbox id="check-computer-secondary-player" />
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
          <InfoCard
            >Each time limit is considered to be disabled/infinite when its
            value is set to 0.</InfoCard
          >
          <UserOption
            name="Primary player time per move"
            icon-id="timer-outline"
            option-id="input-primary-player-seconds-per-move"
          >
            <TimeDurationInput
              id="input-primary-player-seconds-per-move"
              v-model="props.modelValue.primaryPlayerSecondsPerMove.value"
            />
            <template #description
              >Limits player's time per move. If the time runs out (expires) an
              action specified in the option below will be performed.</template
            >
            <template #extra>
              <div class="player-time">
                <div class="time">
                  <Time
                    :time="
                      props.game.playerTimers.primaryPlayerMove.duration.value
                    "
                  />
                </div>
                <button
                  title="Reset timer"
                  @click="
                    props.game.playerTimers.primaryPlayerMove.requestReset()
                  "
                >
                  <Icon icon-id="numeric-0-box-outline" side />
                  Reset
                </button>
              </div>
            </template>
          </UserOption>
          <UserOption
            name="Secondary player time per move"
            icon-id="timer-outline"
            option-id="input-secondary-player-seconds-per-move"
          >
            <TimeDurationInput
              id="input-secondary-player-seconds-per-move"
              v-model="props.modelValue.secondaryPlayerSecondsPerMove.value"
            />
            <template #description
              >Limits time per move of secondary player. If the time runs out
              (expires) an action specified in the option below will be
              performed.
            </template>
            <template #extra>
              <div class="player-time">
                <div class="time">
                  <Time
                    :time="
                      props.game.playerTimers.secondaryPlayerMove.duration.value
                    "
                  />
                </div>
                <button
                  title="Reset timer"
                  @click="
                    props.game.playerTimers.secondaryPlayerMove.requestReset()
                  "
                >
                  <Icon icon-id="numeric-0-box-outline" side />
                  Reset
                </button>
              </div>
            </template>
          </UserOption>
          <UserOption
            name="Primary player time per match"
            icon-id="clock-outline"
            option-id="input-primary-player-seconds-per-match"
          >
            <TimeDurationInput
              id="input-primary-player-seconds-per-match"
              v-model="props.modelValue.primaryPlayerSecondsPerMatch.value"
            />
            <template #description
              >Limits player's time for whole match (game). If the time runs out
              the primary player looses and secondary player wins.
            </template>
            <template #extra>
              <div class="player-time">
                <div class="time">
                  <Time
                    :time="
                      props.game.playerTimers.primaryPlayerMatch.duration.value
                    "
                  />
                </div>
                <button
                  title="Reset timer"
                  @click="
                    props.game.playerTimers.primaryPlayerMatch.requestReset()
                  "
                >
                  <Icon icon-id="numeric-0-box-outline" side />
                  Reset
                </button>
              </div>
            </template>
          </UserOption>
          <UserOption
            name="Secondary player time per match"
            icon-id="clock-outline"
            option-id="input-secondary-player-seconds-per-match"
          >
            <TimeDurationInput
              id="input-secondary-player-seconds-per-match"
              v-model="props.modelValue.secondaryPlayerSecondsPerMatch.value"
            />
            <template #description
              >Limits time for whole match (game) of secondary player. If the
              time runs out the secondary player looses and primary player wins.
            </template>
            <template #extra>
              <div class="player-time">
                <div class="time">
                  <Time
                    :time="
                      props.game.playerTimers.secondaryPlayerMatch.duration
                        .value
                    "
                  />
                </div>
                <button
                  title="Reset timer"
                  @click="
                    props.game.playerTimers.secondaryPlayerMatch.requestReset()
                  "
                >
                  <Icon icon-id="numeric-0-box-outline" side />
                  Reset
                </button>
              </div>
            </template>
          </UserOption>
          <UserOption
            name="Time per move expiration punishment"
            icon-id="timer-alert-outline"
            option-id="seconds-move-limit-run-out-punishment"
          >
            <select
              id="seconds-move-limit-run-out-punishment"
              v-model="props.modelValue.secondsMoveLimitRunOutPunishment.value"
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
              v-model="props.modelValue.markCellCapturingPieces.value"
            />
            <template #description>
              When a cell on the game board is selected, the pieces that are
              checking that position will be highlighted. This feature assists
              the player in identifying any pieces that may be endangering the
              selected cell. It should be noted that highlighting the pieces is
              considered a game rule, as it provides the player with an
              advantage.
            </template>
          </UserOption>
          <UserOption
            name="show availible piece moves of not playing player"
            icon-id="arrow-top-right-bold-box-outline"
            option-id="show-other-availible-moves"
          >
            <Checkbox
              id="show-other-availible-moves"
              v-model="props.modelValue.markUnactivePlayerAvailibleMoves.value"
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
            <select
              id="first-move-color"
              v-model="props.modelValue.preferredFirstMoveColor.value"
            >
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
            name="Promote from captured pieces"
            icon-id="ghost-outline"
            option-id="revive-from-captured-pieces"
          >
            <Checkbox
              id="revive-from-captured-pieces"
              v-model="props.modelValue.reviveFromCapturedPieces.value"
            />
            <template #description>
              If enabled pieces that promote (for example when pawn promotes
              after reaching end of the board) will get promoted only to already
              captured pieces which will get revived and removed from list of
              captured pieces and the original piece will be added to captured
              pieces.
            </template>
          </UserOption>
          <UserOption
            name="Ignore pieces protections"
            icon-id="shield-off-outline"
            option-id="ignore-pieces-protections"
          >
            <Checkbox
              id="ignore-pieces-protections"
              v-model="props.modelValue.ignorePiecesGuardedProperty.value"
            />
            <template #description>
              Some pieces like a king in chess are protected. That means that
              every move of a player that owns that piece that would result in
              that piece being checked in the next move is not allowed. When no
              move is availible because of this (every move leads to the piece
              being checked in next move) player either loses the game (if the
              piece was already checked) or it's a draw. This option disables
              this rule.
            </template>
          </UserOption>
          <!-- Checkboard -->
          <SectionTitle title="Checkboard" />
          <UserOption
            :simple="false"
            name="starting piece positions"
            icon-id="checkerboard"
            option-id="default-board"
          >
            <button
              class="single"
              @click="
                props.game.ui.configsDialog.open(
                  props.game.defaultBoardConfigManager
                )
              "
            >
              <Icon icon-id="folder-outline" side />Checkboard configurations
            </button>
            <div class="board-box">
              <Board
                :manager="props.game.defaultBoardManager"
                :all-pieces-context="
                  props.game.defaultBoardAllPiecesContext.value
                "
                :game="props.game"
                id="default-board"
              />
            </div>
            <template #description>
              Defines position of each piece at the start of the game. Click on
              piece to remove it. Click on empty cell to add a piece.
            </template>
          </UserOption>
          <SectionTitle title="Pieces importance" />
          <InfoCard
            >Piece importance determines how much of a loss it would be for the
            player to lose that piece or how much of a win it would be for
            his/her opponent to capture it.</InfoCard
          >
          <UserOption
            name="Pawn importance"
            icon-id="chess-pawn"
            option-id="input-pawn-importance"
            :description="false"
          >
            <input
              type="number"
              id="input-pawn-importance"
              v-model="props.modelValue.pawnImportance.value"
            />
          </UserOption>
          <UserOption
            name="Knight importance"
            icon-id="chess-knight"
            option-id="input-knight-importance"
            :description="false"
          >
            <input
              type="number"
              id="input-knight-importance"
              v-model="props.modelValue.knightImportance.value"
            />
          </UserOption>
          <UserOption
            name="Bishop importance"
            icon-id="chess-bishop"
            option-id="input-bishop-importance"
            :description="false"
          >
            <input
              type="number"
              id="input-bishop-importance"
              v-model="props.modelValue.bishopImportance.value"
            />
          </UserOption>
          <UserOption
            name="Rook importance"
            icon-id="chess-rook"
            option-id="input-rook-importance"
            :description="false"
          >
            <input
              type="number"
              id="input-rook-importance"
              v-model="props.modelValue.rookImportance.value"
            />
          </UserOption>
          <UserOption
            name="Queen importance"
            icon-id="chess-queen"
            option-id="input-queen-importance"
            :description="false"
          >
            <input
              type="number"
              id="input-queen-importance"
              v-model="props.modelValue.queenImportance.value"
            />
          </UserOption>
          <UserOption
            name="King importance"
            icon-id="chess-king"
            option-id="input-king-importance"
            :description="false"
          >
            <input
              type="number"
              id="input-king-importance"
              v-model="props.modelValue.kingImportance.value"
            />
          </UserOption>
        </Category>
        <!-- Look, feel, behavior -->
        <Category name="look, feel, behavior" icon-id="palette-advanced">
          <!-- Behavior and elements -->
          <SectionTitle title="Behavior and elements" />
          <UserOption
            name="long press timeout (ms)"
            icon-id="gesture-tap-hold"
            option-id="input-long-press-timeout"
          >
            <input
              type="number"
              min="000"
              max="600"
              id="input-long-press-timeout"
              v-model="props.modelValue.pieceLongPressTimeout.value"
            />
            <template #description
              >Changes duration of press/hold on a piece to be recognized as
              long press and allow for a piece to be dragged out of position.
            </template>
          </UserOption>
          <UserOption
            name="table mode"
            icon-id="table-furniture"
            option-id="check-table-mode"
          >
            <Checkbox
              id="check-table-mode"
              v-model="props.modelValue.tableModeEnabled.value"
            />
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
            <Checkbox
              id="check-second-checkboard"
              v-model="props.modelValue.secondCheckboardEnabled.value"
            />
            <template #description>
              Shows second checkboard on the screen rotated for the second
              player. This option is great for separating player zone for each
              player especially if you are playing on a larger screen, but it's
              not recommended on a smaller screen.
            </template>
          </UserOption>
          <UserOption
            name="automatically pause game on focus loss"
            icon-id="play-pause"
            option-id="check-auto-pause"
          >
            <Checkbox
              id="check-auto-pause"
              v-model="props.modelValue.autoPauseGame.value"
            />
            <template #description>
              The game will be automatically paused when settings is opened,
              borwser tab is switched, browser window is not focused etc...
            </template>
          </UserOption>
          <!-- Colors -->
          <SectionTitle title="Colors" />
          <UserOption
            name="UI mode"
            icon-id="brightness-6"
            option-id="select-ui-mode"
          >
            <select id="select-ui-mode" v-model="props.modelValue.theme.value">
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
              v-model="props.modelValue.primaryPlayerHue.value"
            />
            <template #description
              >The UI transitions the overall hue of the app to this hue when
              the primary player is currently playing. The value is a hue degree
              from 0 to 360.
            </template>
          </UserOption>
          <UserOption
            name="Secondary player hue"
            icon-id="format-color-fill"
            option-id="input-hue-secondary-player"
          >
            <input
              type="number"
              min="0"
              max="360"
              id="input-hue-secondary-player"
              v-model="props.modelValue.secondaryPlayerHue.value"
            />
            <template #description
              >The UI transitions the overall hue of the app to this hue when
              secondary player is currently playing. The value is a hue degree
              from 0 to 360.
            </template>
          </UserOption>
          <!-- Checkboard -->
          <SectionTitle title="Checkboard" />
          <UserOption
            name="pieces icon pack"
            icon-id="package-variant-closed"
            option-id="select-piece-set"
          >
            <select
              id="select-piece-set"
              v-model="props.modelValue.pieceIconPack.value"
            >
              <option value="material_design">Material Design</option>
              <option value="font_awesome">Font Awesome</option>
              <option value="tabler">Tabler</option>
            </select>
            <template #description
              >Chooses what vector icons are used for pieces. Different icon
              packs have different shapes, look and feel.
            </template>
          </UserOption>
          <UserOption
            name="piece padding (%)"
            icon-id="padding-piece"
            option-id="input-piece-padding"
          >
            <input
              type="number"
              min="0"
              max="30"
              id="input-piece-padding"
              v-model="props.modelValue.piecePadding.value"
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
              v-model="props.modelValue.pieceBorder.value"
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
              v-model="props.modelValue.cellIndexOpacity.value"
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
            <Checkbox
              id="check-audio-effects"
              v-model="props.modelValue.audioEffectsEnabled.value"
            />
            <template #description>
              Enables simple audio effects when a piece is moved, added etc...
            </template>
          </UserOption>
          <UserOption
            name="haptic feedback"
            icon-id="vibrate"
            option-id="check-use-vibrations"
          >
            <Checkbox
              id="check-use-vibrations"
              v-model="props.modelValue.vibrationsEnabled.value"
            />
            <template #description>
              Vibrations will be performed on devices that have a vibration
              motor when pieces is captured, removed, long-pressed etc...
            </template>
          </UserOption>
          <UserOption
            name="transitions"
            icon-id="transition"
            option-id="select-transitions"
          >
            <select
              id="select-transitions"
              v-model="props.modelValue.transitions.value"
            >
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
              v-model="props.modelValue.transitionDuration.value"
            />
            <template #description
              >Changes duration of all the transitions and animations (except
              for the splashscreen animation) in the same ratio.
            </template>
          </UserOption>
        </Category>
        <div class="action-buttons-drawer">
          <button
            title="Import data"
            @click="props.game.userDataManager.requestImportData()"
          >
            <Icon icon-id="database-import-outline" side />
            Import data
          </button>
          <button
            title="Export data"
            @click="props.game.userDataManager.requestExportData()"
          >
            <Icon icon-id="database-export-outline" side />
            Export data
          </button>
          <button
            title="Clear all data"
            @click="props.game.userDataManager.requestClearData()"
          >
            <Icon icon-id="database-remove-outline" side />
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

.board-box {
  aspect-ratio: 1;
  height: auto;
}

.action-buttons-drawer {
  button {
    margin: var(--spacing-small) var(--spacing-medium) var(--spacing-small) 0;
  }
}

.player-time {
  margin-top: var(--spacing-small);
  display: flex;
  justify-content: space-between;
  align-self: center;

  .time {
    @include shadow;
    @include round-border;
    @include flex-center;

    font-weight: bold;
    margin: var(--spacing-small) 0;
    padding: var(--spacing-tiny) var(--spacing-big);
    background-color: var(--color-primary-surface-top);
  }
}
</style>
