我们都知道VUE的响应式实现是依赖`Object.defineProperty`来实现的，因此IE8以下的浏览器是不支持的。
Reference link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

getter主要是做依赖收集的，setter主要是做派发更新的

### 当new Vue()对象的时候，VUE是如何将'data' 和 'props'变成响应式的呢?

`src\core\instance\init.js` 中的 `initState(vm)` 是响应式的入口，所有的响应式工作都是从这里开始的。
一共有两条线，一条是`initProps()`的响应式操作；另一条是 `initData(vm)` 的响应式操作。

```
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props) // 我是第一条线
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm) // 我是第二条线
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```


### 第一条线 `initProps()`

第一条线比较简单，就是循环props上的属性调用响应式的核心方法 `defineReactive(props, key, value)` 

```
    ...
    } else {
      defineReactive(props, key, value)
    }
    ...
```

这里有一点注意的是，下面的方法操作 `shouldObserve` 的切换，后续为root节点的特殊操作用。
```
  if (!isRoot) {
    toggleObserving(false)
  }
```


### 第二条线 `initData(vm)`

这条线是相对稍微复杂的一条线，在对数据做了一系列检查之后，调用了 `observe` 方法

```
  // observe data
  // 对数据做响应式处理
  observe(data, true /* asRootData */)
```

下面是`observe`方法，这个是在 `src\core\observer\index.js` 文件中

```
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // 核心注意地方
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 核心注意地方
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```

首先判断其有没有 __ob__ 属性，有的话，说明已经响应化过了，后续会有这个属性的定义说明。
之后就是调用 `ob = new Observer(value)` 将属性变成响应式的。

接下来就是`Observer`对象的生命，其中有单个主要的地方

为属性定义响应式标志，指向其本身
```
def(value, '__ob__', this)
```

遍历对象属性，将其变成响应式
```
  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
```

遍历数组属性，将其变成响应式
```
  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
```