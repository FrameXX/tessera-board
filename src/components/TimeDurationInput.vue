<script lang="ts" setup>
import { ref, watch, computed, inject } from "vue";
import DurationDialog from "../modules/dialogs/duration";
import Duration from "../modules/utils/duration";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  id: { type: String },
});

const durationDialog = inject("durationDialog") as DurationDialog;

const emit = defineEmits(["update:modelValue"]);

const seconds = ref(props.modelValue);
const duration = computed(() => {
  return new Duration(seconds.value);
});

watch(
  () => props.modelValue,
  (newValue) => {
    seconds.value = newValue;
  }
);

const text = computed(() => {
  return duration.value.stringifiedLimit;
});

async function set() {
  const newValue = await durationDialog.show(
    duration.value.minutes,
    duration.value.seconds
  );
  if (newValue === null) {
    return;
  }
  seconds.value = newValue;
  emit("update:modelValue", seconds.value);
}
</script>

<template>
  <button
    title="Set time duration"
    class="set-time-duration form"
    :class="{ infinite: text === '∞' }"
    :id="props.id"
    @click="set"
    v-text="text"
  ></button>
</template>

<style lang="scss">
.set-time-duration {
  font-weight: 400;
  height: 25px;
  width: 40px;
  color: var(--color-primary-text);
  border: var(--border-width) solid var(--color-primary-accent);

  &.infinite {
    font-size: var(--font-size-huge);
  }
}
</style>
