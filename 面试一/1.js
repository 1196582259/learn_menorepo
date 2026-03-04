var a = 10;
var a = 20;
let v = 30;

function Person() {
  this.name = "张三";
}
const b = new Person();
const c = {};
console.log(Person.prototype.__proto__);

console.log(c.__proto__ == Person.prototype.__proto__);

function SuperType(name) {
  this.name = name;
}
function SubType(name) {
  SuperType.call(this, name);
  this.age = 18;
}
SubType.prototype = new SuperType("张三");
SubType.prototype.constructor = SubType;
const p = new SubType("李四");
console.log(p.name); // 张三
console.log(p.__proto__); // Person {}
console.log(p.__proto__.__proto__); // Object {}

console.log(p.constructor); // SuperType

function Parent() {
  this.name = "张三";
}
function Child() {
  Parent.call(this);
  this.age = 18;
}

(function () {
  function Temp() {}
  Temp.prototype = Parent.prototype;
  Child.prototype = new Temp();
  Child.prototype.constructor = Child;
})();

const t = new Child();
console.log("-----------------");
console.log(t.__proto__); // Child {}
console.log(t.__proto__.__proto__); // Parent {}
console.log(t.__proto__.__proto__.__proto__); // Object {}

const d = new Parent();
console.log("-----------------");
console.log(d.__proto__); // Parent {}
console.log(d.__proto__.__proto__.constructor); // Object {}

console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
new Promise((resolve) => {
  console.log("D");
  resolve();
}).then(() => console.log("E"));
console.log("F");

// useLocalStorage 自定义 Hook
function useLocalStorage(key, initialValue) {
  let value = initialValue;
  try {
    const item = window.localStorage.getItem(key);
    value = item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.log(error);
    value = initialValue;
  }
  const [storedValue, setStoredValue] = useState(value);

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
