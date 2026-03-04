// 布局状态管理
import { defineStore } from 'pinia'
import { defineAsyncComponent } from 'vue'

const layoutContext = require.context('@/layouts', true, /\.vue$/, 'lazy')
const layoutFiles = layoutContext.keys()
export type LayoutType = (typeof layoutFiles)[number]
const layoutComponents: Record<string, any> = {
  LayoutClassic: defineAsyncComponent(() => import('@/layouts/LayoutClassic.vue')),
  LayoutHolyGrail: defineAsyncComponent(() => import('@/layouts/LayoutHolyGrail.vue')),
  // 可以通过 require.context 自动生成
}
const a = defineAsyncComponent(() => import('@/layouts/LayoutClassic.vue'))
// 定义布局状态管理
export const useLayoutStore = defineStore('layout', {
  state: () => ({
    layoutType: 'LayoutClassic', // 默认布局类型为三栏布局
  }),
  actions: {
    setLayoutType(type: LayoutType) {
      this.layoutType = type
    },
  },
  getters: {
    getLayoutType: (state) => {
      return {
        layoutType: state.layoutType,
        component: layoutComponents[state.layoutType],
      }
    },
  },
})
