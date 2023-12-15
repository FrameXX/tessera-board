<script lang="ts" setup>
import { PropType, computed } from "vue";
import InfoText from "./InfoText.vue";
import {
  getMinsAndSecsTime,
  type MinSecTime,
  getDigitStr,
} from "../modules/utils/misc";
import Game from "../modules/game";

const pulsingMoveSeconds = 11;
const pulsingMatchSeconds = 31;

const props = defineProps({
  game: { type: Object as PropType<Game>, required: true },
});

const playerTimeMove = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(
    props.game.timers.primaryPlayerMove.remainingSeconds.value
  );
});
const playerTimeMatch = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(
    props.game.timers.primaryPlayerMatch.remainingSeconds.value
  );
});
const opponentTimeMove = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(
    props.game.timers.secondaryPlayerMove.remainingSeconds.value
  );
});
const opponentTimeMatch = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(
    props.game.timers.secondaryPlayerMatch.remainingSeconds.value
  );
});

const primaryClass = computed<"primary" | "secondary" | "none">(() => {
  if (props.game.winner.value === "none") {
    return props.game.primaryPlayerPlaying.value ? "primary" : "secondary";
  } else if (props.game.winner.value !== "draw") {
    return props.game.winner.value;
  }
  return "none";
});
const playerSecondsPerMoveSet = computed(() => {
  return props.game.settings.primaryPlayerSecondsPerMove.value !== 0;
});
const opponentSecondsPerMoveSet = computed(() => {
  return props.game.settings.secondaryPlayerSecondsPerMove.value !== 0;
});
const playerSecondsPerMatchSet = computed(() => {
  return props.game.settings.primaryPlayerSecondsPerMatch.value !== 0;
});
const opponentSecondsPerMatchSet = computed(() => {
  return props.game.settings.secondaryPlayerSecondsPerMatch.value !== 0;
});

const playerMoveSecondsPulsing = computed(() => {
  return (
    props.game.timers.primaryPlayerMove.remainingSeconds.value <
      pulsingMoveSeconds &&
    props.game.timers.primaryPlayerMove.remainingSeconds.value > 0 &&
    props.game.primaryPlayerPlaying.value &&
    props.game.winner.value === "none"
  );
});

const playerMatchSecondsPulsing = computed(() => {
  return (
    props.game.timers.primaryPlayerMatch.remainingSeconds.value <
      pulsingMatchSeconds &&
    props.game.timers.primaryPlayerMatch.remainingSeconds.value > 0 &&
    props.game.primaryPlayerPlaying.value &&
    props.game.winner.value === "none"
  );
});

const opponentMoveSecondsPulsing = computed(() => {
  return (
    props.game.timers.secondaryPlayerMove.remainingSeconds.value <
      pulsingMoveSeconds &&
    props.game.timers.secondaryPlayerMove.remainingSeconds.value > 0 &&
    props.game.primaryPlayerPlaying.value &&
    props.game.winner.value === "none"
  );
});

const opponentMatchSecondsPulsing = computed(() => {
  return (
    props.game.timers.secondaryPlayerMatch.remainingSeconds.value <
      pulsingMatchSeconds &&
    props.game.timers.secondaryPlayerMatch.remainingSeconds.value > 0 &&
    props.game.primaryPlayerPlaying.value &&
    props.game.winner.value === "none"
  );
});
</script>

<template>
  <div id="status">
    <div
      id="timers-player-wrapper"
      v-show="playerSecondsPerMoveSet || playerSecondsPerMatchSet"
    >
      <div id="timers-player">
        <InfoText
          v-show="playerSecondsPerMoveSet"
          content-role="timer"
          :class="{
            pulsing: playerMoveSecondsPulsing,
          }"
          name="move"
          >{{
            getDigitStr(playerTimeMove.mins) +
            ":" +
            getDigitStr(playerTimeMove.secs)
          }}</InfoText
        >
        <InfoText
          v-show="playerSecondsPerMatchSet"
          content-role="timer"
          :class="{
            pulsing: playerMatchSecondsPulsing,
          }"
          name="match"
          >{{
            getDigitStr(playerTimeMatch.mins) +
            ":" +
            getDigitStr(playerTimeMatch.secs)
          }}</InfoText
        >
      </div>
    </div>

    <div id="status-text" :class="primaryClass">
      <InfoText :name="`Move #${props.game.lastMoveIndex.value + 2}`">{{
        props.game.status.value
      }}</InfoText>
    </div>

    <div
      id="timers-opponent-wrapper"
      v-show="opponentSecondsPerMoveSet || opponentSecondsPerMatchSet"
    >
      <div id="timers-opponent">
        <InfoText
          v-show="opponentSecondsPerMoveSet"
          content-role="timer"
          :class="{
            pulsing: opponentMoveSecondsPulsing,
          }"
          name="move"
          >{{
            getDigitStr(opponentTimeMove.mins) +
            ":" +
            getDigitStr(opponentTimeMove.secs)
          }}</InfoText
        >
        <InfoText
          v-show="opponentSecondsPerMatchSet"
          content-role="timer"
          :class="{
            pulsing: opponentMatchSecondsPulsing,
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

#timers-player-wrapper,
#timers-opponent-wrapper {
  @include flex-center;
  width: 100%;
  height: 100%;
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

#timers-player-wrapper {
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
  transition: background-color var(--transition-duration-medium) linear;

  &.primary {
    border-color: transparent var(--color-primary-accent) transparent
      transparent;
  }

  &.secondary {
    border-color: transparent transparent transparent
      var(--color-primary-accent);
  }

  &.none {
    border-color: transparent;
  }
}

#timers-opponent-wrapper {
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
