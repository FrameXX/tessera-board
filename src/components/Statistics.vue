<script lang="ts" setup>
import { PropType, Ref, computed, inject } from "vue";
import Backdrop from "./Backdrop.vue";
import FragmentTitle from "./FragmentTitle.vue";
import Tile from "./Tile.vue";
import Game from "../modules/game";
import InfoCard from "./InfoCard.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  game: { type: Object as PropType<Game>, required: true },
});

const statusHeight = inject("statusHeight") as Ref<number>;

const primaryPlayerUnitExtentFactor = computed(() => {
  return (
    props.game.primaryPlayerUnitExtent.value /
    props.game.primaryPlayerMaxUnitExtent.value
  );
});

const secondaryPlayerUnitExtentFactor = computed(() => {
  return (
    props.game.secondaryPlayerUnitExtent.value /
    props.game.secondaryPlayerMaxUnitExtent.value
  );
});

const playersUnitExtentFactor = computed(() => {
  return (
    props.game.primaryPlayerUnitExtent.value /
    (props.game.secondaryPlayerUnitExtent.value +
      props.game.primaryPlayerUnitExtent.value)
  );
});
</script>

<template>
  <Backdrop z-index-category="status" v-show="props.open" />
  <Transition name="slide-up">
    <div class="fragment" id="statistics" v-show="props.open">
      <div class="content">
        <div
          id="status-placeholder"
          :style="`height: ${statusHeight}px;`"
        ></div>
        <FragmentTitle icon-id="chart-box-outline">Statistics</FragmentTitle>
        <InfoCard>
          Unit extent is a sum of importances of all pieces player has on board.
        </InfoCard>
        <Tile
          comparison
          icon-id="shield-crown-outline"
          title="Unit extent comparison"
          :subtitle="`${props.game.primaryPlayerUnitExtent.value}|${props.game.secondaryPlayerUnitExtent.value}`"
          :factor="playersUnitExtentFactor"
        />
        <div id="statistics-players">
          <div class="statistics-player">
            <h3>Primary player</h3>
            <Tile
              icon-id="shield-crown-outline"
              title="Unit extent"
              :subtitle="`${props.game.primaryPlayerUnitExtent.value}/${props.game.primaryPlayerMaxUnitExtent.value}`"
              :factor="primaryPlayerUnitExtentFactor"
            />
            <Tile
              icon-id="timer-sand"
              title="Move time"
              :subtitle="`${game.playerTimers.primaryPlayerMove.durationString.value}/${game.playerTimers.primaryPlayerMove.maxDurationString.value}`"
              :factor="
                props.game.playerTimers.primaryPlayerMove.elapsedFactor.value
              "
            />
            <Tile
              icon-id="timer-outline"
              title="Match time"
              :subtitle="`${game.playerTimers.primaryPlayerMatch.durationString.value}/${game.playerTimers.primaryPlayerMatch.maxDurationString.value}`"
              :factor="
                props.game.playerTimers.primaryPlayerMatch.elapsedFactor.value
              "
            />
          </div>
          <div class="statistics-player">
            <h3>Secondary player</h3>
            <Tile
              secondary
              icon-id="shield-crown-outline"
              title="Unit extent"
              :subtitle="`${props.game.secondaryPlayerUnitExtent.value}/${props.game.secondaryPlayerMaxUnitExtent.value}`"
              :factor="secondaryPlayerUnitExtentFactor"
            />
            <Tile
              secondary
              icon-id="timer-sand"
              title="Move time"
              :subtitle="`${game.playerTimers.secondaryPlayerMove.durationString.value}/${game.playerTimers.secondaryPlayerMove.maxDurationString.value}`"
              :factor="
                props.game.playerTimers.secondaryPlayerMove.elapsedFactor.value
              "
            />
            <Tile
              secondary
              icon-id="timer-outline"
              title="Match time"
              :subtitle="`${game.playerTimers.secondaryPlayerMatch.durationString.value}/${game.playerTimers.secondaryPlayerMatch.maxDurationString.value}`"
              :factor="
                props.game.playerTimers.secondaryPlayerMatch.elapsedFactor.value
              "
            />
          </div>
        </div>
        <div class="nav-placeholder"></div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

#statistics {
  z-index: var(--z-index-status);

  .tile {
    margin-bottom: var(--spacing-medium);
  }

  .statistics-player {
    break-inside: avoid;
  }

  .statistics-player:not(#statistics .statistics-player:first-child) {
    padding-top: 0.1px;
  }
}

@media only screen and (min-width: 600px) {
  #statistics #statistics-players {
    column-count: 2;
  }
}
</style>
