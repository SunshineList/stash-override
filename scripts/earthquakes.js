/**
 * 全球地震快讯 · 无 API Key
 * 数据源: USGS GeoJSON Feed
 * lastVerified: 2026-04-06
 *
 * argument:
 *   feed=4.5      2.5 | 4.5 | significant（显著）
 *   count=8       条数
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

var FEEDS = {
  '2.5': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
  '4.5': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson',
  significant: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson',
};

var params = parseArgs(typeof $argument !== 'undefined' ? $argument : '');
var feedKey = (params.feed || '4.5').toLowerCase();
if (feedKey === 'sig' || feedKey === 'significant') feedKey = 'significant';
var feedUrl = FEEDS[feedKey];
if (!feedUrl) feedUrl = FEEDS['4.5'];

var count = parseInt(params.count, 10) || 8;
if (count > 20) count = 20;

$httpClient.get(
  {
    url: feedUrl,
    headers: { 'User-Agent': 'StashTile/1.0' },
  },
  function (err, resp, body) {
    if (err || !body) {
      $done({
        title: '🌋 地震快讯',
        content: '❌ 请求失败：' + (err || '无数据'),
        icon: 'waveform.path.ecg',
        backgroundColor: '#BF360C',
        url: 'https://earthquake.usgs.gov/',
      });
      return;
    }
    try {
      var j = JSON.parse(body);
      var feats = j.features || [];
      if (!feats.length) {
        $done({
          title: '🌋 地震快讯',
          content: '✅ 过去时段内无符合条件的地震。',
          icon: 'waveform.path.ecg',
          backgroundColor: '#BF360C',
          url: feedUrl,
        });
        return;
      }
      var lines = [];
      for (var i = 0; i < feats.length && i < count; i++) {
        var p = feats[i].properties || {};
        var mag = p.mag != null ? 'M' + p.mag : 'M?';
        var place = p.place || '';
        var title = p.title || mag + ' ' + place;
        lines.push(i + 1 + '. 🔔 ' + title);
      }
      lines.push('');
      lines.push('📡 USGS · ' + (feedKey === 'significant' ? '显著' : feedKey + '+ 近24h'));
      $done({
        title: '🌋 地震快讯',
        content: lines.join('\n'),
        icon: 'waveform.path.ecg',
        backgroundColor: '#BF360C',
        url: feats[0].properties && feats[0].properties.url ? feats[0].properties.url : 'https://earthquake.usgs.gov/',
      });
    } catch (e) {
      $done({
        title: '🌋 地震快讯',
        content: '❌ 解析失败：' + e,
        icon: 'waveform.path.ecg',
        backgroundColor: '#BF360C',
      });
    }
  }
);
