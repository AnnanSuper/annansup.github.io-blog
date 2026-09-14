import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tasks = ['fetch-steam.mjs', 'fetch-bangumi.mjs', 'fetch-douban.mjs'];

let failed = 0;

for (const task of tasks) {
  console.log(`\n=== 运行 ${task} ===`);
  const result = spawnSync(process.execPath, [path.join(root, 'tools', task)], {
    cwd: root,
    stdio: 'inherit'
  });
  if (result.status !== 0) failed++;
}

console.log(
  failed
    ? `\n有 ${failed} 个数据源没有抓取成功（通常是没配置账号，或平台风控）。已有的 JSON 数据不会被删除，页面仍然可以正常构建。`
    : '\n全部数据抓取完成。运行 npm run server 就能看到最新内容。'
);
console.log('提示：抓取完成后建议执行 npm run clean && npm run build 重新生成站点。\n');
