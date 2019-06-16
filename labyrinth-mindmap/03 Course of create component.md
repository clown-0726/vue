首先，进行component的构建是从这个文件开始的，`src/core/vdom/create-component.js`。

注意，`createComponent` 方法 是寄宿在 `src/core/vdom/create-element.js` 中的，也就是说，compiler会将所有的html模版都先编译成render函数，但是生成都render函数中会有一些自定义都标签或者说组件，而当进行生成vnode操作的时候会把这些自定义的组件用`createComponent`进行处理，流程如下：

- 首先，newV VUE 实例，各种初始化操作
- 进行各种template/html模版的编译操作，最终生成render函数（注意：render函数中含有的_c等函数就是`createElement`函数）
- `createComponent` 寄宿在 `createElement` 函数中
- 生成vnode的时候，当`createElement`不认识的那些，也就是自定义都标签或者说组件，都交给寄宿在内的`createComponent`处理
- 这也就触发了子组件的生成过程，也会生成各种子组件VUE的实例，并建立父子关系

我们首先可以得到VUE实例
```
// CROWN: context.$options._base 其实就是Vue全局对象
const baseCtor = context.$options._base
```

之后调用`baseCtor.extend`方法得到一个子组件的构造方法，其实这个构造方法就是用简单的原型继承得到的，并且之后将大VUE的一些全局能力负值给子的构造方法，具体看`src/core/global-api/extend.js` 里面的方法描述。
```
// plain options object: turn it into a constructor
if (isObject(Ctor)) {
  Ctor = baseCtor.extend(Ctor)
}
```

之后进行组件钩子的安装

```
// CROWN: 为新的component绑定各种hooks
installComponentHooks(data)
```

最终去生成vnode，但是和之前的元素vnode有些不太一样的地方
组件vnode的children为空
```
// CROWN: 最终生成vnode对象
const vnode = new VNode(
  `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
  data, undefined, undefined, undefined, context, // 组件的 children， text， elm是空
  { Ctor, propsData, listeners, tag, children }, // 组件特有的，虽然上面三个是空 componentOptions
  asyncFactory
)
```

最后`return new vnode.componentOptions.Ctor(options)` 有会执行VUE的初始化，这就又进入了之前跟VUE的初始化过程。`src/core/instance/init.js`

当有又执行init方法的时候有一步是建立子组件和父组件之间的父子关系

```
initLifecycle(vm)
```

```
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    // 拿到父的vm实例之后，将当前的vm实例push到父vm实例中，从而尽力父子关系
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}
```