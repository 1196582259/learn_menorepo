<template>
  <div class="performance-board">
    <div class="header">
      <h1 class="title">性能监控面板</h1>
      <div class="actions">
        <input type="text" />
        <XButton type="primary" @click="refreshData">刷新数据</XButton>
        <XButton secondary @click="clearCache">清空缓存</XButton>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">LCP (最大内容绘制)</div>
        <div class="metric-value" :class="getMetricClass(lcp)">{{ lcp.toFixed(0) }}ms</div>
        <div class="metric-status">{{ getMetricStatus('LCP', lcp) }}</div>
      </div>

      <div class="metric-card">
        <div class="metric-title">INP (交互响应)</div>
        <div class="metric-value" :class="getMetricClass(inp)">{{ inp.toFixed(0) }}ms</div>
        <div class="metric-status">{{ getMetricStatus('INP', inp) }}</div>
      </div>

      <div class="metric-card">
        <div class="metric-title">CLS (布局偏移)</div>
        <div class="metric-value" :class="getMetricClass(cls)">
          {{ cls.toFixed(3) }}
        </div>
        <div class="metric-status">{{ getMetricStatus('CLS', cls) }}</div>
      </div>

      <div class="metric-card">
        <div class="metric-title">FCP (首次内容绘制)</div>
        <div class="metric-value" :class="getMetricClass(fcp)">{{ fcp.toFixed(0) }}ms</div>
        <div class="metric-status">{{ getMetricStatus('FCP', fcp) }}</div>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-card">
        <h3 class="chart-title">性能趋势</h3>
        <div ref="trendChartRef" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <h3 class="chart-title">资源加载时间</h3>
        <div ref="resourceChartRef" class="chart-container"></div>
      </div>
    </div>

    <div class="test-section">
      <div class="test-card">
        <h3 class="test-title">INP 测试</h3>
        <XButton ref="testButtonRef" type="primary" @click="triggerINP">触发 INP 测试</XButton>
        <p class="test-description">点击此按钮将执行一个耗时操作，触发 INP 指标更新</p>
      </div>
    </div>

    <div class="logs-section">
      <div class="logs-card">
        <h3 class="logs-title">错误日志</h3>
        <div class="logs-container">
          <div v-if="errors.length === 0" class="empty-state">暂无错误</div>
          <div v-for="(error, index) in errors" :key="index" class="log-item error">
            <div class="log-time">{{ formatTime(error.timestamp) }}</div>
            <div class="log-message">{{ error.name }}</div>
            <div class="log-details">{{ error.value }}</div>
          </div>
        </div>
      </div>

      <div class="logs-card">
        <h3 class="logs-title">自定义事件</h3>
        <div class="logs-container">
          <div v-if="customEvents.length === 0" class="empty-state">暂无自定义事件</div>
          <div v-for="(event, index) in customEvents" :key="index" class="log-item custom">
            <div class="log-time">{{ formatTime(event.timestamp) }}</div>
            <div class="log-message">{{ event.name }}</div>
            <div class="log-details">{{ event.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { PerformanceMonitor, type PerformanceData } from '@/sdk/performance'
import XButton from '@/components/XButton/XButton.vue'
import * as echarts from 'echarts'

let performanceMonitor: PerformanceMonitor | null = null

const lcp = ref(0)
const inp = ref(0)
const cls = ref(0)
const fcp = ref(0)
const errors = ref<PerformanceData[]>([])
const customEvents = ref<PerformanceData[]>([])

const trendChartRef = ref<HTMLElement>()
const resourceChartRef = ref<HTMLElement>()
const testButtonRef = ref<InstanceType<typeof XButton>>()
let trendChartInstance: echarts.ECharts | null = null
let resourceChartInstance: echarts.ECharts | null = null

const trendData = ref<
  Array<{ timestamp: number; lcp: number; inp: number; cls: number; fcp: number }>
>([])
const resourceData = ref<Array<{ name: string; duration: number }>>([])

onMounted(() => {
  initPerformanceMonitor()
  initCharts()
})

onUnmounted(() => {
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  if (resourceChartInstance) {
    resourceChartInstance.dispose()
  }
})

function initPerformanceMonitor() {
  performanceMonitor = new PerformanceMonitor({
    endpoint: '/api/performance',
    sampleRate: 1,
    enabledMetrics: ['LCP', 'INP', 'CLS', 'FCP', 'resource', 'error'],
    maxCacheSize: 100,
    onMetric: (data) => {
      handleMetricData(data)
    },
  })
}

function handleMetricData(data: PerformanceData) {
  if (data.type === 'LCP') {
    lcp.value = data.value as number
  } else if (data.type === 'INP') {
    inp.value = data.value as number
  } else if (data.type === 'CLS') {
    cls.value = data.value as number
  } else if (data.type === 'FCP') {
    fcp.value = data.value as number
  } else if (data.type === 'error') {
    errors.value.unshift(data)
    if (errors.value.length > 10) {
      errors.value.pop()
    }
  } else if (data.type === 'custom') {
    customEvents.value.unshift(data)
    if (customEvents.value.length > 10) {
      customEvents.value.pop()
    }
  } else if (data.type === 'resource' && data.name) {
    const resourceName = getResourceName(data.name)
    resourceData.value.push({
      name: resourceName,
      duration: data.value as number,
    })
    if (resourceData.value.length > 20) {
      resourceData.value.shift()
    }
  }

  // 只更新核心指标的趋势数据
  if (['LCP', 'INP', 'CLS', 'FCP'].includes(data.type)) {
    updateTrendData()
  }
}

function getResourceName(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const parts = pathname.split('/')
    const filename = parts[parts.length - 1]
    return filename || pathname
  } catch {
    return url
  }
}

function updateTrendData() {
  trendData.value.push({
    timestamp: Date.now(),
    lcp: lcp.value,
    inp: inp.value,
    cls: cls.value,
    fcp: fcp.value,
  })

  if (trendData.value.length > 20) {
    trendData.value.shift()
  }

  updateCharts()
}

function initCharts() {
  nextTick(() => {
    if (trendChartRef.value) {
      trendChartInstance = echarts.init(trendChartRef.value)
    }
    if (resourceChartRef.value) {
      resourceChartInstance = echarts.init(resourceChartRef.value)
    }
    updateCharts()
  })
}

function updateCharts() {
  if (trendChartInstance) {
    const timestamps = trendData.value.map((item) => formatTime(item.timestamp))
    trendChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['LCP', 'INP', 'CLS', 'FCP'],
      },
      xAxis: {
        type: 'category',
        data: timestamps,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'LCP',
          type: 'line',
          data: trendData.value.map((item) => item.lcp),
          smooth: true,
        },
        {
          name: 'INP',
          type: 'line',
          data: trendData.value.map((item) => item.inp),
          smooth: true,
        },
        {
          name: 'CLS',
          type: 'line',
          data: trendData.value.map((item) => item.cls * 1000),
          smooth: true,
        },
        {
          name: 'FCP',
          type: 'line',
          data: trendData.value.map((item) => item.fcp),
          smooth: true,
        },
      ],
    })
  }

  if (resourceChartInstance) {
    resourceChartInstance.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: resourceData.value.map((item) => item.name),
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: '加载时间 (ms)',
      },
      series: [
        {
          name: '加载时间',
          type: 'bar',
          data: resourceData.value.map((item) => item.duration),
          itemStyle: {
            color: '#5470c6',
          },
        },
      ],
    })
  }
}

