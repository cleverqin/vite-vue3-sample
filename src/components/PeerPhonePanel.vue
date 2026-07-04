<script setup>
import { computed, reactive, ref, useTemplateRef, watch } from 'vue'
import Peer from 'peerjs'
import MyButton from '@/components/MyButton.vue'
import MyInput from '@/components/MyInput.vue'
import { generateUID, getCaptureMediaStream } from '@/utils'
import SvgIcon from '@/components/SvgIcon.vue'
import RipplePanel from '@/components/RipplePanel.vue'
import Message from '@/components/Message'
const peer = ref(null)
const localVideoRef = useTemplateRef('localVideo')
const remoteVideoRef = useTemplateRef('remoteVideo')
import callerRing from '../assets/audio/ringback.wav'
import calledRing from '../assets/audio/71536.aac'
const callerAudioRef = useTemplateRef('callerAudio')
const calledAudioRef = useTemplateRef('calledAudio')
const state = reactive({
  isConnected: false,
  isConnecting: false,
  peerId: null,
  dataConnection: null,
  mediaConnection: null,
  remotePeerId: null,
  localStream: null,
  remoteStream: null,
  isCalling: false,
  isShowModal: false,
  status: 'offline'
})
const callInfo = reactive({
  caller: null,
  called: null,
  beginTime: null,
  answerTime: null,
  endTime: null
})
function initPeer() {
  if (peer.value) return
  state.isConnected = false
  state.isConnecting = true
  const uid = generateUID()
  peer.value = new Peer(uid)
  peer.value.on('open', (id) => {
    state.peerId = id
    state.isConnecting = false
    state.isConnected = true
    state.status = 'idle'
  })
  peer.value.on('close', () => {
    state.isConnecting = false
    state.isConnected = false
    state.status = 'offline'
  })
  peer.value.on('error', (err) => {
    console.log(err)
    Message.error(err.message || '出错了！')
    state.isConnecting = false
    state.isCalling = false
    state.status = 'offline'
  })
  peer.value.on('disconnected', (err) => {
    console.log(err)
    state.isConnecting = false
    state.isConnected = false
    state.status = 'offline'
  })
  peer.value.on('connection', (dataConnection) => {
    dataConnection.on('data', (e) => {
      console.log(e)
    })
    dataConnection.on('close', () => {
      state.status = 'idle'
      state.isShowModal = false
      handleHangup()
    })
    state.dataConnection = dataConnection
  })
  peer.value.on('call', (mediaConnection) => {
    state.status = 'ring'
    state.mediaConnection = mediaConnection
    state.isShowModal = true
    callInfo.caller = mediaConnection.peer
    callInfo.called = state.peerId
    callInfo.beginTime = new Date().getTime()
    callInfo.answerTime = null
    callInfo.endTime = null
    PlayRing('called')
    state.mediaConnection.on('stream', (remoteStream) => {
      callInfo.answerTime = new Date().getTime()
      state.remoteStream = remoteStream
      state.status = 'talking'
      stopRing()
      state.isShowModal = false
    })
    state.mediaConnection.on('close', () => {
      // close
    })
    state.mediaConnection.on('error', () => {
      // close
    })
  })
}
const isCanCall = computed(() => {
  if (state.isConnected && !state.isCalling && state.remotePeerId && state.status !== 'talking') {
    return true
  }
  return false
})
function handleCall() {
  state.isCalling = true
  state.status = 'ring'
  state.dataConnection = peer.value.connect(state.remotePeerId)
  state.dataConnection.on('open', () => {
    getCaptureMediaStream('camera', 'microphone')
      .then((stream) => {
        state.localStream = stream
        callInfo.caller = state.peerId
        callInfo.called = state.remotePeerId
        callInfo.beginTime = new Date().getTime()
        callInfo.answerTime = null
        callInfo.endTime = null
        PlayRing('caller')
        state.mediaConnection = peer.value.call(state.remotePeerId, stream)
        state.mediaConnection.on('stream', (remoteStream) => {
          state.status = 'talking'
          stopRing()
          callInfo.answerTime = new Date().getTime()
          state.isShowModal = false
          state.remoteStream = remoteStream
          state.isCalling = false
        })
        state.mediaConnection.on('close', () => {
          state.isCalling = false
          state.isShowModal = false
        })
        state.mediaConnection.on('error', () => {
          state.isCalling = false
        })
      })
      .catch((err) => {
        console.log(err)
        state.dataConnection.close()
        handleHangup()
      })
  })
  state.dataConnection.on('close', () => {
    console.log('close')
    state.isCalling = false
    state.status = 'idle'
    handleHangup()
  })
  state.dataConnection.on('error', (err) => {
    console.log(err)
    state.isCalling = false
  })
  state.dataConnection.on('data', (e) => {
    console.log(e)
  })
}
// 挂断电话
function handleHangup() {
  state.mediaConnection?.close()
  state.dataConnection?.close()
  state.dataConnection = null
  state.mediaConnection = null
  if (state.localStream) {
    state.localStream.getTracks().forEach((track) => {
      track.stop()
    })
    state.localStream = null
  }
  state.remoteStream = null
  callInfo.endTime = new Date().getTime()
  state.isCalling = false
  stopRing()
}
// 接听电话
function handleAnswer() {
  getCaptureMediaStream('camera', 'microphone')
    .then((steam) => {
      state.localStream = steam
      state.mediaConnection.answer(steam)
      state.isShowModal = false
    })
    .catch((err) => {
      console.error(err.message)
      handleHangup()
    })
}
function handleChangeVideoTrack() {
  navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }).then(async (stream) => {
    const newVideoTrack = stream.getVideoTracks()[0]
    const pc = state.mediaConnection.peerConnection
    const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video')
    if (videoSender) {
      await videoSender.replaceTrack(newVideoTrack)
    }
    // 本地预览更新
    state.localStream.getVideoTracks()[0].stop()
    state.localStream.removeTrack(state.localStream.getVideoTracks()[0])
    state.localStream.addTrack(newVideoTrack)
    localVideoRef.value.srcObject = state.localStream
  })
}
function PlayRing(type = 'caller') {
  stopRing()
  if (type === 'caller') {
    callerAudioRef.value.play()
  }
  if (type === 'called') {
    calledAudioRef.value.play()
  }
}
function stopRing() {
  callerAudioRef.value.pause()
  callerAudioRef.value.currentTime = 0
  calledAudioRef.value.pause()
  calledAudioRef.value.currentTime = 0
}
watch(
  () => state.remoteStream,
  () => {
    const remoteStreams = state.remoteStream
    if (remoteVideoRef.value && remoteStreams) {
      remoteVideoRef.value.srcObject = remoteStreams
    }
    if (remoteVideoRef.value && !remoteStreams) {
      remoteVideoRef.value.srcObject = null
    }
  },
  {
    deep: true,
    immediate: true
  }
)
watch(
  () => state.localStream,
  () => {
    const localStream = state.localStream
    if (localVideoRef.value && localStream) {
      localVideoRef.value.srcObject = localStream
    }
    if (localVideoRef.value && !localStream) {
      localVideoRef.value.srcObject = null
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>
<template>
  <div class="peer-phone-panel">
    <div>
      <audio ref="calledAudio" :src="calledRing" loop></audio>
      <audio ref="callerAudio" :src="callerRing" loop></audio>
    </div>
    <div class="operate-row">
      <MyButton :loading="state.isConnecting" :disabled="state.isConnected" @click="initPeer()">注册</MyButton>
      <MyInput v-model="state.remotePeerId" placeholder="请输入远程连接ID" />
      <MyButton icon="answer" :loading="state.isCalling" :disabled="!isCanCall" @click="handleCall()">呼叫</MyButton>
      <MyButton v-if="['talking', 'ring'].includes(state.status)" icon="hangup" @click="handleHangup()">挂断</MyButton>
      <MyButton :disabled="state.status !== 'talking'" @click="handleChangeVideoTrack()">切换视频流</MyButton>
    </div>
    <div>peerId: {{ state.peerId }}</div>
    <div class="video-panel">
      <div class="video-box">
        <div class="video-header">
          <span>远端媒体</span>
          <span>{{ callInfo.caller === state.peerId ? callInfo.called : callInfo.caller }}</span>
        </div>
        <div class="video-container">
          <video ref="remoteVideo" autoplay />
          <RipplePanel v-if="['ring'].includes(state.status)" />
        </div>
      </div>
      <div class="video-box">
        <div class="video-header">
          <span>本地媒体</span>
          <span>{{ state.peerId }}</span>
        </div>
        <div class="video-container">
          <video ref="localVideo" autoplay muted />
        </div>
      </div>
    </div>
    <transition name="slide">
      <div v-show="state.isShowModal" class="telephone-modal-warp">
        <div class="telephone-modal-body">
          <div class="telephone-avatar">
            <RipplePanel :size="40" />
          </div>
          <div class="telephone-call-info">
            <div>{{ callInfo.caller === state.peerId ? callInfo.called : callInfo.caller }}</div>
            <div></div>
          </div>
          <div class="telephone-actions-container">
            <button class="icon-btn hangup-btn" @click="handleHangup()">
              <SvgIcon name="hangup" />
            </button>
            <button class="icon-btn answer-btn" @click="handleAnswer()">
              <SvgIcon name="answer" />
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.peer-phone-panel {
  max-width: 1000px;
  padding: 15px;
  margin: 0 auto;
  border: 1px solid #c2c0c0;
  border-radius: 4px;
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
    .video-header {
      display: flex;
      font-size: 14px;
      line-height: 30px;
      justify-content: space-between;
    }
    .video-container {
      position: relative;
    }
    video {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      background-color: #666666;
    }
  }
}
.telephone-modal-warp {
  color: #f2f2f2;
  background-image: linear-gradient(60deg, #3b424b 0%, #3d3f4d 100%);
  padding: 10px 20px;
  border-radius: 40px;
  display: inline-flex;
  position: fixed;
  top: 70px;
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
    height: 40px;
    width: 40px;
    background-color: rgb(1, 21, 4);
    border-radius: 20px;
    color: #ffffff;
    position: relative;
  }
  .telephone-call-info {
    width: 120px;
    line-height: 20px;
    font-size: 14px;
    div {
      height: 20px;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
    // animation: jumper 0.8s linear alternate-reverse infinite;
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
