<script lang="ts" setup>
import { type PropType } from "vue";
import Backdrop from "./Backdrop.vue";
import FastButton from "./FastButton.vue";
import Game from "../modules/game";

const props = defineProps({
  open: { type: Boolean, default: false },
  game: { type: Object as PropType<Game>, required: true },
});
</script>

<template>
  <Backdrop
    z-index-category="status"
    v-show="props.open"
    @click="props.game.ui.toggleActionsPanel()"
  />
  <Transition name="slide-up">
    <nav v-show="props.open">
      <div class="actions">
        <FastButton
          @click="props.game.ui.toggleFragment('about')"
          icon-id="information-outline"
          title="About game"
        />
        <FastButton
          @click="props.game.ui.toggleFragment('help')"
          icon-id="help-circle-outline"
          title="Help"
        />
        <FastButton
          @click="props.game.ui.toggleFragment('statistics')"
          icon-id="chart-box-outline"
          title="Statistics"
        />
        <FastButton
          @click="props.game.requestResign()"
          icon-id="flag"
          title="Resign"
        />
        <FastButton
          @click="props.game.ui.manuallyTogglePause()"
          :icon-id="
            props.game.paused.value !== 'not' ? 'play-outline' : 'pause'
          "
          :title="`${
            props.game.paused.value !== 'not' ? 'Resume' : 'Pause'
          } game`"
        />
        <FastButton
          @click="props.game.ui.requestRestart()"
          icon-id="restart"
          title="New match"
        />
        <FastButton
          @click="props.game.ui.toggleFragment('settings')"
          icon-id="cog-outline"
          title="Configuration"
        />
      </div>
      <div class="nav-placeholder"></div>
    </nav>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

nav {
  @include shadow;
  @include no-overrender;
  width: fit-content;
  text-align: center;
  z-index: var(--z-index-status);
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  position: fixed;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  background-color: var(--color-primary-surface);

  .actions {
    padding: var(--spacing-small);
  }

  .nav-placeholder {
    height: 80px;
  }
}
</style>
