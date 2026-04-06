/**
 * 一言 · 无 API Key（Hitokoto 开放接口）
 * 数据源: https://hitokoto.cn/
 * lastVerified: 2026-04-06
 *
 * argument:
 *   c=a          分类：a 动画 b 漫画 c 游戏 d 文学 e 原创 … 可留空随机
 *   max=120      展示的最长字数（超出截断）
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
var cat = params.c || '';
var maxLen = parseInt(params.max, 10) || 120;
if (maxLen < 20) maxLen = 20;
if (maxLen > 300) maxLen = 300;

var url = 'https://v1.hitokoto.cn/?encode=json';
if (cat) url += '&c=' + encodeURIComponent(cat);

$httpClient.get(
  {
    url: url,
    headers: { 'User-Agent': 'StashTile/1.0' },
  },
  function (err, resp, body) {
    if (err || !body) {
      $done({
        title: '一言',
        content: '请求失败：' + (err || '无数据'),
        icon: 'quote.bubble.fill',
        backgroundColor: '#5C6BC0',
        url: 'https://hitokoto.cn/',
      });
      return;
    }
    try {
      var j = JSON.parse(body);
      var text = j.hitokoto || '';
      if (text.length > maxLen) text = text.slice(0, maxLen) + '…';
      var lines = [text, ''];
      if (j.from) lines.push('—— 《' + j.from + '》');
      if (j.from_who) lines.push('　　' + j.from_who);
      lines.push('');
      lines.push('hitokoto.cn');
      $done({
        title: '一言',
        content: lines.join('\n'),
        icon: 'quote.bubble.fill',
        backgroundColor: '#5C6BC0',
        url: 'https://hitokoto.cn/',
      });
    } catch (e) {
      $done({
        title: '一言',
        content: '解析失败：' + e,
        icon: 'quote.bubble.fill',
        backgroundColor: '#5C6BC0',
      });
    }
  }
);
