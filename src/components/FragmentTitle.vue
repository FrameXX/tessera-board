<script lang="ts" setup>
import Icon from "./Icon.vue";

const props = defineProps({ iconId: { type: String, required: true } });
</script>

<template>
  <div class="fragment-title">
    <Icon :icon-id="props.iconId" side big />
    <h2>
      <slot></slot>
    </h2>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.fragment-title {
  @include flex-center;
  padding: 0 var(--spacing-medium);
}
</style>
