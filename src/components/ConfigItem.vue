<script lang="ts" setup>
import Icon from "./Icon.vue";

const props = defineProps({
  id: { type: String, required: true },
  name: { type: String, required: true },
  predefined: { type: Boolean, required: true },
});
</script>

<template>
  <div class="config-item">
    <div class="title">{{ props.name }}</div>
    <div class="action-buttons">
      <button
        v-if="!props.predefined"
        class="fast"
        :title="`Delete configuration ${props.name}`"
        :aria-label="`Delete configuration ${props.name}`"
      >
        <Icon icon-id="delete-forever-outline" />
      </button>
      <button
        v-if="!props.predefined"
        class="fast"
        :title="`Overwrite configuration ${props.name}`"
        :aria-label="`Overwrite configuration ${props.name}`"
      >
        <Icon icon-id="content-save-all-outline" />
      </button>
      <button
        class="fast"
        :title="`Load configuration ${props.name}`"
        :aria-label="`Load configuration ${props.name}`"
      >
        <Icon icon-id="open-in-new" />
      </button>
    </div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.config-item {
  @include shadow;
  @include round-border;
  border: var(--border-width) solid var(--color-primary-accent);
  padding: var(--spacing-medium);
  display: flex;
  flex-direction: column;

  .title {
    padding-bottom: var(--spacing-big);
    font-weight: 600;
  }

  .action-buttons {
    button {
      margin: 0;
      margin-right: var(--spacing-small);
    }
  }
}
</style>
