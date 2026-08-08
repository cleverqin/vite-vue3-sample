<script>
import { renderEmoji } from '@/components/emoji'
export default {
  props: {
    baseUrl: {
      type: String,
      default: './images/emoji'
    },
    text: {
      type: String,
      default: '测试测试[OK]'
    }
  },
  setup(props) {
    return () => renderEmoji(props.text, props.baseUrl)
  }
}
</script>

<style scoped lang="scss"></style>
