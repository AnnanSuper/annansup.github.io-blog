# 梦鸼 · 个人博客

一个基于 **Hexo** 的个人博客，视觉风格参考 [xmdblog.com](https://www.xmdblog.com/)（安知鱼主题）。
主题「拾光」是为这个站点手写的，没有依赖任何外部主题或前端框架，样式、图标、脚本全部在本地。

> 👉 **只想改内容、不想看技术细节？直接看根目录的 [`使用说明.md`](使用说明.md)，那里是一份小白版操作手册。**

包含：

- 写作：Markdown 写文章，支持自定义分类归档、目录、站内搜索
- 游戏库 / 电影 / 动漫：三个收藏页面，可从 Steam、豆瓣、Bangumi 抓取数据
- 关于我（含友情链接）：自我介绍 + 网易云音乐、哔哩哔哩、Steam、Bangumi 卡片 + 朋友链接
- 左下角音乐播放器：把 mp3 丢进 `source/music/` 即可，可播放 / 暂停 / 停止 / 下一首，一首放完自动循环下一首
- 站内切页不整页刷新（PJAX 局部刷新），所以换页面时音乐不会断
- 深浅色模式、响应式布局（手机 / 平板 / 桌面）
- 配色取自**中国传统色**，站点 Logo 使用 SOS 团标志
- 鼠标交互：按钮变色、卡片上浮、点击水波纹、跟手柔光、横幅轻微倾斜

---

## 一、跑起来（验收）

```bash
npm install          # 首次运行，安装依赖
npm run server       # 启动本地预览
```

然后打开 <http://localhost:4000>。改文件会自动刷新，按 `Ctrl + C` 停止。

其它常用命令：

| 命令 | 作用 |
| --- | --- |
| `npm run server` | 本地预览（推荐用这个验收） |
| **`npm run deploy`** | **发布上线**（推送到 GitHub，自动触发部署） |
| `npm run deploy -- "说明"` | 发布并附上提交说明 |
| `npm run build` | 生成静态文件到 `public/` |
| `npm run clean` | 清空缓存和 `public/` |
| `npm run new -- "标题" "分类"` | 新建一篇文章 |
| `npm run fetch` | 抓取 Steam / Bangumi / 豆瓣数据 |

### 建议按这个顺序验收

1. 打开首页 <http://localhost:4000>，看横幅、文章卡片、右侧个人信息与统计
2. 点右上角的月亮图标，切换深浅色
3. 打开一篇文章，看正文排版、右侧目录、版权声明、上一篇/下一篇
4. 打开「生涯 → 游戏 / 电影 / 动漫」，试试点筛选、搜索框和排序
5. 打开「关于」，看自我介绍 + 四个平台卡片 + 友链
6. 按 `Ctrl + K`（或点搜索图标）试试站内搜索
7. **鼠标划过顶部「文章」**，会展开「全部文章 + 你的全部分类」
8. **鼠标划过横幅上那四个图标按钮**，被指到的那个会变长并露出文字，其他三个收起
9. 鼠标划过导航按钮、文章卡片、分类条，看变色 / 上浮 / 水波纹 / 柔光跟手
10. 点左下角的圆形按钮，听一下音乐（按歌单顺序循环播放，你自己的音乐已经放进去了）
11. 把浏览器窗口拉窄，看手机端布局

> 收藏页现在是**你自己的真实数据**：游戏来自 Steam、电影来自豆瓣、动漫来自 Bangumi。
> 想更新时执行 `npm run fetch`，详见第四节。

---

## 二、改哪些字就能变成你的站点

### 1. 全站信息：根目录 `_config.yml`

```yaml
title: 梦鸼                # 站点名
subtitle: 写作 · 游戏 · 电影 · 动漫
description: 一句话介绍
author: 梦鸼               # 你的名字
url: https://annansup.com  # 自定义域名，会影响 RSS 和分享链接
root: /                    # 用自定义域名时必须是 /
```

### 2. 主题样式与菜单：`themes/shiguang/_config.yml`

- `menu`：顶部导航（支持二级菜单）
- `banner`：首页横幅的标题、副标题、三个彩色按钮、推荐文章数量
- `notice`：顶部公告
- `author_card`：右侧个人名片，**网易云 / B 站 / Steam / Bangumi 的链接就填在这里**
- `logo`：导航栏左侧的 Logo（默认是 img/logo.png，也就是你给的 SOS 团标志）
- `music`：左下角播放器（`enable` 开关、音量、也可以直接写外链歌单）
- `effects`：鼠标特效开关（跟手柔光 / 横幅倾斜 / 点击水波纹）
- `footer`：页脚链接分组和备案号
- `comments`：评论系统（默认关闭，支持 giscus / Twikoo / Waline）

### 3. 换头像和默认封面

替换 `themes/shiguang/source/img/` 下的文件即可：

| 文件 | 用途 |
| --- | --- |
| `logo.png` | 导航栏左上角的站点标志（SOS 团，已做好透明底） |
| `favicon.png` | 浏览器标签页小图标 |
| `avatar.svg` | 头像（也可以换成 `avatar.jpg`，记得同步改主题配置里的路径） |
| `cover-default.svg` | 文章没有单独封面时的默认图 |
| `cover-writing.svg` 等 | 示例文章用的几张封面（写作 / 游戏 / 电影 / 动漫 / 随笔） |

### 4. 换配色

全站配色集中在 `themes/shiguang/source/css/style.css` 最上面的 `:root` 里，
取色来自你给的中国传统色配色卡：

| 变量 | 颜色 | 用在哪 |
| --- | --- | --- |
| `--main` | 靛青 `#216e99` | 主色：按钮、链接、选中态 |
| `--main-deep` | 藏青 `#1b5374` | 渐变深色、横幅背景 |
| `--accent` | 朱砂 `#c6452b` | 强调色、播放中的按钮 |
| `--plum` | 苏梅 `#bc718d` | 呼应 Logo 的品红 |
| `--matcha` | logo 绿 `#8fb133` | 点缀色 |
| `--bg` / `--card-bg` | 月白 `#eef2f7` / 白 | 页面底色与卡片 |
| `--font` | 墨色 `#33302e` | 正文字色 |

深色模式用的是玄色 `#16161a` + 鸦青 `#1e1e24`，改 `html[data-theme='dark']` 里那一段即可。

### 5. 放音乐

把 mp3（也支持 m4a / ogg / wav / flac）复制到 `source/music/`，重启预览就行：

```bash
# 举例
copy D:\我的歌\*.mp3 D:\网站\source\music\
npm run server
```

左下角（导航栏）按钮点一下开始播放，**按歌单顺序循环**：第一首放完自动接第二首，最后一首放完回到第一首。
鼠标移上去会出现「下一首」小按钮。想改成随机播放，把主题配置 `themes/shiguang/_config.yml`
里的 `music.shuffle` 设成 `true`；音量在同处的 `music.volume`（0~1）。
文件名会作为歌曲名显示，所以建议写成「歌手 - 歌名.mp3」。
音乐文件放在 `source/music/`，加完重启预览就会出现在播放器里。

---

## 三、写文章

```bash
npm run new -- "今天想说的话" "随笔"
#             ↑标题            ↑分类
```

会在 `source/_posts/随笔/日期-今天想说的话.md` 生成文件，并自动建好同名的配图文件夹（图片丢进去用 `![](图片名.png)` 引用）。

文章开头可以写的字段（**标签功能已按需求移除，不再需要 `tags`**）：

```yaml
---
title: 文章标题
date: 2026-09-14 21:30:00
categories: 随笔          # 分类（"文章"菜单、首页分类条、归档都按它分）
cover: /img/cover-default.svg   # 列表和文章页头图
featured: true                  # 是否出现在首页横幅的推荐位
excerpt: 列表卡片上显示的一句话摘要
---
```

分类是跟着文件夹走的：在 `source/_posts/` 里新建一个文件夹（比如 `读书笔记`），
把文章放进去、`categories` 写成同名即可，顶部「文章」菜单会**自动**多出这一项。

写完后 `npm run server` 立刻就能看到效果。

---

## 四、让收藏页显示你的真实数据

复制 `.env.example` 为 `.env`，按需填写（`.env` 不会被提交到 git）：

```ini
# Steam：https://steamcommunity.com/dev/apikey 申请 Key，SteamID 可用 https://steamid.io/ 查
STEAM_API_KEY=
STEAM_ID=

# Bangumi：打开 https://bgm.tv/user/xxxx 里的 xxxx
BANGUMI_USER_ID=

# 豆瓣：打开 https://movie.douban.com/people/xxxx/ 里的 xxxx
DOUBAN_USER_ID=
# 豆瓣未登录只能拿到很少的数据，建议从浏览器复制 douban.com 的 Cookie
DOUBAN_COOKIE=

# 如果 Steam / Bangumi 连不上，可以填本机代理
# HTTPS_PROXY=http://127.0.0.1:7890
```

然后：

```bash
npm run fetch            # 三个一起抓
npm run fetch:steam      # 也可以单独抓
npm run fetch:bangumi
npm run fetch:douban
```

数据会写进 `source/_data/games.json`、`movies.json`、`anime.json`，页面直接读本地文件，
所以**接口挂了、限流了都不影响网站速度**。

几个注意点：

- **封面图会下载到本地**：豆瓣和 Bangumi 的图床都有防盗链（直接外链会被返回 418），
  所以脚本会把海报下载到 `source/img/covers/` 再从页面本地引用。Steam 的封面可以直接外链，保持原样
- Steam 需要把「游戏详情」隐私设置为公开，否则接口返回空列表
- 豆瓣没有公开 API，用的是移动端接口，风控比较严；抓不到时也可以直接手工编辑 `source/_data/movies.json`
- 手工在 JSON 里补的 `rating`（你的评分）、`comment`（短评）、`tags` 会在下次抓取时被保留
- 抓取完建议 `npm run clean && npm run build` 重新生成

### 收藏条目的字段

```json
{
  "id": "唯一 id",
  "title": "标题",
  "original_title": "原名（可留空）",
  "cover": "封面图地址（留空则显示彩色占位图）",
  "url": "点击跳转的地址",
  "rating": 9.2,            // 你的评分，决定卡片右下角的星星
  "public_rating": 8.6,     // 平台评分，显示在标题下方
  "status": "看完",          // 决定筛选按钮的分组
  "date": "2026-08-10",     // 用于"按时间"排序
  "meta": "28 话 · 2023 年 10 月",
  "tags": ["奇幻", "冒险"],
  "comment": "一句话短评"
}
```

---

## 五、加朋友链接（在「关于」页面）

编辑 `source/_data/links.json`：

```json
{
  "friends": [
    {
      "name": "朋友的站名",
      "url": "https://example.com",
      "avatar": "/img/friends/朋友头像.png",
      "desc": "一句话介绍"
    }
  ]
}
```

**头像建议下载到本地**，放进 `source/img/friends/`，然后 `avatar` 写 `/img/friends/文件名`。
直接填别人网站的图片地址通常会被防盗链拦掉，显示成破图。不填 `avatar` 则使用默认头像 `/img/avatar.svg`。

JSON 格式很严格：引号必须是英文 `"`，条目之间要有逗号、最后一条后面不要有逗号。
写错了友链会整块消失，可以用 <https://jsonlint.com> 校验。

友链页里「我的主页」那几张卡片读取的是主题配置里的社交链接（`themes/shiguang/_config.yml` →
`author_card.social`），改一处就够了。

> 面向小白的逐步操作见 [`使用说明.md`](使用说明.md) 第 2 节。

---

## 六、目录结构

```text
D:\网站
├── _config.yml              # 站点配置（站点名、作者、域名、抓取参数…）
├── .env.example             # 抓取用的账号模板（复制成 .env 使用）
├── 使用说明.md               # 小白版操作手册（发文章 / 改信息 / 换音乐）
├── source/
│   ├── _posts/              # 文章（按分类分文件夹）
│   ├── _data/               # 收藏与友链数据（JSON）
│   ├── music/               # 放 mp3，左下角播放器会自动扫描
│   ├── img/covers/          # 抓取时自动下载的封面图（本地引用，避免防盗链）
│   ├── about/ games/ movies/ anime/         # 独立页面（关于页里含友链）
│   └── 404.md
├── themes/shiguang/         # 主题：拾光
│   ├── _config.yml          # 主题配置（菜单、横幅、社交链接、页脚…）
│   ├── layout/              # EJS 模板
│   └── source/              # css / js / img
├── scripts/                 # Hexo 插件（图标、字数统计、搜索索引）
└── tools/                   # publish.mjs（一键发布）+ 抓取脚本 + 新建文章脚本
```

---

## 七、部署上线

**当前站点已经上线：<https://annansup.com>**

架构：`npm run deploy` → 推送到 GitHub → GitHub Actions 自动构建 → GitHub Pages 发布。

```
本地改动  →  npm run deploy  →  GitHub Actions  →  https://annansup.com
                             （约 1 分钟）
```

### 关键配置（一般不需要动）

| 位置 | 值 | 说明 |
| --- | --- | --- |
| `_config.yml` → `url` | `https://annansup.com` | 影响 RSS、canonical、分享链接 |
| `_config.yml` → `root` | `/` | **用自定义域名时必须是 `/`**，否则全站链接会带错前缀导致 404 |
| `source/CNAME` | `annansup.com` | 告诉 GitHub Pages 用哪个域名 |
| `.github/workflows/deploy.yml` | — | push 到 `main` 自动部署 |
| `_config.yml` → `deploy.repo` | 空 | 走 Actions，不用 `hexo deploy` |

DNS（在腾讯云 DNSPod 配置）：`@` 指向 `185.199.108.153` 和 `185.199.109.153`，
`www` CNAME 指向 `annansuper.github.io`。HTTPS 证书由 GitHub 自动申请和续期。

> **`npm run deploy` 做的是 `tools/publish.mjs`**，它处理了三件容易踩坑的事：
> 中文提交信息乱码、自动探测本机 Clash 代理、找不到 `git` 时回退到便携版路径。
> 没有它的话，在 PowerShell 里直接 `git commit -m "中文"` 提交信息会变成乱码。

### 部署失败怎么查

打开 <https://github.com/AnnanSuper/annansup.github.io-blog/actions> 看运行记录，
红色 ✗ 就是失败。特别注意：**`GITHUB_TOKEN` 无法创建 Pages 站点**（`configure-pages` 的
`enablement: true` 会报 `Resource not accessible by integration`），
所以 Pages 必须先在仓库 Settings → Pages → Source 选 `GitHub Actions` 手工开启一次，之后才永久可用。

### 想换到别的托管

生成的是纯静态文件，扔到任何静态托管都能跑：

```bash
npm run clean && npm run build     # 产物在 public/
```

- **Vercel / Netlify**：连接仓库，构建命令 `npm run build`，输出目录 `public`
- **自己的服务器**：把 `public/` 里的文件传到网站根目录（宝塔、Nginx 均可）

---

## 八、常见问题

**Q：`npm run server` 提示端口被占用？**
换个端口：`npx hexo server -p 4001`。

**Q：执行了 `npm run deploy`，但 https://annansup.com 上还是旧的？**
部署需要时间，先等 1～2 分钟，然后 `Ctrl + F5` 强制刷新（普通刷新可能读到缓存）。
仍然没变就去 [Actions 页面](https://github.com/AnnanSuper/annansup.github.io-blog/actions) 看运行记录，
红色 ✗ 表示构建失败。

**Q：`npm run deploy` 报找不到 `git` 命令？**
关掉 PowerShell 重开一个（PATH 需要新窗口才生效）。发布脚本本身在找不到 `git` 时会回退到
`%LOCALAPPDATA%\PortableTools\MinGit\cmd\git.exe`。

**Q：`npm run deploy` 推送超时？**
先确认 Clash 代理开着，脚本会自动探测 `127.0.0.1:7890`。

**Q：抓取的命令报 `fetch failed`？**
通常是网络问题：Steam / Bangumi 的接口在国内有时连不上，在 `.env` 里配置 `HTTPS_PROXY` 后重试。

**Q：收藏页的数据怎么更新？**
执行 `npm run fetch`（或 `npm run fetch:steam` / `fetch:bangumi` / `fetch:douban` 单独抓）。
抓取需要先开代理，脚本会自动探测本机常见代理端口；成功后 `source/_data/*.json` 里的 `demo` 会变成 `false`。

**Q：想换主题配色？**
打开 `themes/shiguang/source/css/style.css`，改最上面的 `--main`（默认 `#425aef`）和 `--bg` 即可，全站颜色都跟着变。

**Q：左下角播放器点了没声音？**
按这个顺序排查：

1. 歌单是异步加载的，**刚进页面立刻点是没反应的**——现在会显示「歌单加载中…」，加载完自动开始播。
   留意导航栏有没有出现歌名：歌名出现 = 在播，那就是音量问题
2. 音量：主题配置 `music.volume` 默认 **0.7**（0~1），可以调到 0.9 或 1；同时检查系统音量和输出设备
3. **提示「这首歌加载不出来——多半是网络不通」**：音乐文件托管在 GitHub Pages，
   不开代理时国内经常拉不下来。**打开 Clash 后刷新重试**。这是最常见的原因
4. 提示「浏览器拦住了自动播放」才是真的被浏览器拦截，**再点一次按钮**即可
5. 确认 `source/music/` 里确实有音频文件（放进去后要重启一次 `npm run server` 重新生成歌单）
6. 提示「解码失败」才是文件本身损坏或文件名含特殊字符

> 实现细节：`play()` 的 reject 原因要分开处理——网络拉不到音源时浏览器报的是
> `NotSupportedError` + `audio.error.code === 4`（MEDIA_ERR_SRC_NOT_SUPPORTED），
> 只有 `NotAllowedError` 才是自动播放被拦。**不能一律提示「浏览器拦截」**，
> 那会把网络问题误导成浏览器设置问题。

**Q：想让音乐随机播放？**
主题配置 `themes/shiguang/_config.yml` 里把 `music.shuffle` 设成 `true`（默认 `false` = 按歌单顺序循环）。

**Q：不想要鼠标动效 / 播放器？**
在 `themes/shiguang/_config.yml` 里把 `effects.enable` 或 `music.enable` 改成 `false` 即可。
