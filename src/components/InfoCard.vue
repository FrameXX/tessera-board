<script lang="ts" setup>
import { PropType, computed } from "vue";
import Icon from "./Icon.vue";

const props = defineProps({
  type: { type: String as PropType<"info" | "warn">, default: "info" },
});

const iconId = computed(() => {
  let iconId = props.type === "info" ? "information-outline" : "alert-outline";
  return iconId;
});
</script>

<template>
  <div class="info-card">
    <Icon :icon-id="iconId" side big />
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
  padding: var(--spacing-medium);
  background-color: var(--color-primary-surface-top);
  border: var(--border-width) solid var(--color-primary-accent);

  .content {
    columns: 1;
  }
}
</style>
