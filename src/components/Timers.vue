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
const playerTimeAllMoves = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.playerSecsMatch);
});
const opponentTimeMove = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.opponentSecsMove);
});
const opponentTimeAllMoves = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.opponentSecsMatch);
});
</script>

<template>
  <div class="player-timers">
    <div id="player-timers-player">
      <SimpleInfo name="move" v-show="props.playerSecsMove !== -1">{{
        getDigitStr(playerTimeMove.mins) +
        ":" +
        getDigitStr(playerTimeMove.secs)
      }}</SimpleInfo>
      <SimpleInfo name="match" v-show="props.playerSecsMatch !== -1">{{
        getDigitStr(playerTimeAllMoves.mins) +
        ":" +
        getDigitStr(playerTimeAllMoves.secs)
      }}</SimpleInfo>
    </div>
    <div id="player-timers-opponent">
      <SimpleInfo name="move" v-show="props.opponentSecsMatch !== -1">{{
        getDigitStr(opponentTimeMove.mins) +
        ":" +
        getDigitStr(opponentTimeMove.secs)
      }}</SimpleInfo>
      <SimpleInfo name="match" v-show="props.opponentSecsMatch !== -1">{{
        getDigitStr(opponentTimeAllMoves.mins) +
        ":" +
        getDigitStr(opponentTimeAllMoves.secs)
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
  padding: var(--spacing-small);
}

#player-timers-player {
  background-color: var(--color-player-surface-accent);
}

#player-timers-opponent {
  background-color: var(--color-opponent-surface-accent);
}
</style>
