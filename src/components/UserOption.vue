<script lang="ts" setup>
import { capitalizeFirst } from "../modules/utils/misc";
import Icon from "./Icon.vue";

const props = defineProps({
  optionId: { type: String, required: true },
  iconId: { type: String },
  name: { type: String, required: true },
  description: { type: Boolean, default: true },
  simple: { type: Boolean, default: true },
});
</script>

<template>
  <div class="user-option">
    <label :for="props.optionId">
      <Icon v-if="props.iconId" :icon-id="props.iconId" side />
      <span class="title">{{ capitalizeFirst(props.name) }}</span>
      <span class="input simple" v-if="props.simple">
        <slot v-if="props.simple"></slot>
      </span>
    </label>
    <span
      class="description"
      v-if="props.description"
      :id="`${props.optionId}-description`"
    >
      <slot name="description"></slot>
    </span>
    <span class="input" v-if="!props.simple">
      <slot v-if="!props.simple"></slot>
    </span>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.user-option {
  display: flex;
  margin: var(--spacing-huge) 0;
  flex-direction: column;
  text-align: left;
  break-inside: avoid;

  label {
    @include flex-center;
  }

  .title {
    flex-grow: 1;
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
    &.simple {
      @include flex-center;
      height: 40px;
    }

    &:not(.simple) {
      aspect-ratio: 1;
      height: auto;
      padding-top: var(--spacing-medium);
    }
  }
}
</style>
