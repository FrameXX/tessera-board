<script lang="ts" setup>
import Icon from "./Icon.vue";

const props = defineProps({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  predefined: { type: Boolean, required: true },
});

defineEmits({
  delete: (event: { id: string }) => {
    return typeof event.id === "string";
  },
  rename: (event: {
    id: string;
    currentName: string;
    currentDescription: string;
  }) => {
    return (
      typeof event.id === "string" &&
      typeof event.currentName === "string" &&
      typeof event.currentDescription === "string"
    );
  },
  restore: (event: { id: string; predefined: boolean }) => {
    return (
      typeof event.id === "string" && typeof event.predefined === "boolean"
    );
  },
});
</script>

<template>
  <div class="config-item">
    <div class="title">{{ props.name }}</div>
    <div v-show="props.description !== ''" class="description">
      {{ props.description }}
    </div>
    <div class="action-buttons">
      <button
        v-if="!props.predefined"
        @click="$emit('delete', { id: props.id })"
        class="fast"
        :title="`Delete configuration ${props.name}`"
        :aria-label="`Delete configuration ${props.name}`"
      >
        <Icon icon-id="delete-forever-outline" />
      </button>
      <button
        v-if="!props.predefined"
        @click="
          $emit('rename', {
            id: props.id,
            currentName: props.name,
            currentDescription: props.description,
          })
        "
        class="fast"
        :title="`Rename configuration ${props.name}`"
        :aria-label="`Rename configuration ${props.name}`"
      >
        <Icon icon-id="rename-outline" />
      </button>
      <button
        @click="
          $emit('restore', { id: props.id, predefined: props.predefined })
        "
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
  background-color: var(--color-primary-surface-top);
  border: var(--border-width) solid var(--color-primary-accent);
  padding: var(--spacing-medium);
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-big);

  .title {
    padding-bottom: var(--spacing-small);
    font-weight: bold;
    font-size: var(--font-size-big);
  }

  .description {
    font-size: var(--font-size-tiny);
    font-style: italic;
    padding-bottom: var(--spacing-big);
  }

  .action-buttons {
    text-align: right;

    button {
      margin: 0;
      margin-left: var(--spacing-small);
    }
  }
}
</style>
