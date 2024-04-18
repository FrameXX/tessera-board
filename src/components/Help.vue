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
        <h3>Documentation of functions and use</h3>
        <h4>Status bar</h4>
        <p>
          Always located at the top and contains information about the current
          move and information about the time remaining if time limits are
          enabled
        </p>
        <h4>Chess board</h4>
        <p>
          A second chess board can be activated in the settings, if you are
          playing on a wider screen this can be useful. In addition, it can also
          be set to auto-rotate (table mode), which is useful if the players are
          sitting opposite each other.
        </p>
        <h5>Pulling pieces</h5>
        <p>
          To drag a piece, you can click on the piece and click on the box that
          is highlighted with a marker that indicates to the user that they can
          drag it onto the box, or you can grab the piece with your mouse or
          finger and manually drag the piece. On touchscreens, the figurine will
          automatically slide over your finger so you don't cover the figurine
          with it.
        </p>
        <h5>Marking fields</h5>
        <p>
          You can mark an empty field by clicking on it. Once marked, the field
          will display its corresponding number and letter (for example, H6) and
          mark any pieces that threaten/check that field. This behavior can be
          turned off in the settings.
        </p>
        <h4>Bar action</h4>
        <p>
          The user can click on the "ACTIONS" button to expand the next action
          card, or can fast forward or rewind moves using the arrow buttons.
        </p>
        <h4>Additional features</h4>

        <h5>Export and import data</h5>
        <p>
          All saved game data can be exported to a json file in the settings and
          then imported again, perhaps on another device.
        </p>
        <h5>Setting the default figure layout</h5>
        <p>
          In the settings, you can adjust the default layout of the pieces at
          the start of the game pretty much as much as you want. Every time you
          start a new game this default board layout is copied to the game
          board.
        </p>
        <p>
          There's more, of course, but I won't describe every detail... Most can
          be adjusted in the settings.
        </p>
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
