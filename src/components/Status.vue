<script lang="ts" setup>
const props = defineProps({ text: { type: String, required: true } });
</script>

<template>
  <div class="status">{{ props.text }}</div>
</template>

<style lang="scss">
@import "../partials/mixins";

.status {
  @include shadow;
  width: 100%;
  text-align: center;
  font-size: var(--font-size-small);
  background-color: var(--color-primary-surface-accent);
  text-transform: uppercase;
  padding: var(--spacing-small);
  border-bottom: var(--border-width) solid var(--color-primary-accent);
  transition: background-color var(--transition-duration-medium) linear;
}
</style>
