<script setup>
import PeerPhonePanel from '@/components/PeerPhonePanel.vue'
import WebsocketTestPanel from '@/components/WebsocketTestPanel.vue'
import SipPhonePanel from '@/components/SipPhonePanel.vue'
import DragTestPanel from '@/components/DragTestPanel.vue'
import APlayer from '@/components/APlayer.vue'
import { ref } from 'vue'
const curActive = ref('peer-phone')
function changeTab(tabName) {
  curActive.value = tabName
}
function isActive(tabName) {
  return {
    active: curActive.value === tabName
  }
}
</script>
<template>
  <div class="tab-panel">
    <div class="tab-panel-header">
      <ul class="panel-navs">
        <li class="panel-nav-item" :class="isActive('peer-phone')" @click="changeTab('peer-phone')">PeerPhone</li>
        <li class="panel-nav-item" :class="isActive('sip-phone')" @click="changeTab('sip-phone')">SipPhone</li>
        <li class="panel-nav-item" :class="isActive('socket-test')" @click="changeTab('socket-test')">WebsocketTest</li>
        <li class="panel-nav-item" :class="isActive('drag-test')" @click="changeTab('drag-test')">Drag Test</li>
      </ul>
    </div>
    <div class="tab-panel-body">
      <div v-show="curActive === 'drag-test'" class="tab-content-item">
        <DragTestPanel />
      </div>
      <div v-show="curActive === 'peer-phone'" class="tab-content-item">
        <PeerPhonePanel />
      </div>
      <div v-show="curActive === 'sip-phone'" class="tab-content-item">
        <SipPhonePanel />
      </div>
      <div v-show="curActive === 'socket-test'" class="tab-content-item">
        <WebsocketTestPanel />
      </div>
    </div>
    <APlayer />
  </div>
</template>

<style scoped lang="scss">
.tab-panel-header {
  background-color: #f6f8f6;
  margin-bottom: 20px;
  .panel-navs {
    display: flex;
    padding: 0;
    list-style: none;
    line-height: 30px;
    max-width: 1000px;
    margin: 0 auto;
    .panel-nav-item {
      color: #535bf2;
      cursor: pointer;
      padding: 0 10px;
      &:hover,
      &.active {
        color: #323cf5;
        background-color: rgba(51, 107, 248, 0.06);
      }
    }
  }
}
</style>
