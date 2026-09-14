'use strict';

/**
 * 生成 /search.json，供站内搜索使用（不需要任何第三方插件）
 */
hexo.extend.generator.register('search_json', function (locals) {
  const strip = (text) =>
    String(text || '')
      .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const posts = locals.posts.sort('-date').map(function (post) {
      return {
        title: post.title,
        url: post.path,
        date: post.date.format('YYYY-MM-DD'),
        categories: post.categories ? post.categories.map(function (c) { return c.name; }) : [],
        cover: post.cover || '',
        text: strip(post.content).substring(0, 600)
      };
    });

  return {
    path: 'search.json',
    data: JSON.stringify({ posts: posts })
  };
});
