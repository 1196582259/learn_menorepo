<template>
  <n-card :title="title" class="network-resource-card">
    <div ref="chartRef" class="chart-container"></div>
    <div class="network-info">
      <div class="info-item">
        <span class="label">发送速度:</span>
        <span class="value" :style="{ color: uploadColor }">
          {{ formatSpeed(currentUploadSpeed) }}
        </span>
      </div>
      <div class="info-item">
        <span class="label">接收速度:</span>
        <span class="value" :style="{ color: downloadColor }">
          {{ formatSpeed(currentDownloadSpeed) }}
        </span>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { NCard } from 'naive-ui'
import * as echarts from 'echarts'

interface NetworkDataItem {
  timestamp: string
  rxBytesPerSec: number
  txBytesPerSec: number
  rxUsage: string
  txUsage: string
  totalUsage: string
}

interface Props {
  // 网络数据数组
  data: NetworkDataItem[]
  // 标题
  title?: string
  // 上传速度颜色
  uploadColor?: string
  // 下载速度颜色
  downloadColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '网络速度监控',
  uploadColor: '#5470c6',
  downloadColor: '#52c41a',
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 计算当前发送速度（取最后一个数据点）
const currentUploadSpeed = computed(() => {
  if (!props.data || props.data.length === 0) return 0
  return props.data[props.data.length - 1].txBytesPerSec
})

// 计算当前接收速度（取最后一个数据点）
const currentDownloadSpeed = computed(() => {
  if (!props.data || props.data.length === 0) return 0
  return props.data[props.data.length - 1].rxBytesPerSec
})

// 上传速度颜色
const uploadColor = computed(() => props.uploadColor)

// 下载速度颜色
const downloadColor = computed(() => props.downloadColor)

// 标题
const title = computed(() => props.title || '网络速度监控')

// 格式化速度
const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k))
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)

  const option: echarts.EChartsOption = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      axisLine: {
        lineStyle: {
          color: '#d9d9d9',
        },
      },
      axisLabel: {
        color: '#666',
        formatter: (value: string) => {
          // 尝试多种时间戳格式处理
          let timestamp: number
          if (!isNaN(Number(value))) {
            timestamp = Number(value)
          } else {
            timestamp = new Date(value).getTime()
          }
          const date = new Date(timestamp)
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
        },
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLine: {
        lineStyle: {
          color: '#d9d9d9',
        },
      },
      axisLabel: {
        color: '#666',
        formatter: (value: number) => {
          if (value === 0) return '0 B/s'
          const k = 1024
          const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
          const i = Math.floor(Math.log(value) / Math.log(k))
          return parseFloat((value / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
        },
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: {
        color: '#333',
      },
      formatter: (params: any) => {
        // 尝试多种时间戳格式处理
        let timestamp: number
        const axisValue = params[0].axisValue
        if (!isNaN(Number(axisValue))) {
          timestamp = Number(axisValue)
        } else {
          timestamp = new Date(axisValue).getTime()
        }
        const date = new Date(timestamp)
        const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`

        let result = `<div style="font-weight: bold; margin-bottom: 5px;">${timeStr}</div>`

        params.forEach((param: any) => {
          result += `<div style="display: flex; align-items: center; margin-top: 4px;">
            <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; border-radius: 50%; margin-right: 5px;"></span>
            <span>${param.seriesName}: ${formatSpeed(param.value)}</span>
          </div>`
        })

        return result
      },
    },
    legend: {
      data: ['发送速度', '接收速度'],
      bottom: '5%',
      textStyle: {
        color: '#666',
      },
    },
    series: [
      {
        name: '发送速度',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: props.uploadColor,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: props.uploadColor + '4D' },
            { offset: 1, color: props.uploadColor + '0D' },
          ]),
        },
        data: [],
      },
      {
        name: '接收速度',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: props.downloadColor,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: props.downloadColor + '4D' },
            { offset: 1, color: props.downloadColor + '0D' },
          ]),
        },
        data: [],
      },
    ],
  }

  chartInstance.setOption(option)
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !props.data || props.data.length === 0) return

  // 将时间戳转换为 ECharts 能够正确处理的格式
  const timestamps = props.data.map((item: NetworkDataItem) => {
    const timestamp = new Date(item.timestamp).getTime()
    return timestamp.toString()
  })

  const uploadData = props.data.map((item: NetworkDataItem) => item.txBytesPerSec)
  const downloadData = props.data.map((item: NetworkDataItem) => item.rxBytesPerSec)

  const maxValue = Math.max(...uploadData, ...downloadData)

  chartInstance.setOption({
    xAxis: {
      data: timestamps,
    },
    yAxis: {
      max: maxValue * 1.1, // 留出一些空间
    },
    series: [{ data: uploadData }, { data: downloadData }],
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
.network-resource-card {
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 250px;
  margin-bottom: 12px;
}

.network-info {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  gap: 20px;
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
  .network-info {
    flex-direction: column;
    align-items: center;
  }
}
</style>
