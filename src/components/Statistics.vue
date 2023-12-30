<script lang="ts" setup>
import Backdrop from "./Backdrop.vue";

const props = defineProps({ open: { type: Boolean, default: false } });
</script>

<template>
  <Backdrop z-index-category="status" v-show="props.open" />
  <Transition name="slide-up">
    <div class="fragment" id="statistics" v-show="props.open">
      <div class="content">
        <div id="status-placeholder"></div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

#statistics {
  z-index: var(--z-index-status);
}

#status-placeholder {
  height: 68px;
}
</style>
