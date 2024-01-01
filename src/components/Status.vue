<script lang="ts" setup>
import { PropType, computed } from "vue";
import InfoText from "./InfoText.vue";
import Game from "../modules/game";

const pulsingMoveSeconds = 10;
const pulsingMatchSeconds = 30;

const props = defineProps({
  game: { type: Object as PropType<Game>, required: true },
});

const primaryClass = computed<"primary" | "secondary" | "none">(() => {
  if (props.game.winner.value === "none") {
    return props.game.primaryPlayerPlaying.value ? "primary" : "secondary";
  } else if (props.game.winner.value !== "draw") {
    return props.game.winner.value;
  }
  return "none";
});

const primaryPlayerSecondsPerMoveSet = computed(() => {
  return props.game.settings.primaryPlayerSecondsPerMove.value !== 0;
});
const secondaryPlayerSecondsPerMoveSet = computed(() => {
  return props.game.settings.secondaryPlayerSecondsPerMove.value !== 0;
});
const primaryPlayerSecondsPerMatchSet = computed(() => {
  return props.game.settings.primaryPlayerSecondsPerMatch.value !== 0;
});
const secondaryPlayerSecondsPerMatchSet = computed(() => {
  return props.game.settings.secondaryPlayerSecondsPerMatch.value !== 0;
});

const primaryPlayerMoveSecondsPulsing = computed(() => {
  return (
    props.game.playerTimers.primaryPlayerMove.remainingSeconds.value <=
      pulsingMoveSeconds &&
    props.game.playerTimers.primaryPlayerMove.remainingSeconds.value > 0 &&
    props.game.primaryPlayerPlaying.value &&
    props.game.winner.value === "none"
  );
});

const primaryPlayerMatchSecondsPulsing = computed(() => {
  return (
    props.game.playerTimers.primaryPlayerMatch.remainingSeconds.value <=
      pulsingMatchSeconds &&
    props.game.playerTimers.primaryPlayerMatch.remainingSeconds.value > 0 &&
    props.game.primaryPlayerPlaying.value &&
    props.game.winner.value === "none"
  );
});

const secondaryPlayerMoveSecondsPulsing = computed(() => {
  return (
    props.game.playerTimers.secondaryPlayerMove.remainingSeconds.value <=
      pulsingMoveSeconds &&
    props.game.playerTimers.secondaryPlayerMove.remainingSeconds.value > 0 &&
    !props.game.primaryPlayerPlaying.value &&
    props.game.winner.value === "none"
  );
});

const secondaryPlayerMatchSecondsPulsing = computed(() => {
  return (
    props.game.playerTimers.secondaryPlayerMatch.remainingSeconds.value <=
      pulsingMatchSeconds &&
    props.game.playerTimers.secondaryPlayerMatch.remainingSeconds.value > 0 &&
    !props.game.primaryPlayerPlaying.value &&
    props.game.winner.value === "none"
  );
});
</script>

<template>
  <div id="status" @click="props.game.ui.switchFragment('statistics')">
    <div
      id="timers-player-wrapper"
      v-show="primaryPlayerSecondsPerMoveSet || primaryPlayerSecondsPerMatchSet"
    >
      <div id="timers-player">
        <InfoText
          v-show="primaryPlayerSecondsPerMoveSet"
          content-role="timer"
          :class="{
            pulsing: primaryPlayerMoveSecondsPulsing,
          }"
          name="move"
        >
          {{
            props.game.playerTimers.primaryPlayerMove.remainingDurationString
              .value
          }}
        </InfoText>
        <InfoText
          v-show="primaryPlayerSecondsPerMatchSet"
          content-role="timer"
          :class="{
            pulsing: primaryPlayerMatchSecondsPulsing,
          }"
          name="match"
        >
          {{
            props.game.playerTimers.primaryPlayerMatch.remainingDurationString
              .value
          }}
        </InfoText>
      </div>
    </div>

    <div id="status-text" :class="primaryClass">
      <InfoText :name="`Move #${props.game.lastMoveIndex.value + 2}`">{{
        props.game.status.value
      }}</InfoText>
    </div>

    <div
      id="timers-opponent-wrapper"
      v-show="
        secondaryPlayerSecondsPerMoveSet || secondaryPlayerSecondsPerMatchSet
      "
    >
      <div id="timers-opponent">
        <InfoText
          v-show="secondaryPlayerSecondsPerMoveSet"
          content-role="timer"
          :class="{
            pulsing: secondaryPlayerMoveSecondsPulsing,
          }"
          name="move"
        >
          {{
            props.game.playerTimers.secondaryPlayerMove.remainingDurationString
              .value
          }}
        </InfoText>
        <InfoText
          v-show="secondaryPlayerSecondsPerMatchSet"
          content-role="timer"
          :class="{
            pulsing: secondaryPlayerMatchSecondsPulsing,
          }"
          name="match"
        >
          {{
            props.game.playerTimers.secondaryPlayerMatch.remainingDurationString
              .value
          }}
        </InfoText>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

#status {
  @include clickable;
  @include shadow;
  @include flex-center;
  width: 100%;
  z-index: var(--z-index-status);

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
  background-color: var(--color-primary-player-surface-accent);
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
  background-color: var(--color-secondary-player-surface-accent);
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
