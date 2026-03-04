<template>
  <div>
    <component :is="layoutStore.getLayoutType.component">
      <template #layout-changer>
        <LayoutChanger></LayoutChanger>
      </template>
      <router-view></router-view>
    </component>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import LayoutChanger from '@/components/LayoutChanger/index.vue'
import { useLayoutStore } from '@/store/layout'
const layoutStore = useLayoutStore()

const count = ref(0)
</script>
