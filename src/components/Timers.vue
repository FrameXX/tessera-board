<script lang="ts" setup>
import { computed } from "vue";
import SimpleInfo from "./SimpleInfo.vue";
import {
  getMinsAndSecsTime,
  type MinSecTime,
  getDigitStr,
} from "../modules/utils/misc";

const props = defineProps({
  playerSecsMove: { type: Number, required: true },
  playerSecsMatch: { type: Number, required: true },
  opponentSecsMove: { type: Number, required: true },
  opponentSecsMatch: { type: Number, required: true },
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
    <div id="player-timers-player">
      <SimpleInfo
        :class="`${props.playerSecsMove < 16 ? 'pulsing' : ''}`"
        name="move"
        v-show="props.playerSecsMove !== -1"
        >{{
          getDigitStr(playerTimeMove.mins) +
          ":" +
          getDigitStr(playerTimeMove.secs)
        }}</SimpleInfo
      >
      <SimpleInfo name="match" v-show="props.playerSecsMatch !== -1">{{
        getDigitStr(playerTimeMatch.mins) +
        ":" +
        getDigitStr(playerTimeMatch.secs)
      }}</SimpleInfo>
    </div>
    <div id="player-timers-opponent">
      <SimpleInfo name="move" v-show="props.opponentSecsMatch !== -1">{{
        getDigitStr(opponentTimeMove.mins) +
        ":" +
        getDigitStr(opponentTimeMove.secs)
      }}</SimpleInfo>
      <SimpleInfo name="match" v-show="props.opponentSecsMatch !== -1">{{
        getDigitStr(opponentTimeMatch.mins) +
        ":" +
        getDigitStr(opponentTimeMatch.secs)
      }}</SimpleInfo>
    </div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.player-timers {
  @include shadow;
  @include no-overrender;
  margin: 0 var(--spacing-small);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  display: flex;
  align-items: baseline;

  .simple-info {
    display: inline-flex;
  }
}

#player-timers-player,
#player-timers-opponent {
  display: inline-block;
  padding: var(--spacing-tiny);
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
