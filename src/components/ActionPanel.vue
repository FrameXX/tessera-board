<script lang="ts" setup>
import { watch } from "vue";
import Backdrop from "./Backdrop.vue";
import FastButton from "./FastButton.vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  statusText: { type: String, required: true },
});
const emit = defineEmits([
  "open",
  "close",
  "backdropClick",
  "configureGame",
  "restartGame",
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
        <FastButton icon-id="flag" title="Resign" />
        <FastButton icon-id="pause" title="Pause match" />
        <FastButton
          @click="$emit('restartGame')"
          icon-id="restart"
          title="New match (Shift + R)"
        />
        <FastButton
          @click="$emit('configureGame')"
          icon-id="cog-outline"
          title="Config game (Shift + C)"
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
