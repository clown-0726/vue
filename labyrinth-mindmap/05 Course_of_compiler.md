## ==> 主要三个过程

在很多编译技术中，如 babel 编译 ES6 的代码都会先生成 AST。

在 `src/platforms/web/entry-runtime-with-compiler.js` 中执行 `const { render, staticRenderFns } = compileToFunctions(template, {...` 触发模版的最终编译过程。其最终编译的核心三个步骤主要是
1. 生成AST抽象语法树
2. 抽象语法树的优化
3. 将AST生成render函数（可执行代码）

代码在 `src/compiler/index.js`

```
  // 1. 生成AST抽象语法树
  const ast = parse(template.trim(), options)
  // 2. 抽象语法树的优化
  // 这一步主要是将上一步生成的AST树进行静态模板和动态模板 `标记`，静态模板在vue重新渲染的时候时不需要重新渲染的，节省了性能开销。
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  // 3. 将AST生成render函数（可执行代码）
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
```

## ==> 那么问题，在 `compileToFunctions(template, {...` 到核心编译之间发生了什么？

这里面运用了函数curry化的技巧把 `baseOptions` 和 `baseCompile` 给缓存起来出来。


## ==> parseHTML 是其中最主要的HTML解析函数，做了什么呢？

`src/compiler/parser/html-parser.js` 中的 `parseHTML` 主要是对整个html标签进行循环解析，有几个方法需要注意，`stack`，每次解析成功一个开始标签都会忘stack中加一个，每次匹配的一个结束标签就会移除到相应到一个，这样来检测整个标签树的完整性。

砍一棵AST树

```
<ul :class="bindCls" class="list" v-if="isShow">
    <li v-for="(item,index) in data" @click="clickItem(index)">{{item}}:{{index}}</li>
</ul>
```
经过 parse 过程后，生成的 AST 如下：
```
ast = {
  'type': 1,
  'tag': 'ul',
  'attrsList': [],
  'attrsMap': {
    ':class': 'bindCls',
    'class': 'list',
    'v-if': 'isShow'
  },
  'if': 'isShow',
  'ifConditions': [{
    'exp': 'isShow',
    'block': // ul ast element
  }],
  'parent': undefined,
  'plain': false,
  'staticClass': 'list',
  'classBinding': 'bindCls',
  'children': [{
    'type': 1,
    'tag': 'li',
    'attrsList': [{
      'name': '@click',
      'value': 'clickItem(index)'
    }],
    'attrsMap': {
      '@click': 'clickItem(index)',
      'v-for': '(item,index) in data'
     },
    'parent': // ul ast element
    'plain': false,
    'events': {
      'click': {
        'value': 'clickItem(index)'
      }
    },
    'hasBindings': true,
    'for': 'data',
    'alias': 'item',
    'iterator1': 'index',
    'children': [
      'type': 2,
      'expression': '_s(item)+":"+_s(index)'
      'text': '{{item}}:{{index}}',
      'tokens': [
        {'@binding':'item'},
        ':',
        {'@binding':'index'}
      ]
    ]
  }]
}
```

解析处理主要在两个函数中，
1. src\compiler\parser\index.js
2. src\compiler\parser\html-parser.js

parse函数主要是维护了AST树的创建过程，
parseHTML主要是定义了一些正则表达式对html进行遍历提取标签和属性。
这两个过程中，都使用stack栈来维护了整个树的正确性。

注意一点，template模板中是不允许使用scrapt和style标签的。


## ==> optimize

为什么要有优化过程，因为我们知道 Vue 是数据驱动，是响应式的，但是我们的模板并不是所有数据都是响应式的，也有很多数据是首次渲染后就永远不会变化的，那么这部分数据生成的 DOM 也不会变化，我们可以在 patch 的过程跳过对他们的比对。

来看一下 optimize 方法的定义，在 src/compiler/optimizer.js 中：

我们发现每一个 AST 元素节点都多了 staic 属性，并且 type 为 1 的普通元素 AST 节点多了 staticRoot 属性。

那么至此我们分析完了 optimize 的过程，就是深度遍历这个 AST 树，去检测它的每一颗子树是不是静态节点，如果是静态节点则它们生成 DOM 永远不需要改变，这对运行时对模板的更新起到极大的优化作用。

## ==> codegen

这一步就是将AST树转换成render函数需要的执行代码，其实质就是一些字符串拼接过程，来看一个生成的结果：
```
with(this){
  return (isShow) ?
    _c('ul', {
        staticClass: "list",
        class: bindCls
      },
      _l((data), function(item, index) {
        return _c('li', {
          on: {
            "click": function($event) {
              clickItem(index)
            }
          }
        },
        [_v(_s(item) + ":" + _s(index))])
      })
    ) : _e()
}
```

知道整个过程就行，因为这些代码都是来辅助运行时的。