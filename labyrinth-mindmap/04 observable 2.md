### 计算属性和侦听属性的区别

核心这两个都是通过watcher来实现的，也就是观察者模式

- 计算属性（computed）
- 侦听属性（watch）

首先回到new VUE()的过程中sneak peak一下computed方法的初始化过程`src/core/instance/state.js`
从方法`initComputed` --> 方法`defineComputed` -->  方法`createComputedGetter`
```
    // 赋予computed属性 get 方法
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : userDef
    sharedPropertyDefinition.set = noop
```

最终会返回这一个回调函数，当执行get也就是读取computed值的时候会执行这个回调函数
```
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        // 真正去访问watcher.get方法进行求值
        // 参考下面代码
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}
```

```
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }
```

最终触发了get方法中getter函数对computed属性进行求值


技术点是python和scrapy