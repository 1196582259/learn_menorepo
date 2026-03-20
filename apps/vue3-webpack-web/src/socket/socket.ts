// src/services/websocket.ts
import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

interface WebSocketData {
  timestamp: string
  value: number
  type: 'cpu' | 'memory' | 'network'
}

class WebSocketService {
  private socket: Socket | null = null
  private isConnected = ref(false)
  private dataStream = ref<WebSocketData[]>([])
  // 系统数据流
  systemDataStream = ref<any>({})
  constructor() {
    this.connect()
  }

  // 连接WebSocket
  connect() {
    if (this.socket) return

    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // 连接成功
    this.socket.on('connect', () => {
      console.log('WebSocket连接成功')
      this.isConnected.value = true
    })

    // 连接断开
    this.socket.on('disconnect', () => {
      console.log('WebSocket连接断开')
      this.isConnected.value = false
    })

    // 接收欢迎消息
    this.socket.on('welcome', (data) => {
      console.log('收到服务端欢迎:', data)
    })

    // 接收实时数据
    this.socket.on('data-update', (data: WebSocketData[]) => {
      this.dataStream.value = data
    })

    // 接收系统数据
    this.socket.on('system-info', (data: any[]) => {
      console.log('收到系统数据:', data)
      this.systemDataStream.value = data
    })

    // 接收历史数据
    this.socket.on('historical-data', (data: WebSocketData[]) => {
      console.log('收到历史数据:', data)
    })

    // 错误处理
    this.socket.on('error', (error) => {
      console.error('WebSocket错误:', error)
    })
  }

  // 开始数据流
  startDataStream() {
    if (!this.socket) {
      console.error('WebSocket未连接')
      return
    }
    console.log('startDataStream')
    this.socket.emit('start-data-stream')
  }

  // 停止数据流
  stopDataStream() {
    if (!this.socket) {
      console.error('WebSocket未连接')
      return
    }
    this.socket.emit('stop-data-stream')
  }

  // 开始
  startSystemStream() {
    if (!this.socket) {
      console.error('WebSocket未连接')
      return
    }
    console.log('startSystemStream')
    this.socket.emit('start-system-stream')
  }
  stopSystemStream() {
    if (!this.socket) {
      console.error('WebSocket未连接')
      return
    }
    this.socket.emit('stop-system-stream')
  }

  // 发送自定义消息
  sendMessage(message: string) {
    if (!this.socket) {
      console.error('WebSocket未连接')
      return
    }
    this.socket.emit('client-message', { message, timestamp: new Date().toISOString() })
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected.value = false
    }
  }

  // 获取数据
  getData() {
    return this.dataStream
  }

  // 获取连接状态
  getIsConnected() {
    return this.isConnected
  }
}

// 创建单例
export const webSocketService = new WebSocketService()
