/**
 * 加密货币行情 · 无 API Key（CoinGecko 免费档）
 * 数据源: https://www.coingecko.com/
 * lastVerified: 2026-04-06
 *
 * argument:
 *   ids=bitcoin,ethereum,solana
 *   vs=cny         cny 或 usd（可多选 cny,usd）
 *
 * 注意：免费 API 有速率限制，磁贴 interval 建议 ≥ 1200。
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
var ids = params.ids || 'bitcoin,ethereum,solana';
var vsRaw = (params.vs || 'cny').toLowerCase();
var vsList = [];
var partsVs = vsRaw.split(',');
for (var v = 0; v < partsVs.length; v++) {
  var x = String(partsVs[v]).trim().toLowerCase();
  if (x === 'cny' || x === 'usd' || x === 'eur') vsList.push(x);
}
if (vsList.length === 0) vsList.push('cny');

var apiUrl =
  'https://api.coingecko.com/api/v3/simple/price?ids=' +
  encodeURIComponent(ids) +
  '&vs_currencies=' +
  encodeURIComponent(vsList.join(','));

$httpClient.get(
  {
    url: apiUrl,
    headers: { 'User-Agent': 'StashTile/1.0' },
  },
  function (err, resp, body) {
    if (err || !body) {
      $done({
        title: '加密货币',
        content: '请求失败：' + (err || '无数据'),
        icon: 'bitcoinsign.circle.fill',
        backgroundColor: '#F7931A',
        url: 'https://www.coingecko.com/',
      });
      return;
    }
    try {
      var j = JSON.parse(body);
      var idArr = ids.split(',');
      var lines = [];
      for (var i = 0; i < idArr.length; i++) {
        var id = String(idArr[i]).trim().toLowerCase();
        if (!id) continue;
        var row = j[id];
        if (!row) {
          lines.push(id + '：无数据');
          continue;
        }
        var bits = [];
        for (var k = 0; k < vsList.length; k++) {
          var c = vsList[k];
          if (row[c] != null) bits.push(c.toUpperCase() + ' ' + row[c]);
        }
        lines.push(id + '\n  ' + bits.join('  ·  '));
      }
      if (lines.length === 0) lines.push('无返回，请检查 ids 拼写');
      lines.push('');
      lines.push('CoinGecko');
      $done({
        title: '加密货币',
        content: lines.join('\n'),
        icon: 'bitcoinsign.circle.fill',
        backgroundColor: '#F7931A',
        url: 'https://www.coingecko.com/',
      });
    } catch (e) {
      $done({
        title: '加密货币',
        content: '解析失败：' + e,
        icon: 'bitcoinsign.circle.fill',
        backgroundColor: '#F7931A',
      });
    }
  }
);
