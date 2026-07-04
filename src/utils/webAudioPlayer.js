class WebAudioPlayer {
  constructor(url, opts = {}) {
    this.isPlaying = false
    this.duration = null
    this.currentTime = null
    this.audioCtx = null
    this.audioBuffer = null
    this.source = null
    this.url = url
    this.startTime = null
    this.animId = null
    this.analyser = null
    this.masterGain = null
    const defaultOpts = {
      onplay() {},
      onpause() {},
      onTimeChange() {},
      onDraw() {}
    }
    this.opt = { ...defaultOpts, ...opts }
  }
  async initAudio() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const res = await fetch(this.url)
    const arrayBuf = await res.arrayBuffer()
    this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuf)
    this.duration = this.audioBuffer.duration
    this.currentTime = 0
    this.isPlaying = false
  }
  play() {
    if (this.isPlaying) return
    this.source = this.audioCtx.createBufferSource()
    this.source.buffer = this.audioBuffer
    // 4. （可选）创建分析器，用于频谱可视化
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.fftSize = 256
    this.source.connect(this.analyser)
    this.analyser.connect(this.audioCtx.destination)
    this.masterGain = this.audioCtx.createGain()
    this.masterGain.gain.value = 0.8
    this.startTime = new Date().getTime()
    this.isPlaying = true
    this.opt.onplay()
    this.opt.onTimeChange()
    if (this.currentTime >= this.duration) {
      this.currentTime = 0
    }
    this.updateCurrentTime()
    this.source.start(0, this.currentTime)
    this.source.onended = () => {
      if (this.currentTime >= this.duration) {
        this.pause()
        this.currentTime = this.audioBuffer.duration
      }
    }
  }
  pause() {
    if (!this.isPlaying || !this.source) return
    // 计算当前播放进度
    this.source.stop()
    this.source = null
    this.isPlaying = false
    this.opt.onpause()
    this.opt.onTimeChange()
    this.stopUpdate()
  }
  updateCurrentTime() {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.opt.onDraw(dataArray)
    this.currentTime = this.currentTime + (new Date().getTime() - this.startTime) / 1000
    if (this.currentTime >= this.duration) {
      this.pause()
      this.currentTime = this.audioBuffer.duration
    }
    this.startTime = new Date().getTime()
    this.animId = requestAnimationFrame(() => {
      this.updateCurrentTime()
    })
  }
  stopUpdate() {
    cancelAnimationFrame(this.animId)
    this.animId = null
  }
}
export default WebAudioPlayer
