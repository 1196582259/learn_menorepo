// 请你设计并实现一个满足 LRU (最近最少使用) 缓存 约束的数据结构。
// 实现 LRUCache 类：
// LRUCache(int capacity) 以 正整数 作为容量 capacity 初始化 LRU 缓存
// int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1 。
// void put(int key, int value) 如果关键字 key 已经存在，则变更其数据值 value ；如果不存在，则向缓存
// 中插入该组 key-value 。如果插入操作导致关键字数量超过 capacity ，则应该 逐出 最久未使用的关键
// 字。
// 函数 get 和 put 必须以 O(1) 的平均时间复杂度运行。
class Node {
    constructor(key, value, pre = null, next = null) {
        this.key = key
        this.value = value
        this.pre = pre
        this.next = next
    }
}
class LRUCache {
     constructor(capacity_init) {
        this.capacity = capacity_init;
        this.valueMap = new Map();
        this.head = new Node()
        this.tail = new Node()
        this.head.next = this.tail
        this.tail.pre = this.head

    }

    get(key) {
        debugger
        if(this.valueMap.has(key)) {
            const valueNode = this.valueMap.get(key)
            this._moveToHead(valueNode)
            return valueNode.value
        } 
        return -1
    }
    put(key, value) {
        if(this.valueMap.has(key)) {
            const valueNode = this.valueMap.get(key)
            valueNode.value = value;
            this._moveToHead(valueNode)
        } else {
            const valueNode = new Node(key, value)
            this.valueMap.set(key, valueNode)
            this._addToHead(valueNode)
            if(this.valueMap.size > this.capacity) {
                const lruKey = this._popTail()
                this.valueMap.delete(lruKey)
            }
        } 
    }
    _addToHead(node) {
        node.next = this.head.next;
        node.pre = this.head
        this.head.next.pre = node
        this.head.next = node
    }
    _removeNode(node) {
        node.pre.next = node.next
        node.next.pre  = node.pre
    }
    _moveToHead(node) {
        this._removeNode(node)
        this._addToHead(node)
    }
    _popTail() {
        const node = this.tail.pre;
        this._removeNode(node);
        return node.key
    }

}

// const cache = new LRUCache(2);
// cache.put(1, 1);
// cache.put(2, 2);
// console.log(cache.get(1)); // 1
// cache.put(3, 3);           // 淘汰 key 2
// console.log(cache.get(2)); // -1
// console.log(cache.get(3)); // 3


// 你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素
// 就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报
// 警。
// 给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃
// 到的最高金额。


function rob(nums) {
    if(nums.length === 0) return 0 
    if(nums.length <= 2) {
        let max = nums[0]
        nums.forEach(num => {
            max = max > num ?  max : num
        })
        return max
    }
    const first = nums[0]
    const second = nums[1]
    const firstResult = rob(nums.slice(2))
    const secondResult = rob(nums.slice(3))

    return Math.max(first + firstResult, second + secondResult)
}

function dbRob(nums) {
    const db = []
    nums.forEach((num, index) => {
        if(index === 0) {
            db[0] = num
        } else if(index === 1) {
            db[1] = Math.max(db[0], num)
        } else {
            db[index] = Math.max(db[index - 2] + num, db[index - 1])
        }
    })
    return db[db.length - 1]
}


// const arr1 = [1,2,3,1]
// const arr2 = [2,7,9,3,1]

// // console.log(rob(arr1))
// // console.log(rob(arr2))
// console.log(dbRob(arr1))
// console.log(dbRob(arr2))


function getMaxWidth(arr) {
    if(arr.length < 1) return 0 
    let max = 1
    let index = 1
    let lastLen = 1; // 上一层长度
    while(index < arr.length) {
        let start = lastLen - 1
        let end = lastLen - 1
        lastLen *= 2
        while(index < lastLen) {
            if(arr[index] !== undefined && arr[index] !== null) {
                if(start === -1)
                    start = index
                end = index
            }

            index ++
        }
        max = Math.max(max, end - start + 1)
    }
    return max
}


// const testArr = [1,3,2,5,3,null,9]
// const testArr2 = [1,3,2,5,null,null,9,6,null,7]
// console.log(getMaxWidth(testArr2))



class UnionFind{
    map;
    trank;
    constructor() {
        this.map = new Map() 
        this.trank = new Map()
    }
    find(x) {
        if(!this.map.has(x)) {
            this.map.set(x, x);
            this.trank.set(x, 0)
            return x
        }

        if(this.map.get(x) === x) {
            return x
        }
        this.map.set(x, this.find(this.map.get(x)));
        return this.find(this.map.get(x))
    }
    union(x, y) {
        const rootX = this.find(x)
        const rootY = this.find(y)
        const deepX = this.trank.get(rootX)
        const deepY = this.trank.get(rootY)

