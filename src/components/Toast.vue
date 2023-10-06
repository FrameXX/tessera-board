<!-- Toast message/alert -->

<script lang="ts" setup>
import Icon from "./Icon.vue";
import { PropType } from "vue";
import { ToastCase } from "../modules/toast_manager";

const props = defineProps({
  message: { type: String, required: true },
  case: { type: String as PropType<ToastCase>, default: "info" },
  iconId: { type: String, required: false },
});
</script>

<template>
  <div
    :class="'toast ' + props.case"
    role="alert"
    aria-live="assertive"
    tabindex="0"
  >
    <Icon v-if="props.iconId" :icon-id="props.iconId" side />
    {{ props.message }}
    <div class="close-overlay">
      <Icon icon-id="close" side />
      DISMISS
    </div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.toast {
  @include flex-center;
  @include shadow;
  @include round-border;
  @include clickable;
  @include no-overrender;
  @include no-overflow;
  @include no-select;
  margin: var(--spacing-small);
  position: relative;
  padding: var(--spacing-medium);
  border-width: var(--border-width);
  border-style: solid;

  &.info {
    border-color: var(--color-primary-accent);
    background-color: var(--color-primary-surface-top);
    color: var(--color-primary-text);
  }

  &.error {
    background-color: var(--color-error-surface-top);
    color: var(--color-error-text);
    border-color: var(--color-error-accent);
  }

  > .close-overlay {
    @include flex-center;
    @include stretch;
    position: fixed;
    background-color: var(--color-primary-surface-top);
    opacity: 0;
    transition: opacity var(--transition-duration-medium) linear;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
