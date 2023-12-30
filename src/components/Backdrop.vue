<script setup lang="ts">
const props = defineProps({
  zIndexCategory: { type: String, default: "top-fragment" },
});
</script>

<template>
  <Transition name="opacity">
    <div
      :style="`z-index: var(--z-index-${props.zIndexCategory});`"
      class="backdrop"
      aria-hidden="true"
      tabindex="0"
      role="presentation"
    ></div>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

.backdrop {
  @include screen;
  z-index: var(--z-index-modal);
  background-color: var(--color-backdrop);
  opacity: 0.9;
}

.opacity-enter-active,
.opacity-leave-active {
  transition: opacity var(--transition-duration-medium) linear;
}

.opacity-enter-from,
.opacity-leave-to {
  opacity: 0;
}
</style>