        if(deepX > deepY) {
            this.map.set(rootY, rootX);
        } else if(deepX === deepY) {
            this.map.set(rootY, rootX);
            this.trank.set(rootX, deepX + 1)
        }  else {
            this.map.set(rootX, rootY);
        }
    }
}

var numIslands = function(grid) {
    const uf = new UnionFind();
    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[0].length; j++) {
            if(grid[i][j] === '0') continue
            const x = `${i}-${j}`
            uf.union(x, x);
            if(i > 0 && grid[i - 1][j] === '1' ) {
                const y = `${i - 1}-${j}`
                uf.union(x, y)
            }
            if(j > 0 && grid[i][j - 1] === '1') {
                const y = `${i}-${j - 1}`
                uf.union(x, y)
            }
        }
    }
    let result = 0;
    const set = new Set()
    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j < grid[0].length; j++) {
            if(grid[i][j] === '0') continue
            const x = `${i}-${j}`
            const rootX = uf.find(x) 
            if(!set.has(rootX)) {
                set.add(rootX);
                result++
            }
        }
    }
    return result
};

function sort1(x, y) {
    const [a1, b1] = x
    const [a2, b2] = y
    const isXprofit = b1 >= a1; 
    const isYprofit = b2 >= a2; 
    if(isXprofit && isYprofit) {
        return a1 - a2
    } else if(isXprofit) {
        return false
    } else if(isYprofit) {
        return true
    } else {
        return b2 - b1
    }
}

function compareRegions(x, y) {
    const [a1, b1] = x;
    const [a2, b2] = y;
    
    // 分类：收益型（b>=a）和亏损型（b<a）
    const isXProfit = b1 >= a1;
    const isYProfit = b2 >= a2;
    
    if (isXProfit && !isYProfit) {
        return -1; // 收益型排前面
    } else if (!isXProfit && isYProfit) {
        return 1;
    } else if (isXProfit && isYProfit) {
        return a1 - a2; // 收益型按a_i升序（消耗小的先）
    } else {
        return (b2 - b1); // 亏损型按b_i降序（等价于a-b降序）
    }
}



var canCompleteCircuit = function(gas, cost) {
    let energy = 0
    let minIndex = 0
    let min = Infinity
    for(let i = 0; i < gas.length; i++) {
        energy = energy + gas[i] - cost[i]
        console.log(i, energy)
        if(energy <= min) {
            minIndex = i
            min = energy
        }
    }
    if(energy >= 0) return (minIndex + 1) % gas.length
    return -1
};


// 验证函数：判断是否能将任务分成<=M个连续段，每段和<=maxLoad
function canSplit(tasks, M, maxLoad) {
    let count = 1; // 至少需要1个节点
    let currentSum = 0;
    
    for (const c of tasks) {
        // 如果当前任务单独就超过maxLoad，直接不可行
        if (c > maxLoad) return false;
        
        // 累加当前任务，若超过maxLoad则分割
        if (currentSum + c > maxLoad) {
            count++;
            currentSum = c; // 新段从当前任务开始
            // 段数超过M，不可行
            if (count > M) return false;
        } else {
            currentSum += c;
        }
    }
    return count <= M;
}

function findMinMaxLoad(N, M, tasks) {
    let left = Math.max(...tasks);
    let right = tasks.reduce((cur, last) => cur+last, 0)
    let answer = right;
    while(left <= right) {
        const mid = Math.floor((left + right)  / 2);
        if(canSplit(tasks, M, mid)) {
            
        }
    }
}


function lianxucaiji(arr) {
    let maxStep = 0
    let step = 0;
    let left = 0;
    let result = []
    while(left < arr.length) {
        if(arr[left] > 24 || arr[left] < 18) {
            left++
            continue;
        }
        let minNum = arr[left];
        let maxNum = arr[left];
        let right = left + 1;
        step = 1;
        while(right < arr.length) {
            if(arr[right] > 24 || arr[right] < 18) {
                break;
            }
            minNum = Math.min(minNum, arr[right])
            maxNum = Math.max(maxNum, arr[right])
            if(maxNum - minNum > 4) break   
            step++;
            right++;
        }
        if(step > maxStep) {
            result = [[left, --right]]
            maxStep = step
        } else if(step === maxStep) {
            result.push([left, --right])
        }
    left = right - step + 1;
    }

    result.forEach(value => {
        console.log(value[0], value[1])
    })
}
// const arr3 = [23, 20, 22, 20, 21, 22, 23, 20, ].push(...Array(2000).fill(20))
const arr4 = Array(10000000).fill(20)

// lianxucaiji(arr4)
// let a = 1
// arr4.forEach(() => {
//     a++
// })

