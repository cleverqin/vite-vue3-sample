export function fmtDateTime(time, fmt = 'yyyy年M月d日 HH:mm:ss W') {
  const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const date = new Date(time)
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'H+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
    W: weeks[date.getDay()]
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (const k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
  return fmt
}
// 歌词解析
export function parseLyric(sourceLyric) {
  const lrcArr = []
  const lines = sourceLyric.split('\n')
  const timeReg = /\[(\d{1,2}):(\d{1,2})(?:\.(\d+))?\]/g
  lines.forEach((line) => {
    for (const match of line.matchAll(timeReg)) {
      const minute = parseInt(match[1]) || 0
      const second = parseInt(match[2]) || 0
      const millisecond = parseInt(match[3]) || 0
      const time = minute * 60 + second + millisecond / 1000
      let text = line.replace(timeReg, '').trim()
      text = text || '......'
      lrcArr.push({ time, text })
    }
  })
  return lrcArr.sort((a, b) => a.time - b.time)
}
// 歌词查找
export function queryLyric(time, lyricArr = []) {
  // 空数据直接返回
  if (!lyricArr.length) return {}
  const len = lyricArr.length
  const first = lyricArr[0]
  const last = lyricArr[len - 1]
  // 超出时间范围直接返回首尾
  if (time <= first.time) return first
  if (time >= last.time) return last
  // 查找当前歌词（找到第一个比当前时间大的，返回上一句）
  const index = lyricArr.findIndex((item) => item.time > time)
  return lyricArr[index - 1] || {}
}
export function drawAudioAnalyser(sourceMedia, draw, option = {}) {
  const opt = {
    fftSize: 512,
    sourceType: 'MediaElement',
    ...option
  }
  let animationFrameId
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const analyser = audioContext.createAnalyser()
  let source
  if (opt.sourceType === 'MediaStream') {
    source = audioContext.createMediaStreamSource(sourceMedia)
  } else {
    source = audioContext.createMediaElementSource(sourceMedia)
  }
  source.connect(analyser)
  analyser.connect(audioContext.destination)
  analyser.fftSize = opt.fftSize
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  function drawCanvas() {
    analyser.getByteFrequencyData(dataArray)
    draw(dataArray)
    animationFrameId = requestAnimationFrame(() => {
      drawCanvas()
    })
  }
  drawCanvas()
  return {
    stopAnimation() {
      cancelAnimationFrame(animationFrameId)
    },
    startAnimation() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      drawCanvas()
    }
  }
}
export function drawRoundedRect(ctx, x, y, width, height, radius, createColor) {
  let gradient = ctx.createLinearGradient(x, y, x + width, y + height)
  gradient.addColorStop(0, 'rgba(66,243,255,0.1)')
  gradient.addColorStop(1, 'rgba(39,155,255,0.1)')
  if (createColor) {
    gradient = createColor(ctx, x, y, width, height)
  }
  ctx.fillStyle = gradient
  // 开始绘制路径
  ctx.beginPath()
  // 左上角圆角
  ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5)
  // 顶部直线
  ctx.lineTo(x + width - radius, y)
  // 右上角圆角
  ctx.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2)
  // 右侧直线
  ctx.lineTo(x + width, y + height - radius)
  // 右下角圆角
  ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5)
  // 底部直线
  ctx.lineTo(x + radius, y + height)
  // 左下角圆角
  ctx.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI)
  // 闭合路径
  ctx.closePath()
}
// 获取虚拟摄像头视频流
// eslint-disable-next-line no-unused-vars
let animationFrame
let canvas
// 创建虚拟视频流
export function createVirtualStream(text = '软坐席') {
  if (!canvas) {
    canvas = document.createElement('canvas')
  }
  canvas.width = 1280
  canvas.height = 720
  const ctx = canvas.getContext('2d')
  // 绘制初始画面
  function drawFrame(timestamp) {
    // 清除画布
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制渐变背景
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      50,
      canvas.width / 2,
      canvas.height / 2,
      300
    )
    gradient.addColorStop(0, '#16213e')
    gradient.addColorStop(1, '#0f3460')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制动态粒子
    const time = timestamp / 1000
    const particleCount = 100
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.sin(time * 0.2 + i) * canvas.width) / 3 + canvas.width / 2
      const y = (Math.cos(time * 0.3 + i * 0.5) * canvas.height) / 3 + canvas.height / 2
      const size = Math.sin(time + i) * 3 + 5

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(time + i) * 0.3})`
      ctx.fill()
    }

    // 绘制中央标识
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, Math.PI * 2)
    ctx.fill()

    // 绘制文字
    ctx.fillStyle = 'white'
    ctx.font = 'bold 42px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('虚拟摄像头', canvas.width / 2, canvas.height / 2 - 20)

    ctx.font = '24px Arial'
    ctx.fillText('JsSIP WebRTC', canvas.width / 2, canvas.height / 2 + 30)

    // 绘制时间
    const now = new Date()
    const timeStr = fmtDateTime(now.getTime())
    ctx.font = '24px Arial'
    ctx.fillText(timeStr, canvas.width / 2, canvas.height - 40)

    // 绘制状态
    ctx.font = '24px Arial'
    ctx.fillText(text, canvas.width / 2, 50)

    // 继续动画
    animationFrame = requestAnimationFrame(drawFrame)
  }
  // 启动动画
  animationFrame = requestAnimationFrame(drawFrame)
  // 转换为视频流
  return canvas.captureStream(15) // 15 FPS
}
export function closeVirtualStream() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}
// 获取媒体流（包括音频和虚拟视频）
export async function getVirtualMedia(text = '软坐席', type = 'microphone') {
  try {
    // 尝试获取真实音频
    let audioStream
    if (type === 'microphone') {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    }
    if (type === 'audio') {
      audioStream = document.getElementById('localAudio').captureStream()
    }
    const videoStream = createVirtualStream(text)
    // 合并音频和虚拟视频流
    const combinedStream = new MediaStream([...audioStream.getAudioTracks(), ...videoStream.getVideoTracks()])
    return combinedStream
  } catch (error) {
    console.info('无法获取麦克风权限，将使用无声视频')
    // 若音频获取失败，仅返回虚拟视频流
    const videoStream = createVirtualStream(text)
    return videoStream
  }
}
// 获取合成视频流
// virtualVideo - microphone
// virtualVideo - audio
// video - microphone
// video - video
// display - microphone
// camera - microphone
export function getCaptureMediaStream(videoType, audioType, text, mediaElement) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      let combinedTracks = []
      if (videoType === 'virtualVideo' && audioType === 'microphone') {
        const videoStream = createVirtualStream(text)
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        combinedTracks = [...audioStream.getAudioTracks(), ...videoStream.getVideoTracks()]
      }
      if (videoType === 'virtualVideo' && audioType === 'audio') {
        const videoStream = createVirtualStream(text)
        const audioStream = mediaElement.captureStream()
        combinedTracks = [...audioStream.getAudioTracks(), ...videoStream.getVideoTracks()]
      }
      if (videoType === 'video' && audioType === 'microphone') {
        const videoStream = mediaElement.captureStream()
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        combinedTracks = [...audioStream.getAudioTracks(), ...videoStream.getVideoTracks()]
      }
      if (videoType === 'video' && audioType === 'video') {
        const videoStream = mediaElement.captureStream()
        combinedTracks = [...videoStream.getAudioTracks(), ...videoStream.getVideoTracks()]
      }
      if (videoType === 'display' && audioType === 'microphone') {
        const videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        combinedTracks = [...audioStream.getAudioTracks(), ...videoStream.getVideoTracks()]
      }
      if (videoType === 'camera' && audioType === 'microphone') {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        combinedTracks = [...mediaStream.getAudioTracks(), ...mediaStream.getVideoTracks()]
      }
      if (combinedTracks.length > 0) {
        // 合并音频和虚拟视频流
        const combinedStream = new MediaStream(combinedTracks)
        resolve(combinedStream)
      }
    } catch (e) {
      reject(e)
    }
  })
}
export function generateUID(totalLen = 20) {
  const timeStr = Date.now().toString() // 毫秒时间戳
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let randomStr = ''
  // 剩余位数用随机字符补齐
  const randomLen = totalLen - timeStr.length
  for (let i = 0; i < randomLen; i++) {
    randomStr += chars[Math.floor(Math.random() * chars.length)]
  }
  return randomStr + timeStr
}
