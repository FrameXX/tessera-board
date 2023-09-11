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
      <button @click="$emit('configureGame')">
        <Icon icon-id="cog-outline" side />
        Configure game
      </button>
      <button>
        <Icon icon-id="pause" side />
        Pause game
      </button>
      <button>
        <Icon icon-id="flag" side />
        Draw
      </button>
      <button>
        <Icon icon-id="play-outline" side />
        Start new game
      </button>
      <div class="nav-placeholder"></div>
    </nav>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

nav {
  @include shadow;
  display: flex;
  flex-direction: column;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  position: fixed;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  background-color: var(--color-primary-surface);
  padding: var(--spacing-small);
  max-width: 450px;

  button {
    justify-content: left;
    display: flex;
  }

  .nav-placeholder {
    height: 72px;
  }
}
</style>
