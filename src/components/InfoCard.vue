<script lang="ts" setup>
import Icon from "./Icon.vue";

const props = defineProps({
  iconId: { type: String, default: "information-outline" },
});
</script>

<template>
  <div class="info-card">
    <Icon :icon-id="props.iconId" side />
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.info-card {
  @include flex-center;
  @include shadow;
  @include round-border;
  font-size: var(--font-size-small);
  margin: var(--spacing-big) 0;
  padding: var(--spacing-small);
  background-color: var(--color-primary-surface-top);
  width: fit-content;

  .content {
    columns: 1;
  }
}
</style>
