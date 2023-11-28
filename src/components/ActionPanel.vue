<script lang="ts" setup>
import { type PropType, watch } from "vue";
import Backdrop from "./Backdrop.vue";
import FastButton from "./FastButton.vue";
import { GamePausedState } from "../modules/user_data/game_paused";

const props = defineProps({
  open: { type: Boolean, default: false },
  statusText: { type: String, required: true },
  gamePaused: { type: String as PropType<GamePausedState>, required: true },
});
const emit = defineEmits([
  "open",
  "close",
  "backdropClick",
  "configureGame",
  "restartGame",
  "aboutGame",
  "pause",
  "resign",
]);

watch(
  () => props.open,
  () => {
    props.open ? emit("open") : emit("close");
  }
);
</script>

<template>
  <Backdrop v-show="props.open" @click="$emit('backdropClick')" />
  <Transition name="slide-up">
    <nav v-show="props.open">
      <div class="actions">
        <FastButton
          @click="$emit('aboutGame')"
          icon-id="information-outline"
          title="About game"
        />
        <FastButton @click="emit('resign')" icon-id="flag" title="Resign" />
        <FastButton
          @click="$emit('pause')"
          :icon-id="props.gamePaused !== 'not' ? 'play-outline' : 'pause'"
          :title="`${props.gamePaused !== 'not' ? 'Resume' : 'Pause'} game`"
        />
        <FastButton
          @click="$emit('restartGame')"
          icon-id="restart"
          title="New match"
        />
        <FastButton
          @click="$emit('configureGame')"
          icon-id="cog-outline"
          title="Config game"
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
  z-index: var(--z-index-modal);
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
