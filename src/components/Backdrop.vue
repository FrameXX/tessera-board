<template>
  <Transition name="opacity">
    <div
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
