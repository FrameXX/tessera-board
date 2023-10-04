<script lang="ts" setup>
import { watch, ref } from "vue";
import Icon from "./Icon.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const checked = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    checked.value = newValue;
  }
);

function toggle() {
  checked.value = !checked.value;
  emit("update:modelValue", checked.value);
}
</script>

<template>
  <button
    @click="toggle()"
    class="checkbox"
    role="checkbox"
    :aria-checked="checked"
  >
    <Transition name="card">
      <Icon v-show="checked" icon-id="check" />
    </Transition>
  </button>
</template>

<style lang="scss">
@import "../partials/mixins";

.checkbox {
  border: var(--border-width) solid var(--color-primary-accent);
  width: 22px;
  height: 22px;
  padding: var(--spacing-tiny);

  .icon {
    width: 24px;
    height: 24px;
    margin: 0;
    color: var(--color-primary-text);
  }
}

.card-enter-active,
.card-leave-active {
  transition: transform var(--transition-duration-short) ease-in;
}

.card-enter-from,
.card-leave-to {
  transform: scaleY(0);
}
</style>
