// 서일 오피스 — iOS 앱(Capacitor) 안에서만 붙는 네이티브 브릿지 (2026-11-02).
// 웹 번들(site/)은 그대로 두고 index.html에 이 파일만 끼운다. 하는 일:
//  1. 파일 앱·다른 앱에서 .hwp/.hwpx/.hml을 "서일 오피스로 열기" → appUrlOpen → 바이트를 읽어 편집기로.
//  2. 그렇게 연 파일은 **제자리 덮어쓰기**: rhwp가 쓰는 FileSystemFileHandleLike 모양의 핸들을 넘겨
//     Ctrl+S가 Filesystem 플러그인으로 원본 경로에 다시 쓰게 한다(브라우저에선 매번 공유 시트였던 부분).
//  3. 편집기가 window.rhwpStudio.openBytes(bytes, name, handle)를 내놓아야 한다 — patches/native-bridge.mjs.
(function () {
  var C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  var P = C.Plugins || {};
  var App = P.App, FS = P.Filesystem;
  if (!App || !FS) { console.warn('[seoil-native] App/Filesystem 플러그인 없음'); return; }

  function b64ToBytes(b64) {
    var bin = atob(b64), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function bytesToB64(bytes) {
    var s = '', CH = 0x8000;
    for (var i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(s);
  }
  function nameOf(url) {
    try { return decodeURIComponent(url.split('?')[0].split('/').pop() || 'document.hwp'); } catch (e) { return 'document.hwp'; }
  }

  /** rhwp FileSystemFileHandleLike — 원본 URL에 그대로 다시 쓴다 */
  function nativeHandle(url, name) {
    return {
      kind: 'file',
      name: name,
      nativeUrl: url,
      getFile: async function () {
        var r = await FS.readFile({ path: url });
        return new File([b64ToBytes(r.data)], name);
      },
      createWritable: async function () {
        var chunks = [];
        return {
          write: async function (data) {
            if (data instanceof Blob) chunks.push(new Uint8Array(await data.arrayBuffer()));
            else if (data instanceof ArrayBuffer) chunks.push(new Uint8Array(data));
            else if (ArrayBuffer.isView(data)) chunks.push(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
            else if (data && data.data) return this.write(data.data);
            else chunks.push(new TextEncoder().encode(String(data)));
          },
          close: async function () {
            var total = chunks.reduce(function (n, c) { return n + c.length; }, 0);
            var all = new Uint8Array(total), off = 0;
            chunks.forEach(function (c) { all.set(c, off); off += c.length; });
            await FS.writeFile({ path: url, data: bytesToB64(all) });
          },
          abort: async function () { chunks = []; },
        };
      },
      isSameEntry: async function (other) { return !!other && other.nativeUrl === url; },
      queryPermission: async function () { return 'granted'; },
      requestPermission: async function () { return 'granted'; },
    };
  }

  var pending = null;
  async function openUrl(url) {
    if (!/\.(hwpx?|hml)$/i.test(url.split('?')[0])) return;
    var open = window.rhwpStudio && window.rhwpStudio.openBytes;
    if (typeof open !== 'function') { pending = url; return; } // 편집기 준비 전이면 보류
    var name = nameOf(url);
    try {
      var r = await FS.readFile({ path: url });
      open(b64ToBytes(r.data), name, nativeHandle(url, name));
    } catch (e) {
      console.error('[seoil-native] open failed', url, e);
      alert('파일을 열지 못했습니다: ' + name + '\n' + (e && e.message || e));
    }
  }

  App.addListener('appUrlOpen', function (ev) { if (ev && ev.url) openUrl(ev.url); });
  App.getLaunchUrl && App.getLaunchUrl().then(function (r) { if (r && r.url) openUrl(r.url); }).catch(function () {});
  // 편집기가 늦게 뜨는 경우: openBytes가 생기면 보류분 처리
  var t = setInterval(function () {
    if (pending && window.rhwpStudio && typeof window.rhwpStudio.openBytes === 'function') { var u = pending; pending = null; openUrl(u); }
    if (!pending && window.rhwpStudio && window.rhwpStudio.openBytes) clearInterval(t);
  }, 500);

  // 설치 안내·단축키 모드 버튼은 앱에선 의미 없음
  document.addEventListener('DOMContentLoaded', function () {
    ['hwppad-install', 'hwppad-keylock'].forEach(function (id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; });
  });
  window.__seoilNative = { openUrl: openUrl, nativeHandle: nativeHandle };
})();
