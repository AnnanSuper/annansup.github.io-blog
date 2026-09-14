import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, readFetchConfig, resolveOption } from './lib/env.mjs';
import { fetchJson } from './lib/http.mjs';
import { readData, writeData, mergeManual } from './lib/data.mjs';
import { downloadCover } from './lib/cover.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* 豆瓣接口里三种状态的取值分别是 done / doing / mark（mark = 想看） */
const STATUS_MAP = { done: '看过', doing: '在看', mark: '想看' };
const STATUS_QUERY = ['done', 'doing', 'mark'];

function pickCover(pic) {
  if (!pic) return '';
  if (typeof pic === 'string') return pic;
  return pic.large || pic.normal || pic.medium || '';
}

/**
 * 豆瓣没有公开 API，这里使用移动端页面用到的接口。
 * 未登录时只能拿到少量数据，配置 DOUBAN_COOKIE 后可以完整抓取。
 */
async function fetchInterests(userId, status, cookie, max, importComments) {
  const items = [];
  const pageSize = 50;
  for (let start = 0; start < max; start += pageSize) {
    const url =
      `https://m.douban.com/rexxar/api/v2/user/${encodeURIComponent(userId)}/interests` +
      `?type=movie&status=${status}&start=${start}&count=${pageSize}`;
    const json = await fetchJson(url, {
      headers: {
        Referer: `https://m.douban.com/people/${userId}/`,
        Accept: 'application/json, text/plain, */*',
        ...(cookie ? { Cookie: cookie } : {})
      }
    });
    const list = json.interests || json.items || [];
    if (!list.length) break;
    list.forEach((entry) => {
      const subject = entry.subject || entry;
      const rating = entry.rating && entry.rating.value ? Number(entry.rating.value) : null;
      const meta = subject.card_subtitle || '';
      items.push({
        id: String(subject.id || entry.id || subject.url || ''),
        title: subject.title || '未知条目',
        original_title: subject.original_title || '',
        cover: pickCover(subject.pic || subject.cover_url || subject.cover),
        url: subject.url || `https://movie.douban.com/subject/${subject.id}/`,
        rating,
        public_rating: subject.rating && subject.rating.value ? Number(subject.rating.value) : null,
        // 用条目自己返回的 status 打标签，比按请求参数更准
        status: STATUS_MAP[entry.status] || STATUS_MAP[status] || '未分类',
        date: (entry.create_time || entry.update_time || '').slice(0, 10),
        meta,
        tags: subject.genres || [],
        comment: importComments ? entry.comment || '' : ''
      });
    });
    if (list.length < pageSize) break;
  }
  return items;
}

async function main() {
  const env = loadEnv(root);
  const config = readFetchConfig(root);
  const userId = resolveOption(env, 'DOUBAN_USER_ID', config.douban, 'user_id');
  const cookie = resolveOption(env, 'DOUBAN_COOKIE', config.douban, 'cookie');
  const max = Number(config.douban.max || 300);
  const importComments = String(config.douban.import_comments) === 'true';

  if (!userId) {
    console.error(
      [
        '缺少豆瓣配置：',
        '  1) 打开你的豆瓣主页 https://movie.douban.com/people/xxxx/，记下 xxxx',
        '  2) 把 DOUBAN_USER_ID=xxxx 写进根目录 .env',
        '  3) 想抓全量列表的话，再从浏览器复制 douban.com 的 Cookie 填到 DOUBAN_COOKIE',
        '  4) 重新执行 npm run fetch:douban'
      ].join('\n')
    );
    process.exitCode = 1;
    return;
  }

  console.log('· 正在读取豆瓣电影收藏…');
  const collected = new Map();
  for (const status of STATUS_QUERY) {
    try {
      const list = await fetchInterests(userId, status, cookie, max, importComments);
      console.log(`  - ${STATUS_MAP[status]}：${list.length} 条`);
      list.forEach((item) => {
        if (!collected.has(item.id)) collected.set(item.id, item);
      });
    } catch (error) {
      console.warn(`  ! ${STATUS_MAP[status]} 列表抓取失败：${error.message}`);
    }
  }

  const collectedList = [...collected.values()];

  if (!collectedList.length) {
    console.warn(
      [
        '  ! 没有取到数据。豆瓣对未登录请求限制比较严，可以：',
        '    a) 在 .env 里配置 DOUBAN_COOKIE 后重试；',
        '    b) 或者直接手工编辑 source/_data/movies.json 维护这个列表。'
      ].join('\n')
    );
    return;
  }

  const merged = mergeManual(readData(root, 'movies'), collectedList);

  console.log('· 正在把海报下载到本地（豆瓣图床有防盗链，外链会被拒）…');
  const withCovers = [];
  let done = 0;
  for (const item of merged) {
    const cover = await downloadCover({
      url: item.cover,
      referer: 'https://movie.douban.com/',
      root,
      subdir: 'douban',
      filename: String(item.id || item.title).replace(/[^\w-]/g, '_')
    });
    withCovers.push({ ...item, cover });
    done++;
    if (done % 20 === 0) console.log(`  …已处理 ${done}/${merged.length}`);
  }

  writeData(root, 'movies', '豆瓣', withCovers);
}

main().catch((error) => {
  console.error(`抓取豆瓣失败：${error.message}`);
  process.exitCode = 1;
});
