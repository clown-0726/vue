
在 `src/platforms/web/entry-runtime-with-compiler.js` 中执行 `const { render, staticRenderFns } = compileToFunctions(template, {...` 触发模版的最终编译过程。其最终编译的核心三个步骤主要是
1. 生成AST抽象语法树
2. 抽象语法树的优化
3. 将AST生成render函数（可执行代码）

代码在 `src/compiler/index.js`

```
  // 1. 生成AST抽象语法树
  const ast = parse(template.trim(), options)
  // 2. 抽象语法树的优化
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

### 那么问题，在 `compileToFunctions(template, {...` 到核心编译之间发生了什么？

这里面运用了函数curry化的技巧把 `baseOptions` 和 `baseCompile` 给抽离出来。


### parseHTML

`src/compiler/parser/html-parser.js` 中的 `parseHTML` 主要是对整个html标签进行循环解析，有几个方法需要注意，`stack`，每次解析成功一个开始标签都会忘stack中加一个，每次匹配的一个结束标签就会移除到相应到一个，这样来检测整个标签树的完整性。