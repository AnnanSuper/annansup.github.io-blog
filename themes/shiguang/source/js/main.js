/* 主题「拾光」交互脚本（原生 JS，无任何第三方依赖） */
(function () {
  'use strict';

  var CONFIG = window.SITE_CONFIG || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------------- 文字跑马灯（超出宽度才滚动） ---------------- */
  function escapeText(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function setMarqueeText(el, text) {
    if (!el) return;
    var inner = el.querySelector('.marquee-inner');
    if (!inner) return;
    var value = String(text == null ? '' : text);
    el.classList.remove('marquee-run');
    inner.innerHTML = '<span>' + escapeText(value) + '</span>';
    if (!value) return;
    requestAnimationFrame(function () {
      if (inner.scrollWidth > el.clientWidth + 2) {
        inner.innerHTML =
          '<span>' + escapeText(value) + '</span><span aria-hidden="true">' + escapeText(value) + '</span>';
        el.classList.add('marquee-run');
      }
    });
  }

  /* 把页面上「只有一行、放不下就滚动」的文字统一处理 */
  function initMarquees() {
    $$('.friend-card .friend-info small, .my-link-card .my-link-info small').forEach(function (el) {
      var text = (el.getAttribute('data-text') || el.textContent || '').trim();
      if (!text) return;
      el.setAttribute('data-text', text);
      el.classList.add('marquee');
      if (!el.querySelector('.marquee-inner')) {
        el.innerHTML = '<span class="marquee-inner"></span>';
      }
      setMarqueeText(el, text);
    });
  }

  /* ---------------- 卡片悬停：拉近 + 背景虚化 + 右侧弹出 ---------------- */
  function initCardFocus() {
    if (window.__cardFocusBound) return;
    window.__cardFocusBound = true;

    document.addEventListener('mouseover', function (e) {
      var card = e.target.closest ? e.target.closest('.collection-card') : null;
      if (!card) return;
      document.body.classList.add('card-focus');
      var rect = card.getBoundingClientRect();
      // 右边放不下就翻到左边
      card.classList.toggle('popup-left', rect.right + 280 > window.innerWidth);
    });

    document.addEventListener('mouseout', function (e) {
      var card = e.target.closest ? e.target.closest('.collection-card') : null;
      if (!card) return;
      if (e.relatedTarget && card.contains(e.relatedTarget)) return;
      document.body.classList.remove('card-focus');
      card.classList.remove('popup-left');
    });
  }

  /* ---------------- 深浅色 ---------------- */
  function applyTheme(theme) {
    var dark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#18171d' : '#f7f9fe');
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }

  function toggleTheme() {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    if (window.__reloadComments) window.__reloadComments();
  }

  ['darkmode-btn', 'right-darkmode'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', toggleTheme);
  });

  /* ---------------- 侧边栏收起（按钮在顶部导航里） ---------------- */
  try {
    if (localStorage.getItem('hide-aside') === '1') document.body.classList.add('hide-aside');
  } catch (e) {}

  var hideAsideBtn = document.getElementById('aside-toggle-btn');
  if (hideAsideBtn) {
    hideAsideBtn.addEventListener('click', function () {
      document.body.classList.toggle('hide-aside');
      try { localStorage.setItem('hide-aside', document.body.classList.contains('hide-aside') ? '1' : '0'); } catch (e) {}
    });
  }

  /* ---------------- 阅读进度 ---------------- */
  var progress = document.getElementById('read-progress');
  var navBar = document.getElementById('nav');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (navBar) navBar.classList.toggle('scrolled', y > 40);
    if (progress) {
      var height = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (height > 0 ? Math.min(100, (y / height) * 100) : 0) + '%';
    }
    updateTocActive();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- 移动端菜单 ---------------- */
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', function () { mobileMenu.classList.add('show'); });
    var mask = document.getElementById('mobile-menu-mask');
    if (mask) mask.addEventListener('click', function () { mobileMenu.classList.remove('show'); });
  }

  /* ---------------- 公告关闭 ---------------- */
  function initNotice() {
    var noticeBar = $('.notice-bar');
    var noticeClose = document.getElementById('notice-close');
    if (noticeBar && noticeClose) {
      try { if (sessionStorage.getItem('notice-closed') === '1') noticeBar.classList.add('hidden'); } catch (e) {}
      noticeClose.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        noticeBar.classList.add('hidden');
        try { sessionStorage.setItem('notice-closed', '1'); } catch (err) {}
      });
    }
  }

  /* ---------------- 首页推荐轮播 ---------------- */
  function initSlider() {
    if (window.__featuredTimer) {
      clearInterval(window.__featuredTimer);
      window.__featuredTimer = null;
    }
    var slider = document.getElementById('featured-slider');
    if (!slider) return;
    var slides = $$('.featured-item', slider);
    var dots = $$('.featured-dot', slider);
    if (slides.length > 1) {
      var current = 0;
      var timer = null;
      var go = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (s, i) { s.classList.toggle('active', i === current); });
        dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
      };
      var start = function () {
        stop();
        timer = setInterval(function () { go(current + 1); }, 4500);
        window.__featuredTimer = timer;
      };
      var stop = function () { if (timer) clearInterval(timer); };
      dots.forEach(function (dot) {
        dot.addEventListener('click', function (e) {
          e.preventDefault();
          go(Number(dot.getAttribute('data-index')));
          start();
        });
      });
      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      start();
    }
  }

  /* ---------------- 站内搜索 ---------------- */
  var searchModal = document.getElementById('search-modal');
  if (searchModal && CONFIG.searchEnable) {
    var searchInput = document.getElementById('search-input');
    var searchResults = document.getElementById('search-results');
    var searchData = null;
    var loading = false;

    var openSearch = function () {
      searchModal.classList.add('show');
      document.body.style.overflow = 'hidden';
      if (searchInput) searchInput.focus();
      if (!searchData && !loading) {
        loading = true;
        fetch(CONFIG.root + 'search.json')
          .then(function (r) { return r.json(); })
          .then(function (data) { searchData = data.posts || []; })
          .catch(function () { searchData = []; })
          .finally(function () { loading = false; if (searchInput.value) doSearch(); });
      }
    };
    var closeSearch = function () {
      searchModal.classList.remove('show');
      document.body.style.overflow = '';
    };

    var escapeHtml = function (str) {
      return String(str).replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
      });
    };

    var doSearch = function () {
      var keyword = (searchInput.value || '').trim();
      if (!keyword) {
        searchResults.innerHTML = '<div class="search-tip">输入关键词开始搜索，支持标题、标签和正文</div>';
        return;
      }
      if (!searchData) {
        searchResults.innerHTML = '<div class="search-tip">正在加载索引…</div>';
        return;
      }
      var lower = keyword.toLowerCase();
      var matched = searchData.filter(function (post) {
        return (
          post.title.toLowerCase().indexOf(lower) > -1 ||
          (post.tags || []).join(' ').toLowerCase().indexOf(lower) > -1 ||
          (post.text || '').toLowerCase().indexOf(lower) > -1
        );
      });
      if (!matched.length) {
        searchResults.innerHTML = '<div class="search-empty">没有找到和「' + escapeHtml(keyword) + '」相关的内容</div>';
        return;
      }
      var highlight = function (text) {
        var safe = escapeHtml(text);
        return safe.replace(new RegExp('(' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
      };
      searchResults.innerHTML = matched
        .slice(0, 12)
        .map(function (post) {
          return (
            '<a class="search-result" href="' + CONFIG.root + post.url + '">' +
            (post.cover ? '<img class="search-result-cover" src="' + post.cover + '" alt="">' : '') +
            '<div class="search-result-body">' +
            '<div class="search-result-title">' + highlight(post.title) + '</div>' +
            '<div class="search-result-meta">' + post.date + ' · ' + (post.categories || []).join(' / ') + '</div>' +
            '</div></a>'
          );
        })
        .join('');
    };

    var searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.addEventListener('click', openSearch);
    var maskEl = document.getElementById('search-mask');
    if (maskEl) maskEl.addEventListener('click', closeSearch);
    var closeBtn = document.getElementById('search-close');
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    if (searchInput) searchInput.addEventListener('input', doSearch);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSearch();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
    });
  }

  /* ---------------- 目录高亮 ---------------- */
  function updateTocActive() {
    var tocLinks = $$('#toc-card a');
    if (!tocLinks.length) return;
    var headings = $$('#post-body h2, #post-body h3');
    if (!headings.length) return;
    var offset = window.scrollY + 100;
    var activeId = headings[0].id;
    headings.forEach(function (h) {
      if (h.offsetTop <= offset) activeId = h.id;
    });
    tocLinks.forEach(function (link) {
      var href = decodeURIComponent(link.getAttribute('href') || '').replace('#', '');
      link.classList.toggle('active', href === activeId);
    });
  }

  /* ---------------- 收藏页：筛选 / 搜索 / 排序 ---------------- */
  function initCollection() {
  var grid = document.getElementById('collection-grid');
  if (grid) {
    var cards = $$('.collection-card', grid);
    var filterState = 'all';
    var searchBox = document.getElementById('collection-search');
    var sortSelect = document.getElementById('collection-sort');

    var render = function () {
      var keyword = searchBox ? searchBox.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var status = card.getAttribute('data-status') || '';
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var tags = (card.getAttribute('data-tags') || '').toLowerCase();
        var okStatus = filterState === 'all' || status === filterState;
        var okKeyword = !keyword || title.indexOf(keyword) > -1 || tags.indexOf(keyword) > -1;
        var show = okStatus && okKeyword;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      var empty = grid.parentNode.querySelector('.collection-no-result');
      if (!visible) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'collection-no-result collection-empty';
          empty.textContent = '没有匹配的内容，换个关键词试试';
          grid.parentNode.insertBefore(empty, grid.nextSibling);
        }
      } else if (empty) {
        empty.remove();
      }
    };

    if (searchBox) searchBox.addEventListener('input', render);

    $$('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        filterState = btn.getAttribute('data-filter');
        render();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        var mode = sortSelect.value;
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === 'rating') return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
          if (mode === 'date') return String(b.getAttribute('data-date')).localeCompare(String(a.getAttribute('data-date')));
          if (mode === 'title') return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh');
          return Number(a.getAttribute('data-index') || 0) - Number(b.getAttribute('data-index') || 0);
        });
        sorted.forEach(function (card) { grid.appendChild(card); });
        render();
      });
    }

    cards.forEach(function (card, i) { card.setAttribute('data-index', i); });
    render();
  }
  }

  /* ---------------- 复制友链信息 ---------------- */
  function initCopyButton() {
  ['copy-friend-info'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var done = function () {
        var original = btn.innerHTML;
        btn.innerHTML = '已复制 ✓';
        setTimeout(function () { btn.innerHTML = original; }, 1600);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        done();
      }
    });
  });
  }

  /* ---------------- 评论（可选） ---------------- */
  function loadComments() {
    if (!CONFIG.commentEnable) return;
    var theme = document.documentElement.getAttribute('data-theme');
    var giscus = document.getElementById('giscus-container');
    if (giscus && giscus.getAttribute('data-repo')) {
      giscus.innerHTML = '';
      var s = document.createElement('script');
      s.src = 'https://giscus.app/client.js';
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.setAttribute('data-repo', giscus.getAttribute('data-repo'));
      s.setAttribute('data-repo-id', giscus.getAttribute('data-repo-id'));
      s.setAttribute('data-category', giscus.getAttribute('data-category'));
      s.setAttribute('data-category-id', giscus.getAttribute('data-category-id'));
      s.setAttribute('data-mapping', giscus.getAttribute('data-mapping'));
      s.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
      s.setAttribute('data-lang', 'zh-CN');
      giscus.appendChild(s);
    }
    var twikoo = document.getElementById('twikoo-container');
    if (twikoo && twikoo.getAttribute('data-env-id')) {
      var t = document.createElement('script');
      t.src = 'https://cdn.jsdelivr.net/npm/twikoo@1.6.39/dist/twikoo.all.min.js';
      t.onload = function () {
        window.twikoo.init({ envId: twikoo.getAttribute('data-env-id'), el: '#twikoo-container' });
      };
      document.body.appendChild(t);
    }
    var waline = document.getElementById('waline-container');
    if (waline && waline.getAttribute('data-server-url')) {
      var w1 = document.createElement('link');
      w1.rel = 'stylesheet';
      w1.href = 'https://unpkg.com/@waline/client@v3/dist/waline.css';
      document.head.appendChild(w1);
      import('https://unpkg.com/@waline/client@v3/dist/waline.js').then(function (mod) {
        mod.init({ el: '#waline-container', serverURL: waline.getAttribute('data-server-url'), dark: theme === 'dark' });
      });
    }
  }
  /* ---------------- 跟手柔光 ---------------- */
  (function () {
    if (!CONFIG.effects || !CONFIG.effects.cursorGlow) return;
    var glow = document.getElementById('cursor-glow');
    if (!glow) return;
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var frame = null;

    function loop() {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      glow.style.transform =
        'translate3d(' + currentX.toFixed(1) + 'px,' + currentY.toFixed(1) + 'px,0)';
      if (Math.abs(targetX - currentX) > 0.4 || Math.abs(targetY - currentY) > 0.4) {
        frame = requestAnimationFrame(loop);
      } else {
        frame = null;
      }
    }

    document.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.classList.add('on');
      if (!frame) frame = requestAnimationFrame(loop);
    });

    document.addEventListener('mouseleave', function () {
      glow.classList.remove('on');
    });
  })();

  /* ---------------- 点击水波纹 ---------------- */
  if (CONFIG.effects && CONFIG.effects.ripple) {
    var rippleSelector =
      '.nav-btn, .category-item, .filter-btn, .banner-tab, .copy-btn, .right-btn, ' +
      '#right-side-toggle, #music-toggle, .music-mini, .pagination a, .menus-link';

    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest(rippleSelector) : null;
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
      ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
      el.classList.add('rippling');
      el.appendChild(ripple);
      setTimeout(function () {
        ripple.remove();
        if (!el.querySelector('.ripple')) el.classList.remove('rippling');
      }, 620);
    });
  }

  /* ---------------- 横幅随鼠标轻微倾斜 ---------------- */
  function initTilt() {
    if (!CONFIG.effects || !CONFIG.effects.cardTilt) return;
    var banner = document.querySelector('.banner');
    if (!banner) return;
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

    var panels = [banner.querySelector('.banner-left'), banner.querySelector('.banner-right')].filter(Boolean);
    if (!panels.length) return;

    banner.addEventListener('mousemove', function (e) {
      var rect = banner.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      banner.classList.add('tilting');
      panels.forEach(function (panel, index) {
        var factor = index === 0 ? 1 : 0.7;
        panel.style.setProperty('--tilt-y', (px * 7 * factor).toFixed(2) + 'deg');
        panel.style.setProperty('--tilt-x', (-py * 5 * factor).toFixed(2) + 'deg');
      });
    });

    banner.addEventListener('mouseleave', function () {
      banner.classList.remove('tilting');
      panels.forEach(function (panel) {
        panel.style.setProperty('--tilt-y', '0deg');
        panel.style.setProperty('--tilt-x', '0deg');
      });
    });
  }

  /* ---------------- 左下角音乐播放器 ---------------- */
  (function () {
    var player = document.getElementById('music-player');
    if (!player) return;

    var audio = document.getElementById('music-audio');
    var toggleBtn = document.getElementById('music-toggle');
    var nextBtn = document.getElementById('music-next');
    var titleEl = document.getElementById('music-title');
    var subEl = document.getElementById('music-sub');
    var tracks = [];
    var current = -1;
    var currentName = '';

    audio.volume = typeof CONFIG.musicVolume === 'number' ? CONFIG.musicVolume : 0.7;

    function setPlayingUI(playing) {
      player.classList.toggle('playing', playing);
      if (toggleBtn) toggleBtn.setAttribute('title', playing ? '暂停' : '播放');
      // 歌名区域展开之后再判断是否需要滚动
      if (playing && currentName) {
        setTimeout(function () { setMarqueeText(titleEl, currentName); }, 500);
      }
    }

    function pickIndex() {
      if (tracks.length < 2) return 0;
      var index;
      do {
        index = Math.floor(Math.random() * tracks.length);
      } while (index === current);
      return index;
    }

    function playRandom() {
      if (!tracks.length) return;
      current = pickIndex();
      var track = tracks[current];
      currentName = track.name;
      player.classList.add('has-track');
      audio.src = track.url;
      setMarqueeText(titleEl, track.name);
      audio.play().catch(function () {
        if (subEl) subEl.textContent = '浏览器拦住了播放，再点一次试试';
      });
    }

    fetch(CONFIG.root + 'music/playlist.json')
      .then(function (response) { return response.json(); })
      .then(function (data) {
        tracks = data.tracks || [];
        if (subEl) {
          // 有歌的时候不显示多余文字，只在没歌时给个提示
          subEl.textContent = tracks.length ? '' : '把 mp3 放进 source/music/ 就能播放';
          subEl.style.display = tracks.length ? 'none' : '';
        }
      })
      .catch(function () {
        if (subEl) subEl.textContent = '歌单加载失败';
      });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        if (audio.paused) {
          if (!audio.src || audio.ended) {
            playRandom();
          } else {
            if (currentName) setMarqueeText(titleEl, currentName);
            audio.play().catch(function () {});
          }
        } else {
          audio.pause();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        playRandom();
      });
    }

    audio.addEventListener('play', function () { setPlayingUI(true); });
    audio.addEventListener('pause', function () { setPlayingUI(false); });
    // 循环播放：一首放完自动接着播下一首（想关掉就把主题配置里的 music.loop 设成 false）
    audio.addEventListener('ended', function () {
      if (CONFIG.musicLoop === false) {
        setPlayingUI(false);
        return;
      }
      playRandom();
    });
    audio.addEventListener('error', function () {
      if (subEl && audio.src) subEl.textContent = '这首放不出来，换一首试试';
    });

  })();

  window.__reloadComments = loadComments;

  /* ---------------- 页面级组件初始化（PJAX 切页后需要重新执行） ---------------- */
  function initPageComponents() {
    document.body.classList.remove('card-focus');
    initNotice();
    initSlider();
    initCollection();
    initTilt();
    initCopyButton();
    initMarquees();
    initCardFocus();
    loadComments();
    onScroll();
  }

  initPageComponents();

  /* ---------------- PJAX：站内切页只换内容，音乐不会中断 ---------------- */
  if (window.Pjax && CONFIG.pjaxEnable && !window.__pjaxReady) {
    window.__pjaxReady = true;

    new Pjax({
      elements:
        'a[href]:not([target="_blank"]):not([href^="#"]):not([href^="http"]):not([href^="mailto:"]):not([href^="javascript:"])',
      selectors: ['title', '#pjax-container'],
      cacheBust: false,
      scrollTo: 0
    });

    document.addEventListener('pjax:send', function () {
      document.documentElement.classList.add('pjax-loading');
    });

    document.addEventListener('pjax:complete', function () {
      document.documentElement.classList.remove('pjax-loading');
      initPageComponents();
    });

    document.addEventListener('pjax:error', function () {
      document.documentElement.classList.remove('pjax-loading');
    });
  }
})();
