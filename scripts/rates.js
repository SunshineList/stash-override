/**
 * 汇率磁贴 · 无 API Key
 * 数据源: https://www.frankfurter.app/ (ECB)
 * lastVerified: 2026-04-06
 *
 * argument:
 *   from=USD&to=CNY,EUR,JPY
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
var from = (params.from || 'USD').toUpperCase();
var toParam = params.to || 'CNY,EUR,JPY,GBP';
var toList = [];
var rawTo = toParam.split(',');
for (var t = 0; t < rawTo.length; t++) {
  var c = String(rawTo[t]).trim().toUpperCase();
  if (c) toList.push(c);
}

var url =
  'https://api.frankfurter.app/latest?from=' +
  encodeURIComponent(from) +
  '&to=' +
  encodeURIComponent(toList.join(','));

$httpClient.get(
  {
    url: url,
    headers: { 'User-Agent': 'StashTile/1.0' },
  },
  function (err, resp, body) {
    if (err || !body) {
      $done({
        title: '汇率',
        content: '请求失败：' + (err || '无数据'),
        icon: 'dollarsign.circle.fill',
        backgroundColor: '#2E7D32',
      });
      return;
    }
    try {
      var j = JSON.parse(body);
      if (!j.rates) {
        $done({
          title: '汇率',
          content: '数据异常：' + String(body).slice(0, 180),
          icon: 'dollarsign.circle.fill',
          backgroundColor: '#2E7D32',
        });
        return;
      }
      var lines = [];
      lines.push('1 ' + (j.base || from));
      lines.push('日期 ' + (j.date || ''));
      for (var i = 0; i < toList.length; i++) {
        var code = toList[i];
        if (j.rates[code] != null) lines.push(code + '  ' + j.rates[code]);
      }
      lines.push('来源 Frankfurter');
      $done({
        title: '汇率 · ' + from,
        content: lines.join('\n'),
        icon: 'dollarsign.circle.fill',
        backgroundColor: '#2E7D32',
        url: 'https://www.frankfurter.app/',
      });
    } catch (e) {
      $done({
        title: '汇率',
        content: '解析失败：' + e,
        icon: 'dollarsign.circle.fill',
        backgroundColor: '#2E7D32',
      });
    }
  }
);
