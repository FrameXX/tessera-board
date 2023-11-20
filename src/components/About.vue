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
        <header>
          <h1>Tessera board</h1>
          <small class="version">v0.0.0 (16)</small>
        </header>
        <p>Made with ❤️ by Jiří Král.</p>
        <p>
          Source code is availible at
          <a href="https://github.com/FrameXX/tessera-board" target="_blank"
            >Github repository</a
          >.
        </p>
        <p>
          This software is licensed under
          <a href="https://www.gnu.org/licenses/agpl-3.0.en.html" target="_blank"
            >GNU Affero General Public License v3</a
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

  p {
    margin: var(--spacing-small) 0;
  }

  > .content {
    padding: var(--spacing-big);
    left: 0;
    right: 0;
    margin: auto;
    max-width: 900px;
  }
}
</style>
