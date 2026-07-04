<template>
  <div class="my-input-container" :class="[slotAppend ? 'append' : '', 'my-input-' + size]">
    <input v-model="value" type="text" v-bind="$attrs" />
    <SvgIcon v-if="value" name="close" class="icon-close" @click="value = ''" />
    <slot name="append" />
  </div>
</template>

<script setup>
import { useSlots } from 'vue'
const { size } = defineProps({
  size: {
    type: String,
    default: 'default'
  }
})
import SvgIcon from '@/components/SvgIcon.vue'
const value = defineModel()
const slotAppend = !!useSlots().append
</script>

<style scoped lang="scss">
.my-input-container {
  display: inline-block;
  position: relative;
  input {
    display: block;
    outline: none;
    border: 1px solid #036e21;
    line-height: 20px;
    font-size: 14px;
    border-radius: 20px;
    padding: 5px 30px 5px 15px;
    background-color: transparent;
    color: inherit;
    width: 220px;
    box-sizing: border-box;
  }
  &.append {
    input {
      padding: 5px 100px 5px 15px;
    }
    .icon-close {
      right: 85px;
    }
  }
  &:hover {
    input {
      border: 1px solid #04942d;
    }
    ::v-deep(.my-btn) {
      border: 1px solid #04942d;
      background-color: #04942d;
    }
  }
  .icon-close {
    position: absolute;
    right: 15px;
    top: 50%;
    margin-top: -0.5em;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    &:hover {
      color: #a7a8a6;
    }
  }
  ::v-deep(.my-btn) {
    border-radius: 0 20px 20px 0;
    position: absolute;
    top: 1px;
    right: 1px;
    line-height: 18px;
  }
  &.my-input-mini {
    position: relative;
    display: block;
    height: 28px;
    &.append {
      input {
        padding: 3px 65px 3px 15px;
      }
      .icon-close {
        right: 55px;
      }
    }
    input {
      border: 1px solid #30353b;
      font-size: 12px;
      padding: 3px 30px 3px 15px;
      width: 180px;
    }
    .icon-close {
      right: 35px;
    }
    ::v-deep(.my-btn) {
      border-radius: 0 20px 20px 0;
      padding: 3px 5px;
      position: absolute;
      top: 1px;
      right: 1px;
      line-height: 18px;
      background-color: rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.05);
      font-size: 12px;
      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
        border-color: rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
