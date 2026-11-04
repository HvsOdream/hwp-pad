// 서일 오피스 — 대화상자 키보드 (2026-11-04).
// 편집기의 글자 모양·문단 모양 같은 대화상자는 열려도 키보드 초점이 문서(숨은 입력칸)에 남아,
// 한글처럼 Alt+글자·Enter·Esc가 대화상자에 먹지 않았다. 한글과 같게 맞춘다:
//  - 대화상자가 열리면 첫 입력칸에 초점(글자 전체 선택)
//  - Alt+글자(라벨의 (E) 같은 밑줄 글자): 그 칸으로 이동 / 단추·체크·라디오는 누름
//  - Enter = 설정(기본 단추), Esc = 취소, Ctrl+Tab·Ctrl+Shift+Tab = 탭 넘기기
//  - 숫자 칸에서 ↑/↓ = 1씩(Shift는 10씩) 올리고 내리기
//  - 초점이 문서에 남아 있을 때 누른 키는 문서로 보내지 않고 대화상자로 초점을 옮긴다
(function () {
  'use strict';
  function visible(el) { return !!(el && el.offsetParent !== null); }
  function topDialog() {
    var all = document.querySelectorAll('.dialog-wrap');
    for (var i = all.length - 1; i >= 0; i--) if (visible(all[i])) return all[i];
    return null;
  }
  function activePanel(dlg) { return dlg.querySelector('.dialog-tab-panel.active') || dlg.querySelector('.dialog-body') || dlg; }
  function focusables(root) {
    return Array.prototype.filter.call(root.querySelectorAll('input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'), visible);
  }
  function focusFirst(dlg) {
    var f = focusables(activePanel(dlg)).filter(function (e) { return e.tagName !== 'BUTTON'; })[0] || focusables(dlg)[0];
    if (f) { try { f.focus(); if (f.select) f.select(); } catch (e) {} }
  }
  function primary(dlg) { return dlg.querySelector('.dialog-btn-primary') || Array.prototype.filter.call(dlg.querySelectorAll('button'), function (b) { return /^(설정|확인|넣기|적용)/.test(b.textContent.trim()); })[0]; }
  function cancel(dlg) {
    return Array.prototype.filter.call(dlg.querySelectorAll('button'), function (b) { return /^(취소|닫기)/.test(b.textContent.trim()); })[0]
      || dlg.querySelector('.dialog-close, .close, [aria-label="닫기"]');
  }
  /** 라벨 글자의 (X)로 칸 찾기 */
  function byAccel(dlg, ch) {
    var re = new RegExp('\\(' + ch + '\\)', 'i'), scopes = [activePanel(dlg), dlg];
    for (var s = 0; s < scopes.length; s++) {
      var nodes = scopes[s].querySelectorAll('button, label, span, div.dialog-row > *, legend');
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]; if (!visible(n)) continue;
        var own = Array.prototype.filter.call(n.childNodes, function (c) { return c.nodeType === 3; }).map(function (c) { return c.textContent; }).join('') || (n.children.length ? '' : n.textContent);
        if (!re.test(own) && !(n.tagName === 'BUTTON' && re.test(n.textContent))) continue;
        if (n.tagName === 'BUTTON') return { el: n, click: true };
        var inner = n.querySelector('input, select, textarea');
        if (!inner && n.htmlFor) inner = document.getElementById(n.htmlFor);
        if (!inner) { // 라벨 바로 뒤 형제 칸
          var sib = n.nextElementSibling;
          while (sib && !inner) { inner = /INPUT|SELECT|TEXTAREA/.test(sib.tagName) ? sib : sib.querySelector && sib.querySelector('input, select, textarea'); sib = sib.nextElementSibling; }
        }
        if (inner) return { el: inner, click: inner.type === 'checkbox' || inner.type === 'radio' };
      }
    }
    return null;
  }
  function switchTab(dlg, dir) {
    var tabs = Array.prototype.filter.call(dlg.querySelectorAll('.dialog-tab'), visible);
    if (tabs.length < 2) return false;
    var i = tabs.findIndex(function (t) { return t.classList.contains('active'); });
    var n = tabs[(i + dir + tabs.length) % tabs.length]; n.click();
    setTimeout(function () { focusFirst(dlg); }, 30);
    return true;
  }

  // 대화상자가 새로 뜨면 초점
  var seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
  function check() {
    var dlg = topDialog();
    if (!dlg || (seen && seen.has(dlg)) || dlg.__seoilSeen) return;
    if (seen) seen.add(dlg); dlg.__seoilSeen = true;
    setTimeout(function () { if (visible(dlg) && !dlg.contains(document.activeElement)) focusFirst(dlg); }, 60);
  }
  new MutationObserver(function () { check(); }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

  window.addEventListener('keydown', function (e) {
    var dlg = topDialog(); if (!dlg) return;
    var t = e.target, inDlg = dlg.contains(t);
    if (!inDlg) { // 초점이 문서에 남아 있으면 대화상자로 옮기고, 이 키는 문서로 보내지 않는다
      if (e.key === 'Escape' || e.key === 'Enter' || e.altKey) { /* 아래에서 처리 */ }
      else { e.preventDefault(); e.stopPropagation(); focusFirst(dlg); return; }
    }
    var tag = (t && t.tagName) || '';
    if (e.key === 'Escape') { var c = cancel(dlg); if (c) { e.preventDefault(); e.stopPropagation(); c.click(); } return; }
    if (e.key === 'Enter' && !e.isComposing && tag !== 'TEXTAREA' && !(tag === 'BUTTON' && inDlg)) {
      var p = primary(dlg); if (p) { e.preventDefault(); e.stopPropagation(); if (t && t.blur && inDlg) t.blur(); setTimeout(function () { p.click(); }, 0); }
      return;
    }
    if (e.ctrlKey && e.key === 'Tab') { if (switchTab(dlg, e.shiftKey ? -1 : 1)) { e.preventDefault(); e.stopPropagation(); } return; }
    if (e.altKey && !e.ctrlKey && !e.metaKey && /^Key[A-Z]$|^Digit\d$/.test(e.code || '')) {
      var ch = e.code.slice(-1), hit = byAccel(dlg, ch);
      e.preventDefault(); e.stopPropagation();
      if (hit) { if (hit.click) hit.el.click(); else { hit.el.focus(); if (hit.el.select) hit.el.select(); } }
      return;
    }
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && tag === 'INPUT' && inDlg && (t.type === 'text' || t.type === 'number' || !t.type)) {
      var m = String(t.value).match(/^\s*(-?\d+(?:\.\d+)?)(.*)$/);
      if (m) {
        var step = e.shiftKey ? 10 : 1, dec = (m[1].split('.')[1] || '').length;
        var v = parseFloat(m[1]) + (e.key === 'ArrowUp' ? step : -step);
        t.value = v.toFixed(dec) + m[2];
        t.dispatchEvent(new Event('input', { bubbles: true })); t.dispatchEvent(new Event('change', { bubbles: true }));
        e.preventDefault(); e.stopPropagation();
      }
      return;
    }
  }, true);
})();
