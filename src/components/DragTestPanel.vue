<script setup>
import { ref } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
const list = ref([
  {
    id: 'uid0001',
    name: '张三'
  },
  {
    id: 'uid0002',
    name: '李四'
  },
  {
    id: 'uid0003',
    name: '王武'
  },
  {
    id: 'uid0004',
    name: '赵六'
  }
])
const list1 = ref([
  {
    id: 'uid0011',
    name: '张三三'
  },
  {
    id: 'uid0012',
    name: '李四四'
  },
  {
    id: 'uid0013',
    name: '王武武'
  },
  {
    id: 'uid0014',
    name: '赵六六'
  }
])
</script>
<template>
  <div class="drag-container">
    <VueDraggableNext
      v-model="list"
      class="drag-area"
      :animation="300"
      group="class1"
      item-key="id"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      handle=".drag-span"
    >
      <transition-group>
        <div v-for="(element, i) in list" :key="element.id" class="drag-item">
          <span class="drag-span">{{ i + 1 }}</span>
          <span>{{ element.name }}</span>
        </div>
      </transition-group>
    </VueDraggableNext>
    <VueDraggableNext
      v-model="list1"
      class="drag-area"
      :animation="300"
      group="class1"
      item-key="id"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      handle=".drag-span"
    >
      <transition-group>
        <div v-for="(element, i) in list1" :key="element.id" class="drag-item">
          <span class="drag-span">{{ i + 1 }}</span>
          <span>{{ element.name }}</span>
        </div>
      </transition-group>
    </VueDraggableNext>
  </div>
</template>

<style scoped lang="scss">
.drag-container {
  display: flex;
  width: 1000px;
  margin: 0 auto;
  gap: 10px;
  .drag-area {
    width: 100%;
    background-color: #f2f2f2;
    padding: 10px;
  }
}
.drag-item {
  display: flex;
  line-height: 30px;
  align-items: center;
  gap: 5px;
  border: 1px dashed transparent;
  padding: 0 5px;
}
.drag-span {
  text-align: center;
  line-height: 20px;
  width: 20px;
  height: 20px;
  background-color: #67c23a;
  border-radius: 3px;
  color: #333333;
  cursor: move;
}
.drag-ghost {
  border: 1px dotted #d1d1d1;
}
.drag-chosen {
  color: #535bf2;
  background-color: #f2f2f2;
  border: 1px dashed #d1d1d1;
  border-radius: 3px;
}
</style>
