<script lang="ts" setup>
import { capitalizeFirst } from "../modules/utils/misc";
import Backdrop from "./Backdrop.vue";

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  open: { type: Boolean, default: false },
});
</script>

<template>
  <Backdrop v-show="props.open" />
  <Transition name="throw">
    <dialog
      v-show="props.open"
      class="window-dialog"
      :id="`${props.id}-dialog`"
      :aria-label="props.title"
    >
      <div class="content">
        <h2>{{ capitalizeFirst(props.title) }}</h2>
        <slot></slot>
      </div>
      <div class="action-buttons">
        <slot name="action-buttons"> </slot>
      </div>
    </dialog>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

.window-dialog {
  @include fix-centered;
  @include flex-center(inline-block);
  @include shadow;
  @include round-border;
  padding: var(--spacing-big);
  display: flex;
  flex-direction: column;
  background-color: var(--color-primary-surface);
  max-height: calc(100% - var(--spacing-huge) * 3);
  max-width: calc(100% - var(--spacing-huge) * 3);
  width: 450px;

  .content {
    overflow: auto;
  }

  > .action-buttons {
    @include no-shrink;
    margin-top: var(--spacing-medium);
    width: 100%;
    text-align: end;
  }
}

#confirm-dialog > .message {
  .message {
    margin-top: 0;
  }
}

#config-piece-dialog {
  display: flex;
  align-items: normal;

  .piece-preview {
    @include flex-center;

    .icon {
      filter: var(--svg-shadow-filter);
      padding: var(--spacing-medium);
      width: 65px;
      height: 65px;
    }
  }
}

.throw-enter-active {
  transition: transform var(--transition-duration-short)
      var(--transition-timing-jump),
    opacity var(--transition-duration-short) linear;
}

.throw-leave-active {
  transition: transform var(--transition-duration-medium)
      var(--transition-timing-jump),
    opacity var(--transition-duration-medium) linear;
}

.throw-leave-to {
  opacity: 0;
  transform: translateX(100%) rotate(0.5turn);
}

.throw-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
