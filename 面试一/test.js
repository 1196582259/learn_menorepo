

{
    const a = 1
    let b = 2
    var c = 3
}
console.log(a) // 报错，a 是 const 声明的变量，只能在块级作用域内访问
console.log(b) // 报错，b 是 let 声明的变量，只能在块级作用域内访问
console.log(c) // 3，c 是 var 声明的变量，函数作用域内访问



const items = document.querySelectorAll('.item')
items.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation()
        console.log(item.textContent)
    }, true)
})
