import { ref, effect } from '../vue/ref'

const a = ref(1)

const tmp = () => {
  console.log('tmp: get value', a.value)
}
const tmp2 = () => {
  console.log('tmp2: get value', a.value)
}

effect(tmp)
effect(tmp)
setTimeout(() => {
  a.value = 2
  console.log(a)
}, 1000)
const b = {
  value: 1,
}
const c = new Proxy(b, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value) {
    Reflect.set(target, key, value)
    return true
  },
})
c.value = 2
console.log(b)
