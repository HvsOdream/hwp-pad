// 서일 오피스 — 홈 화면(C안) + 안전 영역 (2026-11-03).
// 앱을 켜면 전체 화면 홈: 검색 · 입구 셋(새 문서 / 양식 채우기 / 파일 열기) · 내 양식 · 최근 문서.
//  - 내 양식: 「양식 채우기」로 한 번 연 양식(원본 바이트)이 이 기기에 남고, 파일 이름으로 혁신·교무·산학·기타를 짐작.
//    부서는 바꿀 수 있고 ×로 지울 수 있다. 처음엔 비어 있다.
//  - 최근 문서: 작업 중인 문서를 이 기기에 가끔 저장해 두었다가(30초마다, 바뀐 경우만) 다시 연다 — "이어서 쓰기".
//  - 양식이 아닌 파일을 열어도 빈칸이 있으면 위에 「AI로 채우기」 띠가 뜬다.
// 모든 기록은 IndexedDB(이 기기에만). 원본 파일은 덮어쓰지 않는다(양식·최근 문서는 저장 핸들 없이 연다).
(function () {
  'use strict';

  var css = [
    // 안전 영역: 아이패드 앱·홈 화면 모드에서 상태 막대/홈 바와 겹치지 않게
    'html,body{height:100vh;height:100dvh}',
    '#studio-root{box-sizing:border-box;height:100vh!important;height:100dvh!important;padding-top:env(safe-area-inset-top);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right);padding-bottom:env(safe-area-inset-bottom)}',
    '#seoil-ai{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}',
    '#seoil-ai-fab{bottom:calc(64px + env(safe-area-inset-bottom))!important;right:calc(14px + env(safe-area-inset-right))!important}',
    '#hwppad-keylock{bottom:calc(12px + env(safe-area-inset-bottom))!important}',
    'body.seoil-home-open #seoil-ai-fab,body.seoil-home-open #seoil-home-btn,body.seoil-home-open #hwppad-keylock,body.seoil-home-open #hwppad-help,body.seoil-home-open #hwppad-install{display:none!important}',
    // 홈
    '#seoil-home{position:fixed;inset:0;z-index:900;background:#fff;display:none;overflow:auto;font:14px/1.6 "Noto Sans KR",system-ui,-apple-system,sans-serif;color:#1C1F23;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}',
    '#seoil-home.open{display:block}',
    '#seoil-home *{box-sizing:border-box}',
    '#seoil-home .top{display:flex;align-items:center;gap:12px;padding:16px 28px}',
    '#seoil-home .logo{width:28px;height:28px;border-radius:7px;background:#1C1F23;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}',
    '#seoil-home .me{font:inherit;font-size:13px;height:40px;padding:0 12px;border:0;background:#EEF2FD;border-radius:10px;color:#2F5BEA;cursor:pointer}',
    '#seoil-home .back{font:inherit;font-size:13px;height:40px;padding:0 12px;border:1px solid #D5D9DF;background:#fff;border-radius:10px;color:#1C1F23;cursor:pointer}',
    '#seoil-home main{max-width:1080px;margin:0 auto;padding:40px 24px 56px;display:flex;flex-direction:column;gap:28px}',
    '#seoil-home h1{margin:0;font-size:30px;font-weight:700;letter-spacing:-.5px;text-align:center}',
    '#seoil-home .search{width:100%;max-width:720px;margin:0 auto;display:flex;align-items:center;gap:12px;border:2px solid #1C1F23;border-radius:14px;padding:0 18px;height:58px;background:#fff}',
    '#seoil-home .search input{border:0;font:inherit;font-size:17px;flex:1;outline:none;color:#1C1F23;background:transparent;min-width:0}',
    '#seoil-home .doors{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}',
    '#seoil-home .door{font:inherit;text-align:left;border:1px solid #E3E6EA;border-radius:16px;background:#fff;padding:22px;display:flex;flex-direction:column;gap:10px;cursor:pointer;min-height:168px;color:#1C1F23}',
    '#seoil-home .door:hover{border-color:#2F5BEA}',
    '#seoil-home .door.main{border:0;background:#2F5BEA;color:#fff}',
    '#seoil-home .door .ic{width:44px;height:44px;border-radius:12px;background:#F1F2F4;display:flex;align-items:center;justify-content:center}',
    '#seoil-home .door.main .ic{background:rgba(255,255,255,.16)}',
    '#seoil-home .door b{font-size:18px}',
    '#seoil-home .door .d{font-size:13px;color:#5F6670;line-height:1.55}',
    '#seoil-home .door.main .d,#seoil-home .door.main .k{color:#DCE4FD}',
    '#seoil-home .door .k{margin-top:auto;font-size:12px;color:#6B7280}',
    '#seoil-home .door .sub{font-size:12px;border:1px solid #D5D9DF;border-radius:8px;padding:6px 10px;color:#1C1F23;background:#fff;cursor:pointer;min-height:32px;display:inline-flex;align-items:center}',
    '#seoil-home .door .sub:hover{border-color:#2F5BEA;color:#2F5BEA}',
    '#seoil-home .door .sub.on{background:#1C1F23;border-color:#1C1F23;color:#fff}',
    '#seoil-home .tpl{display:flex;flex-direction:column;gap:12px}',
    '#seoil-home .tpls{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}',
    '#seoil-home .tc{font:inherit;text-align:left;border:1px solid #E3E6EA;border-radius:12px;background:#fff;padding:12px;display:flex;gap:12px;align-items:center;cursor:pointer;color:#1C1F23;min-height:96px}',
    '#seoil-home .tc:hover{border-color:#2F5BEA}',
    '#seoil-home .thumb{flex:none;width:54px;height:72px;border:1px solid #D5D9DF;border-radius:4px;background:#fff;padding:7px 6px;display:flex;flex-direction:column;gap:4px}',
    '#seoil-home .thumb i{display:block;height:3px;background:#C9CDD3;border-radius:2px}',
    '#seoil-home .thumb .bx{height:7px;background:none;display:flex;gap:2px}#seoil-home .thumb .bx b{width:8px;background:#1E3A6B;border-radius:1px}#seoil-home .thumb .bx s{flex:1;background:#DCE6F5;border:1px solid #8FA8D4;border-radius:1px}',
    '#seoil-home .thumb .h{width:60%;background:#5F6670}',
    '#seoil-home .thumb .l1{width:80%;margin-left:3px}#seoil-home .thumb .l2{width:75%;margin-left:7px}#seoil-home .thumb .s{width:60%}',
    '#seoil-home .tt{display:flex;flex-direction:column;gap:2px;min-width:0}#seoil-home .tt b{font-size:15px}#seoil-home .tt small{font-size:12px;color:#5F6670;line-height:1.5}',
    '#seoil-home .cols{display:flex;flex-wrap:wrap;gap:20px;margin-top:8px}',
    '#seoil-home .col{min-width:0;display:flex;flex-direction:column;gap:12px}',
    '#seoil-home h2{margin:0;font-size:16px;font-weight:700}',
    '#seoil-home .tabs{display:flex;flex-wrap:wrap;gap:6px}',
    '#seoil-home .tab{font:inherit;font-size:12px;height:32px;padding:0 12px;border-radius:16px;border:1px solid #D5D9DF;background:#fff;color:#1C1F23;cursor:pointer}',
    '#seoil-home .tab.on{border-color:#1C1F23;background:#1C1F23;color:#fff}',
    '#seoil-home .row{display:flex;align-items:center;gap:10px;padding:8px 8px 8px 12px;border:1px solid #EEF0F3;border-radius:10px;min-height:52px}',
    '#seoil-home .row select{font:inherit;font-size:12px;font-weight:700;height:28px;padding:0 4px;border-radius:6px;border:0;cursor:pointer}',
    '#seoil-home .row .nm{flex:1;min-width:0;font:inherit;font-size:14px;color:#1C1F23;text-align:left;background:none;border:0;padding:6px 0;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#seoil-home .row .nm:hover{color:#2F5BEA}',
    '#seoil-home .when{font-size:12px;color:#6B7280;flex:none}',
    '#seoil-home .tc.pin{position:relative;cursor:pointer}',
    '#seoil-home .tc .unpin{position:absolute;top:6px;right:6px;width:26px;height:26px;border:0;border-radius:6px;background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}',
    '#seoil-home .tc .unpin:hover{background:#F1F2F4}',
    '#seoil-home .undo{flex:1;display:flex;align-items:center;gap:12px;font-size:13px;color:#5F6670}',
    '#seoil-home .undo-b{font:inherit;font-size:13px;font-weight:700;color:#2F5BEA;background:#EEF2FD;border:0;border-radius:6px;padding:5px 10px;cursor:pointer}',
    '#seoil-home .x{width:36px;height:36px;border:0;background:transparent;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex:none}',
    '#seoil-home .x:hover{background:#F4F5F7}',
    '#seoil-home .empty{border:2px dashed #D5D9DF;border-radius:12px;padding:28px 20px;text-align:center;font-size:13px;color:#5F6670;line-height:1.6}',
    '#seoil-home .rc{display:flex;align-items:center;gap:6px;border:1px solid #EEF0F3;border-radius:10px;background:#FAFAFB;padding:4px 4px 4px 0}',
    '#seoil-home .rc .open{flex:1;min-width:0;font:inherit;text-align:left;border:0;background:none;padding:8px 6px 8px 14px;cursor:pointer;display:flex;flex-direction:column;gap:4px;color:#1C1F23}',
    '#seoil-home .rc .open:hover b{color:#2F5BEA}',
    '#seoil-home .rc b{font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block}',
    '#seoil-home .rc .tag{font-size:11px;color:#5F6670;border:1px solid #D5D9DF;border-radius:6px;padding:0 6px;margin-right:6px;font-weight:400}',
    '#seoil-home .rc .meta{font-size:12px;color:#5F6670}',
    '#seoil-home .msg{font-size:13px;color:#B42318;text-align:center;min-height:1px}',
    '#seoil-home .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}',
    '#seoil-home.drag main{outline:3px dashed #2F5BEA;outline-offset:8px;border-radius:16px}',
    // 편집 중 홈으로 돌아가는 버튼
    '#seoil-home-btn{position:fixed;right:calc(14px + env(safe-area-inset-right));bottom:calc(112px + env(safe-area-inset-bottom));z-index:2147481998;font:600 13px "Noto Sans KR",system-ui,sans-serif;padding:9px 14px;border:1px solid #D5D9DF;border-radius:20px;background:#fff;color:#1C1F23;box-shadow:0 4px 14px rgba(0,0,0,.08);cursor:pointer}',
    'body.seoil-ai-open #seoil-home-btn{display:none}',
    // 빈칸이 있는 파일을 열면 위에 뜨는 띠
    '#seoil-fill-bar{position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top));z-index:2147482400;background:#1C1F23;color:#fff;border-radius:12px;padding:8px 10px 8px 16px;display:none;align-items:center;gap:12px;font:13px/1.5 "Noto Sans KR",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:calc(100vw - 32px)}',
    '#seoil-fill-bar.open{display:flex}',
    '#seoil-fill-bar button{font:inherit;border:0;border-radius:8px;padding:6px 12px;cursor:pointer;white-space:nowrap}',
    '#seoil-fill-bar .go{background:#2F5BEA;color:#fff}#seoil-fill-bar .no{background:transparent;color:#C9CDD3}',
    '#seoil-fill-bar .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}',
    'body.seoil-ai-open #seoil-fill-bar,body.seoil-home-open #seoil-fill-bar{display:none}',
  ].join('\n');

  var DB = 'seoil-office', STORE = 'kv', FORMS = 'forms.mine', RECENT = 'docs.recent', MAX_FORMS = 40, MAX_RECENT = 8, MAX_BYTES = 8 * 1024 * 1024;
  var DEPTS = ['혁신', '교무', '산학', '기타'];
  var CHIP = { '혁신': ['#EEF2FD', '#1E44C4'], '교무': ['#FFF1E6', '#9A4A08'], '산학': ['#E8F5EE', '#17683F'], '기타': ['#F1F2F4', '#4B5260'] };
  var GUESS = [
    ['혁신', /혁신|AID|AI·DX|DX|정책과제|교재개발|동아리|성과공유|RISE|부트캠프|기자재|비품/],
    ['교무', /강사|강의|교육과정|학사|교과|수업|출석|성적|재임용|교원|융합코스|학과 운영|휴보강/],
    ['산학', /산학|현장실습|인프라|기업|기술이전|창업|가족회사|LINC|취업|수탁/],
  ];
  function guessDept(name) { for (var i = 0; i < GUESS.length; i++) if (GUESS[i][1].test(name)) return GUESS[i][0]; return '기타'; }
  var isApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  // ---------- 작은 도구 ----------
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'style') e.style.cssText = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'value') e.value = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function svg(path, color) { return el('span', { 'aria-hidden': 'true', style: 'display:inline-flex', html: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="' + (color || '#1C1F23') + '" stroke-width="1.8">' + path + '</svg>' }); }
  function bridge() { return window.rhwpStudio && window.rhwpStudio.ai; }
  function doc() { var b = bridge(); return b && b.doc(); }
  function fileName() { var b = bridge(); return (b && b.fileName && b.fileName()) || ''; }
  function readBytes(file) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(new Uint8Array(r.result)); }; r.onerror = rej; r.readAsArrayBuffer(file); }); }
  function stem(n) { return String(n || '').replace(/\.(hwpx?|hml)$/i, ''); }
  function ago(iso) {
    var t = new Date(iso), d = (Date.now() - t.getTime()) / 86400000;
    if (d < 1 && t.getDate() === new Date().getDate()) return '오늘';
    return d < 2 ? '어제' : d < 14 ? Math.floor(d) + '일 전' : (t.getMonth() + 1) + '월 ' + t.getDate() + '일';
  }
  function norm(s) { return String(s || '').replace(/\s/g, '').toLowerCase(); }

  // ---------- IndexedDB (이 기기에만) ----------
  function idb() {
    return new Promise(function (res, rej) {
      try { var q = indexedDB.open(DB, 1); q.onupgradeneeded = function () { q.result.createObjectStore(STORE); }; q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); }; }
      catch (e) { rej(e); }
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
  function list(key) { return kv('get', key).then(function (l) { return Array.isArray(l) ? l : []; }); }
  function update(key, fn) { return list(key).then(function (l) { var n = fn(l); return kv('put', key, n).then(function () { return n; }); }); }

  function rememberForm(name, bytes) {
    return update(FORMS, function (l) {
      var old = l.filter(function (x) { return x.name === name; })[0];
      l = l.filter(function (x) { return x.name !== name; });
      l.unshift({ name: name, bytes: bytes, dept: old ? old.dept : guessDept(name), at: new Date().toISOString() });
      return l.slice(0, MAX_FORMS);
    });
  }

  // ---------- 최근 문서: 작업 중인 문서를 가끔 이 기기에 저장 ----------
  var cur = { doc: null, tag: '파일', name: '', sig: '' };
  function progressOf(d) {
    if (!window.SeoilFill) return '';
    try {
      var m = window.SeoilFill.scan(d), left = 0;
      m.tables.forEach(function (t) { if (!t.guideBox) t.cells.forEach(function (c) { if (c.kind === 'empty' || c.kind === 'ph' || c.kind === 'guide') left++; }); });
      m.paras.forEach(function (p) { if (p.kind === 'ph') left++; });
      return left ? '작성 중' : '';
    } catch (e) { return ''; }
  }
  function snapshot(force) {
    var d = doc(); if (!d || d !== cur.doc) return Promise.resolve();
    var bytes;
    try { if (!force && d.isEmptyDocument && d.isEmptyDocument()) return Promise.resolve(); bytes = d.exportHwp(); } catch (e) { return Promise.resolve(); }
    if (!bytes || bytes.length > MAX_BYTES) return Promise.resolve();
    var sig = bytes.length + ':' + bytes[bytes.length >> 1] + ':' + bytes[bytes.length - 7];
    if (!force && sig === cur.sig) return Promise.resolve();
    cur.sig = sig;
    var name = fileName() || cur.name || '새 문서.hwp', pages = 0;
    try { pages = d.pageCount(); } catch (e) {}
    var meta = [pages ? pages + '쪽' : '', cur.tag === '양식' ? progressOf(d) : ''].filter(Boolean).join(' · ');
    return update(RECENT, function (l) {
      l = l.filter(function (x) { return x.name !== name; });
      l.unshift({ name: name, tag: cur.tag, bytes: bytes, meta: meta, at: new Date().toISOString() });
      return l.slice(0, MAX_RECENT);
    });
  }

  // ---------- 열기 ----------
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
  var nextTag = null;
  async function openBytes(bytes, name, tag) {
    var open = window.rhwpStudio && window.rhwpStudio.openBytes;
    if (typeof open !== 'function') throw new Error('편집기가 아직 준비되지 않았습니다');
    await snapshot(false);
    var prev = doc();
    nextTag = tag;
    open(bytes.slice(), name, null); // 저장 핸들 없음 → 원본은 그대로, Ctrl+S는 새 파일로 저장
    await waitDocChange(prev);
  }
  async function openForm(bytes, name) {
    await openBytes(bytes, name, '양식');
    rememberForm(name, bytes);
    close();
    setTimeout(function () { if (window.SeoilAI) { window.SeoilAI.open(true); window.SeoilAI.reset(); } }, 300);
  }
  /** 지금 문서의 사본을 새 이름(…_YYYYMMDD.hwp)으로 연다. 원본은 내 양식에 남긴다. */
  async function forkCopy() {
    var d = doc(); if (!d) throw new Error('열린 문서가 없습니다');
    var orig = fileName() || '문서.hwp', bytes = d.exportHwp();
    var t = new Date(), ymd = t.getFullYear() + String(t.getMonth() + 1).padStart(2, '0') + String(t.getDate()).padStart(2, '0');
    var name = stem(orig).replace(/[_\s-]*(20\d{2}[.\-]?\d{2}[.\-]?\d{2}|\d{6,8})$/, '') + '_' + ymd + '.hwp';
    rememberForm(orig.replace(/\.(hwpx|hml)$/i, '.hwp'), bytes);
    await openBytes(bytes, name, '양식');
    close();
  }
  function pickForm() {
    pick('.hwp,.hwpx', async function (file) {
      try { busy(true); await openForm(await readBytes(file), file.name); busy(false); }
      catch (e) { busy(false, '열지 못했습니다: ' + (e.message || e)); }
    });
  }
  function newDoc() {
    snapshot(false);
    nextTag = '새 문서';
    var it = document.querySelector('[data-cmd="file:new-doc"]');
    close();
    if (it) { it.classList.remove('disabled'); it.click(); return; }
    var D = doc() && doc().constructor;
    if (D && D.createEmpty) { try { window.rhwpStudio.openBytes(D.createEmpty().exportHwp(), '새 문서.hwp', null); } catch (e) {} }
  }
  /** 문서 닫기: 저장 안 한 변경이 있으면 편집기가 묻고(저장·저장 안 함·취소), 닫히면 홈으로 */
  async function closeDoc() {
    var it = document.querySelector('[data-cmd="file:new-doc"]');
    if (!it) return;
    var before = doc(), name0 = fileName();
    snapshot(false);
    nextTag = '새 문서';
    it.classList.remove('disabled'); it.click();
    // 새 빈 문서로 바뀌면 홈으로. 편집기가 같은 문서 객체를 다시 쓰기도 해서 이름 바뀜도 본다.
    // 저장 확인에서 취소하면(2분 안에 안 바뀌면) 그대로 둔다
    for (var t0 = Date.now(); Date.now() - t0 < 120000; ) {
      if (doc() && (doc() !== before || fileName() !== name0)) { open(); return; }
      await new Promise(function (r) { setTimeout(r, 150); });
    }
  }
  /** 기본 양식 파일(web/forms)을 양식으로 연다 — 내 양식에는 따로 남기지 않는다 */
  async function openBuiltin(file, name) {
    try {
      busy(true);
      var r = await fetch('forms/' + encodeURIComponent(file));
      if (!r.ok) throw new Error('양식을 받지 못했습니다');
      await openBytes(new Uint8Array(await r.arrayBuffer()), name, '양식');
      busy(false); close();
      setTimeout(function () { if (window.SeoilAI) { window.SeoilAI.open(true); window.SeoilAI.reset(); } }, 300);
    } catch (e) { busy(false, e.message || String(e)); }
  }
  /** 서일 보고서 기본 양식(표지 + Ⅰ장 + 1. □ ○ 단계 스타일)으로 새 문서 */
  async function newReport() {
    try {
      busy(true);
      var r = await fetch('forms/' + encodeURIComponent('서일_보고서') + '.hwp');
      if (!r.ok) throw new Error('보고서 양식을 받지 못했습니다');
      var bytes = new Uint8Array(await r.arrayBuffer());
      await openBytes(bytes, '보고서.hwp', '보고서');
      busy(false); close();
      setTimeout(function () { if (window.SeoilAI) { window.SeoilAI.open(true); window.SeoilAI.reset(); } }, 300);
    } catch (e) { busy(false, e.message || String(e)); }
  }
  function openFile() {
    snapshot(false);
    nextTag = '파일';
    var it = document.querySelector('[data-cmd="file:open"]');
    if (it) { close(); it.click(); return; }
    pick('.hwp,.hwpx,.hml', async function (file) { await openBytes(await readBytes(file), file.name, '파일'); close(); });
  }
  function pick(accept, cb) {
    var inp = el('input', { type: 'file', accept: accept, style: 'display:none' });
    inp.addEventListener('change', function () { var f = inp.files && inp.files[0]; inp.remove(); if (f) cb(f); });
    document.body.appendChild(inp); inp.click();
  }

  // ---------- 홈 그리기 ----------
  var ui = {}, S = { tab: '전체', q: '' };
  function busy(on, t) { ui.main.style.opacity = on ? '.6' : '1'; ui.main.style.pointerEvents = on ? 'none' : ''; ui.msg.textContent = t || ''; }

  function door(cls, icon, iconColor, title, desc, key, onclick) {
    return el('button', { type: 'button', class: 'door' + (cls ? ' ' + cls : ''), onclick: onclick }, [
      el('span', { class: 'ic' }, [svg(icon, iconColor)]), el('b', { text: title }), el('span', { class: 'd', text: desc }), el('span', { class: 'k', text: key })]);
  }

  function drawForms() {
    list(FORMS).then(function (forms) {
      var q = norm(S.q);
      drawPinned(forms.filter(function (f) { return f.pinned; }));
      forms = forms.filter(function (f) { return !f.pinned; });
      ui.tabs.innerHTML = '';
      if (forms.length) ['전체'].concat(DEPTS).forEach(function (t) {
        var n = t === '전체' ? forms.length : forms.filter(function (f) { return f.dept === t; }).length;
        if (t !== '전체' && !n) return;
        ui.tabs.appendChild(el('button', { type: 'button', role: 'tab', 'aria-selected': String(S.tab === t), class: 'tab' + (S.tab === t ? ' on' : ''), text: t + ' ' + n, onclick: function () { S.tab = t; drawForms(); } }));
      });
      if (S.tab !== '전체' && !forms.some(function (f) { return f.dept === S.tab; })) S.tab = '전체';
      var shown = forms.filter(function (f) { return (S.tab === '전체' || f.dept === S.tab) && (!q || norm(f.name).indexOf(q) >= 0); });
      ui.forms.innerHTML = '';
      if (!forms.length) { ui.forms.appendChild(el('div', { class: 'empty', text: '아직 양식이 없습니다. 「양식 채우기」로 한 번 열면 여기에 부서별로 남습니다.' })); return; }
      if (!shown.length) { ui.forms.appendChild(el('div', { class: 'empty', text: '찾는 양식이 없습니다.' })); return; }
      shown.forEach(function (f) {
        var sel = el('select', { 'aria-label': '부서 바꾸기', style: 'background:' + CHIP[f.dept][0] + ';color:' + CHIP[f.dept][1], onchange: function () {
          var v = sel.value; update(FORMS, function (l) { l.forEach(function (x) { if (x.name === f.name) x.dept = v; }); return l; }).then(drawForms);
        } }, DEPTS.map(function (d) { var o = el('option', { value: d, text: d }); if (d === f.dept) o.selected = true; return o; }));
        ui.forms.appendChild(el('div', { class: 'row' }, [
          sel,
          el('button', { type: 'button', class: 'nm', title: f.name, text: stem(f.name), onclick: async function () {
            try { busy(true); await openForm(f.bytes, f.name); busy(false); } catch (e) { busy(false, e.message || String(e)); }
          } }),
          el('span', { class: 'when', text: ago(f.at) }),
          el('button', { type: 'button', class: 'x', 'aria-label': '기본 양식으로 올리기', title: '기본 양식으로 올리기(위 「서일 기본 양식」에 고정)', onclick: function () {
            setPinned(f.name, true);
          } }, [svg('<path d="M12 17v5"/><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/>', '#6B7280')]),
          el('button', { type: 'button', class: 'x', 'aria-label': '내 양식에서 지우기', title: '내 양식에서 지우기', onclick: function (e) {
            askRemove(e.currentTarget.parentNode, f);
          } }, [svg('<path d="M6 6l12 12M18 6L6 18"/>', '#6B7280')]),
        ]));
      });
    });
  }

  // 내 양식 → 기본 양식 고정(이 기기). 고정한 양식은 「서일 기본 양식」 줄에 카드로 서고, 내 양식 목록에서는 빠진다.
  function setPinned(name, on) {
    return update(FORMS, function (l) { l.forEach(function (x) { if (x.name === name) x.pinned = on; }); return l; }).then(drawForms);
  }
  function drawPinned(pins) {
    if (!ui.tpls) return;
    Array.prototype.slice.call(ui.tpls.querySelectorAll('.pin')).forEach(function (n) { n.remove(); });
    pins.forEach(function (f) {
      var card = el('div', { class: 'tc pin', role: 'button', tabindex: '0', title: f.name, onclick: async function () {
        try { busy(true); await openForm(f.bytes, f.name); busy(false); } catch (e) { busy(false, e.message || String(e)); }
      } }, [
        el('span', { class: 'thumb', 'aria-hidden': 'true', html: '<i class="h"></i><i class="l1"></i><i class="l2"></i><i class="l2 s"></i><i class="l1"></i>' }),
        el('span', { class: 'tt' }, [el('b', { text: stem(f.name) }), el('small', { text: (f.dept || '') + ' · 내 양식에서 고정' })]),
        el('button', { type: 'button', class: 'unpin', title: '고정 풀기(내 양식으로 내리기)', 'aria-label': '고정 풀기', onclick: function (e) { e.stopPropagation(); setPinned(f.name, false); } }, [svg('<path d="M6 6l12 12M18 6L6 18"/>', '#9AA0A8')]),
      ]);
      ui.tpls.appendChild(card);
    });
  }
  // 지우기는 바로 하지 않는다: 그 줄에 「지웠습니다 · 되돌리기」를 6초 보여 주고 그동안 안 누르면 지운다
  function askRemove(row, f) {
    if (!row || row.dataset.removing) return;
    row.dataset.removing = '1';
    var kids = Array.prototype.slice.call(row.childNodes);
    kids.forEach(function (k) { k.style.display = 'none'; });
    var timer = null;
    var bar = el('span', { class: 'undo' }, [
      el('span', { text: '「' + stem(f.name) + '」을 내 양식에서 지웁니다' }),
      el('button', { type: 'button', class: 'undo-b', text: '되돌리기', onclick: function () {
        clearTimeout(timer); bar.remove(); kids.forEach(function (k) { k.style.display = ''; }); delete row.dataset.removing;
      } }),
    ]);
    row.appendChild(bar);
    timer = setTimeout(function () {
      update(FORMS, function (l) { return l.filter(function (x) { return x.name !== f.name; }); }).then(drawForms);
    }, 6000);
  }

  function drawRecent() {
    list(RECENT).then(function (docs) {
      var q = norm(S.q);
      var shown = docs.filter(function (d) { return !q || norm(d.name).indexOf(q) >= 0; });
      ui.recent.innerHTML = '';
      if (!docs.length) { ui.recent.appendChild(el('div', { class: 'empty', text: '작업한 문서가 여기에 남습니다. 이 기기에만 저장됩니다.' })); return; }
      if (!shown.length) { ui.recent.appendChild(el('div', { class: 'empty', text: '찾는 문서가 없습니다.' })); return; }
      shown.forEach(function (d) {
        ui.recent.appendChild(el('div', { class: 'rc' }, [
          el('button', { type: 'button', class: 'open', title: d.name, onclick: async function () {
            try { busy(true); await openBytes(d.bytes, d.name, d.tag); busy(false); close(); } catch (e) { busy(false, e.message || String(e)); }
          } }, [
            el('b', {}, [el('span', { class: 'tag', text: d.tag }), stem(d.name)]),
            el('span', { class: 'meta', text: [ago(d.at), d.meta].filter(Boolean).join(' · ') }),
          ]),
          el('button', { type: 'button', class: 'x', 'aria-label': '최근 문서에서 지우기', title: '최근 문서에서 지우기', onclick: function () {
            update(RECENT, function (l) { return l.filter(function (x) { return x.name !== d.name; }); }).then(drawRecent);
          } }, [svg('<path d="M6 6l12 12M18 6L6 18"/>', '#6B7280')]),
        ]));
      });
    });
  }

  function open() {
    snapshot(false).then(drawRecent);
    drawForms(); drawRecent();
    ui.back.style.display = doc() && cur.doc && fileName() ? '' : 'none';
    ui.root.classList.add('open'); document.body.classList.add('seoil-home-open');
    ui.bar.classList.remove('open');
  }
  function close() { ui.root.classList.remove('open'); document.body.classList.remove('seoil-home-open'); }
  function isOpen() { return ui.root.classList.contains('open'); }

  // ---------- 문서가 바뀌면: 최근 문서 기록 + 빈칸 있으면 「AI로 채우기」 ----------
  function watch() {
    var d = doc();
    if (!d || d === cur.doc) return;
    cur = { doc: d, tag: nextTag || '파일', name: fileName(), sig: '' };
    nextTag = null;
    ui.bar.classList.remove('open');
    if (isOpen() || cur.tag === '새 문서' || !window.SeoilFill || /^새 문서/.test(cur.name)) return;
    var m; try { m = window.SeoilFill.scan(d); } catch (e) { return; }
    var n = 0;
    m.tables.forEach(function (t) { if (!t.guideBox) t.cells.forEach(function (c) { if (c.kind === 'empty' || c.kind === 'ph' || c.kind === 'guide') n++; }); });
    m.paras.forEach(function (p) { if (p.kind === 'ph') n++; });
    if (cur.tag === '양식' || cur.tag === '보고서' || document.body.classList.contains('seoil-ai-open')) return;
    var filledForm = window.SeoilFill.looksFilled ? window.SeoilFill.looksFilled(m) : false;
    if (n >= 2 || filledForm) {
      ui.bar.dataset.mode = filledForm ? 'rewrite' : 'fill';
      ui.barText.textContent = filledForm ? '다 쓴 양식이네요. 이걸 바탕으로 새로 쓸까요?' : '채울 칸이 있는 양식이네요';
      ui.barGo.textContent = filledForm ? '새로 쓰기' : 'AI로 채우기';
      ui.bar.classList.add('open');
    }
  }

  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    ui.msg = el('div', { class: 'msg', role: 'status' });
    ui.search = el('input', { type: 'text', placeholder: '내 양식·최근 문서에서 찾기', 'aria-label': '내 양식과 최근 문서에서 찾기', oninput: function () { S.q = ui.search.value; drawForms(); drawRecent(); } });
    ui.tabs = el('div', { class: 'tabs', role: 'tablist', 'aria-label': '부서' });
    ui.forms = el('div', { style: 'display:flex;flex-direction:column;gap:6px' });
    ui.recent = el('div', { style: 'display:flex;flex-direction:column;gap:8px' });
    ui.back = el('button', { type: 'button', class: 'back', text: '← 편집 중인 문서로', onclick: close });
    ui.main = el('main', {}, [
      el('div', { style: 'display:flex;flex-direction:column;gap:18px' }, [
        el('h1', { text: '무엇을 쓸까요?' }),
        el('label', { class: 'search' }, [svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'), ui.search]),
      ]),
      el('div', { class: 'doors' }, [
        door('', '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M12 11v6M9 14h6"/>', '#1C1F23', '새 문서', 'A4 빈 문서로 바로 씁니다. 오른쪽 AI에게 초안을 부탁해도 됩니다.', 'Ctrl+N', newDoc),
        door('main', '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 10v10"/><path d="M13 14.5h4M13 17h3"/>', '#FFFFFF', '양식 채우기', '공문에 붙어 온 hwp 양식을 원본 그대로 열고, 빈칸을 AI와 채웁니다.', 'hwp·hwpx를 화면에 놓아도 됩니다', pickForm),
        door('', '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', '#1C1F23', '파일 열기', '가지고 있는 한글 문서를 열어 편집합니다. 빈칸이 있으면 AI가 먼저 제안합니다.', 'Ctrl+O', openFile),
      ]),
      ui.msg,
      el('section', { class: 'tpl' }, [
        el('h2', { text: '서일 기본 양식' }),
        ui.tpls = el('div', { class: 'tpls' }, [
          el('button', { type: 'button', class: 'tc', onclick: newReport, 'aria-label': '보고서 양식으로 새 문서' }, [
            el('span', { class: 'thumb', 'aria-hidden': 'true', html: '<i class="bx"><b></b><s></s></i><i class="h"></i><i class="l1"></i><i class="l2"></i><i class="l2 s"></i><i class="l1"></i><i class="l2"></i>' }),
            el('span', { class: 'tt' }, [el('b', { text: '보고서' }), el('small', { text: '표지 · Ⅰ. 장 · 1. 절 · □ ○ - 개조식' })]),
          ]),
          el('button', { type: 'button', class: 'tc', onclick: function () { openBuiltin('회의록_혁신.hwpx', '회의록(양식).hwpx'); }, 'aria-label': '회의록 양식(혁신) 열기' }, [
            el('span', { class: 'thumb', 'aria-hidden': 'true', html: '<i class="h"></i><i class="l1"></i><i class="l1"></i><i class="l2"></i><i class="l1"></i><i class="l2 s"></i>' }),
            el('span', { class: 'tt' }, [el('b', { text: '회의록' }), el('small', { text: '혁신 · 프로그램명·회의 일시·안건·내용·참석자 서명' })]),
          ]),
        ]),
      ]),
      el('section', { class: 'cols' }, [
        el('div', { class: 'col', style: 'flex:2 1 520px' }, [
          el('div', { style: 'display:flex;flex-wrap:wrap;align-items:center;gap:10px' }, [el('h2', { text: '내 양식' }), el('span', { style: 'flex:1' }), ui.tabs]),
          ui.forms,
        ]),
        el('div', { class: 'col', style: 'flex:1 1 300px' }, [el('h2', { text: '최근 문서' }), ui.recent]),
      ]),
    ]);
    ui.root = el('div', { id: 'seoil-home', role: 'dialog', 'aria-label': '서일 오피스 홈' }, [
      el('div', { class: 'top' }, [
        el('span', { class: 'logo', text: '서일' }), el('b', { style: 'font-size:16px', text: '서일 오피스' }), el('span', { style: 'flex:1' }),
        ui.back,
        el('button', { type: 'button', class: 'me', text: '내 정보', onclick: function () { close(); if (window.SeoilAI) { window.SeoilAI.open(true); var b = document.querySelector('#seoil-ai .hd .ibtn[title="내 정보·설정"]'); if (b) b.click(); } } }),
      ]),
      ui.main,
    ]);
    // hwp를 홈에 놓으면 양식으로 연다
    ui.root.addEventListener('dragover', function (e) { e.preventDefault(); ui.root.classList.add('drag'); });
    ui.root.addEventListener('dragleave', function (e) { if (e.target === ui.root) ui.root.classList.remove('drag'); });
    ui.root.addEventListener('drop', async function (e) {
      e.preventDefault(); ui.root.classList.remove('drag');
      var f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f || !/\.(hwpx?)$/i.test(f.name)) { busy(false, 'hwp·hwpx 파일을 놓아 주세요.'); return; }
      try { busy(true); await openForm(await readBytes(f), f.name); busy(false); } catch (err) { busy(false, err.message || String(err)); }
    });
    ui.root.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        var k = (e.key || '').toLowerCase();
        if (k === 'n' || e.code === 'KeyN') { e.preventDefault(); e.stopPropagation(); newDoc(); return; }
        if (k === 'o' || e.code === 'KeyO') { e.preventDefault(); e.stopPropagation(); openFile(); return; }
      }
      if (e.key === 'Escape' && ui.back.style.display !== 'none') close();
      e.stopPropagation();
    });

    ui.barText = el('span', { class: 't' });
    ui.bar = el('div', { id: 'seoil-fill-bar' }, [ui.barText,
      ui.barGo = el('button', { type: 'button', class: 'go', text: 'AI로 채우기', onclick: function () {
        ui.bar.classList.remove('open');
        if (ui.bar.dataset.mode === 'rewrite' && window.SeoilAI && window.SeoilAI.rewrite) { window.SeoilAI.rewrite(); return; }
        var d = doc(); if (d) { try { rememberForm(fileName() || '양식.hwp', d.exportHwp()); cur.tag = '양식'; } catch (e) {} }
        if (window.SeoilAI) { window.SeoilAI.open(true); window.SeoilAI.reset(); }
      } }),
      el('button', { type: 'button', class: 'no', text: '닫기', onclick: function () { ui.bar.classList.remove('open'); } })]);
    var homeBtn = el('button', { type: 'button', id: 'seoil-home-btn', text: '홈', title: '서일 오피스 홈', onclick: open });
    document.body.appendChild(ui.root);
    document.body.appendChild(ui.bar);
    document.body.appendChild(homeBtn);
    // 메뉴 막대 맨 앞에 「홈」, 파일 메뉴 맨 위에 「홈 화면」
    (function addMenu() {
      var bar = document.getElementById('menu-bar');
      if (!bar) { setTimeout(addMenu, 300); return; }
      if (!document.getElementById('seoil-menu-home')) {
        var b = el('button', { type: 'button', id: 'seoil-menu-home', title: '서일 오피스 홈', 'aria-label': '홈 화면', onclick: function (e) { e.stopPropagation(); open(); },
          style: 'font:inherit;font-size:13px;display:inline-flex;align-items:center;gap:4px;height:28px;margin:0 4px 0 2px;padding:0 10px;border:0;border-radius:6px;background:#EEF2FD;color:#2F5BEA;cursor:pointer;align-self:center' },
          [el('span', { 'aria-hidden': 'true', style: 'display:inline-flex', html: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2F5BEA" stroke-width="2.2"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>' }), '홈']);
        bar.insertBefore(b, bar.firstChild);
      }
      var dd = bar.querySelector('[data-menu="file"] .menu-dropdown');
      if (dd && !document.getElementById('seoil-md-home')) {
        var it = el('div', { class: 'md-item', id: 'seoil-md-home', onclick: function (e) { e.stopPropagation(); document.body.click(); open(); } },
          [el('span', { class: 'md-icon' }), el('span', { class: 'md-label', text: '홈 화면' })]);
        dd.insertBefore(el('div', { class: 'md-sep' }), dd.firstChild);
        dd.insertBefore(it, dd.firstChild);
      }
      // 파일 메뉴: 「다른 이름으로 저장」 아래 「문서 닫기」(한글과 같은 Ctrl+F4)
      var sa = dd && dd.querySelector('[data-cmd="file:save-as"]');
      if (sa && !document.getElementById('seoil-md-close')) {
        var ci = el('div', { class: 'md-item', id: 'seoil-md-close', onclick: function (e) { e.stopPropagation(); document.body.click(); closeDoc(); } },
          [el('span', { class: 'md-icon' }), el('span', { class: 'md-label', text: '문서 닫기' }), el('span', { class: 'md-shortcut', text: 'Ctrl+F4' })]);
        sa.parentNode.insertBefore(ci, sa.nextSibling);
      }
    })();

    // 편집기가 뜨면: 파일을 열고 들어온 경우가 아니면 홈
    var t0 = Date.now(), noStart = /[?&]nostart\b/.test(location.search);
    if (!noStart) open();
    // 문서 감시는 처음부터 늘 돌린다(홈에 오래 머물러 편집기 문서가 늦게 생겨도)
    setInterval(watch, 700);
    setInterval(function () { if (!isOpen()) snapshot(false); }, 30000);
    document.addEventListener('visibilitychange', function () { if (document.hidden) snapshot(false); });
    (function wait() {
      var d = doc();
      if (!d) { if (Date.now() - t0 < 20000) setTimeout(wait, 200); return; }
      if (cur.doc === d && cur.tag !== '파일') return;
      setTimeout(function () {
        var name = fileName();
        var opened = doc() !== d || !/^(새 문서|document)\.hwp$/.test(name);
        if (opened) close();
        else if (cur.doc === d) cur.tag = '새 문서';
      }, isApp ? 1200 : 500);
    })();
  }

  // 바깥에서 문서가 열리면(설치판: 탐색기 더블클릭·내 Claude) 홈 화면을 닫는다 — 안 그러면 열린 문서가 홈 뒤에 가려진다
  (function hookOpen() {
    var R = window.rhwpStudio;
    if (!R || typeof R.openBytes !== 'function') return setTimeout(hookOpen, 300);
    if (R.openBytes.__seoilHome) return;
    var orig = R.openBytes;
    R.openBytes = function () { try { close(); } catch (e) {} return orig.apply(this, arguments); };
    R.openBytes.__seoilHome = true;
  })();
  window.addEventListener('keydown', function (e) {
    if (e.key === 'F4' && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && !isOpen()) { e.preventDefault(); e.stopPropagation(); closeDoc(); }
  }, true);
  window.SeoilStart = { open: open, close: close, closeDoc: closeDoc, pickForm: pickForm, openForm: openForm, newDoc: newDoc, newReport: newReport, forkCopy: forkCopy };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
