<script lang="ts" setup>
import { computed } from "vue";
import SimpleInfo from "./SimpleInfo.vue";
import {
  getMinsAndSecsTime,
  type MinSecTime,
  getDigitStr,
} from "../modules/utils/misc";

const props = defineProps({
  playerSecsTurn: { type: Number, required: true },
  playerSecsAllTurns: { type: Number, required: true },
  opponentSecsTurn: { type: Number, required: true },
  opponentSecsAllTurns: { type: Number, required: true },
});

const playerTimeTurn = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.playerSecsTurn);
});
const playerTimeAllTurns = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.playerSecsAllTurns);
});
const opponentTimeTurn = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.opponentSecsTurn);
});
const opponentTimeAllTurns = computed<MinSecTime>(() => {
  return getMinsAndSecsTime(props.opponentSecsAllTurns);
});
</script>

<template>
  <div class="player-timers">
    <div id="player-timers-player">
      <SimpleInfo name="this turn" v-show="props.playerSecsTurn !== -1">{{
        getDigitStr(playerTimeTurn.mins) +
        ":" +
        getDigitStr(playerTimeTurn.secs)
      }}</SimpleInfo>
      <SimpleInfo name="all turns" v-show="props.playerSecsAllTurns !== -1">{{
        getDigitStr(playerTimeAllTurns.mins) +
        ":" +
        getDigitStr(playerTimeAllTurns.secs)
      }}</SimpleInfo>
    </div>
    <div id="player-timers-opponent">
      <SimpleInfo name="this turn" v-show="props.opponentSecsAllTurns !== -1">{{
        getDigitStr(opponentTimeTurn.mins) +
        ":" +
        getDigitStr(opponentTimeTurn.secs)
      }}</SimpleInfo>
      <SimpleInfo name="all turns" v-show="props.opponentSecsAllTurns !== -1">{{
        getDigitStr(opponentTimeAllTurns.mins) +
        ":" +
        getDigitStr(opponentTimeAllTurns.secs)
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
