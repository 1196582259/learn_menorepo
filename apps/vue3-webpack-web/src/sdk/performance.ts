import { onCLS, onFCP, onINP, onLCP, Metric } from 'web-vitals'

interface MonitorConfig {
  endpoint: string
  sampleRate?: number
  enabledMetrics?: string[]
  maxCacheSize?: number
  onMetric?: (data: PerformanceData) => void
}

export interface PerformanceData {
  type: string
  name?: string
  value: number | string
  timestamp: number
  url: string
  userAgent: string
  deviceType: string
  sessionId: string
}

export class PerformanceMonitor {
  private config: MonitorConfig
  private cache: PerformanceData[] = []
  private sessionId: string

  constructor(config: MonitorConfig) {
    this.config = {
      sampleRate: 1,
      enabledMetrics: ['LCP', 'INP', 'CLS', 'FCP', 'resource', 'error'],
      maxCacheSize: 50,
      ...config,
    }
    this.sessionId = this.generateSessionId()
    this.init()
  }

  private init() {
    const sampleRate = this.config.sampleRate ?? 1
    if (Math.random() > sampleRate) {
      return
    }
    this.initMetrics()
    window.addEventListener('beforeunload', () => {
      this.reportCache()
    })
  }

  private initMetrics() {
    const enabledMetrics = this.config.enabledMetrics || []

    if (enabledMetrics.includes('LCP')) {
      onLCP((metric) => {
        debugger
        this.handleMetric('LCP', metric)
      })
    }

    if (enabledMetrics.includes('INP')) {
      onINP((metric) => {
        debugger
        this.handleMetric('INP', metric)
      })
    }

    if (enabledMetrics.includes('CLS')) {
      onCLS((metric) => this.handleMetric('CLS', metric))
    }

    if (enabledMetrics.includes('FCP')) {
      onFCP((metric) => this.handleMetric('FCP', metric))
    }

    if (enabledMetrics.includes('resource')) {
      this.initResourceMonitoring()
    }

    if (enabledMetrics.includes('error')) {
      this.initErrorMonitoring()
    }
  }

  private handleMetric(type: string, metric: Metric) {
    const data: PerformanceData = {
      type,
      value: metric.value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      sessionId: this.sessionId,
    }

    if (this.config.onMetric) {
      this.config.onMetric(data)
    }

    this.report(data)
  }

  private initResourceMonitoring() {
    if (typeof window.performance === 'undefined' || !('getEntries' in window.performance)) {
      return
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const resources = window.performance.getEntriesByType('resource')
        resources.forEach((resource) => {
          if (resource.duration > 0) {
            const data: PerformanceData = {
              type: 'resource',
              name: resource.name,
              value: resource.duration,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
              deviceType: this.getDeviceType(),
              sessionId: this.sessionId,
            }
            this.report(data)
          }
        })
      }, 0)
    })
  }

  private initErrorMonitoring() {
    window.addEventListener('error', (event) => {
      const data: PerformanceData = {
        type: 'error',
        name: event.error?.message || event.message || 'Unknown error',
        value: event.error?.stack || event.filename || 'Unknown',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        deviceType: this.getDeviceType(),
        sessionId: this.sessionId,
      }
      this.report(data)
    })

    window.addEventListener('unhandledrejection', (event) => {
      const data: PerformanceData = {
        type: 'error',
        name: 'Unhandled Promise Rejection',
        value: event.reason?.message || String(event.reason) || 'Unknown',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        deviceType: this.getDeviceType(),
        sessionId: this.sessionId,
      }
      this.report(data)
    })
  }

  private async report(data: PerformanceData) {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to report performance data')
      }
    } catch {
      this.cacheData(data)
    }
  }

  private reportCache() {
    if (this.cache.length === 0) {
      return
    }

    try {
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batch: this.cache }),
      })
    } catch {
      this.saveToLocalStorage()
    }
  }

  private cacheData(data: PerformanceData) {
    const maxCacheSize = this.config.maxCacheSize ?? 50
    if (this.cache.length >= maxCacheSize) {
      this.cache.shift()
    }
    this.cache.push(data)
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('performance-cache', JSON.stringify(this.cache))
    } catch {
      // Ignore localStorage errors
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent
    if (/mobile/i.test(userAgent)) {
      return 'mobile'
    }
    if (/tablet/i.test(userAgent)) {
      return 'tablet'
    }
    return 'desktop'
  }

  public trackCustomEvent(name: string, value: number | string) {
    const data: PerformanceData = {
      type: 'custom',
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      sessionId: this.sessionId,
    }
    this.report(data)
  }

  public getCache(): PerformanceData[] {
    return [...this.cache]
  }

  public clearCache() {
    this.cache = []
    try {
      localStorage.removeItem('performance-cache')
    } catch {
      // Ignore localStorage errors
    }
  }
}
