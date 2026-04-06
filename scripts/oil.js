/**
 * 油价参考 · 无 API Key（全国统计口径，非各省发改委挂牌价）
 * 数据源: GlobalPetrolPrices 中文页 meta 描述
 *   - 汽油 https://zh.globalpetrolprices.com/China/gasoline_prices/
 *   - 柴油 https://zh.globalpetrolprices.com/China/diesel_prices/
 * lastVerified: 2026-04-06
 *
 * argument: 预留扩展，当前无必填参数
 */
function extractOgDescription(html) {
  var m = html.match(/property="og:description"\s+content='([^']*)'/);
  if (m) return m[1];
  m = html.match(/property="og:description"\s+content="([^"]*)"/);
  return m ? m[1] : '';
}

function parseStats(desc, label) {
  if (!desc) return label + '：无数据';
  var avg = desc.match(/平均价格\s+([0-9.]+)/);
  var min = desc.match(/最低价格[^的]+的\s+([0-9.]+)/);
  var max = desc.match(/最高价格[^的]+的\s+([0-9.]+)/);
  var world = desc.match(/世界平均[^0-9]*([0-9.]+)|世界各地[^0-9]*([0-9.]+)/);
  var parts = [label];
  if (avg) parts.push('平均 ' + avg[1] + ' 元/升(口径见站方)');
  if (min) parts.push('最低 ' + min[1]);
  if (max) parts.push('最高 ' + max[1]);
  if (world) parts.push('世界均 ' + (world[1] || world[2]));
  return parts.join('\n');
}

var UA = { 'User-Agent': 'StashTile/1.0' };

$httpClient.get(
  {
    url: 'https://zh.globalpetrolprices.com/China/gasoline_prices/',
    headers: UA,
  },
  function (err1, r1, gasHtml) {
    if (err1 || !gasHtml) {
      $done({
        title: '油价参考',
        content: '汽油页请求失败：' + (err1 || '空'),
        icon: 'fuelpump.fill',
        backgroundColor: '#C932A9',
        url: 'https://zh.globalpetrolprices.com/China/gasoline_prices/',
      });
      return;
    }

    $httpClient.get(
      {
        url: 'https://zh.globalpetrolprices.com/China/diesel_prices/',
        headers: UA,
      },
      function (err2, r2, dieHtml) {
        var gasDesc = extractOgDescription(gasHtml);
        var dieDesc = err2 || !dieHtml ? '' : extractOgDescription(dieHtml);

        var content =
          parseStats(gasDesc, '汽油(全国统计)') +
          '\n\n' +
          (dieDesc ? parseStats(dieDesc, '柴油(全国统计)') : '柴油：未获取') +
          '\n\n各省挂牌价请以本地发改委/加油站为准。';

        $done({
          title: '油价参考 · 中国',
          content: content,
          icon: 'fuelpump.fill',
          backgroundColor: '#C932A9',
          url: 'https://zh.globalpetrolprices.com/China/gasoline_prices/',
        });
      }
    );
  }
);
