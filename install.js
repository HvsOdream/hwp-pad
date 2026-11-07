(function () {
  var standalone = window.matchMedia('(display-mode: standalone), (display-mode: minimal-ui), (display-mode: window-controls-overlay)').matches
    || window.navigator.standalone === true;
  if (standalone) return;
  try { if (localStorage.getItem('hwppad.installHint') === 'off') return; } catch (e) {}
  var ua = navigator.userAgent;
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome|Chromium/.test(ua);
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; show(); });
  function show() {
    if (document.getElementById('hwppad-install')) return;
    var bar = document.createElement('div');
    bar.id = 'hwppad-install';
    bar.setAttribute('style', 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483000;background:#1f2937;color:#fff;font:13px/1.4 -apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;padding:10px 14px;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.35);display:flex;gap:10px;align-items:center;max-width:92vw');
    var msg = document.createElement('span');
    var btn = document.createElement('button');
    btn.setAttribute('style', 'font:13px sans-serif;padding:5px 12px;border:0;border-radius:6px;background:#60a5fa;color:#0b1220;font-weight:600;white-space:nowrap');
    var close = document.createElement('button');
    close.textContent = '×'; close.title = '다시 보지 않기';
    close.setAttribute('style', 'font:16px sans-serif;background:none;border:0;color:#cbd5e1;padding:0 2px');
    if (deferred) {
      msg.textContent = '주소창 없이 앱처럼 쓰려면';
      btn.textContent = '앱으로 설치';
      btn.onclick = function () { var d = deferred; deferred = null; if (d) { d.prompt(); d.userChoice.then(function () { bar.remove(); }); } };
    } else if (isIOS) {
      msg.textContent = isSafari
        ? '앱처럼 쓰려면: 공유(⬆︎) → 「홈 화면에 추가」'
        : '앱처럼 쓰려면 사파리에서 열고 공유 → 「홈 화면에 추가」';
      btn.style.display = 'none';
    } else {
      return; // 설치 불가 브라우저: 조용히
    }
    close.onclick = function () { try { localStorage.setItem('hwppad.installHint', 'off'); } catch (e) {} bar.remove(); };
    bar.appendChild(msg); bar.appendChild(btn); bar.appendChild(close);
    document.body.appendChild(bar);
  }
  if (isIOS) {
    if (document.body) setTimeout(show, 1500); else document.addEventListener('DOMContentLoaded', function () { setTimeout(show, 1500); });
  }
  window.addEventListener('appinstalled', function () { var b = document.getElementById('hwppad-install'); if (b) b.remove(); });
})();
