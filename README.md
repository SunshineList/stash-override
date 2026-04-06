# 🗂️ Stash 磁贴合集

[![GitHub Repo](https://img.shields.io/badge/GitHub-SunshineList%2Fstash--override-24292f?logo=github)](https://github.com/SunshineList/stash-override)

一组给 [**Stash**](https://stash.wiki/) 首页 **Tile（磁贴）** 用的覆写配置：**尽量不用第三方数据平台的 API Key**，脚本从公开接口或公开页面拉数据，用 **raw 链接** 即可订阅。

**本仓库**：<https://github.com/SunshineList/stash-override>  

---

## ✨ 你能得到什么

- 📱 **十余个磁贴**：天气、汇率、热榜、电影、油价、必应壁纸、维基「历史上的今天」、一言、加密货币、地震、HN、空气质量、ISS、农历与法定假日等  
- 🔓 **无 Key 优先**：无需去天行、聚合数据等平台注册 Key（个别数据源有免费额度限制，见下表）  
- 🧩 **单文件脚本**：每个功能一个 `scripts/*.js`，配合 `stoverride/*.stoverride` 单独订阅或一键 `all-tiles`  
- 🤖 **农历自动构建**：改 `lunar-holiday-tail.js` 后由 **GitHub Actions** 拼出 `lunar-holiday.js`，不必本机跑脚本  

---

## 🚀 快速开始（已指向本仓库）

1. 📲 打开 Stash → **覆写 / Override** → **添加**，填入下面任一 **raw** 地址（默认分支 `main`）：  
   - 🎯 **合集（推荐）**：<https://raw.githubusercontent.com/SunshineList/stash-override/main/stoverride/all-tiles.stoverride>  
   - 🌤️ 仅天气：<https://raw.githubusercontent.com/SunshineList/stash-override/main/stoverride/weather.stoverride>  
   - （其余单磁贴见 [`stoverride/`](stoverride/) 目录内同名 `.stoverride`）  
2. 🔄 首页下拉刷新磁贴；若某国内站走代理异常，可在规则里对相关域名尝试 **DIRECT**。  
3. 🍴 **Fork 自建**：复制本仓库后，请把 `stoverride/` 里所有 `raw.githubusercontent.com/SunshineList/stash-override/` 改成你的 `用户名/仓库名`。  

---

## 📁 目录结构

```text
stash/
├── README.md
├── .gitignore
├── .github/
│   └── workflows/
│       └── lunar-holiday.yml     🤖 CI：自动拼接 lunar-holiday.js
├── scripts/
│   ├── *.js                      📜 各磁贴逻辑（Stash 远程加载）
│   ├── lunar-holiday.js          📦 构建产物（CI 或本地生成后提交）
│   ├── lunar-holiday-tail.js     ✏️ 农历·假日业务代码（主要改这个）
│   ├── build-lunar-holiday.sh
│   └── vendor/
│       └── solarlunar.min.js     📚 npm solarlunar UMD（见致谢）
└── stoverride/
    ├── *.stoverride              📋 单磁贴订阅
    └── all-tiles.stoverride      🎯 合集订阅
```

---

## 🌙 农历磁贴（CI 构建）

| 步骤 | 说明 |
|------|------|
| 1️⃣ | 编辑 `scripts/lunar-holiday-tail.js` 或替换 `scripts/vendor/solarlunar.min.js` |
| 2️⃣ | `git push` 到 **`main` / `master`**（或手动跑 **Actions → Lunar holiday bundle → Run workflow**） |
| 3️⃣ | Workflow 执行 `build-lunar-holiday.sh`，如有变化会自动提交 `scripts/lunar-holiday.js` |
| 🧪 | 可选本地自检：`bash scripts/build-lunar-holiday.sh` |

> ⚠️ 仓库需在 GitHub **Settings → Actions → General** 中为 Workflow 开启 **Read and write**，否则 bot 无法推送构建提交。

---

## 🧩 磁贴一览

| 脚本 | 数据源 | argument 示例 | 备注 |
|------|--------|---------------|------|
| `weather.js` | Open-Meteo | `city=Beijing` / `lat=&lon=` | 城市建议英文 |
| `rates.js` | Frankfurter | `from=USD&to=CNY,EUR` | ECB 口径 |
| `hot-search.js` | TopHub | `platform=微博&count=8` | 移动页解析 |
| `movies.js` | 豆瓣正在上映 | `city=beijing` | 小写城市段 |
| `oil.js` | GlobalPetrolPrices | — | 全国统计口径 |
| `bing-wallpaper.js` | Bing | `idx=0&mkt=zh-CN` | 日图 |
| `on-this-day.js` | Wikimedia | `lang=zh&count=6` | 历史上的今天 |
| `hitokoto.js` | 一言 | `c=d&max=120` | 分类可空 |
| `crypto.js` | CoinGecko | `ids=bitcoin&vs=cny` | ⚠️ 注意限速 |
| `earthquakes.js` | USGS | `feed=4.5` | GeoJSON |
| `hn-front.js` | hnrss | `count=8` | 可换 `url=` |
| `air-quality.js` | Open-Meteo AQI | `city=Beijing` | US AQI 等 |
| `iss-tracker.js` | wheretheiss.at | — | ISS 位置 |
| `lunar-holiday.js` | solarlunar + Nager | `upcoming=6` | 见上节 |

**农历·假日补充**：农历由 **solarlunar** 本地推算；假日列表来自 **Nager.Date**（`CN`），**与国务院调休、补班不一定完全一致**，重要安排请以官方通知为准。脚本含 `const`/`let`，需较新 JS 引擎（一般 Stash 环境无压力）。

---

## 🛠️ 封装约定

- 各脚本内使用相同的 **`parseArgs`** 解析 `$argument`（兼容旧环境，未用 `Object.fromEntries`）。  
- 改解析逻辑时请 **多文件同步**（含 `lunar-holiday-tail.js`）。  
- 网页解析处用 `// --- parse: ... ---` 标注，方便以后改正则。  
- 磁贴里的 **`icon`** 为 **SF Symbols** 名称，与 Stash 文档一致。  

---

## 💡 还能扩展的方向

- 📰 任意 **RSS**（仿 `hn-front.js`）  
- 🚇 本地 **地铁 / 限行 / 机场**（依赖城市开放数据）  
- 📜 仓库内自建 **JSON** 诗词 / 金句  
- 🛰️ **NASA APOD**（官方 `DEMO_KEY`，有每日限额）  

---

## 🙏 致谢与引用

本仓库能做成，离不开下列项目、服务与作者的开放数据或开源作品（排名不分先后）。若仅用于个人浏览资讯，也请遵守各站 **服务条款** 与 **许可协议**。

| 类型 | 项目 / 服务 | 说明 |
|------|-------------|------|
| 🧭 客户端 | [**Stash**](https://stash.wiki/) | iOS 客户端与 [Tile 脚本说明](https://stash.wiki/en/script/tile) |
| 🌤️ 天气 / AQI | [**Open-Meteo**](https://open-meteo.com/) | 预报、地理编码、空气质量等，无 Key |
| 💱 汇率 | [**Frankfurter**](https://www.frankfurter.app/) | ECB 参考汇率 |
| 📊 热榜 | [**TopHub / 今日热榜**](https://tophub.today/) | 公开页面解析；节点 ID 思路参考社区脚本 |
| 🎬 电影 | [**豆瓣电影**](https://movie.douban.com/) | 正在上映页结构化字段解析（勿高频抓取） |
| ⛽ 油价参考 | [**GlobalPetrolPrices.com**](https://www.globalpetrolprices.com/) | 中文页 meta 中的统计口径说明 |
| 🖼️ 壁纸 | **Microsoft Bing** | `HPImageArchive` 公开 JSON |
| 📖 今日史 | [**Wikimedia**](https://api.wikimedia.org/) | On This Day Feed API |
| 📅 公共假日 | [**Nager.Date**](https://date.nager.at/) | 中国公共假日日历数据（与调休未必一致） |
| 💬 一言 | [**Hitokoto**](https://hitokoto.cn/) | 开放接口 |
| 🪙 行情 | [**CoinGecko**](https://www.coingecko.com/) | 免费 API（请控制频率） |
| 🌍 地震 | [**USGS**](https://earthquake.usgs.gov/) | 地震 GeoJSON Feed |
| 📰 HN | [**hnrss.org**](https://hnrss.org/) | Hacker News RSS 聚合 |
| 🛰️ ISS | [**wheretheiss.at**](https://wheretheiss.at/) | ISS 轨道 JSON API |
| 🌙 农历库 | [**solarlunar**](https://www.npmjs.com/package/solarlunar)（[**yize**](https://github.com/yize/solarlunar)，ISC） | `3.x` UMD 置于 `scripts/vendor/` |
| 📚 社区参考 | [**deezertidal/Surge_Module**](https://github.com/deezertidal/Surge_Module) | 早期 `hotoday.js` / `movie.js` 等思路参考 |
| 🤖 自动化 | [**GitHub Actions**](https://github.com/features/actions) | 农历 bundle 自动构建与提交 |
| 🎨 图标 | **Apple SF Symbols** | 磁贴 `icon` 字段所用符号名 |

向以上项目维护者与数据提供方致以谢意。 ❤️

---

## ⚖️ 免责声明

- 数据均为 **第三方提供**，不保证实时、准确或长期可用；页面结构或接口变更时，需自行更新脚本。  
- **`solarlunar.min.js`** 以 npm 包 **ISC** 许可为准；其他数据源的版权与使用条件以其官网为准。  
- 本仓库仅供学习与交流；请勿用于侵犯他人权益或违反当地法律的用途。  

---

**⭐ 若本仓库对你有帮助，欢迎 Star；修好了某个失效磁贴，也欢迎 PR 分享给其他人。**
