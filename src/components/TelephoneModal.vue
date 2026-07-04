<script setup>
import SvgIcon from '@/components/SvgIcon.vue'
import { useSipPhoneStore } from '@/store/sipPhone'
const sipPhoneStore = useSipPhoneStore()
</script>
<template>
  <transition name="slide">
    <div v-show="sipPhoneStore.isShowModal" class="telephone-modal-warp">
      <div class="telephone-modal-body">
        <div class="telephone-avatar">
          <SvgIcon name="telephone-idle" class="jumper" />
        </div>
        <div class="telephone-call-info">
          <div>{{ sipPhoneStore.callInfo.caller }}</div>
          <div>中国移动</div>
        </div>
        <div class="telephone-actions-container">
          <button class="icon-btn hangup-btn" @click="sipPhoneStore.sipHangup()">
            <SvgIcon name="hangup" />
          </button>
          <button class="icon-btn answer-btn" @click="sipPhoneStore.sipAnswer()">
            <SvgIcon name="answer" />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
<style scoped lang="scss">
.telephone-modal-warp {
  color: #f2f2f2;
  background-image: linear-gradient(60deg, #3b424b 0%, #3d3f4d 100%);
  padding: 10px 20px;
  border-radius: 40px;
  display: inline-flex;
  position: fixed;
  box-shadow: 0 0 0 20px #f38e96;
  width: 260px;
  overflow: hidden;
  z-index: 999;
  left: 50%;
  transform: translateX(-50%);
  animation: breath 1s infinite linear alternate-reverse;
  .telephone-modal-body {
    display: flex;
    gap: 10px;
  }
  .telephone-avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    height: 40px;
    width: 40px;
    background-color: rgb(2, 161, 28);
    border-radius: 7px;
    color: #ffffff;
    .svg-icon {
      font-size: 24px;
      color: #ffffff;
    }
  }
  .telephone-call-info {
    width: 120px;
    line-height: 20px;
    font-size: 14px;
    div {
      height: 20px;
    }
  }
  .telephone-actions-container {
    display: flex;
    align-items: center;
    height: 40px;
    gap: 10px;
    .icon-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 36px;
      height: 36px;
      border-radius: 36px;
      outline: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #f2f2f2;
    }
    .hangup-btn {
      background-color: #fc2929;
    }
    .answer-btn {
      background-color: #06c425;
    }
  }
  @keyframes breath {
    0% {
      box-shadow: 0 0 20px #f38e96;
    }
    100% {
      box-shadow: 0 0 0 rgba(226, 45, 60, 0);
    }
  }
  @keyframes jumper {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-6px);
    }
  }
  .jumper {
    animation: jumper 0.8s linear alternate-reverse infinite;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: scale(0);
  }
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform-origin: 50% 50%;
  transform: translateX(-50%) translateY(-40px) scale(0);
}
</style>
