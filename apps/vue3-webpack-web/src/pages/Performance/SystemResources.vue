<!-- src/pages/Performance/SystemResources.vue -->
<template>
  <div class="system-resources-container">
    <div class="header-section">
      <h1 class="page-title">系统资源监控</h1>
      <div class="header-actions">
        <XButton type="primary" @click="toggleDataStream" :disabled="!isConnected">
          {{ isStreaming ? '停止' : '开始' }}数据流
        </XButton>
        <div class="connection-status">
          <span class="status-label">连接状态:</span>
          <span
            class="status-value"
            :class="{ connected: isConnected, disconnected: !isConnected }"
          >
            {{ isConnected ? '已连接' : '未连接' }}
          </span>
        </div>
      </div>
    </div>

    <div class="overview-section">
      <SystemInfo />
    </div>

    <div class="charts-grid">
      <div class="chart-item">
        <ResourceLoad :name="'cpu'" :data="resourceData.cpu" :title="'CPU负载'" />
      </div>
      <div class="chart-item">
        <ResourceLoad :name="'memory'" :data="resourceData.memory" :title="'内存使用'" />
      </div>
      <div class="chart-item">
        <DiskResource :data="diskInfo" :title="'磁盘使用'" />
      </div>
      <div class="chart-item full-width">
        <NetworkResource :data="networkInfo" :title="'网络速度'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { webSocketService } from '@/socket/socket'
import XButton from '@/components/XButton/XButton.vue'

// 组件
import SystemInfo from '@/components/SystemInfo/SystemInfo.vue'
import ResourceLoad from '@/components/SystemInfo/ResourceLoad.vue'
import DiskResource from '@/components/SystemInfo/DiskResource.vue'
import NetworkResource from '@/components/SystemInfo/NetworkResource.vue'

// 状态变量
const isStreaming = ref(false)

// 计算属性
const isConnected = computed(() => webSocketService.getIsConnected().value)

// 数据存储
const resourceData = ref<Record<string, Array<{ timestamp: string; value: number }>>>({
  cpu: [],
  memory: [],
})

const networkInfo = ref<
  Array<{
    timestamp: string
    rxBytesPerSec: number
    txBytesPerSec: number
    rxUsage: string
    txUsage: string
    totalUsage: string
  }>
>([])

const diskInfo = ref<{
  total: number
  used: number
  free: number
  usagePercent: number
}>({
  total: 0,
  used: 0,
  free: 0,
  usagePercent: 0,
})

// 常量
const MAX_DATA_LENGTH = 20 // 图表数据最大长度

// 处理系统数据更新
const handleSystemDataUpdate = (data: any) => {
  // 更新 CPU 和内存数据
  if (data.cpu) {
    updateResourceData('cpu', data.timestamp, data.cpu.usagePercent)
  }

  if (data.memory) {
    updateResourceData('memory', data.timestamp, data.memory.usagePercent)
  }

  // 更新网络数据
  if (data.network && data.network.WLAN) {
    networkInfo.value.push({
      timestamp: data.timestamp,
      ...data.network.WLAN,
    })

    // 限制数据长度
    if (networkInfo.value.length > MAX_DATA_LENGTH) {
      networkInfo.value.shift()
    }
  }

  // 更新磁盘数据
  if (data.disk) {
    diskInfo.value = data.disk
  }
}

// 更新资源数据的辅助函数
const updateResourceData = (type: string, timestamp: string, value: number) => {
  if (!resourceData.value[type]) {
    resourceData.value[type] = []
  }

  resourceData.value[type].push({
    timestamp,
    value,
  })

  // 限制数据长度
  if (resourceData.value[type].length > MAX_DATA_LENGTH) {
    resourceData.value[type].shift()
  }
}

// 监听系统数据变化
watch(
  webSocketService.systemDataStream,
  (newValue) => {
    if (newValue) {
      handleSystemDataUpdate(newValue)
    }
  },
  { deep: true }
)

// 切换数据流
const toggleDataStream = () => {
  if (isStreaming.value) {
    webSocketService.stopSystemStream()
  } else {
    webSocketService.startSystemStream()
  }
  isStreaming.value = !isStreaming.value
}

onMounted(() => {
  webSocketService.connect()
})

onUnmounted(() => {
  webSocketService.disconnect()
})
</script>

<style scoped>
.system-resources-container {
  padding: var(--spacing-lg);
  background-color: var(--content-bg);
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border);
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.status-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.status-value {
  font-size: var(--font-size-sm);
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
}

.status-value.connected {
  background-color: var(--success-color-light);
  color: var(--success-color);
}

.status-value.disconnected {
  background-color: var(--danger-color-light);
  color: var(--danger-color);
}

.overview-section {
  margin-bottom: var(--spacing-xl);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.chart-item {
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
  transition: all var(--transition-normal);
}

.chart-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.chart-item.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-item.full-width {
    grid-column: 1;
  }
}
</style>
