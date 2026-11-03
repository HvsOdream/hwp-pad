// 서일 오피스 — 시작 화면 + "받은 공문 → 회신" 흐름 + 안전 영역 (2026-11-03).
// 앱을 켜면 빈 문서 대신 "무엇을 쓸까요?"를 먼저 보여 준다. 핵심 경로는 하나:
//   받은 공문(hwp·pdf·사진)을 고른다 → 업무협조전 원본 양식을 새 문서로 연다 → 공문은 AI 자료로 붙인다 → AI가 회신을 채운다.
// 업무협조전 양식은 어디서 오나 (위에서부터):
//   1) 이 기기에 기억해 둔 양식(IndexedDB) 2) 앱에 넣어 둔 양식(forms/업무협조전.hwp, 있으면)
//   3) 받은 공문이 hwp면 그 파일 자체 — 그룹웨어 공문은 모두 같은 업무협조전 양식이라, 칸 값만 비우면 원본 양식이다.
// 양식 파일은 원본 바이트를 그대로 보관하고 열 때마다 새 문서로 연다(원본·받은 공문은 덮어쓰지 않는다).
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
    '#seoil-start .sheet{background:#fff;border-radius:16px;width:min(560px,100%);max-height:100%;overflow:auto;padding:22px;box-shadow:0 12px 40px rgba(0,0,0,.18)}',
    '#seoil-start h2{font-size:19px;margin:0 0 2px}',
    '#seoil-start .sub{color:#5F6670;font-size:13px;margin-bottom:16px}',
    '#seoil-start .main{width:100%;text-align:left;border:0;border-radius:12px;background:#2F5BEA;color:#fff;padding:16px 18px;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:2px}',
    '#seoil-start .main b{font-size:16px}#seoil-start .main span{font-size:13px;opacity:.9}',
    '#seoil-start .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}',
    '#seoil-start .card{text-align:left;border:1px solid #D9DCE1;border-radius:12px;background:#fff;padding:12px 14px;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:2px}',
    '#seoil-start .card:hover{border-color:#2F5BEA}#seoil-start .card b{font-size:14px}#seoil-start .card span{font-size:12px;color:#5F6670}',
    '#seoil-start .tip{margin-top:14px;font-size:12px;color:#5F6670;background:#F4F5F7;border-radius:10px;padding:10px 12px}',
    '#seoil-start .foot{display:flex;justify-content:space-between;align-items:center;margin-top:14px;font-size:12px;color:#8A9099}',
    '#seoil-start .link{border:0;background:none;font:inherit;color:#5F6670;text-decoration:underline;cursor:pointer;padding:4px}',
    '#seoil-start .msg{margin-top:12px;font-size:13px;color:#B42318}',
    '@media (max-width:480px){#seoil-start .grid{grid-template-columns:1fr}}',
    // 받은 공문을 열었을 때 위에 뜨는 띠
    '#seoil-reply-bar{position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top));z-index:2147482400;background:#1C1F23;color:#fff;border-radius:12px;padding:10px 12px 10px 16px;display:none;align-items:center;gap:12px;font:13px/1.5 "Noto Sans KR",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:calc(100vw - 32px)}',
    '#seoil-reply-bar.open{display:flex}',
    '#seoil-reply-bar button{font:inherit;border:0;border-radius:8px;padding:6px 12px;cursor:pointer;white-space:nowrap}',
    '#seoil-reply-bar .go{background:#2F5BEA;color:#fff}#seoil-reply-bar .no{background:transparent;color:#C9CDD3}',
    '#seoil-reply-bar .t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}',
  ].join('\n');

  var DB = 'seoil-office', STORE = 'kv', TPL_KEY = 'form.업무협조전';
  // 공문마다 달라지는 칸(받은 공문을 양식으로 쓸 때 비운다). 결재선·시행번호·일자는 그룹웨어가 다시 채운다.
  var CLEAR = ['doctitle', 'recipient', 'recipients', 'refers', 'docnumber', 'enforcedate', 'receivedate', 'receiptnumber'];
  for (var i = 1; i <= 8; i++) { CLEAR.push('sign' + i, 'jikwe' + i, 'signdate' + i); }
  var isApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  // ---------- 작은 도구 ----------
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'style') e.style.cssText = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function J(s) { return typeof s === 'string' ? JSON.parse(s) : s; }
  function bridge() { return window.rhwpStudio && window.rhwpStudio.ai; }
  function doc() { var b = bridge(); return b && b.doc(); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function extOf(name) { return (String(name).split('.').pop() || '').toLowerCase(); }
  function readBytes(file) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(new Uint8Array(r.result)); }; r.onerror = rej; r.readAsArrayBuffer(file); });
  }

  // ---------- 양식 보관 (IndexedDB, 이 기기에만) ----------
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
  function saveTemplate(bytes, name, from) { return kv('put', TPL_KEY, { bytes: bytes, name: name, from: from, at: new Date().toISOString() }); }
  function loadTemplate() {
    return kv('get', TPL_KEY).then(function (t) {
      if (t && t.bytes) return t;
      return fetch('forms/' + encodeURIComponent('업무협조전') + '.hwp').then(function (r) {
        if (!r.ok) return null;
        return r.arrayBuffer().then(function (b) { return { bytes: new Uint8Array(b), name: '업무협조전.hwp', from: 'bundle' }; });
      }).catch(function () { return null; });
    });
  }

  // ---------- 문서 판별 ----------
  /** hwp 바이트를 잠깐 열어 누름틀 값만 본다 */
  function peek(bytes) {
    var d = doc(); if (!d) return null;
    var x = null;
    try {
      x = new d.constructor(bytes);
      var f = {}; J(x.getFieldList()).forEach(function (v) { if (!(v.name in f)) f[v.name] = String(v.value || ''); });
      return f;
    } catch (e) { return null; } finally { try { x && x.free && x.free(); } catch (e) {} }
  }
  function fieldsOf(d) {
    var f = {}; try { J(d.getFieldList()).forEach(function (v) { if (!(v.name in f)) f[v.name] = String(v.value || ''); }); } catch (e) {}
    return f;
  }
  function isForm(f) { return !!(f && 'doctitle' in f && 'body' in f); }
  /** 받은(이미 시행된) 공문인가: 시행번호가 찍혀 있다 */
  function isReceived(f) { return isForm(f) && /\d/.test(f.docnumber || ''); }

  // ---------- 양식을 새 문서로 열기 ----------
  function waitDocChange(prev, ms) {
    var t0 = Date.now();
    return new Promise(function (res, rej) {
      (function tick() {
        var d = doc();
        if (d && d !== prev) return res(d);
        if (Date.now() - t0 > (ms || 8000)) return rej(new Error('문서를 여는 데 시간이 너무 걸립니다'));
        setTimeout(tick, 120);
      })();
    });
  }
  function today() { var d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); }

  var opening = false;
  async function openForm(tpl, title) {
    var open = window.rhwpStudio && window.rhwpStudio.openBytes;
    if (typeof open !== 'function') throw new Error('편집기가 아직 준비되지 않았습니다');
    var prev = doc();
    opening = true;
    try { return await openFormInner(open, prev, tpl, title); } finally { lastDoc = doc(); opening = false; }
  }
  async function openFormInner(open, prev, tpl, title) {
    var name = '회신_' + (title ? title.replace(/[\\/:*?"<>|]/g, '').slice(0, 40) + '_' : '') + today() + '.' + (extOf(tpl.name) === 'hwpx' ? 'hwpx' : 'hwp');
    open(tpl.bytes.slice(), name, null); // 저장 핸들 없음 → Ctrl+S는 새 파일로 저장(양식·받은 공문은 그대로)
    var d = await waitDocChange(prev);
    await sleep(150);
    // 문단 모양(번호·가.·붙임)은 지금 본문에서 먼저 배워 두고, 그다음 칸을 비운다
    try { window.SeoilForm.detect(d); } catch (e) {}
    var f = fieldsOf(d);
    CLEAR.forEach(function (k) { if (k in f && f[k]) { try { d.setFieldValueByName(k, ''); } catch (e) {} } });
    try { window.SeoilForm.apply(d, { body: [{ level: 'num', text: ' ' }] }); d.setFieldValueByName('body', ''); } catch (e) {}
    bridge().changed('seoil-start-form');
    return d;
  }

  /** 받은 공문 파일을 알맞게 처리: 양식 확보 → 새 회신 문서 → 공문은 AI 자료로 → AI 시작 */
  async function replyWith(file, opts) {
    opts = opts || {};
    var ext = extOf(file.name), bytes = await readBytes(file), f = null;
    if (ext === 'hwp' || ext === 'hwpx') f = peek(bytes);
    var tpl = await loadTemplate();
    if (!tpl && isForm(f)) {
      tpl = { bytes: bytes, name: file.name, from: 'received' };
      saveTemplate(bytes, file.name, 'received'); // 다음부터는 이 양식으로 바로 시작
    }
    if (!tpl) return { need: 'template', file: file };
    var ai = window.SeoilAI;
    var reading = ai && ai.addFiles ? ai.addFiles([file]) : Promise.resolve();
    await openForm(tpl, f && f.doctitle);
    if (ai) {
      ai.open(true);
      ai.reset(true);
      await reading;
      ai.send(opts.text || '받은 공문에 대한 제출 회신을 써 주세요.');
    }
    return { ok: true };
  }

  async function newForm() {
    var tpl = await loadTemplate();
    if (!tpl) return { need: 'template' };
    await openForm(tpl, '');
    if (window.SeoilAI) { window.SeoilAI.open(true); window.SeoilAI.reset(); }
    return { ok: true };
  }

  async function setTemplateFrom(file) {
    var bytes = await readBytes(file), f = peek(bytes);
    if (!isForm(f)) throw new Error('업무협조전 양식이 아닙니다 (제목·본문 누름틀이 없음). 그룹웨어에서 받은 업무협조전 hwp를 골라 주세요.');
    await saveTemplate(bytes, file.name, 'picked');
    return true;
  }

  // ---------- 시작 화면 ----------
  var ui = {};
  function pick(accept, cb) {
    var inp = el('input', { type: 'file', accept: accept, style: 'display:none' });
    inp.addEventListener('change', function () { var f = inp.files && inp.files[0]; inp.remove(); if (f) cb(f); });
    document.body.appendChild(inp); inp.click();
  }
  function msg(t) { ui.msg.textContent = t || ''; }
  function busy(on, t) { ui.sheet.style.opacity = on ? '.6' : '1'; ui.sheet.style.pointerEvents = on ? 'none' : ''; if (t != null) msg(t); }

  function askTemplate(then) {
    msg('');
    ui.body.innerHTML = '';
    ui.body.appendChild(el('div', { class: 'sub', text: '처음 한 번만 필요합니다. 그룹웨어에서 받은 업무협조전 hwp 아무거나(지난 공문도 됨) 골라 주시면, 그 양식을 이 기기에 기억해 두고 칸 값만 비워서 씁니다.' }));
    ui.body.appendChild(el('button', { class: 'main', onclick: function () {
      pick('.hwp,.hwpx', async function (file) {
        busy(true, '');
        try { await setTemplateFrom(file); busy(false); then(); }
        catch (e) { busy(false, e.message || String(e)); }
      });
    } }, [el('b', { text: '업무협조전 양식 고르기' }), el('span', { text: '파일 앱 · Dropbox · 메일에서 받은 hwp' })]));
    ui.body.appendChild(el('div', { class: 'foot' }, [el('button', { class: 'link', text: '← 처음으로', onclick: drawHome }), el('span')]));
  }

  function startReply() {
    pick('.hwp,.hwpx,.pdf,image/*', async function (file) {
      busy(true, '');
      try {
        var r = await replyWith(file);
        if (r.need === 'template') { busy(false); askTemplate(function () { busy(true); replyWith(file).then(function () { busy(false); close(); }, function (e) { busy(false, e.message); }); }); return; }
        busy(false); close();
      } catch (e) { busy(false, '열지 못했습니다: ' + (e.message || e)); }
    });
  }

  function drawHome() {
    msg('');
    ui.body.innerHTML = '';
    ui.body.appendChild(el('button', { class: 'main', onclick: startReply }, [
      el('b', { text: '받은 공문에 회신 쓰기' }),
      el('span', { text: '요청 공문(hwp·pdf·사진)을 고르면 업무협조전 회신을 AI가 채웁니다' }),
    ]));
    ui.body.appendChild(el('div', { class: 'grid' }, [
      el('button', { class: 'card', onclick: function () {
        busy(true, ''); newForm().then(function (r) { busy(false); if (r.need) askTemplate(function () { newForm().then(close); }); else close(); }, function (e) { busy(false, e.message); });
      } }, [el('b', { text: '업무협조전 새로 쓰기' }), el('span', { text: '받은 공문 없이, 대화로 처음부터' })]),
      el('button', { class: 'card', onclick: function () { close(); openFileMenu(); } }, [el('b', { text: '파일 열기' }), el('span', { text: 'hwp·hwpx 편집' })]),
    ]));
    ui.body.appendChild(el('div', { class: 'tip', text: isApp
      ? '그룹웨어·메일에서 공문 파일을 연 뒤 공유 → 「서일 오피스」로 보내도 됩니다. 받은 공문이 열리면 위에 「회신 쓰기」가 뜹니다.'
      : '받은 공문 hwp를 편집기에 바로 열어도 됩니다. 위에 「회신 쓰기」가 뜹니다.' }));
    loadTemplate().then(function (t) {
      ui.foot.innerHTML = '';
      ui.foot.appendChild(el('span', { text: t ? '양식: ' + (t.from === 'bundle' ? '앱 기본 업무협조전' : t.name) : '양식: 아직 없음 (첫 회신 때 정해집니다)' }));
      ui.foot.appendChild(el('span', {}, [
        t && t.from !== 'bundle' ? el('button', { class: 'link', text: '양식 바꾸기', onclick: function () { askTemplate(drawHome); } }) : null,
        el('button', { class: 'link', text: '빈 문서로 시작', onclick: close }),
      ]));
    });
    ui.body.appendChild(ui.foot);
  }

  function openFileMenu() {
    var it = document.querySelector('[data-cmd="file:open"]');
    if (it) { it.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); it.click(); return; }
    pick('.hwp,.hwpx,.hml', async function (file) {
      var b = await readBytes(file); window.rhwpStudio.openBytes(b, file.name, null);
    });
  }

  function open() { drawHome(); ui.root.classList.add('open'); }
  function close() { ui.root.classList.remove('open'); }

  // ---------- 받은 공문이 열리면: 위에 "회신 쓰기" 띠 ----------
  var lastDoc = null, barFor = null;
  function showReplyBar(d, f) {
    barFor = d;
    ui.barText.textContent = '받은 공문 · ' + (f.doctitle || '');
    ui.bar.classList.add('open');
  }
  async function replyToOpen() {
    ui.bar.classList.remove('open');
    var d = doc(); if (!d) return;
    var name = (bridge().fileName && bridge().fileName()) || '받은공문.hwp', bytes;
    try { bytes = d.exportHwp(); } catch (e) { alert('공문을 읽지 못했습니다: ' + (e.message || e)); return; }
    var file = new File([bytes], name.replace(/\.(hwpx|hml)$/i, '.hwp'));
    try {
      var r = await replyWith(file);
      if (r.need === 'template') { open(); askTemplate(function () { replyWith(file).then(close); }); }
    } catch (e) { alert('회신 문서를 만들지 못했습니다: ' + (e.message || e)); }
  }
  function watch() {
    var d = doc();
    if (opening || !d || d === lastDoc) return;
    lastDoc = d;
    if (d !== barFor) ui.bar.classList.remove('open');
    var f = fieldsOf(d);
    if (isReceived(f)) { close(); showReplyBar(d, f); return; }
    if (isForm(f)) {
      close();
      // 빈 업무협조전 양식을 열었으면 기억해 둔다(아직 없을 때만)
      kv('get', TPL_KEY).then(function (t) {
        if (t) return;
        try { var b = d.exportHwp(); saveTemplate(b, (bridge().fileName && bridge().fileName()) || '업무협조전.hwp', 'opened'); } catch (e) {}
      });
    }
  }

  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    ui.body = el('div');
    ui.foot = el('div', { class: 'foot' });
    ui.msg = el('div', { class: 'msg' });
    ui.sheet = el('div', { class: 'sheet' }, [
      el('h2', { text: '무엇을 쓸까요?' }),
      el('div', { class: 'sub', text: '학교 양식 위에 그대로 채웁니다. 다 쓰면 편집기에서 확인하고 저장하세요.' }),
      ui.body, ui.msg,
    ]);
    ui.root = el('div', { id: 'seoil-start' }, [ui.sheet]);
    ui.root.addEventListener('click', function (e) { if (e.target === ui.root) close(); });
    ['keydown', 'keyup', 'keypress'].forEach(function (t) { ui.root.addEventListener(t, function (e) { if (e.key === 'Escape') close(); e.stopPropagation(); }); });
    ui.barText = el('span', { class: 't' });
    ui.bar = el('div', { id: 'seoil-reply-bar' }, [ui.barText,
      el('button', { class: 'go', text: '회신 쓰기', onclick: replyToOpen }),
      el('button', { class: 'no', text: '닫기', onclick: function () { ui.bar.classList.remove('open'); } })]);
    document.body.appendChild(ui.root);
    document.body.appendChild(ui.bar);

    // 편집기가 뜨면: 아는 문서가 열려 있지 않을 때만 시작 화면을 띄운다(앱으로 파일을 열고 들어온 경우는 건너뜀)
    var t0 = Date.now();
    (function wait() {
      var d = doc();
      if (!d) { if (Date.now() - t0 < 15000) setTimeout(wait, 200); return; }
      setTimeout(function () {
        var name = (bridge().fileName && bridge().fileName()) || '';
        var cur = doc();
        var opened = cur !== d || !/^(새 문서|document)\.hwp$/.test(name);
        if (!opened && !/[?&]nostart\b/.test(location.search)) open();
        setInterval(watch, 600);
      }, isApp ? 1200 : 500);
    })();
  }

  window.SeoilStart = { open: open, close: close, replyWith: replyWith, newForm: newForm, isReceived: function () { return isReceived(fieldsOf(doc())); }, setTemplateFrom: setTemplateFrom, clearTemplate: function () { return kv('del', TPL_KEY); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
