'use strict';

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
const LATIN = /[A-Za-z0-9_'-]+/g;

function plain(text) {
  return String(text || '')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text) {
  const t = plain(text);
  const cjk = (t.match(CJK) || []).length;
  const latin = (t.match(LATIN) || []).length;
  return cjk + latin;
}

hexo.extend.helper.register('word_count', function (text) {
  return countWords(text);
});

hexo.extend.helper.register('reading_time', function (text) {
  return Math.max(1, Math.round(countWords(text) / 400));
});

hexo.extend.helper.register('total_words', function (posts) {
  let total = 0;
  posts.each(function (post) {
    total += countWords(post.content || post.raw || '');
  });
  if (total > 10000) return (total / 10000).toFixed(1) + ' 万字';
  return total + ' 字';
});

hexo.extend.helper.register('days_since', function (since) {
  const start = new Date(since || Date.now());
  if (isNaN(start.getTime())) return 0;
  return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000));
});

hexo.extend.helper.register('excerpt_text', function (post, length) {
  const len = length || 90;
  const text = plain(post.excerpt || post.description || post.content || '');
  return text.length > len ? text.substring(0, len) + '…' : text;
});

/** 把带中文的链接还原成可读形式，用于版权声明等地方展示 */
hexo.extend.helper.register('pretty_full_url', function (path) {
  try {
    return decodeURI(this.full_url_for(path)).replace(/([^:]\/)\/+/g, '$1');
  } catch (error) {
    return this.full_url_for(path);
  }
});
