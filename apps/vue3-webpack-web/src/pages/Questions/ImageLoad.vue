<template>
  <div class="image-control-container">
    <div class="image-control-group">
      <div class="load-image-btns flex">
        <XButton class="mr-2" type="primary" @click="loadImages(100)">加载100张图片</XButton>
        <XButton class="mr-2" type="primary" @click="loadImages(500)">加载500张</XButton>
        <XButton class="mr-2" type="primary" @click="loadImages(1000)">加载1000张</XButton>
      </div>
      <div class="load-image-methods">
        <div class="mr-2">加载方式：</div>
        <NRadioGroup v-model:value="imgControlConfig.loadMethod" class="mr-2">
          <NRadio key="virtual" value="virtual">虚拟加载</NRadio>
          <NRadio key="lazyObserver" value="lazyObserver">懒加载（IntersectionObserver）</NRadio>
          <NRadio key="lazyScroll" value="lazyScroll">懒加载（scroll）</NRadio>
          <NRadio key="chunk" value="chunk">分块加载</NRadio>
        </NRadioGroup>
        <div class="mr-2">加载来源：</div>
        <n-radio-group v-model:value="imgControlConfig.loadFrom" class="mr-2">
          <n-radio key="local" value="local">本地图片（开启CDN缓存）</n-radio>
          <n-radio key="network" value="network">网络图片</n-radio>
        </n-radio-group>
        <NSwitch class="mr-2" type="primary">分块加载</NSwitch>
      </div>
      <div
        v-if="['lazyScroll', 'lazyObserver'].includes(imgControlConfig.loadMethod)"
        class="load-image-container"
        style="height: calc(100vh - 300px); overflow: auto"
      ></div>
      <div
        v-else-if="imgControlConfig.loadMethod === 'chunk'"
        class="load-image-container"
        style="height: calc(100vh - 300px); overflow: auto"
      ></div>
      <div
        v-else
        class="load-image-scroll-container"
        style="height: calc(100vh - 300px); position: relative; overflow: auto"
      >
        <div
          class="load-image-scroll"
          :style="{
            height: scrollHeight + 'px',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
          }"
        ></div>
        <div class="load-image-container">
          <!-- 虚拟加载 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { XButton } from '@/components'
import { NSwitch, NRadioGroup, NRadio } from 'naive-ui'
import { debounce } from '@/utils'
type imgControlConfigType = {
  loadMethod: 'virtual' | 'lazyScroll' | 'lazyObserver' | 'chunk' // 加载方式 虚拟加载、懒加载、分块加载
  loadFrom: 'local' | 'network' // 加载来源
}

const imgControlConfig = ref<imgControlConfigType>({
  loadMethod: 'virtual',
  loadFrom: 'local',
})
const scrollHeight = ref(0)

// 加载图片
const loadImages = (count: number) => {
  console.log(`加载${count}张图片`)

  // 清空容器
  const container = document.querySelector('.load-image-container')
  if (container) {
    container.innerHTML = ''
  }

  loadLocalImages(count)

  if (imgControlConfig.value.loadMethod === 'virtual') {
    // 设置滚动高度，模拟大量内容
    scrollHeight.value = count * 250 // 每张图片高度200px + 间隙50px

    // 初始加载可见区域的图片
    nextTick(() => {
      virtualLoad()
    })
  } else {
    // 其他加载方式
    lazyLoadImages()
    const content = document.querySelector('.load-image-container')
    if (content) {
      content.removeEventListener('scroll', debounceLazyScrollLoad)
      content.addEventListener('scroll', debounceLazyScrollLoad)
    }
  }
}

const loadLocalImages = (count: number) => {
  console.log(`加载${count}张本地图片`)
  const folder = '/images'
  console.log(folder)
  const fragment = document.createDocumentFragment()
  for (let i = 0; i < count; i++) {
    const img = new Image()
    // 从 000930 开始，与实际文件匹配
    const index = 930 + i
    img.dataset.src = folder + `/风景_${index.toString().padStart(6, '0')}.jpg`
    img.alt = `风景图片${index}`
    img.style.height = '200px'
    img.classList.add('lazy-image')
    img.loading = 'lazy'
    img.style.width = '200px'
    fragment.appendChild(img)
  }
  document.querySelector('.load-image-container')?.appendChild(fragment)
}

