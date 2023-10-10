<script lang="ts" setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  id: { type: String },
});
const emit = defineEmits(["update:modelValue"]);

const minutes = ref(Math.trunc(props.modelValue / 60));
const seconds = ref(props.modelValue % 60);

function updateModelValue() {
  emit("update:modelValue", +minutes.value * 60 + +seconds.value);
}

watch(minutes, updateModelValue);
watch(seconds, updateModelValue);
</script>

<template>
  <div class="time-duration-input">
    <input
      min="0"
      type="number"
      :id="`minutes-${props.id}`"
      v-model="minutes"
    />:<input
      min="0"
      max="59"
      type="number"
      :id="`seconds-${props.id}`"
      v-model="seconds"
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
