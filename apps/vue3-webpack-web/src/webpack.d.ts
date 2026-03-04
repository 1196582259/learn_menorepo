declare const require: {
  (id: string): any
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp,
    mode?: 'sync' | 'eager' | 'weak' | 'async-weak' | 'lazy' | 'lazy-once'
  ): {
    keys(): string[]
    <T>(id: string): T
  }
}
