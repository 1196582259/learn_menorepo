// 防抖
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let timeout: NodeJS.Timeout | number | undefined
  let result: ReturnType<T> | undefined

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> | undefined {
    const context = this

    clearTimeout(timeout as NodeJS.Timeout)
    timeout = setTimeout(() => {
      result = func.apply(context, args)
    }, wait)

    return result
  }
}
