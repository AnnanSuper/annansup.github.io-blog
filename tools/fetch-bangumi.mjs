import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, readFetchConfig, resolveOption } from './lib/env.mjs';
import { fetchJson } from './lib/http.mjs';
import { readData, writeData, mergeManual } from './lib/data.mjs';
import { downloadCover } from './lib/cover.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TYPE_MAP = { 1: '想看', 2: '看完', 3: '在看', 4: '搁置', 5: '抛弃' };

async function main() {
  const env = loadEnv(root);
  const config = readFetchConfig(root);
  const userId = resolveOption(env, 'BANGUMI_USER_ID', config.bangumi, 'user_id');
  const max = Number(config.bangumi.max || 300);
  const importComments = String(config.bangumi.import_comments) === 'true';

  if (!userId) {
    console.error(
      [
        '缺少 Bangumi 配置：',
        '  1) 打开你的主页 https://bgm.tv/user/xxxx，记下 xxxx',
        '  2) 把 BANGUMI_USER_ID=xxxx 写进根目录 .env',
        '  3) 重新执行 npm run fetch:bangumi'
      ].join('\n')
    );
    process.exitCode = 1;
    return;
  }

  console.log('· 正在读取 Bangumi 收藏（动画）…');
  const items = [];
  const pageSize = 50;

  for (let offset = 0; offset < max; offset += pageSize) {
    const url =
      `https://api.bgm.tv/v0/users/${encodeURIComponent(userId)}/collections` +
      `?subject_type=2&limit=${pageSize}&offset=${offset}`;
    let json;
    try {
      json = await fetchJson(url, {
        headers: {
          'User-Agent': 'shiguang-blog/1.0 (https://github.com/yourname/yourname.github.io)',
          Accept: 'application/json'
        }
      });
    } catch (error) {
      if (!items.length) throw error;
      console.warn(`  ! 第 ${offset / pageSize + 1} 页拉取失败，先写入已获取的数据：${error.message}`);
      break;
    }

    const list = json.data || [];
    if (!list.length) break;

    list.forEach((entry) => {
      const subject = entry.subject || {};
      const images = subject.images || {};
      const airDate = subject.date || '';
      const epTotal = subject.eps || subject.total_episodes || 0;
      items.push({
        id: String(subject.id || entry.subject_id),
        title: subject.name_cn || subject.name || '未知条目',
        original_title: subject.name || '',
        cover: images.large || images.common || images.medium || '',
        url: `https://bgm.tv/subject/${subject.id || entry.subject_id}`,
        rating: entry.rate ? Number(entry.rate) : null,
        public_rating: subject.score ? Number(subject.score) : null,
        status: TYPE_MAP[entry.type] || '未分类',
        date: (entry.updated_at || '').slice(0, 10),
        meta: [epTotal ? `${epTotal} 话` : '', airDate ? `${airDate} 开播` : ''].filter(Boolean).join(' · '),
        tags: [],
        comment: importComments ? entry.comment || '' : ''
      });
    });

    if (list.length < pageSize) break;
  }

  if (!items.length) {
    console.warn('  ! 没有取到任何收藏，请确认 Bangumi 主页是公开的。');
    return;
  }

  const merged = mergeManual(readData(root, 'anime'), items);

  console.log('· 正在把封面下载到本地…');
  const withCovers = [];
  let done = 0;
  for (const item of merged) {
    const cover = await downloadCover({
      url: item.cover,
      referer: 'https://bgm.tv/',
      root,
      subdir: 'bangumi',
      filename: String(item.id || item.title).replace(/[^\w-]/g, '_')
    });
    withCovers.push({ ...item, cover });
    done++;
    if (done % 20 === 0) console.log(`  …已处理 ${done}/${merged.length}`);
  }

  writeData(root, 'anime', 'Bangumi', withCovers);
}

main().catch((error) => {
  console.error(`抓取 Bangumi 失败：${error.message}`);
  process.exitCode = 1;
});
