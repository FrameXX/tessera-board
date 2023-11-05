<script lang="ts" setup>
import { PropType, computed } from "vue";
import InfoText from "./InfoText.vue";
import {
  getMinsAndSecsTime,
  type MinSecTime,
  getDigitStr,
} from "../modules/utils/misc";
import { Winner } from "../modules/game";

const TOO_FEW_MOVE_SECONDS = 11;
const TOO_FEW_MATCH_SECONDS = 31;

const props = defineProps({
  playerSecsMove: { type: Number, required: true },
  playerSecsMatch: { type: Number, required: true },
  opponentSecsMove: { type: Number, required: true },
  opponentSecsMatch: { type: Number, required: true },
  playerMoveSecondsLimitSet: { type: Boolean, required: true },
  opponentMoveSecondsLimitSet: { type: Boolean, required: true },
  playerMatchSecondsLimitSet: { type: Boolean, required: true },
  opponentMatchSecondsLimitSet: { type: Boolean, required: true },
  playerPlaying: { type: Boolean, required: true },
  moveIndex: { type: Number, required: true },
  statusText: { type: String, required: true },
  winner: { type: String as PropType<Winner>, required: true },
});

const playerTimeMove = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.playerSecsMove);
});
const playerTimeMatch = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.playerSecsMatch);
});
const opponentTimeMove = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.opponentSecsMove);
});
const opponentTimeMatch = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.opponentSecsMatch);
});
</script>

<template>
  <div id="status">
    <div
      id="timers-player"
      v-show="
        props.playerMoveSecondsLimitSet || props.playerMatchSecondsLimitSet
      "
    >
      <InfoText
        v-show="props.playerMoveSecondsLimitSet"
        content-role="timer"
        :class="{
          pulsing:
            props.playerSecsMove < TOO_FEW_MOVE_SECONDS &&
            props.playerSecsMove > 0 &&
            props.playerPlaying &&
            winner === 'none',
        }"
        name="move"
        >{{
          getDigitStr(playerTimeMove.mins) +
          ":" +
          getDigitStr(playerTimeMove.secs)
        }}</InfoText
      >
      <InfoText
        v-show="props.playerMatchSecondsLimitSet"
        content-role="timer"
        :class="{
          pulsing:
            props.playerSecsMatch < TOO_FEW_MATCH_SECONDS &&
            props.playerSecsMatch > 0 &&
            props.playerPlaying &&
            winner === 'none',
        }"
        name="match"
        >{{
          getDigitStr(playerTimeMatch.mins) +
          ":" +
          getDigitStr(playerTimeMatch.secs)
        }}</InfoText
      >
    </div>

    <div
      id="status-text"
      :class="{ player: props.playerPlaying, opponent: !props.playerPlaying }"
    >
      <InfoText :name="`Move #${props.moveIndex + 1}`">{{
        props.statusText
      }}</InfoText>
    </div>

    <div
      id="timers-opponent"
      v-show="
        props.opponentMoveSecondsLimitSet || props.opponentMatchSecondsLimitSet
      "
    >
      <InfoText
        v-show="props.opponentMoveSecondsLimitSet"
        content-role="timer"
        :class="{
          pulsing:
            props.opponentSecsMove < TOO_FEW_MOVE_SECONDS &&
            props.opponentSecsMove > 0 &&
            !props.playerPlaying &&
            winner === 'none',
        }"
        name="move"
        >{{
          getDigitStr(opponentTimeMove.mins) +
          ":" +
          getDigitStr(opponentTimeMove.secs)
        }}</InfoText
      >
      <InfoText
        v-show="props.opponentMatchSecondsLimitSet"
        content-role="timer"
        :class="{
          pulsing:
            props.opponentSecsMatch < TOO_FEW_MATCH_SECONDS &&
            props.opponentSecsMatch > 0 &&
            !props.playerPlaying &&
            winner === 'none',
        }"
        name="match"
        >{{
          getDigitStr(opponentTimeMatch.mins) +
          ":" +
          getDigitStr(opponentTimeMatch.secs)
        }}</InfoText
      >
    </div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

#status {
  @include shadow;
  @include flex-center;
  width: 100%;

  .info-text {
    display: inline-flex;
  }
}

#timers-player,
#timers-opponent {
  display: inline-block;

  .info-text {
    width: 70px;
  }
}

#timers-player,
#timers-opponent,
#status-text {
  text-align: center;
  width: 100%;
}

#timers-player {
  background-color: var(--color-player-surface-accent);
}

#status-text {
  @include flex-center;
  flex-shrink: 0.9;
  background-color: var(--color-primary-surface-accent);
  height: 100%;
  border-width: 0 calc(var(--border-width) * 1.5) 0
    calc(var(--border-width) * 1.5);
  border-style: dashed;

  &.player {
    border-color: transparent var(--color-primary-accent) transparent
      transparent;
  }

  &.opponent {
    border-color: transparent transparent transparent
      var(--color-primary-accent);
  }
}

#timers-opponent {
  background-color: var(--color-opponent-surface-accent);
}

.pulsing {
  animation: 1000ms var(--transition-timing-bounce) pulse infinite;
}

@keyframes pulse {
  0% {
    transform: none;
  }

  12% {
    transform: scale(1.2);
  }

  24% {
    transform: none;
  }
}
</style>
