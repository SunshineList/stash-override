/**
 * 空气质量 · 无 API Key
 * 数据源: Open-Meteo Air Quality API + Geocoding
 * lastVerified: 2026-04-06
 *
 * argument:
 *   city=Beijing | lat=39.9&lon=116.4
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

function aqiLabel(usAqi) {
  if (usAqi == null || isNaN(usAqi)) return '';
  var v = Number(usAqi);
  if (v <= 50) return '优';
  if (v <= 100) return '良';
  if (v <= 150) return '轻度污染';
  if (v <= 200) return '中度污染';
  if (v <= 300) return '重度污染';
  return '严重污染';
}

var params = parseArgs(typeof $argument !== 'undefined' ? $argument : '');
var lat = params.lat ? parseFloat(params.lat) : NaN;
var lon = params.lon ? parseFloat(params.lon) : NaN;
var displayName = params.name || params.city || '';

function fetchAqi(name, latitude, longitude) {
  var q =
    'latitude=' +
    latitude +
    '&longitude=' +
    longitude +
    '&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide&timezone=auto';
  $httpClient.get(
    {
      url: 'https://air-quality-api.open-meteo.com/v1/air-quality?' + q,
      headers: { 'User-Agent': 'StashTile/1.0' },
    },
    function (err, resp, body) {
      if (err || !body) {
        $done({
          title: '🌬️ 空气质量',
          content: '❌ 请求失败：' + (err || '无数据'),
          icon: 'wind',
          backgroundColor: '#00838F',
        });
        return;
      }
      try {
        var j = JSON.parse(body);
        var cur = j.current;
        if (!cur) {
          $done({
            title: '🌬️ 空气质量',
            content: '😶 无当前数据',
            icon: 'wind',
            backgroundColor: '#00838F',
          });
          return;
        }
        var aqi = cur.us_aqi;
        var label = aqiLabel(aqi);
        var title = '🌬️ ' + (name || '位置') + ' · AQI';
        var lines = [];
        if (aqi != null) lines.push('📊 US AQI ' + aqi + (label ? '（' + label + '）' : ''));
        if (cur.pm2_5 != null) lines.push('🌫️ PM2.5  ' + cur.pm2_5 + ' μg/m³');
        if (cur.pm10 != null) lines.push('💨 PM10   ' + cur.pm10 + ' μg/m³');
        if (cur.carbon_monoxide != null) lines.push('☁️ CO     ' + cur.carbon_monoxide + ' μg/m³');
        if (cur.nitrogen_dioxide != null) lines.push('🏭 NO₂    ' + cur.nitrogen_dioxide + ' μg/m³');
        lines.push('🕐 更新 ' + (cur.time || '') + (j.timezone ? ' · ' + j.timezone : ''));
        lines.push('📡 Open-Meteo Air Quality');
        $done({
          title: title,
          content: lines.join('\n'),
          icon: 'wind',
          backgroundColor: '#00838F',
          url: 'https://open-meteo.com/',
        });
      } catch (e) {
        $done({
          title: '🌬️ 空气质量',
          content: '❌ 解析失败：' + e,
          icon: 'wind',
          backgroundColor: '#00838F',
        });
      }
    }
  );
}

if (!isNaN(lat) && !isNaN(lon)) {
  fetchAqi(displayName || String(lat) + ',' + String(lon), lat, lon);
} else {
  var city = params.city || 'Beijing';
  $httpClient.get(
    {
      url:
        'https://geocoding-api.open-meteo.com/v1/search?name=' +
        encodeURIComponent(city) +
        '&count=1',
      headers: { 'User-Agent': 'StashTile/1.0' },
    },
    function (err, resp, body) {
      if (err || !body) {
        $done({
          title: '🌬️ 空气质量',
          content: '❌ 地理编码失败：' + (err || '无数据'),
          icon: 'wind',
          backgroundColor: '#00838F',
        });
        return;
      }
      try {
        var g = JSON.parse(body);
        if (!g.results || !g.results.length) {
          $done({
            title: '🌬️ 空气质量',
            content: '🔍 未找到：' + city + '\n请用英文地名或 lat=&lon=',
            icon: 'wind',
            backgroundColor: '#00838F',
          });
          return;
        }
        var r = g.results[0];
        var label = r.name + (r.admin1 ? ' · ' + r.admin1 : '');
        fetchAqi(label, r.latitude, r.longitude);
      } catch (e) {
        $done({
          title: '🌬️ 空气质量',
          content: '❌ 解析失败：' + e,
          icon: 'wind',
          backgroundColor: '#00838F',
        });
      }
    }
  );
}
