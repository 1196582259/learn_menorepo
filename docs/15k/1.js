// 题目1：异步编程综合
async function asyncPool(poolLimit, array, iteratorFn) {
  // 实现一个控制并发数的异步任务池
  // 要求：最多同时执行poolLimit个任务，按顺序返回结果
  const results = []
  const executings = []

  for(let item of array) {
    // 创建微任务
    const p = Promise.resolve().then(() => iteratorFn(item));
    results.push(p);
    const e = p.finally(() => executings.splice(executings.indexOf(e), 1))
    executings.push(e);
    if(executings.length >= poolLimit) {
      await Promise.race(executings)
    }
  }

  return Promise.all(results);
}

// 题目2：实现一个深拷贝函数，处理循环引用和特殊类型（Date、Set、Map等）
function deepClone(obj, map = new WeakMap()) {
    // 基础类型直接返回
    if (obj === null || typeof obj !== 'object') {
        return obj
    }
    
    // 处理循环引用
    if (map.has(obj)) {
        return map.get(obj)
    }
    
    // Date类型
    if (obj instanceof Date) {
        return new Date(obj.getTime())
    }
    
    // RegExp类型
    if (obj instanceof RegExp) {
        const flags = [
            obj.global ? 'g' : '',
            obj.ignoreCase ? 'i' : '',
            obj.multiline ? 'm' : '',
            obj.dotAll ? 's' : '',
            obj.unicode ? 'u' : '',
            obj.sticky ? 'y' : ''
        ].join('')
        return new RegExp(obj.source, flags)
    }
    
    // Map类型
    if (obj instanceof Map) {
        const result = new Map()
        map.set(obj, result)
        obj.forEach((value, key) => {
            result.set(deepClone(key, map), deepClone(value, map))
        })
        return result
    }
    
    // Set类型
    if (obj instanceof Set) {
        const result = new Set()
        map.set(obj, result)
        obj.forEach(value => {
            result.add(deepClone(value, map))
        })
        return result
    }
    
    // ArrayBuffer类型
    if (obj instanceof ArrayBuffer) {
        return obj.slice(0)
    }
    
    // 处理数组
    if (Array.isArray(obj)) {
        const result = []
        map.set(obj, result)
        for (let i = 0; i < obj.length; i++) {
            result[i] = deepClone(obj[i], map)
        }
        return result
    }
    
    // 处理普通对象
    const result = {}
    map.set(obj, result)
    
    // 处理Symbol作为key
    const allKeys = [
        ...Object.keys(obj),
        ...Object.getOwnPropertySymbols(obj)
    ]
    
    for (const key of allKeys) {
        result[key] = deepClone(obj[key], map)
    }
    
    // 处理不可枚举属性
    const descriptors = Object.getOwnPropertyDescriptors(obj)
    for (const key in descriptors) {
        if (descriptors[key].writable === false || 
            descriptors[key].get || 
            descriptors[key].set) {
            Object.defineProperty(result, key, descriptors[key])
        }
    }
    
    return result
}



// 题目3：事件循环输出顺序分析
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 问：输出顺序及解释
// 答：
// 输出： 1->4->3->2
// 解释：js是单线程，执行顺序为 同步->微任务队列清空->一个宏任务->微任务队列清空->一个宏任务（循环往复，直至宏任务清空）
// Promise属于异步任务中的微任务，setTimeout属于异步任务中的宏任务
// 微任务有：Promise、await async(Promise语法糖)、 prrocess.nextTick(node)、MutationObserve
// 宏任务有：script、setTimeout、setInterval、setImmediate、i/o操作（输入输出，比如读取文件操作、网络请求）、ui render（dom渲染，即更改代码重新渲染dom的过程）、异步ajax
// 宏任务执行顺序：setImmediate --> setTimeout --> setInterval --> i/o操作 --> 异步ajax



// React题目：实现一个自定义Hook usePagination
// 要求：支持分页参数管理、loading状态、错误处理
// 具有防抖的搜索功能
// 答：不会

// Vue题目：对比Vue2和Vue3响应式原理差异
// 实现一个简易的Vue3 reactive系统

// 答：Vue2和Vue3都是通过劫持对象属性+发布订阅模式实现响应式的，但两者存在不同，Vue2通过劫持对象每个属性的访问器，而且需要在定义数据的时候就对所有属性进行劫持，面对嵌套过深的对象或大数组性能开销很大，Vue3利用ES6的新特性Proxy直接劫持一个对象，避免了直接修改对象，而且能监听到对象属性新增、删除的变化（Vue2不能）

let activeEffect = null;
const reactiveMap = new WeakMap();
const objKeyToDepMap = new WeakMap();
const effectFnMap = new WeakMap();
function track(obj, key) {
  // 给对象的属性添加依赖它的函数
  if(!activeEffect) return
  let objMap = objKeyToDepMap.get(obj)
  if(!objMap) objKeyToDepMap.set(obj, (objMap = new WeakMap()))
  let keyToDepSet = objMap.get(key);
  if(!keyToDepSet) objMap.set(key, (keyToDepSet = new Set()))
  keyToDepSet.add(activeEffect);
  activeEffect.deps.push(keyToDepSet)
}

function trigger(obj, key) {
  // 触发属性上的依赖函数
  let objMap = objKeyToDepMap.get(obj);
  if(!objMap) return 
  let keyToDepSet = objMap.get(key);
  if(!keyToDepSet) return 
  const fnSet = new Set(keyToDepSet);
  fnSet.forEach(fn => fn());
}

function reactive(obj) {
  if(typeof obj !== 'object' || obj === null) {
    throw new Error('reactive param need a object!')
  }

  if(reactiveMap.has(obj)) return reactiveMap.get(obj);

  const result = new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key);
      return Reflect.get(target,key, receiver);
    },
    set(target, key, val, receiver) {
      const oldVal = Reflect.get(target, key);
      if(oldVal !== val) trigger(target, key);
      return Reflect.set(target,key, val, receiver)
    },
    deleteProperty(target, key) {
      if (!Reflect.has(target, key)) return true
      trigger(target, key);
      return Reflect.defineProperty(target, key)
    }
  })

  reactiveMap.set(obj, result);
  return result;
}

function effect(fn) {
  if(effectFnMap.has(fn)) return;
  const effectFn = ()  => {
    cleanup(effectFn)
    activeEffect = fn;
    fn()
    activeEffect = null;
  }
  effectFn.deps = []
  effectFnMap.set(fn, effectFn)
  effectFn();
}
function cleanup(effectFn) {
  effectFn.forEach(set => {
    set.delete(effectFn)
  })
}



/* 题目1：实现一个等比例缩放的响应式网格 */
/* 要求：移动端堆叠，桌面端平铺，间隙自适应 */
// 答：不会

/* 题目2：用flexbox实现圣杯布局 */
/* 要求：header固定，sidebar可折叠，main区域自适应 */
// 答：不会

// 后续的全不会



