<template>
  <button class="my-btn" type="button" :class="classNames" v-bind="$attrs">
    <SvgIcon v-if="loading" name="loading" class="loading-icon" />
    <SvgIcon v-if="!loading && icon" :name="icon" />
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import SvgIcon from '@/components/SvgIcon.vue'
const { icon, loading, size } = defineProps({
  icon: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default'
  }
})
const classNames = computed(() => {
  const names = []
  names.push(`my-btn-${size}`)
  if (loading) {
    names.push('my-btn-loading')
  }
  return names.join(' ')
})
</script>
<style scoped lang="scss">
@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
.my-btn {
  --btn-bg-color: #336bf8;
  --btn-border-color: #336bf8;
  --btn-disabled-bg: #89a8f6;
  --btn-disabled-border: #89a8f6;
  font-size: 14px;
  line-height: 20px;
  padding: 5px 15px;
  outline: none;
  cursor: pointer;
  border-radius: 20px;
  border: 1px solid var(--btn-border-color);
  background-color: var(--btn-bg-color);
  color: #f2f2f2;
  &.my-btn-mini {
    padding: 3px 10px;
    font-size: 12px;
  }
  .loading-icon {
    animation: rotate 2s linear infinite;
  }
  .svg-icon {
    margin-right: 3px;
    position: relative;
    top: -1px;
  }
  &:hover {
    border: 1px solid var(--btn-border-color);
    background-color: var(--btn-bg-color);
    color: #fff;
  }
  &.my-btn-loading {
    border: 1px solid var(--btn-border-color);
    background-color: var(--btn-bg-color);
    color: #c2c0c0;
    pointer-events: none;
  }
  &.my-btn-text {
    background-color: transparent;
    border: none;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #c7c6c6;
    .svg-icon {
      margin-right: 0;
      top: 0;
    }
    &:hover {
      color: #f2f2f2;
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
  &[disabled] {
    cursor: not-allowed !important;
    background-color: var(--btn-disabled-bg);
    border: 1px solid var(--btn-disabled-border);
    color: #e5e3e3;
  }
}
</style>
