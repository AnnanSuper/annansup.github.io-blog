/**
 * 一键发布：把本地改动提交并推送到 GitHub，自动触发网站部署。
 *
 * 用法：
 *   npm run publish                  # 用默认提交信息
 *   npm run publish -- "更新友链"     # 自定义提交信息
 *
 * 这个脚本帮你处理了三件容易踩坑的事：
 *   1. 中文提交信息乱码 —— 提交信息用 UTF-8 临时文件传给 git，不经过 PowerShell 参数
 *   2. 自动探测本机 Clash 代理（127.0.0.1:7890），有就走，没有就直连
 *   3. 找不到 git 命令时，回退到便携版 MinGit 的完整路径
 */
import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync, unlinkSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'AnnanSuper/annansup.github.io-blog';
const BRANCH = 'main';

function log(msg) {
  console.log(msg);
}

/** 探测本机代理端口是否在监听 */
function probeProxy(port = 7890, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(400);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

/** 找到可用的 git 命令 */
function resolveGit() {
  const probe = spawnSync('git', ['--version'], { stdio: 'ignore', shell: false });
  if (!probe.error && probe.status === 0) return 'git';

  const local = process.env.LOCALAPPDATA;
  if (local) {
    const fallback = path.join(local, 'PortableTools', 'MinGit', 'cmd', 'git.exe');
    if (existsSync(fallback)) return fallback;
  }
  return null;
}

function runGit(git, args, env) {
  const r = spawnSync(git, args, { cwd: root, stdio: 'inherit', env, shell: false });
  if (r.error) throw r.error;
  return r.status ?? 1;
}

const git = resolveGit();
if (!git) {
  console.error('❌ 找不到 git 命令。');
  console.error('   请确认下面这个文件存在，或重新执行安装步骤：');
  console.error(`   ${process.env.LOCALAPPDATA}\\PortableTools\\MinGit\\cmd\\git.exe`);
  process.exit(1);
}

// 组装环境变量：本机开着 Clash 就带上代理，否则直连
const env = { ...process.env };
if (await probeProxy(7890)) {
  env.HTTPS_PROXY = 'http://127.0.0.1:7890';
  env.HTTP_PROXY = 'http://127.0.0.1:7890';
  env.NO_PROXY = '127.0.0.1,localhost';
  log('· 检测到本机代理 127.0.0.1:7890，已启用');
} else {
  log('· 未检测到本地代理，按直连处理');
}

// ---------- 1. 暂存 ----------
log('\n[1/4] 扫描改动…');
if (runGit(git, ['add', '-A'], env) !== 0) {
  console.error('❌ 暂存失败');
  process.exit(1);
}

const staged = spawnSync(git, ['diff', '--cached', '--name-only'], { cwd: root, encoding: 'utf8', env });
const changed = (staged.stdout || '').trim().split('\n').filter(Boolean);

if (changed.length === 0) {
  log('· 没有任何改动，无需发布。');
  log('   （如果你刚改完文件，请确认保存了）');
  process.exit(0);
}

log(`· 共 ${changed.length} 个文件有改动：`);
changed.slice(0, 20).forEach((f) => log(`    ${f}`));
if (changed.length > 20) log(`    … 还有 ${changed.length - 20} 个`);

// ---------- 2. 提交 ----------
log('\n[2/4] 提交…');
const message =
  process.argv.slice(2).join(' ').trim() ||
  `更新站点内容 ${new Date().toLocaleString('zh-CN', { hour12: false })}`;

// 用 UTF-8 临时文件传提交信息，避免中文乱码
const msgFile = path.join(os.tmpdir(), `hexo-publish-${Date.now()}.txt`);
writeFileSync(msgFile, `${message}\n`, 'utf8');
try {
  if (runGit(git, ['commit', '-F', msgFile], env) !== 0) {
    console.error('❌ 提交失败');
    process.exit(1);
  }
} finally {
  try {
    unlinkSync(msgFile);
  } catch {
    /* 清理失败不影响结果 */
  }
}
log(`· 提交信息：${message}`);

// ---------- 3. 同步远端 ----------
log('\n[3/4] 同步远端…');
if (runGit(git, ['fetch', 'origin', BRANCH], env) !== 0) {
  console.error('❌ 拉取远端失败，请检查网络或代理');
  process.exit(1);
}
const behind = spawnSync(git, ['rev-list', '--count', `HEAD..origin/${BRANCH}`], {
  cwd: root,
  encoding: 'utf8',
  env,
});
if (Number((behind.stdout || '0').trim()) > 0) {
  log('· 远端有新提交，先变基…');
  if (runGit(git, ['rebase', `origin/${BRANCH}`], env) !== 0) {
    console.error('❌ 变基冲突，请手动处理：git rebase --abort 可以放弃');
    process.exit(1);
  }
}

// ---------- 4. 推送 ----------
log('\n[4/4] 推送到 GitHub…');
if (runGit(git, ['push', 'origin', BRANCH], env) !== 0) {
  console.error('❌ 推送失败');
  process.exit(1);
}

log('\n✅ 推送成功！GitHub 正在自动部署，约 1 分钟后生效。');
log(`   查看部署进度：https://github.com/${REPO}/actions`);
log('   网站地址：    https://annansup.com');
log('\n   提示：部署需要一点时间，如果刷新还是旧内容，等 1 分钟再刷新（或按 Ctrl+F5 强制刷新）。');
