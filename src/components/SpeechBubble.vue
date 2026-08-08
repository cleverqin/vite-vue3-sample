<script setup>
import MyEmojiText from '@/components/MyEmojiText.vue'
const { isSend, message, setting } = defineProps({
  isSend: {
    type: Boolean,
    default: false
  },
  setting: {
    type: Object,
    default() {
      return {
        isName: false,
        isTime: true
      }
    }
  },
  message: {
    type: Object,
    default() {
      return {
        from: {
          name: '似水流年',
          avatarUrl: 'https://picsum.photos/200'
        },
        content: '这是一条[微笑]测试信息1112222222[气球]2222222',
        time: new Date().getTime(),
        type: 'text'
      }
    }
  }
})
function friendlyTime(value) {
  let time = new Date().getTime()
  time = parseInt((time - value) / 1000)
  // 存储转换值
  let s
  if (time < 60 * 3) {
    // 三分钟内
    return '刚刚'
  } else if (time < 60 * 60 && time >= 60 * 3) {
    // 超过十分钟少于1小时
    s = Math.floor(time / 60)
    return s + '分钟前'
  } else if (time < 60 * 60 * 24 && time >= 60 * 60) {
    // 超过1小时少于24小时
    s = Math.floor(time / 60 / 60)
    return s + '小时前'
  } else if (time < 60 * 60 * 24 * 3 && time >= 60 * 60 * 24) {
    // 超过1天少于3天内
    s = Math.floor(time / 60 / 60 / 24)
    return s + '天前'
  } else {
    // 超过3天
    const date = new Date(value)
    return date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + date.getDate()
  }
}
</script>
<template>
  <div class="speech-bubble-warp" :class="isSend ? 'speech-bubble-send' : 'speech-bubble-receive'">
    <div class="speech-bubble-avatar">
      <img :src="message.from.avatarUrl" alt="" />
    </div>
    <div class="speech-bubble-container">
      <div v-if="setting.isName" class="speech-bubble-body">
        <span v-if="setting.isTime && isSend" class="speech-bubble-time">
          <slot name="time">
            {{ friendlyTime(message.time) }}
          </slot>
        </span>
        <span class="speech-bubble-name">{{ message.from.name }}</span>
        <span v-if="setting.isTime && !isSend" class="speech-bubble-time">
          <slot name="time">
            {{ friendlyTime(message.time) }}
          </slot>
        </span>
      </div>
      <div class="speech-bubble-content">
        <slot name="content">
          <MyEmojiText v-if="message.type === 'text'" :text="message.content" />
          <div v-if="message.type === 'image'" v-html="message.content" />
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.speech-bubble-warp {
  position: relative;
}
.speech-bubble-warp:after {
  display: table;
  content: '';
  clear: both;
}
.speech-bubble-avatar,
.speech-bubble-avatar img {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 4px;
}
.speech-bubble-send .speech-bubble-avatar {
  float: right;
}
.speech-bubble-send .speech-bubble-body,
.speech-bubble-send .speech-bubble-container {
  text-align: right;
}
.speech-bubble-send .speech-bubble-container .speech-bubble-content {
  text-align: left;
}
.speech-bubble-receive .speech-bubble-avatar {
  float: left;
}
.speech-bubble-container {
  position: relative;
  margin-left: 50px;
  margin-right: 50px;
}
.speech-bubble-infoWarp .speech-bubble-name {
  font-size: 14px;
  color: #333333;
  line-height: 20px;
}
.speech-bubble-infoWarp .speech-bubble-time {
  font-size: 12px;
  color: #666666;
  line-height: 20px;
  margin-left: 10px;
  margin-right: 10px;
}
.speech-bubble-content {
  display: inline-block;
  min-height: 20px;
  padding: 10px;
  border-radius: 4px;
  max-width: 100%;
  line-height: 20px;
  vertical-align: middle;
  color: #666666;
  font-size: 14px;
  word-break: break-word;
  position: relative;
}
.speech-bubble-receive .speech-bubble-content:before,
.speech-bubble-send .speech-bubble-content:after {
  position: absolute;
  content: '';
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  top: 20px;
  margin-top: -5px;
}
.speech-bubble-receive .speech-bubble-content:before {
  right: 100%;
  border-right: 5px solid #dae1ff;
}
.speech-bubble-receive .speech-bubble-content {
  background-color: #dae1ff;
}
.speech-bubble-send .speech-bubble-content:after {
  left: 100%;
  border-left: 5px solid #aae97e;
}
.speech-bubble-send .speech-bubble-content {
  background-color: #aae97e;
}
</style>
