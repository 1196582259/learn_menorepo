<!-- 非受控组件 -->

<template>
  <n-card>
    <h2>System Info</h2>
    <p>Platform: {{ systemInfo?.platform }}</p>
    <p>Hostname: {{ systemInfo?.hostname }}</p>
    <p>CPU: {{ systemInfo?.cpu?.model }}</p>
    <p>Memory: {{ systemInfo?.memory?.total }}</p>
    <p>Disk: {{ systemInfo?.disk?.total }}</p>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard } from 'naive-ui'
import http from '@/http/http'

const systemInfo = ref<any>({})

onMounted(() => {
  http.get('/system/info').then((res) => {
    console.log(res.data)
    systemInfo.value = res.data
  })
})
</script>
