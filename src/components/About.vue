<script lang="ts" setup>
import Backdrop from "./Backdrop.vue";

const props = defineProps({ open: { type: Boolean, default: false } });
</script>

<template>
  <Backdrop v-show="props.open" />
  <Transition name="slide-up">
    <div id="about" v-show="props.open">
      <div class="content">
        <img id="logo" src="../assets/img/favicon.svg" />
        <h1>Tessera board</h1>
        <small class="version">v0.0.0 (12)</small>
        <p>
          Made with ❤️ by Jiří Král.
          <br />
          Source code is availible at
          <a href="https://github.com/FrameXX/tessera-board" target="_blank"
            >Github repository</a
          >.
          <br />
          This software is licensed under
          <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank"
            >General Public License v3.0</a
          >.
        </p>
        <div class="nav-placeholder"></div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

#about {
  @include flex-center;
  @include fix-centered;
  @include scrollable;
  @include shadow;
  text-align: center;
  overflow-x: hidden;
  z-index: var(--z-index-top-fragment);
  height: 100%;
  background-color: var(--color-primary-surface);

  #logo {
    width: 150px;
  }

  > .content {
    padding: var(--spacing-big);
    left: 0;
    right: 0;
    margin: auto;
    max-width: 900px;
  }

  p {
    padding: var(--spacing-big) 0;
    line-height: 28px;
  }
}
</style>
