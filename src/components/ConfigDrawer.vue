<script lang="ts" setup>
import Backdrop from "./Backdrop.vue";

const props = defineProps({ open: { type: Boolean, default: false } });
</script>

<template>
  <Backdrop v-show="props.open" />
  <Transition name="slide-up">
    <div class="drawer" v-show="props.open">
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

header {
  margin-bottom: var(--spacing-huge);
}

.drawer {
  @include fix-centered;
  @include scrollable;
  @include shadow;
  height: 100%;
  background-color: var(--color-primary-surface);

  > .content {
    padding: var(--spacing-medium);
    left: 0;
    right: 0;
    margin: auto;
    max-width: 450px;
  }

  .nav-placeholder {
    height: 90px;
  }
}

.board-box {
  aspect-ratio: 1;
  height: auto;
}
</style>
