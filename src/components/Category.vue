<script lang="ts" setup>
import { ref } from "vue";
import Icon from "./Icon.vue";
import { capitalizeFirst } from "../modules/utils/misc";

const props = defineProps({
  name: { type: String, required: true },
  iconId: { type: String, required: true },
});

const open = ref<Boolean>(false);
</script>

<template>
  <div class="category">
    <button
      @click="open = !open"
      class="head"
      :aria-controls="`category-content-${props.name}`"
    >
      <Icon :icon-id="props.iconId" side />
      <h2>{{ capitalizeFirst(props.name) }}</h2>
      <Icon
        :class="`caret ${open ? 'open' : ''}`"
        icon-id="chevron-down"
      ></Icon>
    </button>
    <Transition name="fade-down">
      <div v-show="open" class="content" :id="`category-content-${props.name}`">
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

.category {
  display: flex;
  flex-direction: column;
  margin: var(--spacing-big) 0;

  .head {
    @include clickable;
    @include flex-center;
    @include round-border;
    margin: 0;
    padding: 0 var(--spacing-medium);
    background-color: var(--color-primary-surface-top);

    .icon {
      @include no-shrink;
    }
  }

  h2 {
    text-transform: none;
    text-align: left;
    flex-grow: 1;
  }

  .caret {
    transition: transform var(--transition-duration-medium)
      var(--transition-timing-function-motion);

    &.open {
      transform: rotateX(0.5turn);
    }
  }

  > .content {
    @include no-overrender;
    padding-top: var(--spacing-big);
  }
}

.fade-down-enter-active {
  transition: transform var(--transition-duration-medium)
      var(--transition-timing-function-motion),
    opacity var(--transition-duration-medium)
      var(--transition-timing-function-display);
}

.fade-down-enter-from {
  transform: translateY(-5px);
  opacity: 0;
}
</style>
