import MyMessage from './MyMessage.vue'
import { createVNode, render, ref } from 'vue'
function Message(msg, type) {
  const div = document.createElement('div')
  document.body.appendChild(div)
  const option = ref({
    msg,
    type,
    remove() {
      render(null, div)
      div.remove()
    }
  })
  let vNode = createVNode(MyMessage, option.value)
  render(vNode, div)
  return vNode.component.exposed
}
export default {
  info(text) {
    return Message(text, 'info')
  },
  error(text) {
    return Message(text, 'error')
  },
  success(text) {
    return Message(text, 'success')
  },
  warning(text) {
    return Message(text, 'warning')
  }
}
