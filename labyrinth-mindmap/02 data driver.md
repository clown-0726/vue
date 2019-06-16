vue 是数据驱动的

### 当new一个vue对象之后，`src/core/instance/init.js`会执行下面几个过程

第一步是拿到vm实例，`const vm: Component = this` 也就是说vm就是当前的VUE实例，

然后进行配置合并，将option上的配置都合并到$option上

```
vm.$options = mergeOptions(
  resolveConstructorOptions(vm.constructor),
  options || {},
  vm
)
```

之后对vm实例做了一些列的初始化操作，或者可以说是“扩展操作”这些操作在之后的mount调用中会进行使用。
```
vm._self = vm
initLifecycle(vm)
initEvents(vm)
initRender(vm)
callHook(vm, 'beforeCreate')
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props
callHook(vm, 'created')
```

之后就是调用`$mount`操作了

```
if (vm.$options.el) {
  vm.$mount(vm.$options.el)
}
```

### $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
插播一条编译的新闻
上面是VUE实例的过程，而下面执行mountComponent操作的时候，时机上是使用render函数，也即是说，html模版会在这里进行编译，整个编译过程我们放到第三章进行说明。

### $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

### VUE实例化完成之后，最终会调用`src/core/instance/lifecycle.js` 中的 `mountComponent` 方法完成整个vnode的path过程

```
// 最终定义了这个函数，核心代码，上面是和性能埋点相关的。
// hydrating ssr相关
// vm._render() 最终得到vnode
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
```