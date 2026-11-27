(function () {
  if (!/[?#&]debug/.test(location.search + location.hash)) return;
  var MAX = 60, lines = [], box, pre, armed = false;
  function fmt(v) { try { return typeof v === 'string' ? v : JSON.stringify(v); } catch (e) { return String(v); } }
  function log(tag, data) {
    var t = new Date().toISOString().slice(11, 23);
    lines.push(t + ' ' + tag + ' ' + fmt(data));
    if (lines.length > MAX) lines.shift();
    if (pre) { pre.textContent = lines.join('\n'); pre.scrollTop = pre.scrollHeight; }
  }
  function mount() {
    if (box) return;
    box = document.createElement('div');
    box.setAttribute('style', 'position:fixed;left:0;right:0;bottom:0;max-height:38vh;z-index:2147483647;background:rgba(0,0,0,.88);color:#9f9;font:11px/1.35 ui-monospace,Menlo,monospace;display:flex;flex-direction:column;pointer-events:auto');
    var bar = document.createElement('div');
    bar.setAttribute('style', 'display:flex;gap:8px;padding:4px 8px;background:#222;color:#fff;align-items:center');
    bar.innerHTML = '<b>hwp-pad debug</b><span id="dbg-ua" style="opacity:.7;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis"></span>';
    var copy = document.createElement('button'); copy.textContent = '복사'; copy.setAttribute('style', 'font:12px sans-serif;padding:2px 10px');
    copy.onclick = function () { var txt = header() + '\n' + lines.join('\n'); try { navigator.clipboard.writeText(txt).then(function(){ copy.textContent = '복사됨'; }, function(){ fallback(txt); }); } catch (e) { fallback(txt); } };
    var clear = document.createElement('button'); clear.textContent = '지움'; clear.setAttribute('style', 'font:12px sans-serif;padding:2px 10px');
    clear.onclick = function () { lines = []; pre.textContent = ''; };
    var close = document.createElement('button'); close.textContent = '닫기'; close.setAttribute('style', 'font:12px sans-serif;padding:2px 10px');
    close.onclick = function () { box.remove(); box = null; pre = null; };
    bar.appendChild(copy); bar.appendChild(clear); bar.appendChild(close);
    pre = document.createElement('pre');
    pre.setAttribute('style', 'margin:0;padding:6px 8px;overflow:auto;flex:1;white-space:pre-wrap;word-break:break-all;-webkit-user-select:text;user-select:text');
    box.appendChild(bar); box.appendChild(pre);
    document.body.appendChild(box);
    bar.querySelector('#dbg-ua').textContent = navigator.userAgent;
    pre.textContent = lines.join('\n');
  }
  function fallback(txt) { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('style', 'position:fixed;top:10px;left:10px;width:80vw;height:40vh;z-index:2147483647;font:11px monospace'); document.body.appendChild(ta); ta.select(); }
  function header() { return 'UA: ' + navigator.userAgent + '\nURL: ' + location.href + '\nbuild: ' + (document.querySelector('script[src*="assets/index"]') || {}).src; }
  function keyInfo(e) {
    return { key: e.key, code: e.code, kc: e.keyCode, comp: e.isComposing, mods: (e.ctrlKey?'C':'')+(e.shiftKey?'S':'')+(e.altKey?'A':'')+(e.metaKey?'M':''), tgt: (e.target && (e.target.tagName + (e.target.id ? '#' + e.target.id : '') + (e.target.className && typeof e.target.className === 'string' ? '.' + e.target.className.split(' ')[0] : ''))) };
  }
  window.addEventListener('keydown', function (e) {
    var info = keyInfo(e);
    setTimeout(function () { info.dp = e.defaultPrevented; log('keydown', info); }, 0);
  }, true);
  window.addEventListener('keyup', function (e) { if (e.key === 'Enter') log('keyup', { key: e.key, kc: e.keyCode, comp: e.isComposing }); }, true);
  window.addEventListener('keypress', function (e) { if (e.key === 'Enter' || e.keyCode === 13) log('keypress', { key: e.key, kc: e.keyCode, dp: e.defaultPrevented }); }, true);
  window.addEventListener('beforeinput', function (e) { log('beforeinput', { type: e.inputType, data: e.data, comp: e.isComposing, dp: e.defaultPrevented }); }, true);
  window.addEventListener('input', function (e) { log('input', { type: e.inputType, data: e.data, comp: e.isComposing }); }, true);
  window.addEventListener('compositionstart', function (e) { log('compositionstart', e.data); }, true);
  window.addEventListener('compositionupdate', function (e) { log('compositionupdate', e.data); }, true);
  window.addEventListener('compositionend', function (e) { log('compositionend', e.data); }, true);
  window.addEventListener('error', function (e) { log('ERROR', (e.message || '') + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno + (e.error && e.error.stack ? '\n' + String(e.error.stack).split('\n').slice(0, 4).join('\n') : '')); });
  window.addEventListener('unhandledrejection', function (e) { var r = e.reason; log('REJECT', r && r.stack ? String(r.stack).split('\n').slice(0, 4).join('\n') : fmt(r)); });
  ['error', 'warn'].forEach(function (lvl) {
    var orig = console[lvl];
    console[lvl] = function () { try { log('console.' + lvl, Array.prototype.map.call(arguments, function (a) { return a && a.stack ? String(a.stack).split('\n').slice(0, 3).join(' | ') : fmt(a); }).join(' ')); } catch (e) {} return orig.apply(console, arguments); };
  });
  log('debug', 'overlay on; press keys, then 복사');
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
