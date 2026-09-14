import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv, readFetchConfig, resolveOption } from './lib/env.mjs';
import { fetchJson } from './lib/http.mjs';
import { readData, writeData, mergeManual, formatDuration } from './lib/data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const STEAM_CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';
const STEAM_ID_BASE = 76561197960265728n;
const HIDDEN_FILE = 'games-hidden.json';

/** 读取"隐藏游戏"名单：不想出现在页面上的游戏填在这里 */
function readHidden(root) {
  try {
    const file = path.join(root, 'source', '_data', HIDDEN_FILE);
    if (!fs.existsSync(file)) return { ids: new Set(), titles: new Set() };
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      ids: new Set((json.ids || []).map(String)),
      titles: new Set((json.titles || []).map((t) => String(t).trim().toLowerCase()))
    };
  } catch (error) {
    console.warn(`  ! 读取 ${HIDDEN_FILE} 失败：${error.message}`);
    return { ids: new Set(), titles: new Set() };
  }
}

/**
 * Steam 的接口只认 17 位的 SteamID64。
 * 如果 .env 里填的是自定义网址（如 annansup）或旧的数字 ID，这里自动转换。
 */
async function resolveSteamId(raw, apiKey) {
  const value = String(raw || '').trim();
  if (/^\d{17}$/.test(value)) return value;
  if (/^\d+$/.test(value)) return (STEAM_ID_BASE + BigInt(value)).toString();

  console.log(`· STEAM_ID 填的是自定义网址「${value}」，正在解析成 SteamID64…`);
  const url =
    'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/' +
    `?key=${encodeURIComponent(apiKey)}&vanityurl=${encodeURIComponent(value)}`;
  const json = await fetchJson(url);
  const id = json.response && json.response.steamid;
  if (!id) {
    throw new Error(`解析失败（${json.response ? json.response.message : '未知错误'}），请确认自定义网址是否正确`);
  }
  console.log(`  ✓ SteamID64 = ${id}`);
  return id;
}

async function main() {
  const env = loadEnv(root);
  const config = readFetchConfig(root);
  const apiKey = resolveOption(env, 'STEAM_API_KEY', config.steam, 'api_key');
  const steamId = resolveOption(env, 'STEAM_ID', config.steam, 'steam_id');
  const max = Number(config.steam.max || 300);

  if (!apiKey || !steamId) {
    console.error(
      [
        '缺少 Steam 配置，先补上再运行：',
        '  1) 到 https://steamcommunity.com/dev/apikey 申请 API Key',
        '  2) 把 STEAM_API_KEY 和 STEAM_ID 写进根目录 .env（可参考 .env.example）',
        '  3) 重新执行 npm run fetch:steam'
      ].join('\n')
    );
    process.exitCode = 1;
    return;
  }

  console.log('· 正在读取 Steam 游戏库…');
  const steamId64 = await resolveSteamId(steamId, apiKey);
  const url =
    'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/' +
    `?key=${encodeURIComponent(apiKey)}&steamid=${encodeURIComponent(steamId64)}` +
    '&include_appinfo=1&include_played_free_games=1&format=json';

  const json = await fetchJson(url);
  const games = (json.response && json.response.games) || [];
  if (!games.length) {
    console.warn('  ! Steam 返回了空的游戏列表，请确认「游戏详情」隐私设置为公开。');
  }

  const hidden = readHidden(root);
  let hiddenCount = 0;

  const items = games
    .map((game) => {
      const hours = (game.playtime_forever || 0) / 60;
      const recent = (game.playtime_2weeks || 0) / 60;
      let status = '未开始';
      if (recent > 0) status = '在玩';
      else if (hours > 0) status = '已玩过';

      return {
        id: String(game.appid),
        title: game.name,
        cover: `${STEAM_CDN}/${game.appid}/library_600x900.jpg`,
        cover_fallback: `${STEAM_CDN}/${game.appid}/header.jpg`,
        url: `https://store.steampowered.com/app/${game.appid}`,
        rating: null,
        status,
        date: game.rtime_last_played
          ? new Date(game.rtime_last_played * 1000).toISOString().slice(0, 10)
          : '',
        meta: recent > 0 ? `游玩 ${formatDuration(hours)} · 最近两周 ${formatDuration(recent)}` : `游玩 ${formatDuration(hours)}`,
        total_hours: Number(hours.toFixed(1)),
        recent_hours: Number(recent.toFixed(1)),
        tags: [],
        comment: ''
      };
    })
    .filter((item) => {
      const isHidden = hidden.ids.has(item.id) || hidden.titles.has(item.title.trim().toLowerCase());
      if (isHidden) hiddenCount++;
      return !isHidden;
    })
    // 排序：最近两周在玩的排前面，其次按总时长
    .sort((a, b) => b.recent_hours - a.recent_hours || b.total_hours - a.total_hours)
    .slice(0, max);

  if (hiddenCount) console.log(`  · 按 ${HIDDEN_FILE} 隐藏了 ${hiddenCount} 款游戏`);

  const merged = mergeManual(readData(root, 'games'), items);
  writeData(root, 'games', 'Steam', merged);
}

main().catch((error) => {
  console.error(`抓取 Steam 失败：${error.message}`);
  process.exitCode = 1;
});
