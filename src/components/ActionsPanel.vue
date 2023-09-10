<script lang="ts" setup>
import { watch } from "vue";
import Backdrop from "./Backdrop.vue";
import Icon from "./Icon.vue";

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["open", "close", "backdropClick"]);

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
    <div class="actions-panel" v-show="props.open">
      <button>
        <Icon icon-id="play-outline" side />
        Start new game
      </button>
      <button>
        <Icon icon-id="pause" side />
        Pause game
      </button>
      <button>
        <Icon icon-id="flag-outline" side />
        Draw
      </button>
      <div class="nav-placeholder"></div>
    </div>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

.actions-panel {
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
    height: 74px;
  }
}
</style>
