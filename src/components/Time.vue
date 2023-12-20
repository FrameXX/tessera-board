import { PropType } from 'vue';
<script setup lang="ts">
import { PropType } from "vue";
import { MinSecTime, getDigitStr } from "../modules/utils/misc";

defineProps({
  time: { type: Object as PropType<MinSecTime>, required: true },
});
</script>

<template>
  {{ getDigitStr($props.time.mins) }}:{{ getDigitStr($props.time.secs) }}
</template>
