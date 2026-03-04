// array 方法链式调用优化
// 1.组合操作:操作组合固定，性能要求高的场景 优点 ：内存占用低，CPU时间少 缺点：不易扩展，只能特定优化某个场景

// 2.惰性求值
// 核心思想 ：创建惰性计算包装器，只在需要结果时才执行操作，且只遍历一次数组。
// 适用场景 ：复杂链式调用，需要灵活性的场景 优点 ：内存占用中等，CPU时间少 缺点 ：代码复杂度高
// 生成器版 map
function* mapGen(arr, fn) {
  for (const x of arr) {
    const a = yield fn(x);
    console.log(a);
  }
}

const tmp = mapGen([1, 2, 3], (x) => {
  return x * 2;
});
let a = tmp.next(2);
let b = tmp.next(1);
console.log(b);
