import fs from 'node:fs';
import path from 'node:path';

/** 读取根目录 .env（不依赖任何第三方包），已存在的环境变量优先 */
export function loadEnv(root = process.cwd()) {
  const file = path.join(root, '.env');
  if (!fs.existsSync(file)) return {};
  const result = {};
  fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index === -1) return;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    });
  // 写进 process.env，方便脚本各处以统一方式读取（已有的环境变量优先）
  Object.keys(result).forEach((key) => {
    if (!process.env[key]) process.env[key] = result[key];
  });
  return result;
}

function stripQuotes(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const quote = raw[0];
  if (quote === '"' || quote === "'") {
    const end = raw.indexOf(quote, 1);
    return end === -1 ? raw.slice(1) : raw.slice(1, end);
  }
  // 去掉 YAML 行内注释
  const hash = raw.indexOf(' #');
  return (hash === -1 ? raw : raw.slice(0, hash)).trim();
}

/**
 * 解析 _config.yml 里的 fetch 段落：
 *   fetch:
 *     steam:
 *       api_key: xxx
 * 只需要支持这个固定结构，所以不引入 YAML 依赖。
 */
export function readFetchConfig(root = process.cwd()) {
  const file = path.join(root, '_config.yml');
  const config = { steam: {}, bangumi: {}, douban: {} };
  if (!fs.existsSync(file)) return config;

  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let inFetch = false;
  let section = null;

  for (const line of lines) {
    if (/^fetch:\s*$/.test(line)) {
      inFetch = true;
      continue;
    }
    if (inFetch && /^\S/.test(line) && line.trim() !== '') {
      inFetch = false;
      section = null;
      continue;
    }
    if (!inFetch) continue;

    const sectionMatch = line.match(/^\s{2}([A-Za-z0-9_]+):\s*$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      if (!config[section]) config[section] = {};
      continue;
    }
    const itemMatch = line.match(/^\s{4}([A-Za-z0-9_]+):\s*(.*)$/);
    if (itemMatch && section) {
      config[section][itemMatch[1]] = stripQuotes(itemMatch[2]);
    }
  }
  return config;
}

/** .env 优先，其次 _config.yml */
export function resolveOption(env, envKey, fetchConfig, configKey) {
  const fromEnv = process.env[envKey] || env[envKey];
  if (fromEnv) return fromEnv;
  return fetchConfig[configKey] || '';
}
