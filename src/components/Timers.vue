<script lang="ts" setup>
import { computed } from "vue";
import SimpleInfo from "./SimpleInfo.vue";
import {
  getMinsAndSecsTime,
  type MinSecTime,
  getDigitStr,
} from "../modules/utils/misc";

const TOO_FEW_MOVE_SECONDS = 11;
const TOO_FEW_MATCH_SECONDS = 31;

const props = defineProps({
  playerSecsMove: { type: Number, required: true },
  playerSecsMatch: { type: Number, required: true },
  opponentSecsMove: { type: Number, required: true },
  opponentSecsMatch: { type: Number, required: true },
  playerSecondsPerMoveSet: { type: Boolean, required: true },
  opponentSecondsPerMoveSet: { type: Boolean, required: true },
  playerSecondsPerMatchSet: { type: Boolean, required: true },
  opponentSecondsPerMatchSet: { type: Boolean, required: true },
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
  <div class="player-timers">
    <div
      id="player-timers-player"
      v-show="props.playerSecondsPerMoveSet || props.playerSecondsPerMatchSet"
    >
      <SimpleInfo
        v-show="props.playerSecondsPerMoveSet"
        content-role="timer"
        :class="{
          pulsing:
            props.playerSecsMove < TOO_FEW_MOVE_SECONDS &&
            props.playerSecsMove !== 0,
        }"
        name="move"
        >{{
          getDigitStr(playerTimeMove.mins) +
          ":" +
          getDigitStr(playerTimeMove.secs)
        }}</SimpleInfo
      >
      <SimpleInfo
        v-show="props.playerSecondsPerMatchSet"
        content-role="timer"
        :class="{
          pulsing:
            props.playerSecsMatch < TOO_FEW_MATCH_SECONDS &&
            props.playerSecsMatch !== 0,
        }"
        name="match"
        >{{
          getDigitStr(playerTimeMatch.mins) +
          ":" +
          getDigitStr(playerTimeMatch.secs)
        }}</SimpleInfo
      >
    </div>
    <div
      id="player-timers-opponent"
      v-show="
        props.opponentSecondsPerMoveSet || props.opponentSecondsPerMatchSet
      "
    >
      <SimpleInfo
        v-show="props.opponentSecondsPerMoveSet"
        content-role="timer"
        :class="{
          pulsing:
            props.opponentSecsMove < TOO_FEW_MOVE_SECONDS &&
            props.opponentSecsMove !== 0,
        }"
        name="move"
        >{{
          getDigitStr(opponentTimeMove.mins) +
          ":" +
          getDigitStr(opponentTimeMove.secs)
        }}</SimpleInfo
      >
      <SimpleInfo
        v-show="props.opponentSecondsPerMatchSet"
        content-role="timer"
        :class="{
          pulsing:
            props.opponentSecsMatch < TOO_FEW_MATCH_SECONDS &&
            props.opponentSecsMatch !== 0,
        }"
        name="match"
        >{{
          getDigitStr(opponentTimeMatch.mins) +
          ":" +
          getDigitStr(opponentTimeMatch.secs)
        }}</SimpleInfo
      >
    </div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.player-timers {
  @include shadow;
  @include flex-center;
  width: 100%;
  align-items: baseline;

  .simple-info {
    display: inline-flex;
  }
}

#player-timers-player,
#player-timers-opponent {
  display: inline-block;
  padding: 0 var(--spacing-tiny);
  text-align: center;
  width: 100%;
}

#player-timers-player {
  background-color: var(--color-player-surface-accent);
}

#player-timers-opponent {
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
