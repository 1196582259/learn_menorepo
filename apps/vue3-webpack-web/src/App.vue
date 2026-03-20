<template>
  <div data-theme="light">
    <component :is="layoutStore.getLayoutType.component">
      <template #sidebar-left>
        <MenuBar :data="data"></MenuBar>
      </template>
      <template #layout-changer>
        <LayoutChanger></LayoutChanger>
      </template>
      <router-view></router-view>
    </component>
  </div>
</template>

<script setup lang="ts">
import LayoutChanger from '@/components/LayoutChanger/index.vue'
import { useLayoutStore } from '@/store/layout'
import MenuBar from '@/components/MenuBar/MenuBar.vue'

const data = [
  {
    label: '系统资源',
    key: 'system-resources',
    to: '/Performance/SystemResources',
  },
  {
    label: '性能监控',
    key: 'performance-monitoring',
    to: '/Performance/PerformanceBoard',
  },
  {
    label: '问题管理',
    key: 'question-management',
    to: '/Questions/QuestionsIndex',
    children: [
      {
        label: '问题列表',
        key: 'question-list',
        to: '/Questions/QuestionsIndex',
      },
      {
        label: '图片加载',
        key: 'image-load',
        to: '/Questions/ImageLoad',
      },
    ],
  },
  {
    label: '日志分析',
    key: 'log-analysis',
  },
  {
    label: '告警通知',
    key: 'alarm-notification',
  },
  {
    label: '系统配置',
    key: 'system-configuration',
  },
  {
    label: '产品管理',
    key: 'product-management',
  },
  {
    label: '用户管理',
    key: 'user-management',
  },
  {
    label: '角色管理',
    key: 'role-management',
  },
  {
    label: '权限管理',
    key: 'permission-management',
  },
]
const layoutStore = useLayoutStore()
</script>