const lazyLoadImages = () => {
  if (imgControlConfig.value.loadMethod === 'lazyObserver') {
    lazyObserverLoad()
  } else if (imgControlConfig.value.loadMethod === 'lazyScroll') {
    lazyScrollLoad()
  }
}

// 懒加载图片 scroll
const lazyScrollLoad = () => {
  console.log('懒加载图片：scroll')
  // 获取当前页面位置，预加载下面4行的图片
  const viewportHeight = document.documentElement.clientHeight // 可见区域高度（无滚动条）
  const scrollTop = window.scrollY
  const imgs = document.querySelectorAll(
    '.load-image-container img'
  ) as NodeListOf<HTMLImageElement>
  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i]
    const rect = img.getBoundingClientRect() // 包含border、padding、margin的元素位置信息,即使没有设置box-sizing: border-box;
    if (rect.top < 3 * (viewportHeight + scrollTop)) {
      // 图片进入可见区域
      img.src = img.dataset.src!
    }
  }
  console.log('懒加载图片')
}
const debounceLazyScrollLoad = debounce(lazyScrollLoad, 1000)
// 懒加载图片 IntersectionObserver
const lazyObserverLoad = () => {
  // 监听图片加载事件，实现懒加载
  console.log('懒加载图片：IntersectionObserver')
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = img.dataset.src!
            observer?.unobserve(img)
          }
        })
      },
      {
        threshold: 0, // 图片进入可见区域的比例，默认0.0
        rootMargin: '200px', // 监听区域的外边距，默认0px
      }
    )
  }
  const imgs = document.querySelectorAll('.lazy-image') as NodeListOf<HTMLImageElement>
  imgs.forEach((img) => {
    observer?.observe(img)
  })
}

// 虚拟加载图片: 只存在可视区域的节点
const virtualLoad = () => {
  console.log('虚拟加载图片')

  // 获取滚动容器
  const scrollContainer = document.querySelector('.load-image-scroll-container')
  if (!scrollContainer) return

  // 获取容器的滚动位置和尺寸
  const scrollTop = scrollContainer.scrollTop
  const containerHeight = scrollContainer.clientHeight

  // 计算可见区域的范围
  const visibleTop = scrollTop
  const visibleBottom = scrollTop + containerHeight + 200 // 预加载区域

  // 获取所有图片
  const imgs = document.querySelectorAll(
    '.load-image-container img'
  ) as NodeListOf<HTMLImageElement>

  imgs.forEach((img) => {
    const rect = img.getBoundingClientRect()
    const imgTop = rect.top + scrollTop

    // 检查图片是否在可见区域内
    if (imgTop >= visibleTop && imgTop <= visibleBottom) {
      // 图片在可见区域内，加载图片
      if (img.dataset.src && !img.src) {
        img.src = img.dataset.src
      }
      img.style.display = 'block'
    } else {
      // 图片不在可见区域内，隐藏图片
      img.style.display = 'none'
    }
  })
}

// 防抖处理的虚拟加载
const debounceVirtualLoad = debounce(virtualLoad, 100)

const loadNetworkImages = (count: number) => {
  console.log(`加载${count}张网络图片`)
}
let observer: IntersectionObserver | null = null
onMounted(() => {
  // 监听滚动容器的滚动事件，实现虚拟加载
  const scrollContainer = document.querySelector('.load-image-scroll-container')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', debounceVirtualLoad, { passive: true })
  }
})

onUnmounted(() => {
  // 移除滚动事件监听
  const scrollContainer = document.querySelector('.load-image-scroll-container')
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', debounceVirtualLoad)
  }

  // 清理 IntersectionObserver
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

let obj = {
  name: '张三',
  age: 18,
  test: debounce(function (this: ThisParameterType<typeof obj>) {
    console.log(this)
  }, 1000),
}
obj.test()
</script>

<style scoped lang="scss">
.load-image-container {
  display: grid;
  padding: var(--spacing-lg);
  background-color: var(--content-bg);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  // grid-template-rows: 1fr 1fr; //
  gap: 20px; /* 20px 的纵向和横向间隙 */
}
</style>
