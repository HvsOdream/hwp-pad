// 서일 오피스 윈도우 설치판 — 웹 편집기와 파일 시스템 사이의 좁은 창구.
// 웹에는 window.seoilDesktop만 보인다(이 앱이 연 파일 읽기·다시 쓰기, 버전 정보). 임의 경로 접근은 없다.
const { contextBridge, ipcRenderer, webFrame } = require('electron');

contextBridge.exposeInMainWorld('seoilDesktop', {
  onOpenFile: (cb) => ipcRenderer.on('seoil:open-file', (_e, msg) => cb({ token: msg.token, name: msg.name, bytes: new Uint8Array(msg.bytes) })),
  ready: () => ipcRenderer.send('seoil:ready'),
  write: (token, bytes) => ipcRenderer.invoke('seoil:write', token, bytes),
  read: (token) => ipcRenderer.invoke('seoil:read', token).then((b) => new Uint8Array(b)),
  info: () => ipcRenderer.invoke('seoil:info'),
  isDesktop: true,
});

// 편집기 쪽 연결 코드는 웹 페이지 안에서 돈다: 편집기(openBytes)가 준비되면 파일을 받아 연다.
// rhwp 파일 핸들(FileSystemFileHandleLike) 모양을 흉내 내 Ctrl+S가 원본에 덮어쓰게 한다.
webFrame.executeJavaScript(`(function () {
  var D = window.seoilDesktop;
  function handle(token, name) {
    return {
      kind: 'file', name: name, seoilToken: token,
      getFile: function () { return D.read(token).then(function (b) { return new File([b], name); }); },
      createWritable: function () {
        var chunks = [];
        return Promise.resolve({
          write: function (data) {
            if (data && data.data !== undefined && !(data instanceof Blob) && !ArrayBuffer.isView(data)) data = data.data;
            if (data instanceof Blob) return data.arrayBuffer().then(function (ab) { chunks.push(new Uint8Array(ab)); });
            if (data instanceof ArrayBuffer) chunks.push(new Uint8Array(data));
            else if (ArrayBuffer.isView(data)) chunks.push(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
            else chunks.push(new TextEncoder().encode(String(data)));
            return Promise.resolve();
          },
          close: function () {
            var n = chunks.reduce(function (s, c) { return s + c.length; }, 0), all = new Uint8Array(n), o = 0;
            chunks.forEach(function (c) { all.set(c, o); o += c.length; });
            return D.write(token, all);
          },
          abort: function () { chunks = []; return Promise.resolve(); },
        });
      },
      isSameEntry: function (o) { return Promise.resolve(!!o && o.seoilToken === token); },
      queryPermission: function () { return Promise.resolve('granted'); },
      requestPermission: function () { return Promise.resolve('granted'); },
    };
  }
  var queue = [];
  function flush() {
    var open = window.rhwpStudio && window.rhwpStudio.openBytes;
    if (typeof open !== 'function') return false;
    while (queue.length) { var f = queue.shift(); open(f.bytes, f.name, handle(f.token, f.name)); }
    return true;
  }
  D.onOpenFile(function (f) { queue.push(f); if (!flush()) wait(); });
  var waiting = false;
  function wait() {
    if (waiting) return; waiting = true;
    var t = setInterval(function () { if (flush()) { clearInterval(t); waiting = false; } }, 300);
  }
  // 설치판에서는 브라우저용 안내(설치 배너·단축키 모드)가 필요 없다
  var css = document.createElement('style');
  css.textContent = '#hwppad-install,#hwppad-keylock{display:none!important}';
  (document.head || document.documentElement).appendChild(css);
  function boot() {
    var t = setInterval(function () { if (window.rhwpStudio && window.rhwpStudio.openBytes) { clearInterval(t); D.ready(); } }, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();`).catch(() => {});
