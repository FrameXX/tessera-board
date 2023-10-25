<script lang="ts" setup>
import { type PropType, ref, watch, computed } from "vue";
import { getDigitStr, getMinsAndSecsTime } from "../modules/utils/misc";
import DurationDialog from "../modules/dialogs/duration";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  id: { type: String },
  durationDialog: { type: Object as PropType<DurationDialog>, required: true },
});
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

async function set() {
  const newValue = await props.durationDialog.show(
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
    :id="props.id"
    @click="set"
  >
    {{ getDigitStr(duration.mins) }}:{{ getDigitStr(duration.secs) }}
  </button>
</template>

<style lang="scss">
.set-time-duration {
  font-weight: 400;
  height: 25px;
  width: 40px;
  color: var(--color-primary-text);
  border: var(--border-width) solid var(--color-primary-accent);
}
</style>
