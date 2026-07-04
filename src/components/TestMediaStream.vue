<script setup>
import { ref, useTemplateRef } from 'vue'
import MyButton from '@/components/MyButton.vue'
import { closeVirtualStream, getCaptureMediaStream } from '@/utils'
import Message from '@/components/Message'
const mediaStream = ref(null)
const mediaVideoRef = useTemplateRef('mediaVideoRef')
function closeMediaStream() {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach((track) => {
      track.stop()
    })
    closeVirtualStream()
    mediaVideoRef.value.srcObject = null
  }
}
function getMediaStream(type = 1) {
  closeMediaStream()
  let videoType = ''
  let audioType = 'microphone'
  if (type === 1) {
    videoType = 'virtualVideo'
  }
  if (type === 2) {
    videoType = 'display'
  }
  if (type === 3) {
    videoType = 'camera'
  }
  getCaptureMediaStream(videoType, audioType)
    .then((stream) => {
      mediaStream.value = stream
      mediaVideoRef.value.srcObject = stream
    })
    .catch((err) => {
      console.error(err)
      Message.error(err.message)
    })
}
</script>
<template>
  <div class="test-panel">
    <div class="operate-row">
      <MyButton @click="getMediaStream(1)">虚拟视频+麦克风</MyButton>
      <MyButton @click="getMediaStream(2)">共享屏幕+麦克风</MyButton>
      <MyButton @click="getMediaStream(3)">摄像头+麦克风</MyButton>
      <MyButton @click="closeMediaStream()">关闭</MyButton>
    </div>
    <div class="video-box">
      <video ref="mediaVideoRef" autoplay></video>
    </div>
  </div>
</template>
<style scoped lang="scss">
.test-panel {
  max-width: 1000px;
  margin: 0 auto;
  padding: 15px;
  border-radius: 7px;
  border: 1px solid #d1d1d1;
  .operate-row {
    margin-bottom: 15px;
    display: flex;
    gap: 10px;
  }
  .video-box {
    video {
      display: block;
      width: 100%;
      aspect-ratio: 16 /9;
      background-color: #8d8d8d;
    }
  }
}
</style>
