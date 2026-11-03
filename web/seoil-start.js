// 서일 오피스 — 시작 화면 + 안전 영역 (2026-11-03, 첨부 양식 중심으로 개편).
// 앱을 켜면 빈 문서 대신 "무엇을 채울까요?"를 먼저 보여 준다. 핵심 경로는 하나:
//   공문에 붙어 온 양식(hwp·hwpx)을 고른다 → 편집기에 연다(원본 파일은 덮어쓰지 않음) → AI 패널이 칸을 채운다.
// 한 번 쓴 양식은 이 기기의 "최근 양식"(IndexedDB)에 남아 다음엔 바로 고른다. 부서(혁신·교무·산학)는 파일 이름으로 짐작.
// 공문(업무협조전) 회신은 그룹웨어가 하므로 여기서 다루지 않는다.
(function () {
  'use strict';

  // ---------- 안전 영역: 아이패드 앱·홈 화면 모드에서 상태 막대/홈 바와 겹치지 않게 ----------
  var css = [
    'html,body{height:100vh;height:100dvh}',
    '#studio-root{box-sizing:border-box;height:100vh!important;height:100dvh!important;padding-top:env(safe-area-inset-top);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);padding-bottom:env(safe-area-inset-bottom)}',
    '#seoil-ai{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}',
    '#seoil-ai-fab{bottom:calc(64px + env(safe-area-inset-bottom))!important;right:calc(14px + env(safe-area-inset-right))!important}',
    '#hwppad-keylock{bottom:calc(12px + env(safe-area-inset-bottom))!important}',
    // 시작 화면
    '#seoil-start{position:fixed;inset:0;z-index:2147482500;background:rgba(28,31,35,.42);display:none;align-items:center;justify-content:center;padding:calc(16px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom));font:14px/1.6 "Noto Sans KR",system-ui,-apple-system,sans-serif;color:#1C1F23}',
    '#seoil-start.open{display:flex}',
    '#seoil-start *{box-sizing:border-box}',
    '#seoil-start .sheet{background:#fff;border-radius:16px;width:min(580px,100%);max-height:100%;overflow:auto;padding:22px;box-shadow:0 12px 40px rgba(0,0,0,.18)}',
    '#seoil-start h2{font-size:19px;margin:0 0 2px}',
    '#seoil-start .sub{color:#5F6670;font-size:13px;margin-bottom:16px}',
    '#seoil-start .main{width:100%;text-align:left;border:0;border-radius:12px;background:#2F5BEA;color:#fff;padding:16px 18px;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:2px}',
    '#seoil-start .main b{font-size:16px}#seoil-start .main span{font-size:13px;opacity:.9}',
    '#seoil-start .sec{margin-top:16px;font-size:12px;color:#5F6670;font-weight:700}',
    '#seoil-start .tabs{display:flex;gap:6px;margin:8px 0;flex-wrap:wrap}',
    '#seoil-start .tab{font:inherit;font-size:12px;border:1px solid #D9DCE1;background:#fff;border-radius:14px;padding:3px 10px;cursor:pointer}#seoil-start .tab.on{background:#1C1F23;color:#fff;border-color:#1C1F23}',
    '#seoil-start .list{display:flex;flex-direction:column;gap:6px}',
    '#seoil-start .item{display:flex;align-items:center;gap:10px;border:1px solid #ECEEF1;border-radius:10px;padding:8px 12px;cursor:pointer;background:#fff;font:inherit;text-align:left;width:100%}',
    '#seoil-start .item:hover{border-color:#2F5BEA}#seoil-start .item b{flex:1;font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#seoil-start .item small{font-size:11px;color:#8A9099;white-space:nowrap}',
    '#seoil-start .dep{font-size:11px;border-radius:8px;padding:0 6px;background:#F4F5F7;color:#5F6670;white-space:nowrap}',
    '#seoil-start .empty{font-size:12px;color:#8A9099;padding:6px 2px}',
    '#seoil-start .tip{margin-top:14px;font-size:12px;color:#5F6670;background:#F4F5F7;border-radius:10px;padding:10px 12px}',
    '#seoil-start .foot{display:flex;justify-content:flex-end;gap:8px;align-items:center;margin-top:12px;font-size:12px;color:#8A9099}',
    '#seoil-start .link{border:0;background:none;font:inherit;color:#5F6670;text-decoration:underline;cursor:pointer;padding:4px}',
    '#seoil-start .msg{margin-top:12px;font-size:13px;color:#B42318}',
    // 양식이 열리면 위에 뜨는 띠
    '#seoil-fill-bar{position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top));z-index:2147482400;background:#1C1F23;color:#fff;border-radius:12px;padding:8px 10px 8px 16px;display:none;align-items:center;gap:12px;font:13px/1.5 "Noto Sans KR",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:calc(100vw - 32px)}',
    '#seoil-fill-bar.open{display:flex}',
    '#seoil-fill-bar button{font:inherit;border:0;border-radius:8px;padding:6px 12px;cursor:pointer;white-space:nowrap}',
    '#seoil-fill-bar .go{background:#2F5BEA;color:#fff}#seoil-fill-bar .no{background:transparent;color:#C9CDD3}',
    '#seoil-fill-bar .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}',
    'body.seoil-ai-open #seoil-fill-bar{display:none}',
  ].join('\n');

  var DB = 'seoil-office', STORE = 'kv', RECENT = 'forms.recent', MAX_RECENT = 20;
  var isApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var DEPTS = [
    ['혁신', /혁신|AID|AI·DX|정책과제|교재개발|동아리|성과공유|RISE|부트캠프|기자재/],
    ['교무', /강사|강의|교육과정|학사|교과|수업|출석|성적|재임용|교원|융합코스|학과 운영/],
    ['산학', /산학|현장실습|인프라|기업|기술|창업|가족회사|LINC|취업/],
  ];
  function deptOf(name) { for (var i = 0; i < DEPTS.length; i++) if (DEPTS[i][1].test(name)) return DEPTS[i][0]; return '기타'; }

  // ---------- 작은 도구 ----------
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'style') e.style.cssText = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function bridge() { return window.rhwpStudio && window.rhwpStudio.ai; }
  function doc() { var b = bridge(); return b && b.doc(); }
  function readBytes(file) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(new Uint8Array(r.result)); }; r.onerror = rej; r.readAsArrayBuffer(file); });
  }
  function ago(iso) {
    var d = (Date.now() - new Date(iso).getTime()) / 86400000;
    return d < 1 ? '오늘' : d < 2 ? '어제' : d < 30 ? Math.floor(d) + '일 전' : new Date(iso).toISOString().slice(0, 10);
  }

  // ---------- 최근 양식 (IndexedDB, 이 기기에만) ----------
  function idb() {
    return new Promise(function (res, rej) {
      try {
        var q = indexedDB.open(DB, 1);
        q.onupgradeneeded = function () { q.result.createObjectStore(STORE); };
        q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); };
      } catch (e) { rej(e); }
    });
  }
  function kv(op, key, val) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction(STORE, op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore(STORE);
        var q = op === 'get' ? st.get(key) : op === 'del' ? st.delete(key) : st.put(val, key);
        q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); };
      });
    }).catch(function () { return null; });
  }
  function recent() { return kv('get', RECENT).then(function (l) { return Array.isArray(l) ? l : []; }); }
  function remember(name, bytes) {
    return recent().then(function (l) {
      l = l.filter(function (x) { return x.name !== name; });
      l.unshift({ name: name, bytes: bytes, dept: deptOf(name), at: new Date().toISOString() });
      return kv('put', RECENT, l.slice(0, MAX_RECENT));
    });
  }

  // ---------- 양식 열기 ----------
  function waitDocChange(prev, ms) {
    var t0 = Date.now();
    return new Promise(function (res, rej) {
      (function tick() {
        var d = doc();
        if (d && d !== prev) return res(d);
        if (Date.now() - t0 > (ms || 60000)) return rej(new Error('문서를 열지 못했습니다'));
        setTimeout(tick, 150);
      })();
    });
  }
  /** 양식 바이트를 새 문서로 연다(저장 핸들 없음 → 원본 파일은 그대로). 수정 중인 문서가 있으면 편집기가 저장 여부를 묻는다. */
  async function openForm(bytes, name) {
    var open = window.rhwpStudio && window.rhwpStudio.openBytes;
    if (typeof open !== 'function') throw new Error('편집기가 아직 준비되지 않았습니다');
    var prev = doc();
    open(bytes.slice(), name, null);
    await waitDocChange(prev);
    remember(name, bytes);
    setTimeout(function () {
      if (window.SeoilAI) { window.SeoilAI.open(true); window.SeoilAI.reset(); }
    }, 300);
  }
  function pickForm() {
    pick('.hwp,.hwpx', async function (file) {
      try { busy(true); await openForm(await readBytes(file), file.name); busy(false); close(); }
      catch (e) { busy(false, '열지 못했습니다: ' + (e.message || e)); open(); }
    });
  }

  // ---------- 시작 화면 ----------
  var ui = {}, tab = '전체';
  function pick(accept, cb) {
    var inp = el('input', { type: 'file', accept: accept, style: 'display:none' });
    inp.addEventListener('change', function () { var f = inp.files && inp.files[0]; inp.remove(); if (f) cb(f); });
    document.body.appendChild(inp); inp.click();
  }
  function busy(on, t) { if (!ui.sheet) return; ui.sheet.style.opacity = on ? '.6' : '1'; ui.sheet.style.pointerEvents = on ? 'none' : ''; ui.msg.textContent = t || ''; }

  function drawList() {
    recent().then(function (l) {
      ui.tabs.innerHTML = ''; ui.list.innerHTML = '';
      ['전체', '혁신', '교무', '산학', '기타'].forEach(function (t) {
        var n = t === '전체' ? l.length : l.filter(function (x) { return x.dept === t; }).length;
        if (t !== '전체' && !n) return;
        ui.tabs.appendChild(el('button', { class: 'tab' + (tab === t ? ' on' : ''), text: t + (n ? ' ' + n : ''), onclick: function () { tab = t; drawList(); } }));
      });
      var show = tab === '전체' ? l : l.filter(function (x) { return x.dept === tab; });
      if (!show.length) { ui.list.appendChild(el('div', { class: 'empty', text: '아직 없습니다. 위 버튼으로 양식을 한 번 열면 여기에 남습니다.' })); return; }
      show.forEach(function (x) {
        ui.list.appendChild(el('button', { class: 'item', title: x.name, onclick: async function () {
          try { busy(true); await openForm(x.bytes, x.name); busy(false); close(); } catch (e) { busy(false, e.message || String(e)); }
        } }, [el('span', { class: 'dep', text: x.dept }), el('b', { text: x.name.replace(/\.(hwpx?|hml)$/i, '') }), el('small', { text: ago(x.at) })]));
      });
    });
  }

  function openFileMenu() {
    var it = document.querySelector('[data-cmd="file:open"]');
    if (it) { it.click(); return; }
    pick('.hwp,.hwpx,.hml', async function (file) { window.rhwpStudio.openBytes(await readBytes(file), file.name, null); });
  }

  function open() { drawList(); ui.root.classList.add('open'); }
  function close() { ui.root.classList.remove('open'); }

  // ---------- 양식이 열리면: 위에 "AI로 채우기" 띠 ----------
  var lastDoc = null;
  function watch() {
    var d = doc();
    if (!d || d === lastDoc) return;
    lastDoc = d;
    ui.bar.classList.remove('open');
    if (!window.SeoilFill || ui.root.classList.contains('open')) return;
    var m; try { m = window.SeoilFill.scan(d); } catch (e) { return; }
    var n = 0;
    m.tables.forEach(function (t) { if (!t.guideBox) t.cells.forEach(function (c) { if (c.kind === 'empty' || c.kind === 'ph' || c.kind === 'guide') n++; }); });
    m.paras.forEach(function (p) { if (p.kind === 'ph') n++; });
    if (n >= 2 && !document.body.classList.contains('seoil-ai-open')) {
      ui.barText.textContent = '채울 칸 ' + n + '개가 있는 양식입니다';
      ui.bar.classList.add('open');
    }
  }

  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    ui.tabs = el('div', { class: 'tabs' }); ui.list = el('div', { class: 'list' }); ui.msg = el('div', { class: 'msg' });
    ui.sheet = el('div', { class: 'sheet' }, [
      el('h2', { text: '무엇을 채울까요?' }),
      el('div', { class: 'sub', text: '공문에 붙어 온 양식을 원본 그대로 열고, 빈칸·자리표시만 AI와 채웁니다.' }),
      el('button', { class: 'main', onclick: pickForm }, [el('b', { text: '양식 채우기' }), el('span', { text: '신청서·계획서·회의록 hwp·hwpx 고르기' })]),
      el('div', { class: 'sec', text: '최근 양식' }), ui.tabs, ui.list,
      el('div', { class: 'tip', text: isApp
        ? '그룹웨어·메일에서 받은 첨부 양식은 파일 앱이나 Dropbox에 저장한 뒤 고르거나, 공유 → 「서일 오피스」로 바로 열 수 있습니다.'
        : '그룹웨어에서 받은 첨부 양식을 내려받아 고르세요. 편집기에 바로 열어도 위에 「AI로 채우기」가 뜹니다.' }),
      ui.msg,
      el('div', { class: 'foot' }, [
        el('button', { class: 'link', text: '파일 열기(편집만)', onclick: function () { close(); openFileMenu(); } }),
        el('button', { class: 'link', text: '빈 문서로 시작', onclick: close }),
      ]),
    ]);
    ui.root = el('div', { id: 'seoil-start' }, [ui.sheet]);
    ui.root.addEventListener('click', function (e) { if (e.target === ui.root) close(); });
    ['keydown', 'keyup', 'keypress'].forEach(function (t) { ui.root.addEventListener(t, function (e) { if (e.key === 'Escape') close(); e.stopPropagation(); }); });
    ui.barText = el('span', { class: 't' });
    ui.bar = el('div', { id: 'seoil-fill-bar' }, [ui.barText,
      el('button', { class: 'go', text: 'AI로 채우기', onclick: function () { ui.bar.classList.remove('open'); var d = doc(), b = bridge(); if (d && b) remember(b.fileName() || '양식.hwp', d.exportHwp()); if (window.SeoilAI) { window.SeoilAI.open(true); window.SeoilAI.reset(); } } }),
      el('button', { class: 'no', text: '닫기', onclick: function () { ui.bar.classList.remove('open'); } })]);
    document.body.appendChild(ui.root);
    document.body.appendChild(ui.bar);

    // 편집기가 뜨면: 파일을 열고 들어온 경우가 아니면 시작 화면
    var t0 = Date.now();
    (function wait() {
      var d = doc();
      if (!d) { if (Date.now() - t0 < 15000) setTimeout(wait, 200); else if (!/[?&]nostart\b/.test(location.search)) open(); return; }
      setTimeout(function () {
        var name = (bridge().fileName && bridge().fileName()) || '';
        var opened = doc() !== d || !/^(새 문서|document)\.hwp$/.test(name);
        if (!opened && !/[?&]nostart\b/.test(location.search)) open();
        lastDoc = opened ? null : doc();
        setInterval(watch, 700);
      }, isApp ? 1200 : 500);
    })();
  }

  window.SeoilStart = { open: open, close: close, pickForm: pickForm, openForm: openForm, recent: recent };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
