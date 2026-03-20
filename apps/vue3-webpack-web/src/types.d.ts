// 图片文件类型声明
declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg'

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

// 扩展 ImportMeta 类型，识别 glob/globEager API
interface ImportMeta {
  /**
   * Vite 批量导入 API
   * @param pattern 匹配路径的通配符
   * @param options 配置项
   */
  glob: <T = { [key: string]: () => Promise<unknown> }>(
    pattern: string | string[],
    options?: {
      eager?: boolean
      import?: string
      query?: string | Record<string, string>
      transform?: (code: string, id: string) => string | Promise<string>
      as?: 'raw' | 'url' | 'worker' | 'worker?inline'
    }
  ) => T

  // 可选：如果用到 globEager 也加上
  globEager: <T = { [key: string]: unknown }>(
    pattern: string | string[],
    options?: {
      import?: string
      query?: string | Record<string, string>
      transform?: (code: string, id: string) => string | Promise<string>
      as?: 'raw' | 'url' | 'worker' | 'worker?inline'
    }
  ) => T
}
