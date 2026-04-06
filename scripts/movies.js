/**
 * 热映电影 · 无 API Key（豆瓣正在上映页）
 * 数据源: https://movie.douban.com/cinema/nowplaying/{city}/
 * lastVerified: 2026-04-06
 *
 * argument:
 *   city=beijing
 *   city=shanghai&count=6
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
var city = (params.city || 'beijing').replace(/^\s+|\s+$/g, '').toLowerCase();
var count = parseInt(params.count, 10) || 8;
if (count > 20) count = 20;

var url = 'https://movie.douban.com/cinema/nowplaying/' + city + '/';

$httpClient.get(
  {
    url: url,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      Accept: 'text/html,application/xhtml+xml',
    },
  },
  function (err, resp, body) {
    if (err || !body) {
      $done({
        title: '热映电影',
        content: '请求失败：' + (err || '无数据'),
        icon: 'film.fill',
        backgroundColor: '#8E44AD',
        url: 'https://movie.douban.com/',
      });
      return;
    }

    // --- parse: list-item data-* ---
    var pattern =
      /data-title="([^"]*)"\s+data-score="([^"]*)"[^>]*data-actors="([^"]*)"/g;
    var titles = [];
    var scores = [];
    var actors = [];
    var m;
    while ((m = pattern.exec(body)) !== null) {
      titles.push(m[1].replace(/^\s+|\s+$/g, ''));
      scores.push(m[2].replace(/^\s+|\s+$/g, ''));
      actors.push(m[3].replace(/^\s+|\s+$/g, ''));
    }

    if (titles.length === 0) {
      $done({
        title: '热映电影',
        content:
          '未解析到影片（豆瓣页面结构可能变更或被拦截）。\n请检查 city 拼写或更新 scripts/movies.js。\n' +
          url,
        icon: 'film.fill',
        backgroundColor: '#8E44AD',
        url: url,
      });
      return;
    }

    var lines = [];
    for (var i = 0; i < titles.length && i < count; i++) {
      var sc = scores[i] === '0' ? '暂无' : scores[i];
      var ac = actors[i] ? actors[i].split(' / ').slice(0, 2).join('、') : '';
      lines.push(titles[i] + ' · ' + sc + (ac ? '\n  ' + ac : ''));
    }
    lines.push('\n城市 ' + city + ' · 豆瓣');

    $done({
      title: '热映 · ' + city,
      content: lines.join('\n'),
      icon: 'film.fill',
      backgroundColor: '#8E44AD',
      url: url,
    });
  }
);
