//  面试中有价值的方法

function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1)
}

// 深拷贝、递归版
function deepClone(obj, weakMap = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (weakMap.has(obj)) {
    return weakMap.get(obj)
  }
  const type = getType(obj)
  let newObj
  switch (type) {
    case 'Date':
      newObj = new Date(obj)
      break
    case 'RegExp':
      newObj = new RegExp(obj.source, obj.flags)
      break
    case 'Set':
      newObj = new Set()
      break
    case 'Map':
      newObj = new Map()
      break
    case 'Array':
      newObj = []
      break
    case 'Object':
      newObj = {}
      break
    default:
      return obj
  }
  weakMap.set(obj, newObj)
  if (type === 'Set') {
    for (const item of obj) {
      newObj.add(deepClone(item, weakMap))
      return newObj
    }
  } else if (type === 'Map') {
    for (const [key, value] of obj) {
      newObj.set(deepClone(key, weakMap), deepClone(value, weakMap))
      return newObj
    }
  }
  // key in obj 会检查对象及其原型链上是否有该属性，包括继承的属性。
  // hasOwnProperty 方法只会检查对象自身是否有该属性，不包括继承的属性。
  // Object.keys只能获取对象自身的可枚举属性键。
  const allKeys = Object.keys(obj).concat(Object.getOwnPropertySymbols(obj))
  for (const key of allKeys) {
    newObj[key] = deepClone(obj[key], weakMap)
  }
  return newObj
}

getType([]) // Array
getType({}) // Object
getType(123) // Number
getType('123') // String
getType(true) // Boolean
getType(null) // Null
getType(undefined) // Undefined
getType(Symbol('123')) // Symbol
const a = {}
Object.defineProperty(a, 'b', {
  value: 123,
  enumerable: true,
})
