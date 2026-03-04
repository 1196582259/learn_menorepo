const readline = require('readline')

const rrl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// 华为OD机试：天然蓄水库
/**
 * 问题描述：
 *  给你一个数组arr，arr[i]表示第i个柱子的高度。
 *  请你计算出这个数组中，能够盛最多水的容器的面积。
 *  面积等于两柱子之间的距离乘以较低的柱子高度 - 区间内所有柱子高度。
 */
function water() {
    let arr = []
    rrl.on('line', (line) => {
        arr = line.split(' ').map(Number)
    })
    rrl.on('close', () =>{
        const preNum = Array.from({length: arr.length}).fill(0)
        preNum[0] = 0
        for(let i = 1; i < arr.length; i++) {
            preNum[i] = preNum[i-1] + arr[i-1]
        }
        let result = [0,0,0]
        for(let left = 0; left < arr.length; left++) {
            for(let right = left+2; right < arr.length; right++) {
                let area = Math.min(arr[left], arr[right]) * (right - left - 1) - (preNum[right] - preNum[left+1])
                if (result[2] < area || result[2] === area && result[1] - result[0] < right -left) {
                    result = [left, right, area]
                }
            }
        }
        console.log(result.join(" "))
    })

    
}


// 2.华为OD机试：采购订单
function purchaseOrder() {
    const input = []
    const highPriceList = []
    const lowPriceList = []

    const orderMap = new Map() // 单价在一百元以下需要存入map
    let N = 0
    rrl.on('line', (line) => {
        if(N === 0) {
            N = Number(line)
            return
        }
        input.push(line.split(' ').map(Number))
    })
    rrl.on('close', () => {
        input.forEach((item) => {
            const [id, number, price, status] = item
            if(status !== 0) return
            if(price > 100) {
                highPriceList.push([id, number, price])
            } else {
                if(orderMap.has(id)) {
                    const oldValues = orderMap.get(id)
                    const newNumber = oldValues[1] + number
                    orderMap.set(id, [id, newNumber, oldValues[2]])
                } else {
                    orderMap.set(id, [id, number, price])
                }
            }
        })
        orderMap.forEach((item) => {
            lowPriceList.push([item[0], item[1], item[1] >= 100 ? Math.ceil(item[2] * 0.9) : item[2]])
        })
        const result = [...highPriceList, ...lowPriceList]
        result.sort((a, b) => {
            if(a[0] !== b[0]) return a[0] - b[0]; // 先按id升序
            return b[1] - a[1]; // 再按数量降序
        })
        console.log("------------分割线--------------")
        console.log(result.map(item => item.join(' ')).join('\n'))

    })
    
}


const arr = [5,2,2,2,2,2,2,8,10]
purchaseOrder()