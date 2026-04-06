/**
 * 天气磁贴 · 无 API Key
 * 数据源: https://open-meteo.com/ (forecast + geocoding)
 * lastVerified: 2026-04-06
 *
 * argument:
 *   city=Beijing | lat=39.9&lon=116.4 | lat=&lon=&name=自定义标题
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

var WMO_CN = {
  0: '晴',
  1: '大部晴朗',
  2: '局部多云',
  3: '阴',
  45: '雾',
  48: '雾凇',
  51: '小毛毛雨',
  53: '中毛毛雨',
  55: '大毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  80: '小阵雨',
  81: '阵雨',
  82: '强阵雨',
  95: '雷暴',
  96: '雷暴伴冰雹',
  99: '强雷暴伴冰雹',
};

function wmoText(code) {
  return WMO_CN[code] != null ? WMO_CN[code] : '代码' + code;
}

var params = parseArgs(typeof $argument !== 'undefined' ? $argument : '');
var lat = params.lat ? parseFloat(params.lat) : NaN;
var lon = params.lon ? parseFloat(params.lon) : NaN;
var displayName = params.name || params.city || '';

function finishForecast(name, latitude, longitude) {
  var q =
    'latitude=' +
    latitude +
    '&longitude=' +
    longitude +
    '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&timezone=auto';
  $httpClient.get(
    {
      url: 'https://api.open-meteo.com/v1/forecast?' + q,
      headers: { 'User-Agent': 'StashTile/1.0' },
    },
    function (err, resp, body) {
      if (err || !body) {
        $done({
          title: '🌤️ 天气',
          content: '❌ 获取预报失败：' + (err || '无数据'),
          icon: 'cloud.sun.fill',
          backgroundColor: '#4A90D9',
        });
        return;
      }
      try {
        var j = JSON.parse(body);
        var cur = j.current;
        if (!cur) {
          $done({
            title: '🌤️ 天气',
            content: '❌ 返回异常，请检查坐标。',
            icon: 'cloud.sun.fill',
            backgroundColor: '#4A90D9',
          });
          return;
        }
        var tz = j.timezone || '';
        var title = '🌤️ ' + (name || '位置') + ' · 天气';
        var lines = [
          '🌈 ' + wmoText(cur.weather_code),
          '🌡️ 气温 ' + cur.temperature_2m + '°C',
          '🤒 体感 ' + cur.apparent_temperature + '°C',
          '💧 湿度 ' + cur.relative_humidity_2m + '%',
          '💨 风速 ' + cur.wind_speed_10m + ' km/h',
          '🕐 更新 ' + cur.time + (tz ? ' · ' + tz : ''),
        ];
        $done({
          title: title,
          content: lines.join('\n'),
          icon: 'cloud.sun.fill',
          backgroundColor: '#4A90D9',
          url: 'https://open-meteo.com/',
        });
      } catch (e) {
        $done({
          title: '🌤️ 天气',
          content: '❌ 解析失败：' + e,
          icon: 'cloud.sun.fill',
          backgroundColor: '#4A90D9',
        });
      }
    }
  );
}

if (!isNaN(lat) && !isNaN(lon)) {
  finishForecast(displayName || String(lat) + ',' + String(lon), lat, lon);
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
          title: '🌤️ 天气',
          content: '❌ 地理编码失败：' + (err || '无数据'),
          icon: 'cloud.sun.fill',
          backgroundColor: '#4A90D9',
        });
        return;
      }
      try {
        var g = JSON.parse(body);
        if (!g.results || !g.results.length) {
          $done({
            title: '🌤️ 天气',
            content: '❓ 未找到：' + city + '\n请用英文地名或 lat=&lon=',
            icon: 'cloud.sun.fill',
            backgroundColor: '#4A90D9',
          });
          return;
        }
        var r = g.results[0];
        var label = r.name + (r.admin1 ? ' · ' + r.admin1 : '');
        finishForecast(label, r.latitude, r.longitude);
      } catch (e) {
        $done({
          title: '🌤️ 天气',
          content: '❌ 解析地理失败：' + e,
          icon: 'cloud.sun.fill',
          backgroundColor: '#4A90D9',
        });
      }
    }
  );
}
