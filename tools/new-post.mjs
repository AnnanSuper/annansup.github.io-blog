import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [title, category = '随笔'] = process.argv.slice(2);

if (!title) {
  console.log('用法：npm run new -- "文章标题" "分类"');
  process.exit(1);
}

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const time = `${date} ${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
const filename = `${date}-${title.replace(/[\\/:*?"<>|]/g, '')}.md`;
const dir = path.join(root, 'source', '_posts', category);
const file = path.join(dir, filename);
const assetDir = path.join(dir, filename.replace(/\.md$/, ''));

if (fs.existsSync(file)) {
  console.error(`文件已存在：${file}`);
  process.exit(1);
}

fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(assetDir, { recursive: true });

const frontMatter = [
  '---',
  `title: ${title}`,
  `date: ${time}`,
  `categories: ${category}`,
  'cover: /img/cover-default.svg',
  'excerpt: 一句话摘要，会显示在首页卡片上。',
  '---',
  '',
  '正文从这里开始写。',
  ''
].join('\n');

fs.writeFileSync(file, frontMatter, 'utf8');
console.log(`已创建：source/_posts/${category}/${filename}`);
console.log(`配图目录：source/_posts/${category}/${path.basename(assetDir)}/`);
