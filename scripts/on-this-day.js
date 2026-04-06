/**
 * 历史上的今天 · 无 API Key
 * 数据源: Wikimedia Feed API
 * lastVerified: 2026-04-06
 *
 * argument:
 *   lang=zh      zh | en
 *   count=6      条数上限
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

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

var params = parseArgs(typeof $argument !== 'undefined' ? $argument : '');
var lang = (params.lang || 'zh').toLowerCase();
if (lang !== 'en') lang = 'zh';
var count = parseInt(params.count, 10) || 6;
if (count > 15) count = 15;

var now = new Date();
var mm = pad2(now.getMonth() + 1);
var dd = pad2(now.getDate());

var feedUrl =
  'https://api.wikimedia.org/feed/v1/wikipedia/' +
  lang +
  '/onthisday/all/' +
  mm +
  '/' +
  dd;

$httpClient.get(
  {
    url: feedUrl,
    headers: {
      'User-Agent': 'StashTile/1.0 (+https://github.com/SunshineList/stash-override)',
      Accept: 'application/json',
    },
  },
  function (err, resp, body) {
    if (err || !body) {
      $done({
        title: '📜 历史上的今天',
        content: '❌ 请求失败：' + (err || '无数据'),
        icon: 'book.closed.fill',
        backgroundColor: '#8D6E63',
        url: 'https://zh.wikipedia.org/',
      });
      return;
    }
    try {
      var j = JSON.parse(body);
      var lines = [];
      var seen = {};

      function pushFrom(arr, label) {
        if (!arr || !arr.length) return;
        for (var i = 0; i < arr.length && lines.length < count; i++) {
          var t = arr[i].text;
          if (!t) continue;
          var key = t.slice(0, 80);
          if (seen[key]) continue;
          seen[key] = 1;
          lines.push(lines.length + 1 + '. 📌 ' + t);
        }
      }

      pushFrom(j.selected, 'sel');
      if (lines.length < count) pushFrom(j.events, 'evt');
      if (lines.length < count) pushFrom(j.births, 'birth');
      if (lines.length < count) pushFrom(j.deaths, 'death');

      if (lines.length === 0) {
        $done({
          title: '📜 历史上的今天',
          content: '😶 今日暂无条目或结构已变，请检查 API。\n' + feedUrl,
          icon: 'book.closed.fill',
          backgroundColor: '#8D6E63',
          url: feedUrl,
        });
        return;
      }

      lines.push('');
      lines.push('📚 维基 · ' + mm + '/' + dd);

      $done({
        title: '📜 历史上的今天 · ' + mm + '/' + dd,
        content: lines.join('\n'),
        icon: 'book.closed.fill',
        backgroundColor: '#8D6E63',
        url: lang === 'zh' ? 'https://zh.wikipedia.org/' : 'https://en.wikipedia.org/',
      });
    } catch (e) {
      $done({
        title: '📜 历史上的今天',
        content: '❌ 解析失败：' + e,
        icon: 'book.closed.fill',
        backgroundColor: '#8D6E63',
      });
    }
  }
);
