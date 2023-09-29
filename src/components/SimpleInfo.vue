<script lang="ts" setup>
import { capitalizeFirst } from "../modules/utils/misc";

const props = defineProps({
  name: { type: String, required: true },
  contentRole: { type: String },
});
</script>

<template>
  <div class="simple-info">
    <div class="name">{{ capitalizeFirst(props.name) }}</div>
    <div class="content" :role="props.contentRole">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
.simple-info {
  display: flex;
  padding: var(--spacing-small);
  flex-direction: column;

  .name {
    font-size: var(--font-size-small);
    padding: var(--spacing-tiny) 0;
  }
}
</style>
