/**
 * Hacker News 首页 · 无 API Key（解析 RSS）
 * 数据源: https://hnrss.org/frontpage
 * lastVerified: 2026-04-06
 *
 * argument:
 *   count=8
 *   url=https://hnrss.org/newest  可换其它 hnrss 源
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

var params = parseArgs(typeof $argument !== 'undefined' ? $argument : '');
var count = parseInt(params.count, 10) || 8;
if (count > 15) count = 15;
var feedUrl = params.url || 'https://hnrss.org/frontpage';

$httpClient.get(
  {
    url: feedUrl,
    headers: { 'User-Agent': 'StashTile/1.0' },
  },
  function (err, resp, xml) {
    if (err || !xml) {
      $done({
        title: '🧡 Hacker News',
        content: '❌ 请求失败：' + (err || '无数据'),
        icon: 'newspaper.fill',
        backgroundColor: '#FF6600',
        url: 'https://news.ycombinator.com/',
      });
      return;
    }

    // --- parse: RSS item title CDATA ---
    var titles = [];
    var re = /<item>[\s\S]*?<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/gi;
    var m;
    while ((m = re.exec(xml)) !== null) {
      var t = m[1].replace(/^\s+|\s+$/g, '');
      if (t && t.indexOf('Hacker News:') !== 0) titles.push(t);
      if (titles.length >= count) break;
    }

    if (titles.length === 0) {
      var re2 = /<item>[\s\S]*?<title>([^<]+)<\/title>/gi;
      while ((m = re2.exec(xml)) !== null) {
        var t2 = m[1].replace(/^\s+|\s+$/g, '');
        if (t2) titles.push(t2);
        if (titles.length >= count) break;
      }
    }

    if (titles.length === 0) {
      $done({
        title: '🧡 Hacker News',
        content: '⚠️ 未能解析 RSS，页面结构可能已变。\n' + feedUrl,
        icon: 'newspaper.fill',
        backgroundColor: '#FF6600',
        url: feedUrl,
      });
      return;
    }

    var lines = [];
    for (var i = 0; i < titles.length; i++) {
      lines.push(i + 1 + '. 📰 ' + titles[i]);
    }
    lines.push('');
    lines.push('🔗 hnrss.org');

    $done({
      title: '🧡 Hacker News',
      content: lines.join('\n'),
      icon: 'newspaper.fill',
      backgroundColor: '#FF6600',
      url: 'https://news.ycombinator.com/',
    });
  }
);
