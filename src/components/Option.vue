<script lang="ts" setup>
import { capitalizeFirst } from "../modules/utils/misc";
import Icon from "./Icon.vue";

const props = defineProps({
  optionId: { type: String, required: true },
  iconId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
});
</script>

<template>
  <div class="simple-option">
    <label :for="props.optionId">
      <Icon :icon-id="props.iconId" side />
      <span class="title">{{ capitalizeFirst(props.name) }}</span>
      <span class="input">
        <slot></slot>
      </span>
    </label>
    <span class="description" :id="`${props.optionId}-description`">
      <slot name="description"></slot>
    </span>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.simple-option {
  display: flex;
  margin: var(--spacing-huge) 0;
  flex-direction: column;

  label {
    @include flex-center;
  }

  .title {
    flex-grow: 1;
    text-align: left;
  }

  .description {
    font-style: italic;
    font-size: var(--font-size-tiny);
    margin-top: var(--spacing-medium);
  }

  .input,
  .icon {
    @include no-shrink;
  }

  .input {
    @include flex-center;
    height: 40px;
  }
}
</style>
