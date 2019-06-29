
### 配发更新阶段

上述过程完成了数据的依赖收集，并完成了第一次页面渲染过程，当数据再次发生变化的时候，会触发下面的通知方法：参考文件：`src/core/observer/index.js`

```
// 我们知道dep是数据和反应当前数据变化的watchers的桥梁
// 当数据变化的时候，这时候就去通知watcher进行update，从而触发页面重新渲染
dep.notify()
```

这个时候就会触发依赖于当前数据的watchers进行重新渲染的操作。`src/core/observer/watcher.js`

```
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }
```

实际上，watchers并不会立刻重新渲染，而是先将watcher放入一个队列中，就像是一个缓存一样。

```
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      // 将watcher方法更新队列中去
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      let i = queue.length - 1
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}
```

最终会调用flushSchedulerQueue方法，对队列中的所有订阅的watchers进行通知更新

```
// 核心更新逻辑
watcher.run()
```

最终会走到`src/core/observer/watcher.js` 进行页面的再次渲染

```
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // 这个getter在渲染的时候就是传递进来的 updateComponent方法，因此再一次触发页面的渲染
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }
```