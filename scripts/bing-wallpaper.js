/**
 * 必应每日壁纸 · 无 API Key
 * 数据源: Bing HPImageArchive
 * lastVerified: 2026-04-06
 *
 * argument:
 *   idx=0        0=今天 1=昨天 …
 *   mkt=zh-CN    市场
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
var idx = parseInt(params.idx, 10);
if (isNaN(idx) || idx < 0) idx = 0;
if (idx > 7) idx = 7;
var mkt = params.mkt || 'zh-CN';

var apiUrl =
  'https://www.bing.com/HPImageArchive.aspx?format=js&idx=' +
  idx +
  '&n=1&mkt=' +
  encodeURIComponent(mkt);

$httpClient.get(
  {
    url: apiUrl,
    headers: { 'User-Agent': 'StashTile/1.0' },
  },
  function (err, resp, body) {
    if (err || !body) {
      $done({
        title: '🖼️ 必应壁纸',
        content: '❌ 请求失败：' + (err || '无数据'),
        icon: 'photo.fill',
        backgroundColor: '#2B579A',
      });
      return;
    }
    try {
      var j = JSON.parse(body);
      if (!j.images || !j.images.length) {
        $done({
          title: '🖼️ 必应壁纸',
          content: '😶 无图片数据',
          icon: 'photo.fill',
          backgroundColor: '#2B579A',
        });
        return;
      }
      var im = j.images[0];
      var pic = 'https://www.bing.com' + im.url;
      var lines = [];
      if (im.title) lines.push('✨ ' + im.title);
      if (im.copyright) lines.push('©️ ' + im.copyright);
      lines.push('');
      lines.push('🔗 ' + pic);
      $done({
        title: '🖼️ 必应壁纸',
        content: lines.join('\n'),
        icon: 'photo.fill',
        backgroundColor: '#2B579A',
        url: im.copyrightlink || pic,
      });
    } catch (e) {
      $done({
        title: '🖼️ 必应壁纸',
        content: '❌ 解析失败：' + e,
        icon: 'photo.fill',
        backgroundColor: '#2B579A',
      });
    }
  }
);
