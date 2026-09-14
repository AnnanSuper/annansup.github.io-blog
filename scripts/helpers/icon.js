'use strict';

/**
 * 内置图标（全部手写 SVG，不依赖任何图标库 / CDN）
 */
const ICONS = {
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2.2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2.2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2.2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.2"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.4-4.4"/>',
  dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="8.5" cy="8.5" r="1.15" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.5" cy="15.5" r="1.15" fill="currentColor" stroke="none"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M4.3 4.3l1.6 1.6M18.1 18.1l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.3 19.7l1.6-1.6M18.1 5.9l1.6-1.6"/>',
  moon: '<path d="M20.4 14.8A8.6 8.6 0 0 1 9.2 3.6a8.6 8.6 0 1 0 11.2 11.2Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  'chevron-down': '<path d="m6 9.5 6 6 6-6"/>',
  'chevron-right': '<path d="m9.5 6 6 6-6 6"/>',
  'chevron-left': '<path d="m14.5 6-6 6 6 6"/>',
  'arrow-right': '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
  'arrow-up': '<path d="M12 19.5V5M6 11l6-6 6 6"/>',
  megaphone: '<path d="M4 10.2v3.6h3l5 3.7V6.5l-5 3.7H4Z"/><path d="M15.2 9.2a4 4 0 0 1 0 5.6M18.2 6.4a8.2 8.2 0 0 1 0 11.2"/>',
  home: '<path d="m3.2 10.4 8.8-7 8.8 7V19a1.4 1.4 0 0 1-1.4 1.4h-4.6v-6h-5.6v6H4.6A1.4 1.4 0 0 1 3.2 19v-8.6Z"/>',
  hashtag: '<path d="M10 3.5 8 20.5M16 3.5l-2 17M4 8.8h16M3 15.2h16"/>',
  calendar: '<rect x="3.2" y="5" width="17.6" height="16" rx="3"/><path d="M8 3.2v3.6M16 3.2v3.6M3.2 10h17.6"/>',
  clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 6.8V12l3.6 2.2"/>',
  pen: '<path d="M4 20h4L18.2 9.8a2.9 2.9 0 0 0-4.1-4.1L4 16v4Z"/><path d="m13.6 6.4 4.1 4.1"/>',
  folder: '<path d="M3.2 7.2a2.2 2.2 0 0 1 2.2-2.2h3.2l2.2 2.6h8a2.2 2.2 0 0 1 2.2 2.2v7.8a2.2 2.2 0 0 1-2.2 2.2H5.4a2.2 2.2 0 0 1-2.2-2.2V7.2Z"/>',
  tag: '<path d="M20.2 12.6 12.6 20.2a2 2 0 0 1-2.8 0l-6-6a2 2 0 0 1-.58-1.5l.24-6a2 2 0 0 1 1.9-1.9l6-.24a2 2 0 0 1 1.5.58l6 6a2 2 0 0 1 0 2.8Z"/><circle cx="8.2" cy="8.2" r="1.4" fill="currentColor" stroke="none"/>',
  archive: '<rect x="3.2" y="3.6" width="17.6" height="4.8" rx="1.8"/><path d="M5.2 8.4V19a1.6 1.6 0 0 0 1.6 1.6h10.4A1.6 1.6 0 0 0 18.8 19V8.4"/><path d="M10 12.6h4"/>',
  chart: '<path d="M4.6 20V10.4M10.6 20V4.2M16.6 20v-7.2M2.6 20h18.8"/>',
  list: '<path d="M8.4 6.2h12.2M8.4 12h12.2M8.4 17.8h12.2M3.6 6.2h.01M3.6 12h.01M3.6 17.8h.01"/>',
  settings: '<circle cx="12" cy="12" r="3.3"/><path d="M12 2.6v2.6M12 18.8v2.6M4.3 4.3l1.9 1.9M17.8 17.8l1.9 1.9M2.6 12h2.6M18.8 12h2.6M4.3 19.7l1.9-1.9M17.8 6.2l1.9-1.9"/>',
  columns: '<rect x="3.2" y="4.2" width="17.6" height="15.6" rx="3"/><path d="M14.6 4.2v15.6"/>',
  copyright: '<circle cx="12" cy="12" r="8.8"/><path d="M14.8 9.6a3.6 3.6 0 1 0 0 4.8"/>',
  star: '<path d="m12 3.6 2.7 5.4 6 .9-4.4 4.2 1.1 5.9-5.4-2.8-5.4 2.8 1.1-5.9L3.3 9.9l6-.9Z" fill="currentColor" stroke="none"/>',
  link: '<path d="M10.6 13.4a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1l-1 1"/><path d="M13.4 10.6a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1l1-1"/>',
  users: '<circle cx="9.2" cy="8.2" r="3.3"/><path d="M3.6 19.8a5.6 5.6 0 0 1 11.2 0"/><path d="M16.2 5.4a3.3 3.3 0 0 1 0 6.2M18 19.8a5.7 5.7 0 0 0-2-4.3"/>',
  mail: '<rect x="3.2" y="5.2" width="17.6" height="13.6" rx="3"/><path d="m4.4 7.6 7.6 5.2 7.6-5.2"/>',
  copy: '<rect x="9" y="9" width="11.4" height="11.4" rx="3"/><path d="M15.2 9V6.6A2.6 2.6 0 0 0 12.6 4H6.6A2.6 2.6 0 0 0 4 6.6v6A2.6 2.6 0 0 0 6.6 15.2H9"/>',
  rss: '<path d="M5.2 19h.01"/><path d="M5.2 13.2a5.6 5.6 0 0 1 5.6 5.6"/><path d="M5.2 7.2a11.6 11.6 0 0 1 11.6 11.6"/>',
  gamepad: '<rect x="2.6" y="7.4" width="18.8" height="9.6" rx="4.6"/><path d="M7.4 10.6v3.2M5.8 12.2h3.2M15.6 11.4h.01M17.8 13.6h.01"/>',
  film: '<rect x="3.2" y="4.2" width="17.6" height="15.6" rx="3"/><path d="M8.4 4.2v15.6M15.6 4.2v15.6M3.2 9.4h5.2M15.6 9.4h5.2M3.2 14.6h5.2M15.6 14.6h5.2"/>',
  tv: '<rect x="3.2" y="7" width="17.6" height="12.4" rx="3"/><path d="M8.4 3.6 12 7l3.6-3.4"/>',
  book: '<path d="M4.2 5.6A2.6 2.6 0 0 1 6.8 3h12v14.6h-12A2.6 2.6 0 0 0 4.2 20.2V5.6Z"/><path d="M4.2 20.2a2.6 2.6 0 0 1 2.6-2.6h12V21h-12"/>',
  quote: '<path d="M9.6 7.2H6a1.6 1.6 0 0 0-1.6 1.6v3A1.6 1.6 0 0 0 6 13.4h1.4c0 2-1 3.1-2.4 3.6"/><path d="M19.6 7.2H16a1.6 1.6 0 0 0-1.6 1.6v3a1.6 1.6 0 0 0 1.6 1.6h1.4c0 2-1 3.1-2.4 3.6"/>',
  fire: '<path d="M12 3.2s5.2 4.3 5.2 8.8a5.2 5.2 0 0 1-10.4 0C6.8 9.2 9 7.2 9 7.2s.5 2.2 1.6 2.2S12 3.2 12 3.2Z"/>',
  music: '<path d="M9 18.2V6.4l10-2v11.4"/><circle cx="6.6" cy="18.2" r="2.6"/><circle cx="16.6" cy="15.8" r="2.6"/>',
  douyin: '<path d="M14.6 3.4v9.6a3.6 3.6 0 1 1-3.1-3.57"/><path d="M14.6 6.1c1.1 1.8 2.7 2.8 4.8 3"/>',
  play: '<path d="M7.5 4.8 19 12 7.5 19.2V4.8Z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8.4 4.8h3v14.4h-3zM12.6 4.8h3v14.4h-3z" fill="currentColor" stroke="none"/>',
  stop: '<rect x="6.4" y="6.4" width="11.2" height="11.2" rx="2.4" fill="currentColor" stroke="none"/>',
  next: '<path d="M6.5 5.2 15 12l-8.5 6.8V5.2Z" fill="currentColor" stroke="none"/><path d="M17.6 5v14" stroke-width="2.2"/>',
  volume: '<path d="M4.5 9.6h3l4-3.2v11.2l-4-3.2h-3z"/><path d="M15 9.4a3.6 3.6 0 0 1 0 5.2"/>',
  sparkle: '<path d="M12 3.4l1.9 5.1 5.1 1.9-5.1 1.9L12 17.4l-1.9-5.1L5 10.4l5.1-1.9z"/><path d="M18.6 15.4l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z"/>',
  netease: '<circle cx="12" cy="12" r="8.8"/><path d="M15 7.6v7.6a2.6 2.6 0 1 1-2.6-2.6"/><path d="M15 10.2c.9.4 1.6 1.2 1.9 2.2"/>',
  bilibili: '<rect x="3.2" y="7" width="17.6" height="12" rx="3.4"/><path d="M7.4 3.8 10 7M16.6 3.8 14 7"/><path d="M9.2 12.2v2.4M14.8 12.2v2.4"/>',
  steam: '<circle cx="12" cy="12" r="8.8"/><circle cx="15.1" cy="9.5" r="2.4"/><path d="M3.6 14.2 8.6 15.7"/><circle cx="10.2" cy="16" r="2.2"/>',
  bangumi: '<rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5"/><path d="M9.4 16.6V7.4h3a2.7 2.7 0 0 1 0 5.4H9.4"/>',
  github: '<path d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.9c-2.7.6-3.3-1.2-3.3-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.3.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2Z" fill="currentColor" stroke="none"/>'
};

hexo.extend.helper.register('icon', function (name, size) {
  const key = ICONS[name] ? name : 'link';
  const s = size || 18;
  return (
    `<svg class="icon icon-${key}" viewBox="0 0 24 24" width="${s}" height="${s}" ` +
    'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" ' +
    `stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[key]}</svg>`
  );
});
