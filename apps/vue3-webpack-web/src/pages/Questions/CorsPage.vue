<template>
  <div class="cors-page">
    <h1 class="page-title">跨域解决方案验证</h1>

    <!-- CORS 方案 -->
    <div class="cors-section">
      <h2 class="section-title">1. CORS（跨域资源共享）</h2>
      <div class="section-desc">通过服务器设置 Access-Control-Allow-Origin 响应头实现跨域</div>
      <div class="test-area">
        <XButton type="primary" @click="testCors">测试 CORS</XButton>
        <div class="result-area">
          <div class="result-label">请求结果：</div>
          <pre class="result-content">{{ corsResult }}</pre>
        </div>
      </div>
    </div>

    <!-- JSONP 方案 -->
    <div class="cors-section">
      <h2 class="section-title">2. JSONP（JSON with Padding）</h2>
      <div class="section-desc">
        利用 script 标签不受同源策略限制的特性，通过动态创建 script 标签实现跨域
      </div>
      <div class="test-area">
        <XButton type="primary" @click="testJsonp">测试 JSONP</XButton>
        <div class="result-area">
          <div class="result-label">请求结果：</div>
          <pre class="result-content">{{ jsonpResult }}</pre>
        </div>
      </div>
    </div>

    <!-- 代理服务器方案 -->
    <div class="cors-section">
      <h2 class="section-title">3. 代理服务器</h2>
      <div class="section-desc">通过同源服务器代理转发请求，避免浏览器的跨域限制</div>
      <div class="test-area">
        <XButton type="primary" @click="testProxy">测试代理</XButton>
        <div class="result-area">
          <div class="result-label">请求结果：</div>
          <pre class="result-content">{{ proxyResult }}</pre>
        </div>
      </div>
    </div>

    <!-- WebSocket 方案 -->
    <div class="cors-section">
      <h2 class="section-title">4. WebSocket</h2>
      <div class="section-desc">WebSocket 协议不受同源策略限制，可以进行跨域通信</div>
      <div class="test-area">
        <XButton type="primary" @click="testWebSocket">测试 WebSocket</XButton>
        <XButton type="default" @click="closeWebSocket">关闭连接</XButton>
        <div class="result-area">
          <div class="result-label">连接状态：</div>
          <div class="result-content">{{ webSocketStatus }}</div>
          <div class="result-label">消息记录：</div>
          <pre class="result-content">{{ webSocketMessages }}</pre>
        </div>
      </div>
    </div>

    <!-- postMessage 方案 -->
    <div class="cors-section">
      <h2 class="section-title">5. postMessage</h2>
      <div class="section-desc">
        通过 window.postMessage 实现跨窗口通信，适用于 iframe 或 window.open 场景
      </div>
      <div class="test-area">
        <XButton type="primary" @click="testPostMessage">测试 postMessage</XButton>
        <div class="result-area">
          <div class="result-label">消息记录：</div>
          <pre class="result-content">{{ postMessageResult }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { XButton } from '@/components'
import axios from 'axios'

// CORS 测试结果
const corsResult = ref<string>('等待测试...')

// JSONP 测试结果
const jsonpResult = ref<string>('等待测试...')

// 代理测试结果
const proxyResult = ref<string>('等待测试...')

// WebSocket 状态和消息
const webSocketStatus = ref<string>('未连接')
const webSocketMessages = ref<string>('等待测试...')
let ws: WebSocket | null = null

// postMessage 测试结果
const postMessageResult = ref<string>('等待测试...')

/**
 * 测试 CORS 跨域方案
 * 通过服务器设置 Access-Control-Allow-Origin 响应头实现跨域
 */
const testCors = async () => {
  corsResult.value = '请求中...'
  try {
    const response = await axios.get('https://api.example.com/data', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    corsResult.value = `成功：${JSON.stringify(response.data, null, 2)}`
  } catch (error) {
    corsResult.value = `失败：${error instanceof Error ? error.message : String(error)}`
  }
}

/**
 * 测试 JSONP 跨域方案
 * 利用 script 标签不受同源策略限制的特性
 */
const testJsonp = () => {
  jsonpResult.value = '请求中...'

  const callbackName = 'jsonpCallback'

  // 定义全局回调函数
  ;(window as any)[callbackName] = (data: any) => {
    jsonpResult.value = `成功：${JSON.stringify(data, null, 2)}`
    delete (window as any)[callbackName]
    document.body.removeChild(script)
  }

  // 创建 script 标签
  const script = document.createElement('script')
  script.src = `https://api.example.com/jsonp?callback=${callbackName}`
  script.onerror = () => {
    jsonpResult.value = '失败：JSONP 请求失败'
    delete (window as any)[callbackName]
    document.body.removeChild(script)
  }

  document.body.appendChild(script)
}

/**
 * 测试代理服务器跨域方案
 * 通过同源服务器代理转发请求
 */
const testProxy = async () => {
  proxyResult.value = '请求中...'
  try {
    const response = await axios.get('/api/proxy/data', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    proxyResult.value = `成功：${JSON.stringify(response.data, null, 2)}`
  } catch (error) {
    proxyResult.value = `失败：${error instanceof Error ? error.message : String(error)}`
  }
}

/**
 * 测试 WebSocket 跨域方案
 * WebSocket 协议不受同源策略限制
 */
const testWebSocket = () => {
  if (ws) {
    webSocketStatus.value = '已连接'
    return
  }

  webSocketStatus.value = '连接中...'
  webSocketMessages.value = ''

  try {
    ws = new WebSocket('wss://echo.websocket.org')

    ws.onopen = () => {
      webSocketStatus.value = '已连接'
      webSocketMessages.value += '连接成功\n'
      ws?.send('Hello WebSocket!')
    }

    ws.onmessage = (event) => {
      webSocketMessages.value += `收到消息：${event.data}\n`
    }

    ws.onerror = (error) => {
      webSocketStatus.value = '连接错误'
      webSocketMessages.value += `连接错误：${error}\n`
    }

    ws.onclose = () => {
      webSocketStatus.value = '已断开'
      webSocketMessages.value += '连接已关闭\n'
      ws = null
    }
  } catch (error) {
    webSocketStatus.value = '连接失败'
    webSocketMessages.value += `连接失败：${error}\n`
  }
}

/**
 * 关闭 WebSocket 连接
 */
const closeWebSocket = () => {
  if (ws) {
    ws.close()
    ws = null
    webSocketStatus.value = '已断开'
  }
}

/**
 * 测试 postMessage 跨域方案
 * 通过 window.postMessage 实现跨窗口通信
 */
const testPostMessage = () => {
  postMessageResult.value = '测试中...'

  // 监听消息
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== 'https://example.com') {
      return
    }
    postMessageResult.value += `收到消息：${JSON.stringify(event.data, null, 2)}\n`
    window.removeEventListener('message', handleMessage)
  }

  window.addEventListener('message', handleMessage)

  // 模拟发送消息到 iframe 或新窗口
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = 'https://example.com'
  document.body.appendChild(iframe)

  iframe.onload = () => {
    iframe.contentWindow?.postMessage(
      {
        type: 'test',
        data: 'Hello from parent',
      },
      'https://example.com'
    )

    setTimeout(() => {
      document.body.removeChild(iframe)
      postMessageResult.value += '测试完成\n'
    }, 1000)
  }

  iframe.onerror = () => {
    postMessageResult.value = '测试失败：iframe 加载失败'
    document.body.removeChild(iframe)
  }
}

// 组件卸载时清理资源
onUnmounted(() => {
  closeWebSocket()
})
</script>

<style scoped lang="scss">
.cors-page {
  padding: var(--spacing-lg);
  background-color: var(--content-bg);
  overflow: scroll;
  height: calc(100vh - 120px);
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.cors-section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--card-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.section-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
}

.test-area {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.result-area {
  margin-top: var(--spacing-md);
}

.result-label {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.result-content {
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
  color: var(--text-primary);
}
</style>
