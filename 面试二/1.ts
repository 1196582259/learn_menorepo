//4. 请实现一个带并发限制的异步任务调度器，要求：① 最多同时执行 N 个任务；② 任务完成后自动执行队列中的下一个任务；③ 支持添加任务和获取所有任务完成后的结果。

type Task = () => void & unknown;

class TaskScheduler {
  #limit;
  #queue: Task[];
  #running;
  #results: unknown[];
  constructor(limit: number) {
    this.#limit = limit;
    this.#queue = [];
    this.#running = 0;
    this.#results = [];
  }
  add(task: Task) {
    this.#queue.push(task);
    // 加入一个任务时，要判断是否有空余位置，有则立即执行
    this.run();
  }
  run() {
    // 当运行中的任务数小于限制数时，且队列中还有任务时，执行任务
    while (this.#running < this.#limit && this.#queue.length > 0) {
      const task = this.#queue.shift()!;
      this.#running++;
      let taskResult: Promise<unknown>;
      if (typeof task === "function") {
        try {
          const result = task();
          taskResult = Promise.resolve(result);
        } catch (error) {
          taskResult = Promise.reject(error);
        }
      } else {
        taskResult = Promise.resolve(task);
      }
      taskResult.then((value) => {
        this.#running--;
        // 任务执行完成后，继续执行队列中的任务
        this.run();
      });
      this.#results.push(taskResult);
    }
  }

  getResults() {
    return this.#results;
  }
}
