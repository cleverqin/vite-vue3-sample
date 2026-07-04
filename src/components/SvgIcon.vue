<template>
  <svg aria-hidden="true" fill="currentColor" class="svg-icon" width="1em" height="1em">
    <use :xlink:href="symbolId" width="1em" height="1em" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  prefix: {
    type: String,
    default: 'icon'
  },
  name: {
    type: String,
    required: true
  }
})

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<style scoped lang="scss">
.svg-icon {
  vertical-align: middle;
  color: inherit;
  fill: currentColor;
}
</style>
