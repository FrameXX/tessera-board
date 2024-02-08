<script lang="ts" setup>
import { PropType } from "vue";
import Toast from "./Toast.vue";
import Toaster from "../modules/toaster/toaster";

const props = defineProps({
  toaster: { type: Object as PropType<Toaster>, required: true },
});
defineEmits({
  toastDismiss: (event: { id: string }) => {
    return typeof event.id === "string";
  },
});
</script>

<template>
  <div id="toast-stack" aria-label="Toast notifications">
    <TransitionGroup name="slide-down">
      <Toast
        v-for="toast in props.toaster.toasts.value"
        :message="toast.message"
        :case="toast.type"
        :icon-id="toast.iconId"
        :key="toast.id"
        @click="() => $emit('toastDismiss', { id: toast.id })"
      ></Toast>
    </TransitionGroup>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

#toast-stack {
  z-index: var(--z-index-alert);
  align-items: center;
  position: fixed;
  display: flex;
  flex-direction: column-reverse;
  top: 0;
  left: 0;
  right: 0;
  margin: auto;
  padding: var(--spacing-small);
  pointer-events: none;
}
</style>
