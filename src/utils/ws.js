class Ws {
  constructor(url, options = {}) {
    this.opts = {
      pingString: 'ping',
      pingStepTime: 15000,
      pongString: 'pong',
      reconnectTime: 15000,
      isCanReconnect: true,
      onReconnect() {},
      onmessage() {},
      onopen() {},
      onerror() {},
      onclose() {},
      onEvent() {},
      ...options
    }
    // 是否已连接
    this.isConnected = false
    // 是否正在连接中
    this.isConnecting = false
    // 心跳定时器
    this.pingTimer = null
    // 重连定时器
    this.reconnectTimer = null
    // 是否是用户关闭
    this.isUserClose = false
    this.url = url
    this.initSocket()
  }
  initSocket() {
    if (this.isConnecting || this.isConnected) return
    this.clearAllTimer()
    this.isConnecting = true
    this.isConnected = false
    try {
      this.socket = new WebSocket(this.url)
    } catch (err) {
      this.isConnecting = false
      console.error('WebSocket 创建失败', err)
      return
    }
    this.socket.onopen = (e) => {
      this.isConnecting = false
      this.isConnected = true
      this.opts.onopen(e)
      this.opts.onEvent('open', e)
      this.startPing()
    }
    this.socket.onerror = (e) => {
      this.isConnecting = false
      this.isConnected = false
      this.opts.onerror(e)
      this.opts.onEvent('error', e)
      this.clearPingTimer()
    }
    this.socket.onclose = (e) => {
      this.isConnecting = false
      this.isConnected = false
      this.opts.onclose(e)
      this.opts.onEvent('close', e)
      this.clearPingTimer()
      if (!(this.isUserClose || e.code === 4001)) {
        if (this.opts.isCanReconnect) {
          this.startReconnect()
        }
      } else {
        this.opts.onEvent('user-close', e)
      }
      this.isUserClose = false
    }
    this.socket.onmessage = (e) => {
      this.opts.onmessage(e)
      this.opts.onEvent('message', e)
    }
  }
  // 发送socket信息
  sendMessage(text) {
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(text)
      this.opts.onEvent('send', text)
    } else {
      console.warn('socket未创建或未连接！')
    }
  }
  // 开始心跳检测
  startPing() {
    this.clearPingTimer()
    this.pingTimer = setInterval(() => {
      const isFunction = typeof this.opts.pingString === 'function'
      const pingString = isFunction ? this.opts.pingString() : this.opts.pingString
      this.sendMessage(pingString)
    }, this.opts.pingStepTime)
  }
  // 开始定时重新连接
  startReconnect() {
    this.clearReconnectTimer()
    this.reconnectTimer = setTimeout(() => {
      this.initSocket()
      this.opts.onReconnect()
      this.opts.onEvent('reconnect')
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }, this.opts.reconnectTime)
    this.opts.onEvent('wait-reconnect')
  }
  // 清空心跳
  clearPingTimer() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }
  // 清空重连
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
  // 清空所有定时器
  clearAllTimer() {
    this.clearPingTimer()
    this.clearReconnectTimer()
  }
  // 关闭socket连接
  close() {
    this.isUserClose = true
    this.clearAllTimer()
    this.socket?.close(4001)
  }
  // 销毁
  destroy() {
    this.close()
    this.opts.isCanReconnect = false
  }
}
export default Ws
