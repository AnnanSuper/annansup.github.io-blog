import net from 'node:net';

const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

let dispatcherCache;

/* 常见的本机代理端口（Clash / v2ray / Shadowsocks 等） */
const COMMON_PROXY_PORTS = [7890, 7897, 7891, 10809, 10808, 1080, 8889, 2080, 8080];

function probePort(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(500);
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.once('timeout', () => done(false));
  });
}

/** 没有配置代理时，自动探测本机常见的代理端口 */
async function detectProxy() {
  for (const port of COMMON_PROXY_PORTS) {
    if (await probePort(port)) return `http://127.0.0.1:${port}`;
  }
  return '';
}

/**
 * 如果环境里配置了代理（HTTPS_PROXY / HTTP_PROXY），就走代理。
 * 抓 Steam / Bangumi 时经常需要，Node 自带的 fetch 默认不读代理变量。
 */
async function getDispatcher() {
  if (dispatcherCache !== undefined) return dispatcherCache;
  let proxy =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    process.env.ALL_PROXY ||
    process.env.all_proxy;

  if (!proxy) {
    proxy = await detectProxy();
    if (proxy) console.log(`· 自动检测到本机代理：${proxy}`);
  }

  if (!proxy) {
    dispatcherCache = null;
    return null;
  }
  try {
    const { ProxyAgent } = await import('undici');
    dispatcherCache = new ProxyAgent(proxy);
    console.log(`· 使用代理：${proxy}`);
  } catch (error) {
    console.warn(`! 检测到代理 ${proxy}，但加载 undici 失败，将直连：${error.message}`);
    dispatcherCache = null;
  }
  return dispatcherCache;
}

async function request(url, options = {}) {
  const { headers = {}, timeout = 20000, retries = 2, expect = 'json' } = options;
  const dispatcher = await getDispatcher();
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': DEFAULT_UA, ...headers },
        signal: controller.signal,
        ...(dispatcher ? { dispatcher } : {})
      });
      clearTimeout(timer);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return expect === 'text' ? await response.text() : await response.json();
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export function fetchJson(url, options) {
  return request(url, { ...options, expect: 'json' });
}

export function fetchText(url, options) {
  return request(url, { ...options, expect: 'text' });
}

/** 下载二进制文件（图片等），同样支持自动代理 + 超时 + 重试 */
export async function fetchBinary(url, options = {}) {
  const { headers = {}, timeout = 20000, retries = 1 } = options;
  const dispatcher = await getDispatcher();
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': DEFAULT_UA, ...headers },
        signal: AbortSignal.timeout(timeout),
        ...(dispatcher ? { dispatcher } : {})
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return {
        buffer: Buffer.from(await response.arrayBuffer()),
        contentType: response.headers.get('content-type') || ''
      };
    } catch (error) {
      lastError = error;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  throw lastError;
}
