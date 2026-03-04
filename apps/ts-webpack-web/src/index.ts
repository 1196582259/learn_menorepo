import './test/vue'

const app = document.getElementById('app')

app!.innerHTML = 'hello webpack'
console.log('hello webpack')
const parent = {
  value: 'parent',
  get foo() {
    console.log(this)
    this.value = 'parent foo'
    return this.value
  },
}
const a = {
  value: 'a',
  obj: {
    value: 2,
  },
  get tmp() {
    return this.value
  },
  tmp2() {
    console.log('tmp2: get value', this, this.value)
    this.value = 'tmp2 value'
    return this.value
  },
}
Object.setPrototypeOf(a, parent)
const aProxy = new Proxy(a, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value) {
    Reflect.set(target, key, value)
    return true
  },
})
const aProxy2 = new Proxy(a, {
  get(target, key, receiver) {
    return target[key as keyof typeof target]
  },
  set(target, key, value) {
    console.log('Proxy2: set value')
    Reflect.set(target, key, value)
    return true
  },
})

const c = Object.defineProperty(a, 'obj', {
  get() {
    return this.value
  },
})
