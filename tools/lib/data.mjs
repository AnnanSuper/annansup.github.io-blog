import fs from 'node:fs';
import path from 'node:path';

export function dataFile(root, key) {
  return path.join(root, 'source', '_data', `${key}.json`);
}

export function readData(root, key) {
  const file = dataFile(root, key);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.warn(`  ! 读取 ${key}.json 失败：${error.message}`);
    return null;
  }
}

export function writeData(root, key, source, items) {
  const file = dataFile(root, key);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const payload = {
    source,
    demo: false,
    updated: new Date().toISOString().slice(0, 10),
    count: items.length,
    items
  };
  fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`  ✓ 已写入 source/_data/${key}.json（${items.length} 条）`);
  return payload;
}

/**
 * 抓取的数据和本地手工补充的数据合并：
 * 手工填写的 rating / comment / tags 会被保留，除非抓取结果里有同样的字段。
 */
export function mergeManual(existing, items, idKey = 'id') {
  if (!existing || !Array.isArray(existing.items)) return items;
  const map = new Map(existing.items.map((item) => [String(item[idKey]), item]));
  return items.map((item) => {
    const old = map.get(String(item[idKey]));
    if (!old) return item;
    const merged = { ...item };
    ['rating', 'comment', 'tags', 'status', 'title'].forEach((field) => {
      const current = merged[field];
      const isEmpty =
        current === undefined || current === null || current === '' || (Array.isArray(current) && !current.length);
      if (isEmpty && old[field] !== undefined) merged[field] = old[field];
    });
    return merged;
  });
}

export function formatDuration(hours) {
  if (!hours) return '0 小时';
  if (hours < 1) return `${Math.round(hours * 60)} 分钟`;
  return `${hours.toFixed(1)} 小时`;
}
