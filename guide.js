(function () {
  var LS = 'hwppad.guide.v1';
  var ua = navigator.userAgent;
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var hasLock = !!(navigator.keyboard && navigator.keyboard.lock);
  function seen() { try { return localStorage.getItem(LS) === 'off'; } catch (e) { return false; } }
  function open() {
    if (document.getElementById('hwppad-guide')) return;
    var bg = document.createElement('div');
    bg.id = 'hwppad-guide';
    bg.setAttribute('style', 'position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px');
    var card = document.createElement('div');
    card.setAttribute('style', 'background:#fff;color:#111827;max-width:520px;width:100%;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.4);padding:22px 24px;font:14px/1.6 -apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif');
    var rows = [];
    rows.push('<div style="font-size:19px;font-weight:700;margin-bottom:4px">서일 오피스에 오신 것을 환영합니다</div>');
    rows.push('<div style="color:#6b7280;margin-bottom:14px">한글(HWP·HWPX) 문서를 어디서나 열고 고칩니다. 한글 2024 단축키를 그대로 씁니다.</div>');
    if (hasLock && !isIOS) {
      rows.push('<div style="border-left:4px solid #1d4ed8;background:#eff6ff;padding:10px 12px;border-radius:6px;margin:10px 0"><b>⌨ 단축키 모드부터 켜세요</b><br>'
        + 'Ctrl+N,T(표)·Ctrl+T·Ctrl+W 같은 조합은 브라우저가 먼저 가져갑니다. <b>Ctrl+G, Z</b> 또는 오른쪽 아래 ⌨ 버튼을 누르면 전체 화면이 되면서 모든 키가 한글처럼 동작합니다. '
        + '나올 때는 <b>Esc를 길게</b>. ⌨ 옆 「자동」을 켜 두면 다음부터 문서를 클릭할 때 저절로 켜집니다.</div>');
    } else if (isIOS) {
      rows.push('<div style="border-left:4px solid #1d4ed8;background:#eff6ff;padding:10px 12px;border-radius:6px;margin:10px 0"><b>아이패드</b><br>'
        + '외장 키보드의 Ctrl·Alt 단축키가 그대로 됩니다. 저장은 공유 시트 → 「파일에 저장」으로 Dropbox 폴더를 고르세요. 홈 화면에 추가하면 앱처럼 열립니다.</div>');
    }
    rows.push('<ul style="margin:10px 0 14px 18px;padding:0;color:#374151">'
      + '<li><b>열기</b> Alt+O · <b>저장</b> Alt+S / Ctrl+S · <b>다른 이름으로</b> Alt+V · <b>인쇄</b> Alt+P</li>'
      + '<li><b>표</b> Ctrl+N,T · <b>글자 모양</b> Alt+L · <b>문단 모양</b> Alt+T · <b>모양 복사</b> Alt+C · <b>문자표</b> Ctrl+F10</li>'
      + '<li><b>명령 찾기</b> Ctrl+/ (명령 팔레트) · <b>단축키 전체 목록</b> 아래 버튼 또는 ⌨ 옆 「?」</li>'
      + (isIOS ? '' : '<li><b>저장 폴더</b> 파일 메뉴 → 「저장 폴더 지정…」(PC는 Ctrl+S로 제자리 덮어쓰기)</li>')
      + '</ul>');
    rows.push('<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'
      + '<button id="hwppad-guide-list" style="font:inherit;padding:8px 14px;border:1px solid #d1d5db;border-radius:8px;background:#f9fafb;cursor:pointer">단축키 전체 목록</button>'
      + '<span style="flex:1"></span>'
      + '<label style="display:flex;gap:6px;align-items:center;color:#6b7280;font-size:13px"><input type="checkbox" id="hwppad-guide-off" checked>다시 보지 않기</label>'
      + '<button id="hwppad-guide-ok" style="font:inherit;padding:8px 16px;border:0;border-radius:8px;background:#1d4ed8;color:#fff;font-weight:600;cursor:pointer">시작하기</button>'
      + '</div>');
    card.innerHTML = rows.join('');
    bg.appendChild(card);
    document.body.appendChild(bg);
    function close() {
      var off = document.getElementById('hwppad-guide-off');
      try { localStorage.setItem(LS, off && off.checked ? 'off' : 'on'); } catch (e) {}
      bg.remove();
    }
    document.getElementById('hwppad-guide-ok').onclick = close;
    document.getElementById('hwppad-guide-list').onclick = function () { window.open('shortcuts.html', '_blank'); };
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    bg.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }, true);
    document.getElementById('hwppad-guide-ok').focus();
  }
  function mountHelp() {
    var wrap = document.getElementById('hwppad-keylock');
    var help = document.createElement('button');
    help.id = 'hwppad-help';
    help.textContent = '?';
    help.title = '시작 안내 · 단축키 목록';
    help.setAttribute('style', 'font:13px/1 -apple-system,"Malgun Gothic",sans-serif;width:26px;height:26px;border:0;border-radius:50%;background:#1f2937;color:#fff;box-shadow:0 3px 12px rgba(0,0,0,.3);cursor:pointer');
    help.onclick = open;
    if (wrap) { wrap.insertBefore(help, wrap.firstChild); }
    else {
      help.style.position = 'fixed'; help.style.right = '12px'; help.style.bottom = '12px'; help.style.zIndex = '2147482999'; help.style.opacity = '.85';
      document.body.appendChild(help);
    }
  }
  function boot() {
    // keylock.js(defer)가 먼저 버튼 묶음을 만든 뒤에 붙는다
    setTimeout(function () {
      mountHelp();
      /* 첫 화면은 서일 오피스 홈이 맡는다 — 안내는 ? 버튼으로만 */
    }, 0);
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
