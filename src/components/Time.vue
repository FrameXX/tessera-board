import { PropType } from 'vue';
<script setup lang="ts">
import { PropType } from "vue";
import { Duration, getDigitStr } from "../modules/utils/misc";

defineProps({
  time: { type: Object as PropType<Duration>, required: true },
});
</script>

<template>
  {{ getDigitStr($props.time.mins) }}:{{ getDigitStr($props.time.secs) }}
</template>
