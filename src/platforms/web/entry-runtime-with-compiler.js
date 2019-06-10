/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

/**
[TITLE]
new Vue()发生了什么？
[CONTENT]
我们知道，所有的template都会被转化成render函数，从而配合vdom对浏览器进行打patch操作

当执行到return mount.call(this, el, hydrating)的时候，会invoke缓存的mount方法，这个时候
应该移步到这个方法的定义的地方。

[NEXT]
return mount.call(this, el, hydrating)做了什么？
Refer file: platforms/runtime/index.js
*/

// 这里将 Vue.prototype.$mount 缓存起来，并重写了 $mount 方法，因为默认 runtime only 版本的是没有这个方法的。
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {

  // CROWN: query 其实就是根据参数返回一个DOM对象
  el = el && query(el)

  /* istanbul ignore if */
  // CROWN:  不能将实例挂在到html或者body上
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options

  // 总结下面做的事情：
  /**
  * 1. 如果有render function，则直接使用render fun
  * 2. 如果没有render function 但是有template，则将 template 中的html 编译成render fun
  * 3. 如果都没有，则使用 el 选取的 html 片段编译成render fun
  */
  // resolve template/el and convert to render function
  // CROWN: 解析template/el并将其转换成render函数
  // 这里判断是否有render方法，umd调用的是没有render方法的，.vue模版的使用方式一般是手写render方法的。
  if (!options.render) {
    // template 也是根据实际情况有时候会有，有时候会没有的。
    // CROWN: 根据不同的定义template的方法拿到自定义的template
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 如果是直接绑定的，要先去拿到页面的真实 html，因为要去拿这些html去生成虚拟dom
      template = getOuterHTML(el)
    }

    // CROWN: 当拿到template之后，就要进行template的编译工作了，我们知道，我们自定义的template会编译成
    // js的函数，并将其交给vdom进行执行，以下代码主要是编译相关。
    // 这部分就是先编译成AST树，再进而得到render函数
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
