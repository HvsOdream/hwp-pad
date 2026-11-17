(function () {
  var kb = navigator.keyboard;
  if (!kb || typeof kb.lock !== 'function' || !document.documentElement.requestFullscreen) return; // 사파리·아이패드: 해당 없음(브라우저 단축키가 Cmd라 충돌 없음)
  var LS = 'hwppad.keylock';
  var KEYS = [];
  for (var c = 65; c <= 90; c++) KEYS.push('Key' + String.fromCharCode(c));
  for (var d = 0; d <= 9; d++) KEYS.push('Digit' + d);
  for (var f = 1; f <= 12; f++) KEYS.push('F' + f);
  KEYS.push('Escape', 'Enter', 'Backspace', 'Delete', 'Insert', 'Home', 'End', 'PageUp', 'PageDown',
    'Minus', 'Equal', 'BracketLeft', 'BracketRight', 'Backslash', 'Semicolon', 'Quote', 'Comma', 'Period', 'Slash', 'Backquote');
  var locked = false, toastT = null;
  function pref() { try { return localStorage.getItem(LS); } catch (e) { return null; } }
  function setPref(v) { try { localStorage.setItem(LS, v); } catch (e) {} }
  function toast(msg, ms) {
    var t = document.getElementById('hwppad-keylock-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'hwppad-keylock-toast';
      t.setAttribute('style', 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:2147483000;background:#111827;color:#f9fafb;font:13px/1.5 -apple-system,"Malgun Gothic",sans-serif;padding:10px 16px;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.4);max-width:92vw;pointer-events:none;transition:opacity .3s');
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(toastT); toastT = setTimeout(function () { t.style.opacity = '0'; }, ms || 3500);
  }
  function enter() {
    if (document.fullscreenElement) { lock(); return; }
    var p = document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    if (p && p.then) p.then(lock, function (e) { toast('전체화면 전환 실패: ' + (e && e.message || e)); });
  }
  function lock() {
    kb.lock(KEYS).then(function () {
      locked = true; render();
      toast('단축키 모드 켜짐 — Ctrl+N,T(표)·Ctrl+T·Ctrl+W 등 브라우저 단축키도 한글처럼 동작합니다. 해제: Esc 길게 누르기 또는 Ctrl+G,Z', 6000);
    }, function (e) { toast('키 잠금 실패: ' + (e && e.message || e)); });
  }
  function leave() { try { kb.unlock(); } catch (e) {} locked = false; if (document.fullscreenElement) document.exitFullscreen(); render(); }
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement) { try { kb.unlock(); } catch (e) {} locked = false; render(); }
  });
  // 토글은 한글 Ctrl+G,Z(전체 화면)에 매인 명령 hwppad:fullscreen(patches/hancom-web.mjs)이 부른다.
  // F11은 한글대로 '개체 선택'이라 건드리지 않는다.
  function toggle() { if (locked || document.fullscreenElement) leave(); else enter(); }
  window.__hwppadKeylock = { toggle: toggle, enter: enter, leave: leave, get locked() { return locked; } };
  // 버튼
  var btn;
  function render() {
    if (!btn) return;
    btn.textContent = locked ? '⌨ 단축키 모드 켜짐' : '⌨ 단축키 모드 (Ctrl+G,Z)';
    btn.title = locked
      ? '브라우저 단축키(Ctrl+N/T/W…)를 한글 단축키로 쓰는 중. 해제: Esc 길게 또는 Ctrl+G,Z'
      : 'Ctrl+N,T 같은 조합이 새 탭/새 창으로 새면 켜세요. 전체화면 + 키 잠금 (크롬·엣지)';
    btn.style.background = locked ? '#166534' : '#1f2937';
    auto.checked = pref() === 'auto';
  }
  var auto;
  function mount() {
    var wrap = document.createElement('div');
    wrap.id = 'hwppad-keylock';
    wrap.setAttribute('style', 'position:fixed;right:12px;bottom:12px;z-index:2147482999;display:flex;gap:6px;align-items:center;font:12px/1.3 -apple-system,"Malgun Gothic",sans-serif;opacity:.85');
    btn = document.createElement('button');
    btn.setAttribute('style', 'font:inherit;padding:6px 10px;border:0;border-radius:8px;background:#1f2937;color:#fff;box-shadow:0 3px 12px rgba(0,0,0,.3);cursor:pointer;white-space:nowrap');
    btn.onclick = toggle;
    var lab = document.createElement('label');
    lab.setAttribute('style', 'display:flex;gap:4px;align-items:center;background:#1f2937;color:#e5e7eb;padding:5px 8px;border-radius:8px;cursor:pointer;white-space:nowrap');
    lab.title = '켜 두면 다음에 열 때 첫 클릭에서 자동으로 단축키 모드로 들어갑니다';
    auto = document.createElement('input'); auto.type = 'checkbox';
    auto.onchange = function () { setPref(auto.checked ? 'auto' : 'off'); };
    lab.appendChild(auto); lab.appendChild(document.createTextNode('자동'));
    wrap.appendChild(btn); wrap.appendChild(lab);
    document.body.appendChild(wrap);
    render();
    // 자동 모드: 전체화면은 사용자 동작이 있어야 열리므로 첫 클릭/키 입력에 편승
    if (pref() === 'auto') {
      var once = function (e) {
        if (e.target && e.target.closest && e.target.closest('#hwppad-keylock')) return;
        window.removeEventListener('pointerdown', once, true); window.removeEventListener('keydown', once, true);
        enter();
      };
      window.addEventListener('pointerdown', once, true); window.addEventListener('keydown', once, true);
      toast('자동 단축키 모드: 문서를 클릭하면 전체화면으로 전환됩니다', 5000);
    }
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
