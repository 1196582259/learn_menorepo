<template>
  <n-card :title="title" class="disk-resource-card">
    <div ref="chartRef" class="chart-container"></div>
    <div class="disk-info">
      <div class="info-item">
        <span class="label">总容量:</span>
        <span class="value">{{ formatBytes(diskData?.total || 0) }}</span>
      </div>
      <div class="info-item">
        <span class="label">已使用:</span>
        <span class="value" :style="{ color: getColor(usagePercent) }">
          {{ formatBytes(diskData?.used || 0) }} ({{ usagePercent.toFixed(1) }}%)
        </span>
      </div>
      <div class="info-item">
        <span class="label">可用:</span>
        <span class="value">{{ formatBytes(diskData?.free || 0) }}</span>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { NCard } from 'naive-ui'
import * as echarts from 'echarts'

interface DiskData {
  total: number
  used: number
  free: number
  usagePercent: number
}

interface Props {
  // 磁盘数据
  data: DiskData
  // 标题
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '磁盘使用情况',
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 计算磁盘使用率
const usagePercent = computed(() => props.data?.usagePercent || 0)

// 磁盘数据
const diskData = computed(() => {
  return props.data
})

// 标题
const title = computed(() => props.title || '磁盘使用情况')

// 格式化字节数
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取颜色（根据使用率）
const getColor = (value: number): string => {
  if (value < 50) return '#52c41a'
  if (value < 80) return '#faad14'
  return '#f5222d'
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: {
        color: '#666',
      },
    },
    series: [
      {
        name: '磁盘使用',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: 0,
            name: '已使用',
            itemStyle: {
              color: '#5470c6',
            },
          },
          {
            value: 0,
            name: '可用',
            itemStyle: {
              color: '#e6f7ff',
            },
          },
        ],
      },
    ],
  }

  chartInstance.setOption(option)
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !props.data) return

  const { used, free } = props.data

  chartInstance.setOption({
    series: [
      {
        data: [
          {
            value: used,
            name: '已使用',
            itemStyle: {
              color: getColor(usagePercent.value),
            },
          },
          {
            value: free,
            name: '可用',
            itemStyle: {
              color: '#e6f7ff',
            },
          },
        ],
      },
    ],
  })
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    updateChart()
  },
  { deep: true }
)

onMounted(() => {
  initChart()
  updateChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.disk-resource-card {
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 250px;
  margin-bottom: 12px;
}

.disk-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  gap: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.value {
  font-size: 16px;
  font-weight: bold;
  transition: color 0.3s;
}

@media (max-width: 768px) {
  .disk-info {
    flex-direction: column;
    align-items: center;
  }
}
</style>
