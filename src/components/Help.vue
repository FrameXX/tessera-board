<script lang="ts" setup>
import Backdrop from "./Backdrop.vue";
import FragmentTitle from "./FragmentTitle.vue";

const props = defineProps({ open: { type: Boolean, default: false } });
</script>

<template>
  <Backdrop v-show="props.open" />
  <Transition name="slide-up">
    <div class="fragment" id="help" v-show="props.open">
      <div class="content">
        <FragmentTitle icon-id="help-circle-outline">Help</FragmentTitle>
        <h3>Keyboard shortcuts</h3>
        <div id="keyboard-shortcuts">
          <div class="shortcut">
            <div class="keys"><div class="key">Esc</div></div>
            Close dialogs, windows and toggle action panel
          </div>
          <div class="shortcut">
            <div class="keys">
              <div class="stroke">
                <div class="key">Shift</div>
                +
                <div class="key">C</div>
              </div>
            </div>
            Open game configuration
          </div>
          <div class="shortcut">
            <div class="keys">
              <div class="stroke">
                <div class="key">Shift</div>
                +
                <div class="key">R</div>
              </div>
            </div>
            Restart the game (confirmation dialog will be skipped)
          </div>
          <div class="shortcut">
            <div class="keys">
              <div class="stroke">
                <div class="key">Shift</div>
                +
                <div class="key">P</div>
              </div>
            </div>
            Pause/resume the game
          </div>
          <div class="shortcut">
            <div class="keys">
              <div class="stroke">
                <div class="key">Shift</div>
                +
                <div class="key">Z</div>
              </div>
              <div class="stroke">
                <div class="key">Ctrl</div>
                +
                <div class="key">Z</div>
              </div>
              <div class="stroke">
                <div class="key">←</div>
              </div>
            </div>
            Previous move
          </div>
          <div class="shortcut">
            <div class="keys">
              <div class="stroke">
                <div class="key">Shift</div>
                +
                <div class="key">Y</div>
              </div>
              <div class="stroke">
                <div class="key">Ctrl</div>
                +
                <div class="key">Y</div>
              </div>
              <div class="stroke">
                <div class="key">→</div>
              </div>
            </div>
            Next move
          </div>
        </div>
        <div class="nav-placeholder"></div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@import "../partials/mixins";

.shortcut {
  @include shadow;
  @include round-border;

  margin: var(--spacing-medium) 0;
  padding: var(--spacing-medium);
  break-inside: avoid;
  background-color: var(--color-primary-surface-top);
  font-size: var(--font-size-small);
}

.stroke {
  margin-top: var(--spacing-medium);
}

.stroke::first-child {
  margin-top: 0;
}

.keys {
  padding-bottom: var(--spacing-medium);
}

.key {
  @include shadow;
  @include round-border;

  display: inline-block;
  background-color: var(--color-primary-accent);
  padding: var(--spacing-small);
}

@media only screen and (min-width: 600px) {
  #help #keyboard-shortcuts {
    column-count: 2;
  }
}

#keyboard-shortcuts .shortcut:first-child {
  margin-top: 0;
}
</style>
