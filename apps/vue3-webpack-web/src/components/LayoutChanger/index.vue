<template>
  <n-popover trigger="click" :show-arrow="false" placement="left-start">
    <template #trigger>
      <n-button circle size="large" type="primary">
        <template #icon>
          <n-icon :size="22"><SettingsOutline /></n-icon>
        </template>
      </n-button>
    </template>

    <n-card title="选择布局" :bordered="false" size="small">
      <n-radio-group v-model:value="layout">
        <n-space vertical :size="12">
          <n-radio-button value="LayoutClassic">经典布局</n-radio-button>
          <n-radio-button value="LayoutHolyGrail">圣杯布局</n-radio-button>
        </n-space>
      </n-radio-group>
    </n-card>
  </n-popover>
</template>

<script setup>
import { watch, ref } from 'vue'
import { useLayoutStore } from '@/store/layout'
import { NPopover, NButton, NIcon, NCard, NRadioGroup, NRadioButton, NSpace } from 'naive-ui'
import { SettingsOutline } from '@vicons/ionicons5'

const layoutStore = useLayoutStore()
const layout = ref(layoutStore.getLayoutType.layoutType)

watch(layout, (newLayout) => {
  layoutStore.setLayoutType(newLayout)
})
</script>
