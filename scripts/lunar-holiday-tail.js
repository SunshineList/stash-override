/**
 * Stash 磁贴：公历/农历与法定节假日（接在 vendor/solarlunar.min.js 之后拼接）
 * 节假日数据源: https://date.nager.at/ (CN, 无 Key)
 * solarlunar: npm solarlunar@3.1.0 ISC (c) yize — 见文件前半部分
 * lastVerified: 2026-04-06
 *
 * 构建: bash scripts/build-lunar-holiday.sh
 *
 * argument:
 *   upcoming=6   显示下几条即将到来的法定假日
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

function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

var params = parseArgs(typeof $argument !== 'undefined' ? $argument : '');
var upcomingN = parseInt(params.upcoming, 10) || 6;
if (upcomingN > 15) upcomingN = 15;

var now = new Date();
var y = now.getFullYear();
var mo = now.getMonth() + 1;
var da = now.getDate();
var todayStr = y + '-' + pad2(mo) + '-' + pad2(da);

var lunar = typeof solarLunar !== 'undefined' ? solarLunar.solar2lunar(y, mo, da) : null;
if (!lunar || lunar === -1) {
  $done({
    title: '🌙 农历·假日',
    content: '⚠️ 农历库未加载（请使用构建后的 lunar-holiday.js）。',
    icon: 'calendar',
    backgroundColor: '#6D4C41',
  });
} else {
  var lunarLines = [];
  lunarLines.push('📅 公历 ' + y + '年' + mo + '月' + da + '日 ' + (lunar.ncWeek || ''));
  var lm = (lunar.isLeap ? '闰' : '') + (lunar.monthCn || '') + (lunar.dayCn || '');
  lunarLines.push('🌙 农历 ' + lm);
  lunarLines.push('☯️ 干支 ' + (lunar.gzYear || '') + '年 ' + (lunar.gzMonth || '') + '月 ' + (lunar.gzDay || '') + '日');
  if (lunar.animal) lunarLines.push('🐲 生肖 ' + lunar.animal);
  if (lunar.isTerm && lunar.term) lunarLines.push('🌾 节气 ' + lunar.term);
  lunarLines.push('');

  function fetchHolidays(year, cb) {
    $httpClient.get(
      {
        url: 'https://date.nager.at/api/v3/PublicHolidays/' + year + '/CN',
        headers: { 'User-Agent': 'StashTile/1.0' },
      },
      cb
    );
  }

  fetchHolidays(y, function (e1, r1, b1) {
    var listA = [];
    if (!e1 && b1) {
      try {
        listA = JSON.parse(b1);
      } catch (x) {
        listA = [];
      }
    }

    fetchHolidays(y + 1, function (e2, r2, b2) {
      var listB = [];
      if (!e2 && b2) {
        try {
          listB = JSON.parse(b2);
        } catch (x2) {
          listB = [];
        }
      }

      var all = [];
      for (var a = 0; a < listA.length; a++) all.push(listA[a]);
      for (var b = 0; b < listB.length; b++) all.push(listB[b]);

      var todayNote = '';
      var todayName = '';
      for (var t = 0; t < all.length; t++) {
        if (all[t] && all[t].date === todayStr) {
          todayName = all[t].localName || all[t].name || '';
          break;
        }
      }
      if (todayName) todayNote = '🎉 今日法定假日：' + todayName + '\n\n';

      var holLines = ['🗓️ ── 即将到来 ──'];
      if (all.length === 0) {
        holLines.push('❌ 假日数据获取失败（请检查网络）');
      } else {
        var fut = [];
        for (var i = 0; i < all.length; i++) {
          var h = all[i];
          if (!h || !h.date) continue;
          if (h.date <= todayStr) continue;
          fut.push(h);
        }
        fut.sort(function (p, q) {
          return p.date.localeCompare(q.date);
        });
        var seen = {};
        var added = 0;
        for (var j = 0; j < fut.length && added < upcomingN; j++) {
          var item = fut[j];
          if (seen[item.date]) continue;
          seen[item.date] = 1;
          holLines.push('📌 ' + item.date + '  ' + (item.localName || item.name || ''));
          added++;
        }
        if (added === 0) holLines.push('😶 年内暂无更晚的法定假日条目');
      }

      holLines.push('');
      holLines.push('📡 假日 Nager.Date · 🌙 农历 solarlunar@3.1.0');

      $done({
        title: '🌙 农历 · 法定假日',
        content: todayNote + lunarLines.join('\n') + holLines.join('\n'),
        icon: 'calendar',
        backgroundColor: '#6D4C41',
        url: 'https://www.timeanddate.com/holidays/china/',
      });
    });
  });
}