function getMetricClass(value: number): string {
  if (value < 1000) return 'good'
  if (value < 2500) return 'warning'
  return 'poor'
}

function getMetricStatus(type: string, value: number): string {
  if (type === 'CLS') {
    if (value < 0.1) return '良好'
    if (value < 0.25) return '需改进'
    return '较差'
  }

  if (value < 1000) return '良好'
  if (value < 2500) return '需改进'
  return '较差'
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

function refreshData() {
  lcp.value = 0
  inp.value = 0
  cls.value = 0
  fcp.value = 0
  errors.value = []
  customEvents.value = []
  trendData.value = []
  resourceData.value = []
  performanceMonitor?.clearCache()
}

function clearCache() {
  performanceMonitor?.clearCache()
}
let height = 40
function triggerINP() {
  // 通过 Vue 的方式获取按钮元素并修改高度
  if (testButtonRef.value) {
    const buttonElement = testButtonRef.value.$el as HTMLElement
    if (buttonElement) {
      buttonElement.style.height = height + 'px'
      height += 40
      debugger
    }
  }

  // 执行一个耗时操作来触发 INP
  const startTime = performance.now()

  // 模拟耗时计算
  let result = 0
  let a = []
  for (let i = 0; i < 10000; i++) {
    // result += Math.sqrt(i)
    ;(() => {
      console.log(result)
    })()
    a.push(document.createElement('div'))
  }

  const endTime = performance.now()
  console.log('INP 测试耗时:', endTime - startTime, 'ms')

  // 显示结果
  alert(`INP 测试完成，耗时: ${(endTime - startTime).toFixed(0)}ms`)
  a.forEach((item) => {
    item.remove()
  })
}
</script>

<style scoped>
.performance-board {
  padding: var(--spacing-lg);
  background-color: var(--content-bg);
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.metric-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  text-align: center;
  transition: all var(--transition-normal);
}

.metric-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.metric-title {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.metric-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.metric-value.good {
  color: var(--success-color);
}

.metric-value.warning {
  color: var(--warning-color);
}

.metric-value.poor {
  color: var(--danger-color);
}

.metric-status {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.chart-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
}

.chart-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: var(--spacing-md);
}

.chart-container {
  width: 100%;
  height: 300px;
}

.logs-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: var(--spacing-lg);
}

.test-section {
  margin-bottom: var(--spacing-xl);
}

.test-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  text-align: center;
}

.test-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: var(--spacing-md);
}

.test-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: var(--spacing-md);
}

.test-button:hover {
  background-color: var(--primary-hover);
}

.test-description {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0;
}

.logs-card {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
}

.logs-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: var(--spacing-md);
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: var(--spacing-lg);
}

.log-item {
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  border-radius: var(--radius-md);
  border-left: 3px solid;
}

.log-item.error {
  background-color: var(--danger-color-light);
  border-left-color: var(--danger-color);
}

.log-item.custom {
  background-color: var(--info-color);
  border-left-color: var(--info-color);
}

.log-time {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
}

.log-message {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.log-details {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  word-break: break-all;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .logs-section {
    grid-template-columns: 1fr;
  }
}
</style>
