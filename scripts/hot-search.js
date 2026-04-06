/**
 * 平台热榜 · 无 API Key（解析 tophub 公开页）
 * 数据源: https://tophub.today/
 * lastVerified: 2026-04-06
 *
 * 请求使用 iPhone UA 以获取含 .s-title 的移动版 HTML。
 *
 * argument:
 *   platform=微博&count=8
 */
function parseArgs(str) {
  var out = {};
  if (str == null || !String(str).trim()) return out;
  var parts = String(str).split('&');
  for (var p = 0; p < parts.length; p++) {
    var item = parts[p];
    if (!item) continue;
    var i = item.indexOf('=');
    var k = i === -1 ? item : item.slice(0, i);
    var v = i === -1 ? '' : item.slice(i + 1);
    try {
      out[k] = decodeURIComponent(v.replace(/\+/g, ' '));
    } catch (e) {
      out[k] = v;
    }
  }
  return out;
}

var PLATFORM_HASH = {
  微博: 'KqndgxeLl9',
  知乎: 'mproPpoq6O',
  微信: 'WnBe01o371',
  今日头条: 'x9ozB4KoXb',
  澎湃: 'wWmoO5Rd4E',
  百度: 'Jb0vmloB1G',
  '36氪': 'Q1Vd5Ko85R',
  少数派: 'NaEdZZXdrO',
  财新: 'x9ozBY7oXb',
  ZAKER: '5VaobJgoAj',
  新京报: 'YqoXQ8XvOD',
  南方周末: 'ENeYQBweY4',
  科普中国: 'DgeyxkwdZq',
  威锋网: 'n4qv90roaK',
  起点小说: 'VaobmGneAj',
  纵横小说: 'b0vmYyJvB1',
  北美票房: 'n6YoVPadZa',
};

var params = parseArgs(typeof $argument !== 'undefined' ? $argument : '');
var platform = params.platform || '今日头条';
var count = parseInt(params.count, 10) || 8;
if (count > 30) count = 30;

var platformValue = PLATFORM_HASH[platform];
if (!platformValue) {
  $done({
    title: '📊 热榜',
    content: '❓ 未知平台：' + platform + '\n见脚本内 PLATFORM_HASH 键名。',
    icon: 'text.badge.star',
    backgroundColor: '#FFD700',
  });
} else {
  var pageUrl = 'https://tophub.today/n/' + platformValue;
  $httpClient.get(
    {
      url: pageUrl,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml',
      },
    },
    function (error, response, html) {
      if (error || !html) {
        $done({
          title: '📊 ' + platform + '热榜',
          content: '❌ 请求失败：' + (error || '无内容'),
          icon: 'text.badge.star',
          backgroundColor: '#FFD700',
          url: pageUrl,
        });
        return;
      }

      // --- parse: mobile .s-title ---
      var list = [];
      var reMobile = /<div class="s-title">([^<]+)<\/div>/g;
      var m;
      while ((m = reMobile.exec(html)) !== null) {
        var title = m[1].replace(/^\s+|\s+$/g, '');
        if (title && list.indexOf(title) < 0) list.push(title);
      }

      // --- parse: legacy PC table ---
      if (list.length === 0) {
        var rePc = /<td class="al"><a href="\/l\?e=[^"]+"[^>]*>([^<]+)<\/a><\/td>\s+<td>([^<]*)<\/td>/g;
        while ((m = rePc.exec(html)) !== null) {
          var kw = m[1].replace(/^\s+|\s+$/g, '');
          if (kw && list.indexOf(kw) < 0) list.push(kw);
        }
      }

      if (list.length === 0) {
        $done({
          title: '📊 ' + platform + '热榜',
          content:
            '⚠️ 解析不到标题（页面可能改版）。\n请编辑 scripts/hot-search.js 更新正则。\n' + pageUrl,
          icon: 'text.badge.star',
          backgroundColor: '#FFD700',
          url: pageUrl,
        });
        return;
      }

      var content = '';
      for (var i = 0; i < list.length && i < count; i++) {
        content += i + 1 + ' 🔥 ' + list[i] + '\n';
      }
      content += '\n📡 来源 tophub.today';

      $done({
        title: '📊 ' + platform + '热榜',
        content: content,
        icon: 'text.badge.star',
        backgroundColor: '#FFD700',
        url: pageUrl,
      });
    }
  );
}
