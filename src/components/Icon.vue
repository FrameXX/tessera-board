<script lang="ts" setup>
const ICONS_SPRITE_PATH = "assets/img/icons.svg";
const props = defineProps({
  iconId: { type: String, required: true },
  side: { type: Boolean, default: false },
  sourceFile: { type: String, default: ICONS_SPRITE_PATH },
  title: { type: String, required: false },
});
</script>

<template>
  <svg :class="`icon ${props.side ? 'side' : ''}`" aria-hidden="true">
    <title v-if="title">{{ props.title }}</title>
    <use :href="`${props.sourceFile}#${props.iconId}`"></use>
  </svg>
</template>
