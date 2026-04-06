#!/usr/bin/env bash
# 将 solarlunar UMD 与磁贴逻辑拼成 Stash 可用的单文件 lunar-holiday.js
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/scripts/lunar-holiday.js"
TAIL="$ROOT/scripts/lunar-holiday-tail.js"
VENDOR="$ROOT/scripts/vendor/solarlunar.min.js"

if [[ ! -f "$VENDOR" ]]; then
  echo "缺少 $VENDOR — 请先从 npm 包 solarlunar@3.1.0 复制 dist/solarlunar.min.js 到该路径。" >&2
  echo "示例: curl -sSL https://registry.npmjs.org/solarlunar/-/solarlunar-3.1.0.tgz | tar -xzO package/dist/solarlunar.min.js > \"$VENDOR\"" >&2
  exit 1
fi

POLY="$ROOT/scripts/stash-lunar-umd-polyfill.js"
{
  cat "$POLY"
  # UMD 默认 `})(this,`：沙箱里 this 常为 undefined，改为 globalThis（上已 polyfill）
  sed 's/})(this,/})(globalThis,/' "$VENDOR"
  cat "$TAIL"
} > "$OUT"
echo "Wrote $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)"
