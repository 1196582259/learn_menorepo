<template>
  <n-card :title="title" class="resource-load-card">
    <div ref="chartRef" class="chart-container"></div>
    <div class="resource-info">
      <div class="info-item">
        <span class="label">{{ resourceName }}:</span>
        <span class="value" :style="{ color: getColor(currentValue) }"
          >{{ currentValue.toFixed(1) }}%</span
        >
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { NCard } from 'naive-ui'
import * as echarts from 'echarts'

interface Props {
  // 资源名称
  name: 'cpu' | 'memory' | 'disk' | 'network'
  // 资源数据数组 [{ timestamp: string, value: number }]
  data: Array<{ timestamp: string; value: number }>
  // 颜色配置
  color?: string
  // 标题
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#5470c6',
  title: '资源负载监控',
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 计算当前值（取最后一个数据点）
const currentValue = computed(() => {
  if (!props.data || props.data.length === 0) return 0
  return props.data[props.data.length - 1].value
})

// 资源名称映射
const resourceNameMap: Record<string, string> = {
  cpu: 'CPU',
  memory: '内存',
  disk: '磁盘',
  network: '网络',
}

const resourceName = computed(() => resourceNameMap[props.name] || props.name)

// 标题
const title = computed(() => props.title || `${resourceName.value}负载监控`)

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
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
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
      max: 100,
      axisLine: {
        lineStyle: {
          color: '#d9d9d9',
        },
      },
      axisLabel: {
        color: '#666',
        formatter: '{value}%',
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
        return `<div style="font-weight: bold; margin-bottom: 5px;">${timeStr}</div>
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 10px; height: 10px; background: ${params[0].color}; border-radius: 50%; margin-right: 5px;"></span>
            <span>${resourceName.value}: ${params[0].value}%</span>
          </div>`
      },
    },
    series: [
      {
        name: resourceName.value,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: props.color,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: props.color + '4D' },
            { offset: 1, color: props.color + '0D' },
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
  const timestamps = props.data.map((item: { timestamp: string; value: number }) => {
    const timestamp = new Date(item.timestamp).getTime()
    return timestamp.toString()
  })
  const values = props.data.map((item: { timestamp: string; value: number }) => item.value)
  const max = Math.max(...values)
  chartInstance.setOption({
    xAxis: {
      data: timestamps,
    },
    yAxis: {
      max: max > 100 ? max : 100,
    },
    series: [{ data: values }],
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
.resource-load-card {
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 250px;
  margin-bottom: 12px;
}

.resource-info {
  display: flex;
  justify-content: center;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.value {
  font-size: 20px;
  font-weight: bold;
  transition: color 0.3s;
}
</style>
