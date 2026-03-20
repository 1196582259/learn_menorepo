<template>
  <div class="menu-bar">
    <n-menu
      :options="props.data"
      v-model:selected-key="selectedKey"
      class="menu"
      @update:value="handleUpdateValue"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from 'vue'
import { useRouter } from 'vue-router'
import { NMenu } from 'naive-ui'
const router = useRouter()

type MenuItem = {
  label: string
  key: string
}

const props = defineProps({
  data: {
    type: Array as PropType<MenuItem[]>,
    default: () => [],
  },
})
const handleUpdateValue = (key: string, item: any) => {
  selectedKey.value = key
  console.log(key, item)
  if (item.to) {
    router.push(item.to)
  }
}

const selectedKey = ref('cpu')
</script>
