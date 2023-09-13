<script lang="ts" setup>
import { watch } from "vue";
import Backdrop from "./Backdrop.vue";
import Icon from "./Icon.vue";

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["open", "close", "backdropClick", "configureGame"]);

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
      <span class="section-title">Game</span>
      <button
        aria-label="Configure game"
        title="Configure game"
        @click="$emit('configureGame')"
      >
        <Icon icon-id="cog-outline" side />
        Configure game
      </button>
      <span class="section-title">Current match</span>
      <button aria-label="Pause match" title="Pause match">
        <Icon icon-id="pause" side />
        Pause match
      </button>
      <button aria-label="Resign" title="Resign">
        <Icon icon-id="flag" side />
        Resign
      </button>
      <button aria-label="Start new match" title="Start new match">
        <Icon icon-id="play-outline" side />
        Start new match
      </button>
      <div class="nav-placeholder"></div>
    </nav>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

nav {
  @include shadow;
  z-index: var(--z-index-modal);
  display: flex;
  flex-direction: column;
  align-items: center;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  position: fixed;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  background-color: var(--color-primary-surface);
  padding: var(--spacing-small);
  max-width: 450px;

  .section-title {
    width: fit-content;
    margin: var(--spacing-small);
  }

  button {
    @include fill-availible;
    justify-content: left;
    display: flex;
  }

  .nav-placeholder {
    height: 80px;
  }
}
</style>
