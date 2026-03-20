// 图片懒加载类， 基于IntersectionObserver实现
export class LazyLoader {
  config = {
    // 图片加载容器
    container: null,

    // 图片加载阈值
    threshold: 0.5,
    // 图片加载延迟
    delay: 200,
    // 图片加载回调
    callback: null,
    placeholder:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  }
  observer: IntersectionObserver | null = null
  constructor(config = {}) {
    // this.loadImage = this.loadImage.bind(this)
    Object.assign(this.config, config)
    this.observer = null
  }

  init() {
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
      threshold: this.config.threshold,
    })
  }

  handleIntersection() {
    // entries.forEach((entry) => {
    //   if (entry.isIntersecting) {
    //     const img = entry.target
    //     img.src = img.dataset.src
    //     img.removeAttribute('data-src')
    //     this.observer.unobserve(img)
    //     if (this.config.callback) {
    //       this.config.callback(img)
    //     }
    //   }
    // })
  }

  loadImage(img: HTMLImageElement) {
    const src = img.dataset.src
    if (!src) {
      return
    }
    const tempImg = new Image()
    tempImg.onload = () => {
      img.src = src
      img.classList.remove('lazy-loading')
      img.classList.add('lazy-loaded')

      img.dispatchEvent(new CustomEvent('lazyloaded'))
    }
    tempImg.onerror = () => {
      console.error('图片加载失败', src)
      img.classList.remove('lazy-loading')
      img.classList.add('lazy-load-failed')
    }
    tempImg.src = src
  }
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-src') {
          const img = mutation.target as HTMLImageElement
          this.loadImage(img)
        }
      })
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  destroy() {
    this.observer?.disconnect()
    this.observer = null
  }
}