function compareStr(a, b, allowDiff) {
    let aL = a.length
    let bL = b.length
    const dp = Array.from({length: a.length + 1}, () => Array(b.length + 1).fill(0))

      // 第一步：初始化边界（单独处理，更清晰）
    // 初始化第一行：空a → b前j个字符，需要插入j次
    for (let j = 0; j <= bL; j++) {
        dp[0][j] = j;
    }
    // 初始化第一列：a前i个字符 → 空b，需要删除i次
    for (let i = 0; i <= aL; i++) {
        dp[i][0] = i;
    }
    for(let i = 1; i <= aL; i++) {
        for(let j = 1; j <= bL; j++) {
            if(a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else {
                const del = dp[i - 1][j] + 1
                const rep = dp[i - 1][j - 1] + 1
                const add = dp[i][j -1] + 1
                dp[i][j] = Math.min(del, rep, add)
            }
        }
    }
    return dp[aL][bL]
}

function strSort(a, b, diffMap) {
    const test = ["baegeneration", "asegeneration"]
    if(test.includes(a) && test.includes(b))
    if(diffMap[a] === diffMap[b]) {
        for(let i = 0; i < a.length && i < b.length; i++) {
            if(a[i] === b[i]) continue
            return a[i] > b[i] ? 1 : -1
        }
        return a.length - b.length
    } else {
        return diffMap[a] - diffMap[b]
    }
}



function testCompare(list,target, allowDiff) {
    let result = []
    const diffMap = {}
    list.forEach(str => {
        const dp = Array.from({length: str.length}, () => Array(target.length).fill(-1))
        const diff = compareStr(str, target, 0)
        diffMap[str] = diff
        if(diff <= allowDiff) result.push(str)
    })
    result.sort((a, b) => {
        return strSort(a, b, diffMap)
    })
    console.log(diffMap['baebeeneration'])
    if(result.length)
    console.log(result.join(" "))
    else
    console.log("None")
}
const list = [
    "aseneration",
    "basegeneratiin",
    "basegenerwtion",
    "basenneration",
    "basegeneratign",
    "baseeneratio",
    "bzsegeneraton",
    "basegedration",
    "basegenyeraoion",
    "basegenertion",
    "basegenkrartion",
    "basegenerataofn",
    "basegenerfton",
    "basgeneratioz",
    "begenration",
    "basegensration",
    "iasegenertvon",
    "basegeneraion",
    "baisegenenvtion",
    "baexneration",
    "gbasegenratizn",
    "basegeneratio",
    "basgegenerataioz",
    "nasegeneratiown",
    "rasegeneratisn",
    "basegeneratin",
    "baksegeneraton",
    "bfsegenueration",
    "basvgrneratin",
    "basegeneranion",
    "basegeneriabion",
    "asegeneration",
    "bdsegenerytyon",
    "basegeuneratin",
    "bavsevgenerateon",
    "baseenertion",
    "basegeneratioc",
    "bsegeneration",
    "baqegenesrtion",
    "baseenhratio",
    "basmgeneatixon",
    "basegneratin",
    "basegenrxtion",
    "bastegeneration",
    "basgeneration",
    "basegenerten",
    "basegrneration",
    "bajsegeneatioon",
    "basgegeqneration",
    "basegenezration",
    "basengeneration",
    "basegneration",
    "bsegeneratiox",
    "basegeneratnon",
    "basegsenelartion",
    "basegmneiration",
    "bsegenerton",
    "baebeeneration",
    "basexeneratin",
    "baegeneration",
    "baoegeneratiofan",
    "basegenergaion",
    "basereneationn",
    "baegeneration",
    "basepeneratio",
    "basegneration",
    "basegeneyraton",
    "basegeratioln",
    "basegeneqtion",
    "vasegerneration",
    "basegenerwation",
    "basegeneation",
    "basegneration",
    "basegeneraion",
    "gasegfkneration",
    "bbaseegeneration",
    "basgeneration",
    "basceneration",
    "basgeneration",
    "basegenrahtion",
    "basegeyeratidon",
    "basegeneraton",
    "basegehneration",
    "oasegqeneratioz",
    "basvegeneratiot",
    "bapgeneraxion",
    "baegenraticn",
    "qsegneration",
    "baegeneration",
    "basergenedation",
    "bssgeneration",
    "basegeneraton",
    "basegenyeration",
    "asegeineratiog",
    "ubasegeneration",
    "bsegeneraoon",
    "easegennraytion",
    "basegenratin",
    "baxmegmeneration",
    "jasgeneration"
]

const target= "basegeneration"
const allowDiff = 3

const list2 = [
    "aprint",
    "bprint",
    "aaprint",
    "bbprint",
    "output"
]
const target2 = "print"
const allowDiff2 = 2
testCompare(list, target, allowDiff)
// testCompare(list2, target2, allowDiff2)