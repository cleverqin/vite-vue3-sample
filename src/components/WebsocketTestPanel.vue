<script setup>
import Ws from '@/utils/ws'
import { ref } from 'vue'
const url = ref()
function getNowDate() {
  const now = new Date()
  const y = now.getFullYear()
  const M = now.getMonth() + 1
  const d = now.getDate()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  const S = now.getMilliseconds()
  const MM = M > 9 ? M : '0' + M
  const dd = d > 9 ? d : '0' + d
  const hh = h > 9 ? h : '0' + h
  const mm = m > 9 ? m : '0' + m
  const ss = s > 9 ? s : '0' + s
  return `${y}-${MM}-${dd} ${hh}:${mm}:${ss}.${S}`
}
const webSocket = ref(null)
const statusText = ref('')
const eventLogs = ref([])
const messageLogs = ref([])
const sendLogs = ref([])
const socketState = ref(null)
const STATE_MAP = {
  0: 'CONNECTING',
  1: 'OPEN',
  2: 'CLOSING',
  3: 'CLOSED'
}
function getSocketState() {
  if (webSocket.value) {
    if (webSocket.value.reconnectTimer) {
      return 'RECONNECTING'
    } else {
      const state = webSocket.value.socket.readyState
      return STATE_MAP[state]
    }
  } else {
    return 'UN_INIT'
  }
}
function addLog(text, type) {
  if (type === 'event') {
    eventLogs.value.push(text)
  }
  if (type === 'message') {
    messageLogs.value.push(text)
  }
  if (type === 'send') {
    sendLogs.value.push(text)
  }
}
function clearLog(type) {
  if (type === 'event') {
    eventLogs.value = []
  }
  if (type === 'message') {
    messageLogs.value = []
  }
  if (type === 'send') {
    sendLogs.value = []
  }
}
function closeSocket() {
  webSocket.value.close()
}
function initSocket() {
  const wsUrl = url.value
  if (webSocket.value) {
    if (!webSocket.value.isConnected && !webSocket.value.isConnecting) {
      webSocket.value.url = wsUrl
      webSocket.value.initSocket()
    }
  } else {
    webSocket.value = new Ws(wsUrl, {
      pingString() {
        return 'ping'
      },
      onEvent(eventType, e) {
        socketState.value = getSocketState()
        const time = getNowDate()
        const state = webSocket.value?.socket?.readyState
        statusText.value = `readyState：${STATE_MAP[state]} - ${time}`
        const code = eventType === 'close' ? '-' + e.code : ''
        const eventText = `${time}-${eventType}${code}`
        addLog(eventText, 'event')
        switch (eventType) {
          case 'message':
            addLog(`${time}-${e.data}`, 'message')
            break
          case 'send':
            addLog(`${time}-${e}`, 'send')
            break
        }
      }
    })
  }
  const time = getNowDate()
  const state = webSocket.value.socket.readyState
  statusText.value = `readyState：${STATE_MAP[state]} - ${time}`
  socketState.value = getSocketState()
  addLog(`${time}-start-connecting`, 'event')
}
</script>
<template>
  <div class="ws-panel">
    <div class="ws-panel-header">
      <input v-model="url" class="my-input" list="suggestions" placeholder="请输入" type="text" />
      <datalist id="suggestions">
        <option value="ws://171.22.255.19:9001/cti" />
        <option value="ws://171.22.255.100:24090/gateway/dev-api/peripheral/ws?station=2221" />
      </datalist>
      <button class="my-button" @click="initSocket()">连接socket</button>
      <button class="my-button" @click="closeSocket()">关闭socket</button>
    </div>
    <div id="status-info" class="status-info-row">{{ statusText }} ({{ socketState }})</div>
    <div class="ws-panel-body">
      <div class="panel-item">
        <div class="panel-header">
          <span>发送消息</span>
          <button class="clear-btn" @click="clearLog('send')">清空</button>
        </div>
        <div class="panel-body">
          <template v-for="(item, i) in sendLogs" :key="i">
            <div class="log-text">{{ item }}</div>
          </template>
        </div>
      </div>
      <div class="panel-item">
        <div class="panel-header">
          <span>接收消息</span>
          <button class="clear-btn" @click="clearLog('message')">清空</button>
        </div>
        <div class="panel-body">
          <template v-for="(item, i) in messageLogs" :key="i">
            <div class="log-text">{{ item }}</div>
          </template>
        </div>
      </div>
      <div class="panel-item">
        <div class="panel-header">
          <span>事件消息</span>
          <button class="clear-btn" @click="clearLog('event')">清空</button>
        </div>
        <div class="panel-body">
          <template v-for="(item, i) in eventLogs" :key="i">
            <div class="log-text">{{ item }}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.ws-panel {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 7px;
  border: 1px solid #ccc;
  .ws-panel-header {
    display: flex;
    gap: 10px;
  }
}
.my-input {
  width: 760px;
  padding: 7px 10px;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
  border: 1px solid #336bf8;
  border-radius: 4px;
}
.my-button {
  padding: 5px 10px;
  height: 32px;
  box-sizing: border-box;
  font-size: 14px;
  line-height: 20px;
  outline: none;
  background-color: #336bf8;
  border: 1px solid #336bf8;
  border-radius: 4px;
  cursor: pointer;
  color: #f0f9eb;
  box-shadow: 1px 1px 2px rgba(15, 49, 134, 0.58);
}
.my-button:active {
  box-shadow: 1px 1px 0 rgba(15, 49, 134, 0.58);
}
.my-button:disabled {
  background-color: #606266;
  border-color: #606266;
  cursor: not-allowed;
}
.status-info-row {
  line-height: 30px;
  font-size: 14px;
  color: #3a3a3a;
  font-weight: bolder;
  height: 30px;
}
.ws-panel-body {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}
.panel-item {
  height: 500px;
  border: 1px solid #336bf8;
  border-radius: 7px;
}
.panel-header {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  border-bottom: 1px solid #336bf8;
  background-color: #336bf8;
  color: #f0f9eb;
  border-radius: 6px 6px 0 0;
}
.clear-btn {
  font-size: 14px;
  outline: none;
  color: #f0f9eb;
  border: none;
  cursor: pointer;
  background-color: #336bf8;
  padding: 3px 10px;
  border-radius: 4px;
  box-shadow:
    2px 2px 3px #0f3186,
    -2px -2px 3px #4c86f8;
}
.clear-btn:active {
  box-shadow:
    1px 1px 0 #0f3186,
    -1px -1px 0 #4c86f8;
}
.panel-body {
  padding: 10px;
  box-sizing: border-box;
  height: calc(100% - 41px);
  overflow: auto;
  font-size: 14px;
  line-height: 20px;
  color: #3a3a3a;
}
</style>
