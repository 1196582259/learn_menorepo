import { createRouter, createWebHistory } from 'vue-router'
import { useLayoutStore } from '@/store/layout'

const pageContext = require.context('@/pages', true, /\.vue$/, 'lazy')
const routes = pageContext.keys().map((item: string) => {
  const name = item.replace(/^\.\/(.*)\.\w+$/, '$1').replace(/^\/+/, '')
  const filePath = item.replace(/^\.\/(.*)\.\w+$/, '$1').replace(/^\/+/, '') + '.vue'
  return {
    name: name.replace(/\//g, '-'),
    path: '/' + name,
    filePath: filePath,
    component: () => import(/* webpackChunkName: "[request]" */ '@/pages/' + filePath),
  }
})
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/About/About',
    },
    ...routes,
  ],
})
// 导航守卫中延迟获取 store
router.beforeEach((to, from, next) => {
  // 在这里使用 store，而不是在模块顶层
  const layoutStore = useLayoutStore() // 需要时再调用
  console.log(layoutStore.getLayoutType)
  if (to.meta.requiresAuth && !layoutStore.layoutType) {
    next('/login')
  } else {
    next()
  }
})

export default router
