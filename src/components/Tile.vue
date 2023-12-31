<script setup lang="ts">
import { computed } from "vue";
import Icon from "./Icon.vue";

const props = defineProps({
  iconId: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  factor: { type: Number, default: 0 },
  secondary: { type: Boolean, default: false },
  comparison: { type: Boolean, default: false },
});

const full = computed(() => {
  return props.factor * 100;
});

const backgroundColor = computed(() => {
  if (props.comparison) return "var(--color-secondary-player-accent)";
  return props.secondary
    ? "var(--color-secondary-player-surface-accent)"
    : "var(--color-primary-player-surface-accent)";
});
const fillerColor = computed(() => {
  if (props.comparison) return "var(--color-primary-player-accent)";
  return props.secondary
    ? "var(--color-secondary-player-accent)"
    : "var(--color-primary-player-accent)";
});
</script>

<template>
  <div class="tile" :style="`background-color: ${backgroundColor}`">
    <div
      class="filler"
      :style="`width: ${full}%; background-color: ${fillerColor}`"
    ></div>
    <div class="content">
      <Icon :icon-id="props.iconId" side />
      <div class="text">
        <div class="title">{{ props.title }}</div>
        <div>{{ props.subtitle }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.tile {
  @include round-border;
  @include shadow;
  position: relative;
  display: flex;
  contain: paint;
  height: 68px;
  break-inside: avoid;

  .filler {
    transition: width var(--transition-duration-medium)
      var(--transition-timing-jump);
  }

  .content {
    color: var(--color-primary-text);
    font-weight: bold;
    display: flex;
    position: absolute;
    width: 100%;
    height: 100%;
    align-items: center;
    padding-left: var(--spacing-medium);
  }

  .text {
    display: flex;
    flex-direction: column;

    .title {
      font-size: var(--font-size-small);
    }
  }
}
</style>
