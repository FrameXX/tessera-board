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
      :title="`${props.name} category`"
    >
      <Icon :icon-id="props.iconId" side />
      <h3>{{ capitalizeFirst(props.name) }}</h3>
      <Icon
        :class="`caret ${open ? 'open' : ''}`"
        icon-id="chevron-down"
      ></Icon>
    </button>
    <Transition name="land">
      <div v-show="open" class="content" :id="`category-content-${props.name}`">
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
@import "../partials/mixins";

@media only screen and (min-width: 650px) {
  .category .content {
    column-count: 2;
  }
}

.category {
  display: flex;
  flex-direction: column;
  margin: var(--spacing-big) 0;
  column-gap: var(--spacing-small);

  > button {
    height: auto;
  }

  .head {
    @include clickable;
    @include flex-center;
    @include round-border;
    margin: 0;
    padding: 0 var(--spacing-medium);

    .icon {
      @include no-shrink;
    }
  }

  .caret {
    transition: transform var(--transition-duration-medium)
      var(--transition-timing-jump);

    &.open {
      transform: rotateX(0.5turn);
    }
  }

  > .content {
    padding: var(--spacing-huge) 0;
  }
}
</style>
