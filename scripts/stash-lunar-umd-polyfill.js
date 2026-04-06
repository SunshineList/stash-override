/**
 * Stash：solarlunar.min.js 的 UMD 使用 `})(this, ...)`，且分支里会求值 `global || self`。
 * 在部分磁贴脚本沙箱中 `this` 非全局；`self` 未声明会 ReferenceError，脚本无法执行到 $done。
 * 本段须保持在脚本顶层（不要用 IIFE 包一层），以便 `var` 落在磁贴全局。
 */
if (typeof self === 'undefined') {
  var self =
    typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
        ? global
        : {};
}
if (typeof globalThis === 'undefined') {
  var globalThis = self;
}
