/**
 * 国际空间站位置 · 无 API Key
 * 数据源: https://wheretheiss.at/
 * lastVerified: 2026-04-06
 *
 * argument: 暂无
 */
$httpClient.get(
  {
    url: 'https://api.wheretheiss.at/v1/satellites/25544',
    headers: { 'User-Agent': 'StashTile/1.0' },
  },
  function (err, resp, body) {
    if (err || !body) {
      $done({
        title: '🛰️ ISS 位置',
        content: '❌ 请求失败：' + (err || '无数据'),
        icon: 'globe.americas.fill',
        backgroundColor: '#1565C0',
        url: 'https://wheretheiss.at/',
      });
      return;
    }
    try {
      var j = JSON.parse(body);
      var lines = [
        '🌍 纬度 ' + (j.latitude != null ? j.latitude.toFixed(2) : '?'),
        '🧭 经度 ' + (j.longitude != null ? j.longitude.toFixed(2) : '?'),
        '⬆️ 高度 ' + (j.altitude != null ? j.altitude.toFixed(0) + ' km' : '?'),
        '⚡ 速度 ' + (j.velocity != null ? j.velocity.toFixed(0) + ' km/h' : '?'),
        '👁️ 可见性 ' + (j.visibility || '?'),
      ];
      if (j.timestamp) {
        var d = new Date(j.timestamp * 1000);
        lines.push('🕐 数据 UTC ' + d.toISOString().replace('T', ' ').slice(0, 19));
      }
      lines.push('');
      lines.push('🔗 wheretheiss.at');
      $done({
        title: '🛰️ 国际空间站',
        content: lines.join('\n'),
        icon: 'globe.americas.fill',
        backgroundColor: '#1565C0',
        url: 'https://wheretheiss.at/',
      });
    } catch (e) {
      $done({
        title: '🛰️ ISS 位置',
        content: '❌ 解析失败：' + e,
        icon: 'globe.americas.fill',
        backgroundColor: '#1565C0',
      });
    }
  }
);
