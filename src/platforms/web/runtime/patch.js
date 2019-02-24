/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)


/**
[TITLE]
new Vue()发生了什么？
[CONTENT]
说这里使用了curry化的技巧，没太听懂
node-ops 定了对实际dom操作到方法

[NEXT]
createPatchFunction 做了什么？
Refer file: core/vdom/patch

*/
// nodeOps 是一些真实 dom 的操作

export const patch: Function = createPatchFunction({ nodeOps, modules })
