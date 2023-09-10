<script lang="ts" setup>
import { ref, watch, onMounted, PropType } from "vue";
import { capitalizeFirst } from "../modules/utils/misc";
import Backdrop from "./Backdrop.vue";

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  open: { type: Boolean, default: false },
  focusOnOpen: { type: Object as PropType<HTMLElement | null>, default: null },
});
const emit = defineEmits(["open", "close", "backdropClick"]);

const buttons = ref<HTMLDivElement | null>(null);
let lastButton: undefined | HTMLButtonElement;
onMounted(() => {
  const lastChild = buttons.value?.lastElementChild;
  if (lastChild instanceof HTMLButtonElement) {
    lastButton = lastChild;
  }
});
watch(
  () => props.open,
  () => {
    if (props.open) {
      // HACK: The timeout is here only becuase for the button to be focuseable the dialog element can't have display style set to none
      setTimeout(() => {
        emit("open");
        if (props.focusOnOpen) {
          props.focusOnOpen.focus();
          return;
        }
        if (lastButton) {
          lastButton?.focus();
        } else {
          console.error(
            "Reference of last button of WindowDialog is null, thus impossible to focus."
          );
        }
      }, 10);
    } else {
      emit("close");
    }
  }
);
</script>

<template>
  <Backdrop v-show="props.open" @click="$emit('backdropClick')" />
  <Transition name="throw">
    <dialog
      v-show="props.open"
      class="dialog-window"
      :id="`${props.id}-dialog`"
      :aria-label="props.title"
    >
      <div class="content">
        <h2>{{ capitalizeFirst(props.title) }}</h2>
        <slot></slot>
      </div>
      <div class="action-buttons" ref="buttons">
        <slot name="action-buttons"> </slot>
      </div>
    </dialog>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

.dialog-window {
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
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
  }

  > .action-buttons {
    @include no-shrink;
    margin-top: var(--spacing-medium);
    width: 100%;
    text-align: end;
  }
}

#name-config-dialog {
  input,
  textarea {
    @include fill-availible;
    margin: var(--spacing-small) 0;
  }

  textarea {
    resize: vertical;
    height: 150px;
    max-height: 350px;
    min-height: 50px;
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

#choose-action-dialog {
  text-align: left;

  button {
    display: flex;
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
