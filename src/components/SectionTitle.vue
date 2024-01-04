<script lang="ts" setup>
const props = defineProps({ title: { type: String, required: true } });
</script>

<template>
  <div
    class="section-title"
    :aria-label="props.title"
    :title="props.title"
    v-text="props.title"
  ></div>
</template>

<style lang="scss">
@import "../partials/mixins";

.section-title {
  @include shadow;
  @include round-border;
  background-color: var(--color-primary-accent);
  width: fit-content;
  font-size: var(--font-size-small);
  font-weight: bold;
  padding: var(--spacing-small);
}
</style>
