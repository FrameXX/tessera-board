<script lang="ts" setup>
import iconsUrl from "../assets/img/icons.svg";
const props = defineProps({
  iconId: { type: String, required: true },
  side: { type: Boolean, default: false },
  big: { type: Boolean, default: false },
  sourceFile: { type: String, default: iconsUrl },
  title: { type: String, required: false },
});
</script>

<template>
  <svg
    class="icon"
    :class="{ side: props.side, big: props.big }"
    aria-hidden="true"
  >
    <title v-if="title">{{ props.title }}</title>
    <use :href="`${props.sourceFile}#${props.iconId}`"></use>
  </svg>
</template>
