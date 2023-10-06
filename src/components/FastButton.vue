<script lang="ts" setup>
import Icon from "./Icon.vue";

const props = defineProps({
  title: { type: String, required: true },
  iconId: { type: String, required: true },
});

defineEmits(["click"]);
</script>

<template>
  <div class="fast-button-wrapper">
    <button
      @click="$emit('click')"
      :aria-label="props.title"
      :title="props.title"
    >
      <Icon :icon-id="props.iconId" />
    </button>
    <div class="title">{{ props.title }}</div>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.fast-button-wrapper {
  @include flex-center(inline-flex);
  text-align: center;
  flex-direction: column;
  width: 60px;
  height: 100px;
  padding: var(--spacing-medium);

  > button {
    @include no-shrink;
    box-sizing: content-box;
    padding: var(--spacing-small);
  }

  > .title {
    height: 100%;
    font-size: var(--font-size-tiny);
  }
}
</style>
