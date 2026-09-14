import fs from 'node:fs';
import path from 'node:path';
import { fetchBinary } from './http.mjs';

/**
 * 把封面图下载到本地。
 * 豆瓣 / Bangumi 的图床都做了防盗链，直接外链在浏览器里会被拒绝（418），
 * 所以抓取时顺手把图片存到 source/img/covers/ 下，页面引用本地路径。
 */
export async function downloadCover({ url, referer, root, subdir, filename }) {
  if (!url) return '';
  if (!/^https?:/i.test(url)) return url; // 已经是本地路径

  const dir = path.join(root, 'source', 'img', 'covers', subdir);
  fs.mkdirSync(dir, { recursive: true });

  // 已经下过就直接用（重复抓取时省时间）
  for (const ext of ['.jpg', '.png', '.webp']) {
    const exist = path.join(dir, `${filename}${ext}`);
    if (fs.existsSync(exist) && fs.statSync(exist).size > 1024) {
      return `/img/covers/${subdir}/${filename}${ext}`;
    }
  }

  try {
    const { buffer, contentType } = await fetchBinary(url, {
      headers: referer ? { Referer: referer } : {},
      timeout: 15000,
      retries: 1
    });
    const ext = contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : '.jpg';
    const relative = `${subdir}/${filename}${ext}`;
    fs.writeFileSync(path.join(root, 'source', 'img', 'covers', relative), buffer);
    return `/img/covers/${relative}`;
  } catch (error) {
    console.warn(`  ! 封面下载失败（${filename}）：${error.message}`);
    return url;
  }
}
