<template>
  <n-button
    :type="type"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :round="round"
    :circle="circle"
    :ghost="ghost"
    :block="block"
    :auto-insert-space="autoInsertSpace"
    :color="color"
    :text-color="textColor"
    :border-color="borderColor"
    :hover-color="hoverColor"
    :hover-text-color="hoverTextColor"
    :hover-border-color="hoverBorderColor"
    :active-color="activeColor"
    :active-text-color="activeTextColor"
    :active-border-color="activeBorderColor"
    :focus-mode="focusMode"
    :focus-color="focusColor"
    :focus-text-color="focusTextColor"
    :focus-border-color="focusBorderColor"
    @click="handleClick"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    <slot />
  </n-button>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'

interface Props {
  // 按钮类型
  type?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  // 按钮尺寸
  size?: 'small' | 'medium' | 'large'
  // 是否禁用
  disabled?: boolean
  // 是否加载中
  loading?: boolean
  // 是否圆角
  round?: boolean
  // 是否圆形
  circle?: boolean
  // 是否幽灵按钮
  ghost?: boolean
  // 是否块级按钮
  block?: boolean
  // 是否自动插入空格
  autoInsertSpace?: boolean
  // 按钮颜色
  color?: string
  // 文字颜色
  textColor?: string
  // 边框颜色
  borderColor?: string
  // 悬浮颜色
  hoverColor?: string
  // 悬浮文字颜色
  hoverTextColor?: string
  // 悬浮边框颜色
  hoverBorderColor?: string
  // 激活颜色
  activeColor?: string
  // 激活文字颜色
  activeTextColor?: string
  // 激活边框颜色
  activeBorderColor?: string
  // 聚焦模式
  focusMode?: 'outline' | 'highlight'
  // 聚焦颜色
  focusColor?: string
  // 聚焦文字颜色
  focusTextColor?: string
  // 聚焦边框颜色
  focusBorderColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false,
  round: false,
  circle: false,
  ghost: false,
  block: false,
  autoInsertSpace: true,
  color: undefined,
  textColor: undefined,
  borderColor: undefined,
  hoverColor: undefined,
  hoverTextColor: undefined,
  hoverBorderColor: undefined,
  activeColor: undefined,
  activeTextColor: undefined,
  activeBorderColor: undefined,
  focusMode: 'outline',
  focusColor: undefined,
  focusTextColor: undefined,
  focusBorderColor: undefined,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style scoped>
/* 可以在这里添加自定义样式，使用主题变量 */
.x-button {
  transition: all var(--transition-fast);
}
</style>
