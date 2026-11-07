// 서일 오피스 — 뷰어 모드 (2026-11-07)
// 폰(좁은 화면)에서 문서를 열면 편집기 대신 "보기"로 연다: 메뉴·도구·눈금자 숨김, 페이지를 폭에 맞춤,
// 탭해도 커서·키보드가 안 뜸. 위에 얇은 줄(파일명 · 확대/축소 · 편집). 「편집」을 누르면 원래 편집기.
// 아이패드·PC(넓은 화면)는 지금처럼 바로 편집기로 연다. URL에 ?view 를 붙이면 어디서나 뷰어로, ?edit 면 어디서나 편집기로.
(function () {
  var NARROW = 700; // px — 이보다 좁으면 뷰어 기본
  var forced = /[?&]view\b/.test(location.search) ? true : /[?&]edit\b/.test(location.search) ? false : null;
  function narrow() { return forced !== null ? forced : Math.min(window.innerWidth, document.documentElement.clientWidth || 1e9) < NARROW; }
  function api() { return window.rhwpStudio && window.rhwpStudio.ai; }
  function dispatch(id) { var a = api(); if (a && a.dispatch) try { a.dispatch(id); } catch (e) {} }
  function fileName() { var a = api(); return (a && a.fileName && a.fileName()) || ''; }

  var css = [
    'body.seoil-view #menu-bar,body.seoil-view #icon-toolbar,body.seoil-view #style-bar,body.seoil-view #h-ruler,body.seoil-view #v-ruler,body.seoil-view #ruler-corner,body.seoil-view #status-bar,body.seoil-view #seoil-ai-fab,body.seoil-view #seoil-home-btn,body.seoil-view #hwppad-keylock,body.seoil-view #hwppad-help{display:none!important}',
    'body.seoil-view #studio-header{padding:0!important;min-height:0!important}',
    '#seoil-viewbar{display:none;position:sticky;top:0;z-index:950;align-items:center;gap:6px;padding:calc(6px + env(safe-area-inset-top)) calc(8px + env(safe-area-inset-right)) 6px calc(8px + env(safe-area-inset-left));background:#fff;border-bottom:1px solid #E3E6EA;font:14px/1.4 "Noto Sans KR",system-ui,-apple-system,sans-serif;color:#1C1F23}',
    'body.seoil-view #seoil-viewbar{display:flex}',
    '#seoil-viewbar .name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;padding:0 4px}',
    '#seoil-viewbar button{font:inherit;height:34px;min-width:34px;padding:0 10px;border:1px solid #D5D9DF;border-radius:10px;background:#fff;color:#1C1F23;cursor:pointer}',
    '#seoil-viewbar button.pri{background:#2F5BEA;border-color:#2F5BEA;color:#fff;font-weight:600;padding:0 14px}',
    '#seoil-viewbar .zoom{font-variant-numeric:tabular-nums;min-width:44px;text-align:center;color:#4B5260;font-size:12px}',
    // 탭·드래그를 가로채는 투명 막 — 스크롤은 그대로 통과, 커서·키보드는 안 생김
    '#seoil-viewguard{position:absolute;inset:0;z-index:5;touch-action:pan-x pan-y;background:transparent}',
    'body.seoil-view #scroll-container{position:relative}',
    'body.seoil-view #editor-area{grid-template-columns:0 minmax(0,1fr) auto;grid-template-rows:0 minmax(0,1fr)}',
    'body.seoil-home-open #seoil-viewbar{display:none!important}',
    'body.seoil-view #seoil-fill-bar{display:none!important}',
  ].join('\n');

  var ui = {}, on = false, pinch = null;
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    ui.zoom = el('span', { class: 'zoom', text: '' });
    ui.name = el('span', { class: 'name', text: '' });
    ui.bar = el('div', { id: 'seoil-viewbar' }, [
      el('button', { title: '홈', text: '홈', onclick: function () { leave(false); if (window.SeoilStart) window.SeoilStart.closeDoc(); } }),
      ui.name,
      el('button', { title: '축소', text: '−', onclick: function () { dispatch('view:zoom-out'); tick(); } }),
      ui.zoom,
      el('button', { title: '확대', text: '+', onclick: function () { dispatch('view:zoom-in'); tick(); } }),
      el('button', { class: 'pri', text: '편집', onclick: function () { leave(true); } }),
    ]);
    var root = document.getElementById('studio-root');
    if (root) root.insertBefore(ui.bar, root.firstChild); else document.body.insertBefore(ui.bar, document.body.firstChild);
  }
  function guard() {
    var sc = document.getElementById('scroll-container');
    if (!sc || document.getElementById('seoil-viewguard')) return;
    var g = el('div', { id: 'seoil-viewguard' });
    // 두 손가락 벌리기/오므리기 → 확대/축소
    g.addEventListener('touchstart', function (e) { if (e.touches.length === 2) pinch = dist(e); }, { passive: true });
    g.addEventListener('touchmove', function (e) {
      if (e.touches.length !== 2 || pinch == null) return;
      var d = dist(e), r = d / pinch;
      if (r > 1.18) { dispatch('view:zoom-in'); pinch = d; tick(); } else if (r < 0.85) { dispatch('view:zoom-out'); pinch = d; tick(); }
    }, { passive: true });
    g.addEventListener('touchend', function () { pinch = null; }, { passive: true });
    // 두 번 탭 → 폭 맞춤
    var last = 0;
    g.addEventListener('click', function () { var t = Date.now(); if (t - last < 350) { dispatch('view:zoom-fit-width'); tick(); } last = t; });
    sc.appendChild(g);
    // 내용 크기를 따라가도록
    function fit() { var c = document.getElementById('scroll-content'); if (c) { g.style.width = Math.max(c.scrollWidth, sc.clientWidth) + 'px'; g.style.height = Math.max(c.scrollHeight, sc.clientHeight) + 'px'; } }
    fit(); ui.fit = fit;
  }
  function dist(e) { var a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  function tick() { var z = document.getElementById('sb-zoom-val') || document.getElementById('sb-zoom-display'); if (z && ui.zoom) ui.zoom.textContent = (z.textContent || z.value || '').trim(); if (ui.fit) ui.fit(); }

  /** 뷰어로 들어가기 */
  function enter() {
    if (on) return; on = true;
    document.body.classList.add('seoil-view');
    guard();
    var a = api(); if (a && a.inputActive) a.inputActive(false);
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
    setTimeout(function () { dispatch('view:zoom-fit-width'); tick(); }, 60);
    setTimeout(tick, 600);
    ui.name.textContent = fileName();
  }
  /** 뷰어에서 나가기 — edit=true면 편집기로 */
  function leave(edit) {
    if (!on) return; on = false;
    document.body.classList.remove('seoil-view');
    var g = document.getElementById('seoil-viewguard'); if (g) g.remove();
    if (edit) { var a = api(); if (a && a.inputActive) a.inputActive(true); }
  }

  // 문서가 열릴 때(openBytes) 좁은 화면이면 뷰어로
  (function hook() {
    var R = window.rhwpStudio;
    if (!R || typeof R.openBytes !== 'function') return setTimeout(hook, 300);
    if (R.openBytes.__seoilView) return;
    var orig = R.openBytes;
    R.openBytes = function (bytes, name) {
      var r = orig.apply(this, arguments);
      if (narrow()) { var at = Date.now(); (function w() { if (fileName() && fileName() !== '새 문서.hwp') { enter(); ui.name.textContent = name || fileName(); } else if (Date.now() - at < 15000) setTimeout(w, 150); })(); }
      return r;
    };
    R.openBytes.__seoilView = true;
    // 파일 메뉴 「열기」·최근 문서로 연 경우: 파일명이 바뀌면 뷰어로
    var lastName = fileName();
    setInterval(function () {
      var n = fileName();
      if (n !== lastName) { lastName = n; if (n && n !== '새 문서.hwp' && narrow() && !on && !document.body.classList.contains('seoil-home-open')) enter(); if (!n || n === '새 문서.hwp') leave(false); }
      if (on) tick();
    }, 800);
  })();
  window.addEventListener('resize', function () { if (on) tick(); });
  window.SeoilView = { enter: enter, leave: leave, narrow: narrow };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
