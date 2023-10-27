<script lang="ts" setup>
import { ref, watch, computed, inject } from "vue";
import { getDigitStr, getMinsAndSecsTime } from "../modules/utils/misc";
import DurationDialog from "../modules/dialogs/duration";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  id: { type: String },
});

const durationDialog = inject("durationDialog") as DurationDialog;

const emit = defineEmits(["update:modelValue"]);

const seconds = ref(props.modelValue);
const duration = computed(() => {
  return getMinsAndSecsTime(seconds.value);
});

watch(
  () => props.modelValue,
  (newValue) => {
    seconds.value = newValue;
  }
);

const text = computed(() => {
  if (duration.value.mins === 0 && duration.value.secs === 0) {
    return "∞";
  } else {
    return `${getDigitStr(duration.value.mins)}:${getDigitStr(
      duration.value.secs
    )}`;
  }
});

async function set() {
  const newValue = await durationDialog.show(
    duration.value.mins,
    duration.value.secs
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
    class="set-time-duration"
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
