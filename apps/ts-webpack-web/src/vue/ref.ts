interface EffectFn {
  (): void
  deps: Set<() => void>[]
}

// 第一步：定义“判断是否为基本类型”的工具类型
type IsPrimitive<T> = T extends string | number | boolean | null | undefined | symbol | bigint
  ? true
  : false

// 第二步：定义“非基本类型”的工具类型（非法类型返回 never）
type ReactiveAllowed<T> = IsPrimitive<T> extends true ? never : T

let effectsMap = new WeakMap()
let fnToEffectMap = new Map<() => void, EffectFn>()
let reactiveMap = new WeakMap()
let activeEffect: EffectFn | null = null
export function reactive<T>(value: ReactiveAllowed<T>) {
  if (reactiveMap.has(value as object)) return reactiveMap.get(value as object) as T
  const proxy = new Proxy(value as object, {
    get(target, key, receiver) {
      track(target, key as string)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value) {
      if (Reflect.get(target, key) === value) return true
      trigger(target, key as string)
      Reflect.set(target, key, value)
      return true
    },
    deleteProperty(target, key) {
      if (!Reflect.has(target, key)) return true
      trigger(target, key as string)
      return Reflect.deleteProperty(target, key)
    },
  })
  reactiveMap.set(value as object, proxy)
  return proxy
}

export function ref<T>(value: T) {
  return new Ref(value)
}

export class Ref<T> {
  _value: T
  constructor(value: T) {
    this._value = value
  }

  get value() {
    console.log('Ref: get value')
    track(this, 'value')
    return this._value
  }

  set value(value: T) {
    console.log('Ref: set value')
    this._value = value
    trigger(this, 'value')
  }
}

// 收集依赖（副作用函数）
function track(target: Ref<any> | object, key: string) {
  if (!activeEffect) return
  let depsMap = effectsMap.get(target)
  if (!depsMap) effectsMap.set(target, (depsMap = new Map()))
  let effects = depsMap.get(key) as Set<EffectFn>
  if (!effects) depsMap.set(key, (effects = new Set<EffectFn>()))
  effects.add(activeEffect as EffectFn)
}
// 触发依赖（副作用函数）
function trigger(target: Ref<any> | object, key: string) {
  const depsMap = effectsMap.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  if (!effects) return
  const effectsToRun = new Set<() => void>(effects)
  effectsToRun.forEach((fn: () => void) => fn())
}

export function effect(fn: () => void) {
  if (fnToEffectMap.has(fn)) return
  const effectFn: EffectFn = () => {
    // 执行副作用前，先清理该副作用的所有依赖
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
    activeEffect = null
  }
  effectFn.deps = [] // 记录该副作用关联的所有依赖集合
  fnToEffectMap.set(fn, effectFn)
  effectFn()
}

const cleanup = (effectFn: EffectFn) => {
  effectFn.deps.forEach((dep: Set<() => void>) => {
    dep.delete(effectFn)
  })
  effectFn.deps.length = 0
}
