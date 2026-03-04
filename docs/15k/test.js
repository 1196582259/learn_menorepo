console.log('同步任务1') // 同步任务

// 第一个微任务：执行完后会触发新的同步任务
queueMicrotask(() => {
  console.log('微任务1执行')

  // 微任务1执行过程中，产生新的同步任务（比如调用函数）
  function syncTask() {
    console.log('新的同步任务')
  }
  // 注意：这里只是定义函数，调用才是执行同步任务；我们主动调用，模拟“来了同步任务”
  syncTask()

  // 微任务队列中还有微任务2、微任务3
})

// 微任务2
queueMicrotask(() => {
  console.log('微任务2执行')
})

// 微任务3
queueMicrotask(() => {
  console.log('微任务3执行')
})

console.log('同步任务2') // 同步任务
