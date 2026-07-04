<script setup>
import { useSipPhoneStore } from '@/store/sipPhone'
import MyButton from '@/components/MyButton.vue'
import MyInput from '@/components/MyInput.vue'
import { computed, ref, useTemplateRef, watch } from 'vue'
import SvgIcon from '@/components/SvgIcon.vue'
import RipplePanel from '@/components/RipplePanel.vue'
import TelephoneModal from '@/components/TelephoneModal.vue'
const sipPhoneStore = useSipPhoneStore()
const callNum = ref(null)
const remoteVideo = useTemplateRef('remoteVideo')
const localVideo = useTemplateRef('localVideo')
const state = computed(() => {
  if (sipPhoneStore.isRegistering) {
    return 'registering'
  }
  if (sipPhoneStore.isReRegistering) {
    return 'wait-registering'
  }
  return sipPhoneStore.state
})
const hasVideo = computed(() => {
  const remoteStreams = sipPhoneStore.remoteStream
  let flag = false
  const tracks = remoteStreams?.getTracks() || []
  tracks.find((track) => {
    if (track.kind === 'video') {
      flag = true
    }
  })
  return flag
})
const isCanDisconnect = computed(() => {
  return sipPhoneStore.isRegistering || sipPhoneStore.isReRegistering || sipPhoneStore.isRegistered
})
watch(
  () => sipPhoneStore.remoteStream,
  () => {
    const remoteStreams = sipPhoneStore.remoteStream
    if (remoteVideo.value && remoteStreams) {
      remoteVideo.value.srcObject = remoteStreams
    }
    if (remoteVideo.value && !remoteStreams) {
      remoteVideo.value.srcObject = null
    }
  },
  {
    deep: true,
    immediate: true
  }
)

watch(
  () => sipPhoneStore.localStream,
  () => {
    const localStream = sipPhoneStore.localStream
    if (localVideo.value && localStream) {
      localVideo.value.srcObject = localStream
    }
    if (localVideo.value && !localStream) {
      localVideo.value.srcObject = null
    }
  },
  {
    deep: true,
    immediate: true
  }
)
function handleCall() {
  if (!callNum.value) return
  sipPhoneStore.sipCall(callNum.value)
}
function toggleShowModal() {
  sipPhoneStore.isShowModal = !sipPhoneStore.isShowModal
}
</script>
<template>
  <div class="sip-phone-warp">
    <audio id="ringAudio" src="./71536.aac" />
    <TelephoneModal />
    <div class="form-container">
      <div class="form-col">IP:{{ sipPhoneStore.SIP_HOST }}</div>
      <div class="form-col">端口:{{ sipPhoneStore.SIP_PORT }}</div>
      <div class="form-col">
        <SvgIcon name="telephone-idle" :class="{ online: sipPhoneStore.isRegistered }" />
        :{{ sipPhoneStore.phoneNum }}
      </div>
      <div class="form-col">状态:{{ state }}</div>
      <div class="operate-row">
        <div class="form-col">
          <MyButton
            :disabled="sipPhoneStore.state !== 'offline'"
            :loading="sipPhoneStore.isRegistering || sipPhoneStore.isReRegistering"
            @click="sipPhoneStore.sipPhoneConnect()"
          >
            注册
          </MyButton>
        </div>
        <div class="form-col">
          <MyButton :disabled="!isCanDisconnect" @click="sipPhoneStore.sipPhoneDisconnect()"> 断开 </MyButton>
        </div>
        <div class="form-col">
          <MyInput v-model="callNum" placeholder="呼叫号码" />
        </div>
        <div class="form-col">
          <MyButton icon="answer" :disabled="!['idle'].includes(sipPhoneStore.state)" @click="handleCall()">
            呼叫
          </MyButton>
        </div>
        <div class="form-col">
          <MyButton @click="toggleShowModal()"> 显示对话窗口 </MyButton>
        </div>
      </div>
    </div>
    <div class="video-panel">
      <div class="video-box">
        <div class="video-header">远端媒体</div>
        <div class="video-container">
          <video ref="remoteVideo" autoplay />
          <RipplePanel v-if="!hasVideo && ['talking', 'conn', 'ring'].includes(sipPhoneStore.state)" />
        </div>
      </div>
      <div class="video-box">
        <div class="video-header">本地媒体</div>
        <div class="video-container">
          <video ref="localVideo" autoplay muted />
        </div>
      </div>
    </div>
    <div class="phone-control-row mt-15">
      <MyButton
        :disabled="!['talking', 'conn', 'ring'].includes(sipPhoneStore.state)"
        @click="sipPhoneStore.sipHangup()"
      >
        <SvgIcon name="hangup" />
        挂断
      </MyButton>
      <MyButton :disabled="!['ring'].includes(sipPhoneStore.state)" @click="sipPhoneStore.sipAnswer()">
        <SvgIcon name="answer" />
        接听
      </MyButton>
      <MyButton :disabled="!['talking'].includes(sipPhoneStore.state)" @click="sipPhoneStore.sipPhoneToggleHold()">
        <SvgIcon :name="sipPhoneStore.isHold ? 'unhold' : 'hold'" />
        {{ sipPhoneStore.isHold ? '取回' : '保持' }}
      </MyButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sip-phone-warp {
  position: relative;
  max-width: 1000px;
  border: 1px solid #d1d1d1;
  padding: 15px;
  margin: 0 auto;
  border-radius: 4px;
  .form-container {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    .online {
      color: #21c23c;
    }
    .operate-row {
      display: flex;
      gap: 10px;
    }
  }
  .video-panel {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    .video-box {
      flex: 1;
      max-width: 460px;
      .video-header {
        font-size: 14px;
        line-height: 30px;
      }
      .video-container {
        position: relative;
        .video-user-box {
          position: absolute;
          width: 80px;
          height: 80px;
          font-size: 40px;
          color: #f2f2f2;
          background-color: #0a76a4;
          border-radius: 50%;
          text-align: center;
          line-height: 80px;
          top: 50%;
          left: 50%;
          margin-left: -40px;
          margin-top: -40px;
        }
      }
      video {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        background-color: #666666;
      }
    }
  }
  .phone-control-row {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
  }
}
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
