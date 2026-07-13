import { defineStore } from 'pinia'
import JsSIP from 'jssip'
import { closeVirtualStream, getVirtualMedia } from '@/utils'
JsSIP.debug.disable('JsSIP:*')
let userAgent
let incomingSession
export const useSipPhoneStore = defineStore('sipPhone', {
  state() {
    return {
      SIP_HOST: '10.248.201.39', // SIP电话IP
      SIP_PORT: '5066', // SIP电话端口
      phoneNum: '20002', // 话机号码
      password: '123456', // 话机密码
      state: 'offline', // 话机状态 offline：离线、conn：连接、ring：振铃、talking：通话、idle：空闲
      isRegistering: false, // 是否正在注册
      isRegistered: false, // 电话是否注册
      isReRegistering: false, // 是否正等待重新连接
      maxReConnect: 10, // 最大重连次数
      waitTime: 15000, // 重连等待时间
      reconnectNum: 0, // 重连次数
      reconnectTimer: null, // 重连计时器
      isCanReconnect: true, // 是否可以重新连接
      remoteStream: null, // 远程媒体流
      localStream: null, // 本地媒体流
      isHold: false, // 是否保持
      callInfo: {
        caller: null,
        called: null,
        beginTime: null,
        answerTime: null,
        endTime: null,
        result: null
      }, // 呼叫信息
      callRecords: [], // 通话记录
      isShowModal: false
    }
  },
  actions: {
    sipPhoneRegister() {
      this.clearReconnectTimer()
      if (this.isRegistering || this.isRegistered) return
      if (userAgent && userAgent.isConnected()) {
        userAgent.stop()
        return
      }
      const wsUrl = `ws://${this.SIP_HOST}:${this.SIP_PORT}`
      const sipUrl = `${this.SIP_HOST}:${this.SIP_PORT}`
      this.isRegistering = true
      const socket = new JsSIP.WebSocketInterface(wsUrl)
      const configuration = {
        sockets: [socket],
        uri: `sip:${this.phoneNum}@${sipUrl}`,
        password: this.password || this.config.pass,
        register_expires: 60,
        register: true,
        session_timers: false,
        contact_uri: `sip:${this.phoneNum}@${sipUrl};transport=ws`
      }
      userAgent = new JsSIP.UA(configuration)
      userAgent.on('connected', (e) => {
        console.info('###connected', e)
        this.isRegistered = true
        this.isRegistering = false
        this.reconnectNum = 0
      })
      userAgent.on('disconnected', (e) => {
        console.info('###disconnected', e)
        this.isRegistered = false
        this.isRegistering = false
        this.state = 'offline'
        this.triggerPhoneReconnect()
      })
      userAgent.on('registered', () => {
        console.info('###registered 电话注册成功', Date().toString())
        console.log('JsSIP.version', JsSIP.version)
        this.isRegistered = true
        this.isRegistering = false
        this.reconnectNum = 0
        this.state = 'idle'
      })
      userAgent.on('registrationFailed', (e) => {
        console.info('###registrationFailed', e)
        this.isRegistered = false
        this.isRegistering = false
        this.triggerPhoneReconnect()
      })
      userAgent.on('unregistered', (e) => {
        console.info('###unregistered', e)
        this.isRegistered = false
        this.isRegistering = false
        this.triggerPhoneReconnect()
      })
      userAgent.on('newMessage', (e) => {
        if (e.message) {
          const originator = e.originator
          const from = e.message.request.from.uri.user
          const to = e.message.request.to.uri.user
          const content = e.message.content
          const time = new Date().toLocaleString()
          console.info(`收到一条${originator}消息\n发送者:${from}\n接送者:${to}\n接收者:${content}\n消息时间:${time}`)
        }
      })
      userAgent.on('newRTCSession', (e) => {
        console.info('###onNewRTCSession: ', e)
        incomingSession = e.session
        this.callInfo.beginTime = null
        this.callInfo.answerTime = null
        this.callInfo.endTime = null
        this.callInfo.result = null
        this.callInfo.caller = null
        this.callInfo.called = null
        const fromUser = e.request.from.uri.user
        const toUser = e.request.to.uri.user
        if (e.originator === 'remote') {
          // 延时应答，不然视频呼叫容易协商失败
          if (fromUser === this.phoneNum) {
            this.sipAnswer()
          } else {
            this.togglePhoneRing(true)
            this.isShowModal = true
          }
        }
        this.bindSessionEvents(incomingSession, fromUser, toUser)
      })
      userAgent.start()
    },
    clearReconnectTimer() {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
        this.isReRegistering = false
      }
    },
    triggerPhoneReconnect() {
      if (!this.isCanReconnect || this.reconnectNum > this.maxReConnect || this.isRegistering) return
      this.clearReconnectTimer()
      this.isReRegistering = true
      this.reconnectTimer = setTimeout(() => {
        this.reconnectNum += 1
        this.isReRegistering = false
        this.sipPhoneRegister()
      }, this.waitTime)
    },
    stopLocal() {
      this.isHold = false
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          track.stop()
        })
        this.localStream = null
        this.remoteStream = null
        incomingSession = null
      }
      closeVirtualStream()
    },
    // 播放/停止来电铃声
    togglePhoneRing(isPlay = false) {
      const $ringAudio = document.getElementById('ringAudio')
      if ($ringAudio) {
        if (isPlay) {
          $ringAudio.play()
        } else {
          $ringAudio.pause()
          $ringAudio.currentTime = 0
          this.isShowModal = false
        }
      }
    },
    sipAnswer() {
      console.log('answer')
      this.togglePhoneRing(false)
      if (!this.incomingSession) {
        console.log('当前通话连接未建立无法应答！')
        this.isShowModal = false
        return
      }
      this.isShowModal = false
      const text = `${this.phoneNum}(${this.phoneNum})`
      getVirtualMedia(text).then((stream) => {
        this.localStream = stream
        incomingSession.answer({
          mediaStream: stream,
          mediaConstraints: {
            audio: true,
            video: true
          }
        })
        return stream
      })
    },
    // Sip电话呼叫
    sipCall(num) {
      getVirtualMedia(this.phoneNum).then((stream) => {
        this.localStream = stream
        const options = {
          sessionTimersExpires: 120,
          mediaStream: stream,
          mediaConstraints: {
            audio: true,
            video: true
          }
        }
        userAgent.call(num, options)
      })
    },
    // Sip电话挂机
    sipHangup() {
      userAgent.terminateSessions()
    },
    // 话机断开连接不会触发重新连接
    sipPhoneDisconnect() {
      this.clearReconnectTimer()
      this.isCanReconnect = false
      userAgent?.stop()
    },
    // 电话连接
    sipPhoneConnect() {
      this.clearReconnectTimer()
      this.isCanReconnect = true
      this.sipPhoneRegister()
    },
    // 通话保持或取回
    sipPhoneToggleHold() {
      if (incomingSession && this.state === 'talking') {
        if (this.isHold) {
          incomingSession.unhold()
        } else {
          incomingSession.hold()
        }
      }
    },
    bindSessionEvents(session, fromUser, toUser) {
      session.on('peerconnection', (data) => {
        console.info('###onPeerconnection')
        data.peerconnection.ontrack = (ev) => {
          this.remoteStream = ev.streams[0]
          console.log('获取视频流', ev)
        }
      })
      session.on('ended', (data) => {
        console.log('ended', data)
        this.stopLocal()
        this.state = 'idle'
        this.callInfo.endTime = new Date().getTime()
        this.callRecords.push({ ...this.callInfo })
        this.togglePhoneRing(false)
      })
      session.on('accepted', (data) => {
        console.log('accepted', data)
      })
      session.on('progress', (data) => {
        console.log('progress', data)
        this.callInfo.beginTime = new Date().getTime()
        const { originator } = data
        if (originator === 'remote') {
          this.state = 'conn'
          this.callInfo.caller = fromUser
          this.callInfo.called = toUser
        }
        if (originator === 'local') {
          this.state = 'ring'
          this.callInfo.caller = fromUser
          this.callInfo.called = toUser
          this.togglePhoneRing(true)
        }
      })
      session.on('confirmed', (data) => {
        console.log('confirmed', data)
        if (!this.callInfo.caller && !this.callInfo.called) {
          this.state = 'conn'
          this.callInfo.caller = fromUser
          this.callInfo.called = toUser
          this.callInfo.beginTime = new Date().getTime()
          this.callInfo.answerTime = null
        } else {
          this.state = 'talking'
          this.callInfo.answerTime = new Date().getTime()
          this.togglePhoneRing(false)
        }
      })
      session.on('failed', (data) => {
        console.log('failed', data)
        this.state = 'idle'
        this.callInfo.endTime = new Date().getTime()
        this.callRecords.push({ ...this.callInfo })
        this.togglePhoneRing(false)
        this.stopLocal()
      })
      session.on('hold', () => {
        this.isHold = true
      })
      session.on('unhold', () => {
        this.isHold = false
      })
    }
  }
})
