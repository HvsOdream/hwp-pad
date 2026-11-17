// 서일 오피스 — 「문단 모양 맞추기」 양식 고르기·고치기 (2026-11-09).
// 우클릭 「문단 모양 맞추기」는 지금 고른 양식으로 바로 정리하고, 「문단 모양 맞추기 양식…」은 이 창을 연다.
// 양식 넷(보고서 기본·촘촘하게·넉넉하게·내 모양)은 값을 고칠 수 있고 이 브라우저(설치판)에 기억된다.
// 값 자체는 web/seoil-write.js 의 tidySettings/tidySave 가 맡는다(AI 「문단 모양 맞춰줘」도 같은 양식을 쓴다).
(function () {
  'use strict';
  var W = function () { return window.SeoilWrite; };
  var B = function () { return window.rhwpStudio && window.rhwpStudio.ai; };
  var overlay = null, cfg = null, cur = null, ui = {};

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'class') e.className = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function num(label, key, unit, hint) {
    var inp = el('input', { type: 'number', min: '0', step: key === 'lineSpacing' ? '10' : '0.5', style: 'width:72px;padding:3px 6px' });
    inp.addEventListener('input', function () { cfg.presets[cur][key] = Math.max(0, Number(inp.value) || 0); });
    ui[key] = inp;
    return el('label', { style: 'display:flex;align-items:center;gap:8px;margin:6px 0' }, [
      el('span', { style: 'width:150px', text: label }), inp, el('span', { text: unit }),
      hint ? el('span', { style: 'color:#888;font-size:12px', text: hint }) : null,
    ]);
  }
  function fill() {
    var p = cfg.presets[cur];
    ui.name.value = p.name;
    ['bodyAfter', 'headBefore', 'headAfter', 'lineSpacing'].forEach(function (k) { ui[k].value = p[k]; });
    ui.hang.checked = p.hang !== false;
    Array.prototype.forEach.call(ui.tabs.children, function (b) {
      var on = b.dataset.key === cur;
      b.style.background = on ? '#1E5BB8' : ''; b.style.color = on ? '#fff' : ''; b.textContent = cfg.presets[b.dataset.key].name;
    });
  }
  function note(t) { ui.note.textContent = t || ''; }
  function close() { if (overlay) { overlay.remove(); overlay = null; } }

  function fromCursor() {
    var b = B(), r = b && b.selection && b.selection(), d = b && b.doc();
    if (!r || !d) { note('본문 문단에 커서를 두고 다시 눌러 주세요(표 안은 아직 안 됩니다)'); return; }
    try {
      var v = W().tidyFromPara(d, r.s1, r.p1), p = cfg.presets[cur];
      p.bodyAfter = v.after; p.lineSpacing = v.lineSpacing; p.hang = v.hang;
      fill(); note('커서 문단에서 가져왔습니다: 문단 아래 ' + v.after + 'pt · 줄 간격 ' + (v.lineSpacing ? v.lineSpacing + '%' : '그대로') + ' — 저장하면 이 양식에 남습니다');
    } catch (e) { note('가져오지 못했습니다: ' + (e && e.message || e)); }
  }

  function open() {
    if (!W() || !W().tidySettings) return;
    close();
    cfg = W().tidySettings(); cur = cfg.cur; ui = {};
    ui.tabs = el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px' }, W().TIDY_ORDER.map(function (k) {
      var b = el('button', { class: 'dialog-btn', type: 'button', onclick: function () { cur = k; fill(); note(''); } });
      b.dataset.key = k; return b;
    }));
    ui.name = el('input', { type: 'text', maxlength: '12', style: 'width:150px;padding:3px 6px' });
    ui.name.addEventListener('input', function () { cfg.presets[cur].name = ui.name.value.trim() || cfg.presets[cur].name; fill(); });
    ui.hang = el('input', { type: 'checkbox' });
    ui.hang.addEventListener('change', function () { cfg.presets[cur].hang = ui.hang.checked; });
    ui.note = el('div', { style: 'min-height:18px;color:#1E5BB8;font-size:12px;margin-top:8px' });

    var body = el('div', { class: 'dialog-body', style: 'padding:14px 18px;min-width:400px' }, [
      el('div', { style: 'color:#555;font-size:12px;margin-bottom:10px', text: '- ○ □ · 개조식과 1) 가. (1) 번호 제목 문단을 이 값으로 맞춥니다. 글은 바꾸지 않습니다.' }),
      ui.tabs,
      el('label', { style: 'display:flex;align-items:center;gap:8px;margin:6px 0' }, [el('span', { style: 'width:150px', text: '양식 이름' }), ui.name]),
      num('개조식 문단 아래', 'bodyAfter', 'pt'),
      num('번호 제목 위', 'headBefore', 'pt'),
      num('번호 제목 아래', 'headAfter', 'pt'),
      num('줄 간격', 'lineSpacing', '%', '0 = 바꾸지 않음'),
      el('label', { style: 'display:flex;align-items:center;gap:8px;margin:8px 0' }, [ui.hang, el('span', { text: '내어쓰기 — 둘째 줄을 글머리 다음 글자에 맞춤' })]),
      el('div', { style: 'display:flex;gap:6px;margin-top:10px' }, [
        el('button', { class: 'dialog-btn', type: 'button', text: '커서 문단에서 가져오기', title: '직접 고친 개조식 문단에 커서를 두고 누르면 그 간격·줄 간격을 이 양식에 넣습니다', onclick: fromCursor }),
        el('button', { class: 'dialog-btn', type: 'button', text: '처음 값으로', onclick: function () { var name = cfg.presets[cur].name; cfg.presets[cur] = W().tidyReset(cur).presets[cur]; fill(); note(name + ' 을(를) 처음 값으로 돌렸습니다'); } }),
      ]),
      ui.note,
    ]);
    var dlg = el('div', { class: 'dialog-wrap', role: 'dialog' }, [
      el('div', { class: 'dialog-title' }, ['문단 모양 맞추기 양식', el('button', { class: 'dialog-close', type: 'button', text: '×', 'aria-label': '닫기', onclick: close })]),
      body,
      el('div', { class: 'dialog-footer' }, [
        el('button', { class: 'dialog-btn dialog-btn-primary', type: 'button', text: '적용', title: '이 양식을 고르고 저장한 뒤, 블록(없으면 커서 문단)에 바로 맞춥니다', onclick: function () {
          cfg.cur = cur; W().tidySave(cfg); close();
          try { B().dispatch('format:hwppad-tidy'); } catch (e) {}
        } }),
        el('button', { class: 'dialog-btn', type: 'button', text: '저장', onclick: function () { cfg.cur = cur; W().tidySave(cfg); note('저장했습니다 · 우클릭 「문단 모양 맞추기」가 「' + cfg.presets[cur].name + '」로 맞춥니다'); } }),
        el('button', { class: 'dialog-btn', type: 'button', text: '닫기', onclick: close }),
      ]),
    ]);
    overlay = el('div', { class: 'modal-overlay' }, [dlg]);
    overlay.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    document.body.appendChild(overlay);
    fill();
  }

  /** 지금 고른 양식 이름(우클릭 알림용) */
  function currentName() { try { var c = W().tidySettings(); return c.presets[c.cur].name; } catch (e) { return ''; } }

  window.SeoilTidy = { open: open, close: close, currentName: currentName };
  // ---------- 한글의 문단 여백 글쇠 (2026-11-11) ----------
  //  Ctrl+F5 첫 줄 내어쓰기 · Ctrl+F6 첫 줄 들여쓰기 · Ctrl+F7 양쪽 여백 줄이기 · Ctrl+F8 양쪽 여백 늘이기
  //  Ctrl+Alt+F5 왼쪽 여백 줄이기 · Ctrl+Alt+F6 왼쪽 여백 늘이기 · Ctrl+Alt+F7 오른쪽 여백 늘이기 · Ctrl+Alt+F8 오른쪽 여백 줄이기
  //  한 번에 1pt. 커서 문단(블록이면 블록의 문단들, 표 칸 안도)에 적용 — 편집기의 문단 모양 경로(되돌리기 됨)를 탄다.
  //  브라우저에서는 Ctrl+F5 가 「새로 고침」이라 여기서 먼저 잡는다.
  var PT = 200;            // 1pt = 100 HWPUNIT, applyParaFormat 은 그 2배 값을 받는다
  var PX = 150;            // 읽은 값은 px(96dpi): 1px = 75 HWPUNIT → ×2
  function marginKey(e) {
    if (!e.ctrlKey || e.metaKey || e.shiftKey) return;
    var k = e.key; if (k !== 'F5' && k !== 'F6' && k !== 'F7' && k !== 'F8') return;
    var t = e.target;
    if (!t || t.tagName !== 'TEXTAREA' || (t.closest && t.closest('#seoil-ai, .dialog, .dialog-overlay, .modal, [role=dialog]'))) return; // 편집기 입력란일 때만
    if (document.body.classList.contains('seoil-view')) return;
    var b = B(); if (!b || !b.paraProps || !b.applyPara) return;
    e.preventDefault(); e.stopPropagation();
    var pp; try { pp = b.paraProps(); } catch (err) { return; }
    if (!pp) return;
    var left = Math.round((pp.marginLeft || 0) * PX), right = Math.round((pp.marginRight || 0) * PX), ind = Math.round((pp.indent || 0) * PX), props = {};
    if (!e.altKey) {
      if (k === 'F5') props.indent = ind - PT;                       // 첫 줄 내어쓰기
      else if (k === 'F6') props.indent = ind + PT;                  // 첫 줄 들여쓰기
      else { var d = k === 'F8' ? PT : -PT; props.marginLeft = Math.max(0, left + d); props.marginRight = Math.max(0, right + d); }
    } else {
      if (k === 'F5') props.marginLeft = Math.max(0, left - PT);
      else if (k === 'F6') props.marginLeft = left + PT;
      else if (k === 'F7') props.marginRight = right + PT;
      else props.marginRight = Math.max(0, right - PT);
    }
    try { b.applyPara(props); } catch (err) {}
  }
  window.addEventListener('keydown', marginKey, true);

})();
