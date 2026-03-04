// 手写Array.map
Array.prototype.myMap = function (callback, thisArg) {
  if (this == null) throw new TypeError('this is null or undefined')
  if (typeof callback !== 'function') throw new TypeError('callback must be a function')

  const O = Object(this)
  const len = O.length >>> 0
  const newArr = new Array(len)
  for (let i = 0; i < len; i++) {
    if (i in O) {
      // 处理稀疏数组[1,2,,4,5]，跳过空槽 in 操作符可以检查数组是否包含指定索引的元素，包括空槽，in操作符是通过哈希表实现的，时间复杂度为O(1)
      newArr[i] = callback.call(thisArg, O[i], i, O)
    }
  }
  return newArr
}

Array.prototype.myReduce = function (callback, initialValue) {
  if (this == null) throw new TypeError('this is null or undefined')
  if (typeof callback !== 'function') throw new TypeError('callback must be a function')
  const O = Object(this)
  const len = O.length >>> 0
  let k = 0
  if (arguments.length > 1) {
    // 提供了初始值时，将初始值赋值给累加器
    accumulator = initialValue
  } else {
    // 选择数组的第一个元素作为初始值（考虑稀疏数组）
    while (k < len && !(k in O)) k++
    if (k >= len) {
      // 数组全为稀疏抛出错误
      throw new TypeError('Reduce of empty array with no initial value')
    }
    accumulator = O[k++]
  }
  while (k < len) {
    if (k in O) {
      accumulator = callback(accumulator, O[k], k, O)
    }
    k++
  }
  return accumulator
}
Array.prototype.myFilter = function (callback, thisArg) {
  if (this == null) throw new TypeError('this is null or undefined')
  if (typeof callback !== 'function') throw new TypeError('callback must be a function')

  const O = Object(this)
  const len = O.length >>> 0
  const newArr = []
  for (let i = 0; i < len; i++) {
    if (i in O) {
      if (callback.call(thisArg, O[i], i, O)) {
        newArr.push(O[i])
      }
    }
  }
  return newArr
}

Array.prototype.myFlat = function (depth = 1) {
  // 递归实现
  const newArr = []
  for (let i = 0; i < this.length; i++) {
    if (Array.isArray(this[i])) {
      newArr.push(...this[i].myFlat(depth - 1))
    } else {
      newArr.push(this[i])
    }
  }
  return newArr
}

const tmp = []
tmp.flat(1)
