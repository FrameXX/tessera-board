<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  id: { type: String },
});
const emit = defineEmits(["update:modelValue"]);

const minutes = computed(() => {
  return Math.trunc(props.modelValue / 60);
});

const seconds = computed(() => {
  return props.modelValue % 60;
});

function updateSeconds(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    console.error(
      "Could not get seconds value of seconds input. The event target is not a HTMLInputElement."
    );
    return;
  }
  emit("update:modelValue", minutes.value * 60 + +event.target.value);
}

function updateMinutes(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    console.error(
      "Could not get seconds value of minutes input. The event target is not a HTMLInputElement."
    );
    return;
  }
  emit("update:modelValue", +event.target.value * 60 + seconds.value);
}
</script>

<template>
  <div class="time-duration-input">
    <input
      ref="minutesInput"
      min="0"
      type="number"
      :id="`minutes-${props.id}`"
      :value="minutes"
      @input="updateMinutes($event)"
    />:<input
      ref="seconds"
      min="0"
      max="59"
      type="number"
      :id="`seconds-${props.id}`"
      :value="seconds"
      @input="updateSeconds($event)"
    />
  </div>
</template>

<style lang="scss">
.time-duration-input {
  input {
    max-width: 60px;
    display: inline-block;
  }
}
</style>
