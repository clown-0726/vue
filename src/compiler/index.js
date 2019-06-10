/* @flow */

import { parse } from "./parser/index";
import { optimize } from "./optimizer";
import { generate } from "./codegen/index";
import { createCompilerCreator } from "./create-compiler";

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
export const createCompiler = createCompilerCreator(function baseCompile(
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 1. 生成AST抽象语法树
  const ast = parse(template.trim(), options);
  // 2. 抽象语法树的优化
  if (options.optimize !== false) {
    optimize(ast, options);
  }
  // 3. 将AST生成render函数（可执行代码）
  const code = generate(ast, options);
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  };
});

/**

function baseCompile (template: string, options: CompilerOptions): CompiledResult {
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
}

export const createCompiler = createCompilerCreator(baseCompile)

 */
