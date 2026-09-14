'use strict';

const fs = require('fs');
const path = require('path');

const AUDIO_EXT = ['.mp3', '.m4a', '.ogg', '.wav', '.flac', '.aac'];

function walk(dir, base, out) {
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, base, out);
    } else if (AUDIO_EXT.indexOf(path.extname(entry.name).toLowerCase()) > -1) {
      const relative = path.relative(base, full).split(path.sep).join('/');
      out.push({
        name: path.basename(entry.name, path.extname(entry.name)),
        url: '/music/' + relative.split('/').map(encodeURIComponent).join('/'),
        size: fs.statSync(full).size
      });
    }
  });
  return out;
}

/**
 * 扫描 source/music/ 下的音频文件，生成 /music/playlist.json
 * 另外会读取可选的手工歌单 source/_data/music.json（{ tracks: [{name, url}] }）
 */
hexo.extend.generator.register('music_playlist', function (locals) {
  const themeConfig = hexo.theme.config || {};
  const musicConfig = themeConfig.music || {};
  const baseDir = path.join(hexo.source_dir, 'music');

  let tracks = walk(baseDir, baseDir, []);

  if (locals.data && locals.data.music && Array.isArray(locals.data.music.tracks)) {
    tracks = tracks.concat(
      locals.data.music.tracks.map((track) => ({
        name: track.name || '未命名',
        url: track.url,
        size: 0
      }))
    );
  }

  tracks.sort((a, b) => a.name.localeCompare(b.name, 'zh'));

  return {
    path: 'music/playlist.json',
    data: JSON.stringify({
      updated: new Date().toISOString().slice(0, 10),
      count: tracks.length,
      volume: typeof musicConfig.volume === 'number' ? musicConfig.volume : 0.7,
      tracks: tracks
    })
  };
});
