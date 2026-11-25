// 서일 오피스 — 윈도우 설치판 (Electron 껍데기, 2026-11-02).
// 편집기는 배포된 웹(서일 오피스 PWA)을 그대로 띄운다 → 웹을 고치면 설치판도 다음 실행부터 바로 새 버전.
// 브라우저와 달리 Ctrl+N/T/W 같은 키를 브라우저가 가로채지 않으므로 한글 단축키가 단축키 모드 없이 동작한다.
// 탐색기에서 .hwp/.hwpx를 "서일 오피스로 열기" → 편집기로 열고, Ctrl+S는 그 파일에 제자리 덮어쓰기.
const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');

const START_URL = process.env.SEOIL_URL || 'https://hvsodream.github.io/hwp-pad/';
const ORIGIN = new URL(START_URL).origin;
const DOC_RE = /\.(hwpx?|hml)$/i;

// 창은 여러 개(문서 하나에 창 하나 — 한글처럼). win은 "지금 쓰는 창"(마지막에 앞에 온 창)이고, 바깥 AI 도구는 이 창을 다룬다.
// 창마다의 상태는 w.seoil = { ready: 편집기 준비됨, pending: 준비 전에 온 파일, path: 이 앱이 이 창에 연 파일 }.
let win = null;
const wins = new Set();
const opened = new Map(); // token -> 절대 경로 (이 앱이 연 파일만 다시 쓸 수 있다)

function docArgs(argv) {
  return argv.slice(1).filter((a) => DOC_RE.test(a) && fs.existsSync(a)).map((a) => path.resolve(a));
}
const samePath = (a, b) => !!a && !!b && path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();

// 파일을 창 w에 연다(w를 안 주면 지금 쓰는 창)
function sendOpen(p, w) {
  w = w || win;
  if (!w) return;
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  opened.set(token, p); w.seoil.path = p;
  const msg = { token, name: path.basename(p), bytes: fs.readFileSync(p) };
  if (w.seoil.ready) w.webContents.send('seoil:open-file', msg); else w.seoil.pending.push(msg);
}
function front(w) { if (w.isMinimized()) w.restore(); w.show(); w.focus(); win = w; }
function pageIn(w, js) { return w.webContents.executeJavaScript(js, true); }
// 이 창이 비어 있나(홈 화면만 떠 있고 편집 중인 문서가 없다) — 그러면 새 창 대신 여기에 연다
async function isIdle(w) {
  if (w.seoil.opening) return false;
  try { return !!(await pageIn(w, '!!(window.SeoilStart && window.SeoilStart.idle && window.SeoilStart.idle())')); } catch (e) { return false; }
}
// 이 창에 지금도 그 파일이 열려 있나(창 안에서 다른 문서로 바꿨을 수 있어 편집기에 물어본다)
async function hasDoc(w, p) {
  if (!samePath(w.seoil.path, p)) return false;
  if (w.seoil.opening) return true;
  try { return (await pageIn(w, 'window.rhwpStudio && window.rhwpStudio.ai && window.rhwpStudio.ai.fileName ? window.rhwpStudio.ai.fileName() : ""')) === path.basename(p); } catch (e) { return false; }
}
// 탐색기 더블클릭·「연결 프로그램」·바깥 AI가 파일을 열 때: 이미 열린 창이 있으면 그 창을 앞으로, 빈 창이 있으면 거기에, 아니면 새 창.
// (2026-11-25 전에는 창이 하나라 두 번째 파일이 첫 문서를 밀어냈다)
async function openPath(p) {
  for (const w of wins) if (await hasDoc(w, p)) { front(w); return w; }
  for (const w of wins) if (await isIdle(w)) { sendOpen(p, w); front(w); return w; }
  const w = createWindow(p);
  sendOpen(p, w);
  return w;
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    const docs = docArgs(argv);
    if (!docs.length) { if (win) front(win); else createWindow(); return; }
    docs.reduce((q, p) => q.then(() => openPath(p)).catch(() => {}), Promise.resolve());
  });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null); // 메뉴 단축키(Ctrl+W·Ctrl+R…)가 한글 단축키를 먹지 않게
    const docs = docArgs(process.argv);
    if (!docs.length) createWindow();
    else docs.reduce((q, p) => q.then(() => openPath(p)).catch(() => {}), Promise.resolve());
    startAgent();
    startRelay();
  });
  app.on('window-all-closed', () => app.quit());
  app.on('will-quit', () => { try { fs.unlinkSync(agentFile()); } catch (e) {} });
}

// file을 주면 "파일을 열려고 띄우는 창": 홈 화면을 거치지 않고(?nostart) 「여는 중」만 보이다가 바로 문서가 나온다.
// (전에는 더블클릭으로 열면 홈 화면이 잠깐 보였다가 문서로 바뀌었다 — 2026-11-25)
function createWindow(file) {
  const w = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: file ? path.basename(file) + ' - 서일 오피스' : '서일 오피스',
    backgroundColor: '#F4F5F7',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });
  w.seoil = { ready: false, pending: [], path: null, opening: !!file };
  wins.add(w); win = w;
  w.maximize();
  w.on('focus', () => { win = w; if (relay) relay.active(); }); // PC가 여럿이면 지금 쓰는 창으로 도구 호출이 오게
  w.on('closed', () => { wins.delete(w); if (win === w) win = Array.from(wins).pop() || null; });

  if (file) {
    const cover = `(function () {
      if (document.getElementById('seoil-opening')) return;
      var d = document.createElement('div'); d.id = 'seoil-opening';
      d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#F4F5F7;display:flex;align-items:center;justify-content:center;font:15px "Noto Sans KR","Malgun Gothic",sans-serif;color:#5F6670';
      d.textContent = ${JSON.stringify(path.basename(file) + ' 여는 중…')};
      document.documentElement.appendChild(d);
      setTimeout(function () { d.remove(); }, 25000);
    })()`;
    const uncover = () => { w.seoil.opening = false; if (!w.isDestroyed()) pageIn(w, `(function () { var d = document.getElementById('seoil-opening'); if (d) d.remove(); })()`).catch(() => {}); };
    w.webContents.once('dom-ready', () => {
      pageIn(w, cover).catch(() => {});
      // 편집기가 그 파일을 띄우면 걷는다(이름이 바뀔 때까지 기다림). 끝내 안 열리면 25초 뒤 저절로 걷힌다.
      pageIn(w, `(async () => {
        const name = ${JSON.stringify(path.basename(file))};
        for (const t0 = Date.now(); Date.now() - t0 < 25000; ) {
          const ai = window.rhwpStudio && window.rhwpStudio.ai;
          if (ai && ai.doc && ai.doc() && ai.fileName && ai.fileName() === name) { await new Promise((r) => setTimeout(r, 250)); return true; }
          await new Promise((r) => setTimeout(r, 100));
        }
        return false;
      })()`).then(uncover, uncover);
    });
  }

  // 서일 오피스 주소 밖으로는 창 안에서 이동하지 않고 기본 브라우저로 연다
  w.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(ORIGIN)) shell.openExternal(url);
    return { action: 'deny' };
  });
  w.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(ORIGIN)) { e.preventDefault(); shell.openExternal(url); }
  });

  // 저장 안 한 변경이 있을 때(웹의 beforeunload) 닫기 확인
  // 한글처럼 「저장 / 저장 안 함 / 취소」. 저장을 고르면 편집기 저장(처음이면 저장 위치를 묻는다)이
  // 끝난 뒤 창을 닫고, 저장 위치 고르기를 취소하면 창을 그대로 둔다.
  w.webContents.on('will-prevent-unload', (e) => {
    const r = dialog.showMessageBoxSync(w, {
      type: 'question',
      buttons: ['저장하고 닫기', '닫기', '취소'],
      defaultId: 0,
      cancelId: 2,
      noLink: true,
      title: '서일 오피스',
      message: '저장하지 않은 변경이 있습니다.',
      detail: '「닫기」는 저장하지 않고 닫습니다. 「취소」는 이 창만 닫고 편집으로 돌아갑니다.',
    });
    if (r === 1) { e.preventDefault(); return; }
    if (r !== 0) return;
    w.webContents.executeJavaScript(`(async () => {
      const R = window.rhwpStudio, it = document.querySelector('[data-cmd="file:save"]');
      if (!R || typeof R.isDirty !== 'function' || !it) return false;
      it.classList.remove('disabled'); it.click();
      for (const t0 = Date.now(); R.isDirty() && Date.now() - t0 < 120000; ) await new Promise((r) => setTimeout(r, 200));
      return !R.isDirty();
    })()`, true).then((saved) => {
      if (saved && !w.isDestroyed()) w.destroy();
      else if (!saved && !w.isDestroyed()) dialog.showMessageBox(w, { type: 'info', title: '서일 오피스', message: '저장하지 않아 창을 닫지 않았습니다.', buttons: ['확인'] });
    }).catch(() => {});
  });

  // 개발용: F12 개발자 도구, Ctrl+Shift+F5 새로 불러오기(캐시 무시)
  w.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F12') { w.webContents.toggleDevTools(); e.preventDefault(); }
    if (input.key === 'F5' && input.control && input.shift) { w.webContents.reloadIgnoringCache(); e.preventDefault(); }
  });

  // 페이지가 새로 뜰 때만(본 창 이동) 준비 상태를 되돌린다 — 안쪽 틀(iframe)이 불러올 때는 그대로
  w.webContents.on('did-start-navigation', (_e, _url, inPlace, isMain) => { if (isMain && !inPlace) w.seoil.ready = false; });
  w.webContents.on('did-fail-load', (_e, code, desc, url, isMain) => {
    if (!isMain || code === -3) return;
    dialog.showMessageBox(w, {
      type: 'warning',
      title: '서일 오피스',
      message: '편집기를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.',
      detail: `${desc} (${code})\n${url}`,
      buttons: ['다시 시도', '닫기'],
    }).then(({ response }) => { if (response === 0) w.loadURL(START_URL); else w.destroy(); });
  });

  w.loadURL(file ? START_URL + (START_URL.includes('?') ? '&' : '?') + 'nostart' : START_URL);
  return w;
}

const ours = (e) => { const w = BrowserWindow.fromWebContents(e.sender); return w && wins.has(w) ? w : null; };

// 페이지(preload)가 편집기 준비를 알리면 보류 중인 파일을 넘긴다
ipcMain.on('seoil:ready', (e) => {
  const w = ours(e);
  if (!w) return;
  w.seoil.ready = true;
  while (w.seoil.pending.length) w.webContents.send('seoil:open-file', w.seoil.pending.shift());
});

// 제자리 저장: 이 앱이 연 파일(token)에만 쓴다. 먼저 임시 파일에 쓰고 바꿔 끼워 반쯤 쓴 파일이 남지 않게.
ipcMain.handle('seoil:write', async (e, token, bytes) => {
  if (!ours(e)) throw new Error('forbidden');
  const p = opened.get(token);
  if (!p) throw new Error('알 수 없는 파일입니다');
  const tmp = p + '.seoil-tmp';
  await fs.promises.writeFile(tmp, Buffer.from(bytes));
  await fs.promises.rename(tmp, p);
  return { ok: true, path: p };
});

ipcMain.handle('seoil:read', async (e, token) => {
  if (!ours(e)) throw new Error('forbidden');
  const p = opened.get(token);
  if (!p) throw new Error('알 수 없는 파일입니다');
  return fs.promises.readFile(p);
});

ipcMain.handle('seoil:info', () => ({ version: app.getVersion(), platform: process.platform }));


// ---------------------------------------------------------------------------
// 바깥 AI 연결 통로 (2026-11-05)
// 사용자의 Claude(데스크톱·Claude Code)가 mcp.js를 실행하면, mcp.js가 이 로컬 통로로 도구 호출을 넘긴다.
// 이 PC 안(127.0.0.1)에서만 열리고, 사용자 폴더의 agent.json에 적힌 토큰이 있어야 한다.
// 실제 문서 일은 웹의 window.SeoilAgent가 한다 — 패널 AI와 같은 엔진, 사람이 창에서 보고 되돌릴 수 있다.
function agentFile() { return path.join(app.getPath('userData'), 'agent.json'); }
function mcpScript() {
  const p = path.join(__dirname, 'mcp.js');
  return p.replace('app.asar' + path.sep, 'app.asar.unpacked' + path.sep);
}
function inPage(expr) {
  if (!win) return Promise.reject(new Error('서일 오피스 창이 없습니다'));
  if (win.isMinimized()) win.restore();
  return win.webContents.executeJavaScript(`(async () => {
    for (let i = 0; i < 100 && !window.SeoilAgent; i++) await new Promise(r => setTimeout(r, 200));
    if (!window.SeoilAgent) throw new Error('편집기가 아직 준비되지 않았습니다(서일 오피스를 최신으로 새로 고쳐 주세요)');
    return await (${expr});
  })()`, true);
}
const J = (v) => JSON.stringify(v);
function isDoc(p) { return typeof p === 'string' && path.isAbsolute(p) && /\.(hwpx?|hml)$/i.test(p); }

async function listDocs(folder) {
  if (typeof folder !== 'string' || !path.isAbsolute(folder)) throw new Error('folder는 절대 경로여야 합니다');
  const out = [];
  async function walk(dir, depth) {
    let ents = [];
    try { ents = await fs.promises.readdir(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of ents) {
      if (out.length >= 300) return;
      const p = path.join(dir, e.name);
      if (e.isDirectory() && depth < 2 && !e.name.startsWith('.')) await walk(p, depth + 1);
      else if (e.isFile() && /\.(hwpx?)$/i.test(e.name)) {
        let st = null; try { st = await fs.promises.stat(p); } catch (x) {}
        out.push(p + (st ? `  (${st.mtime.toISOString().slice(0, 10)})` : ''));
      }
    }
  }
  await walk(folder, 0);
  return out.length ? out.join('\n') : '한글 문서가 없습니다.';
}

async function saveDoc(target) {
  const st = await inPage('window.SeoilAgent.status()');
  if (!st.open) throw new Error('열린 문서가 없습니다');
  const cur = win && win.seoil.path; // 이 창에 이 앱이 연 파일
  let p = target;
  if (!p) {
    if (cur && path.basename(cur) === st.fileName) p = cur;
    else throw new Error(`"${st.fileName}"은 PC 파일과 연결되어 있지 않습니다. path에 저장할 절대 경로를 주세요.`);
  }
  if (!isDoc(p)) throw new Error('path는 .hwp/.hwpx 절대 경로여야 합니다');
  if (fs.existsSync(p) && p !== cur) {
    const r = await dialog.showMessageBox(win, {
      type: 'question', buttons: ['덮어쓰기', '취소'], defaultId: 1, cancelId: 1, title: '서일 오피스',
      message: 'Claude가 이미 있는 파일에 저장하려고 합니다.', detail: p,
    });
    if (r.response !== 0) throw new Error('사람이 덮어쓰기를 취소했습니다');
  }
  const fmt = /\.hwpx$/i.test(p) ? 'hwpx' : 'hwp';
  const bytes = await inPage(`window.SeoilAgent.exportBytes(${J(fmt)})`);
  await fs.promises.mkdir(path.dirname(p), { recursive: true });
  const tmp = p + '.seoil-tmp';
  await fs.promises.writeFile(tmp, Buffer.from(bytes));
  await fs.promises.rename(tmp, p);
  if (p === cur) {
    await inPage(`window.rhwpStudio.notifySaved ? window.rhwpStudio.notifySaved() : null`).catch(() => {});
    return `저장했습니다: ${p}`;
  }
  // 다른 이름으로 저장: 저장한 파일을 다시 열어 이후 Ctrl+S가 새 파일에 쓰이게(원본 양식을 덮지 않게)
  await inPage(`window.rhwpStudio.notifySaved ? window.rhwpStudio.notifySaved() : null`).catch(() => {});
  sendOpen(p);
  await inPage(`window.SeoilAgent.waitOpened(${J(path.basename(p))}, 30000)`).catch(() => {});
  return `저장했습니다: ${p} (이제 이 파일이 열려 있고, Ctrl+S도 이 파일에 저장됩니다)`;
}

// 그림 op: {"image":"C:\\…\\사진.jpg", …} 의 경로를 여기서 읽어 편집기에 바이트(base64)로 넘긴다.
// 웹 편집기는 PC 파일을 직접 읽지 못한다. 그림 파일(png·jpg·gif·bmp·webp, 10MB 이하)만 읽는다.
const IMG_EXT = /\.(png|jpe?g|gif|bmp|webp)$/i;
async function loadImages(ops) {
  if (!Array.isArray(ops)) return ops;
  const out = [];
  for (const op of ops) {
    if (!op || typeof op !== 'object' || op.image == null) { out.push(op); continue; }
    const p = op.image;
    if (typeof p !== 'string' || !path.isAbsolute(p)) throw new Error('image는 그림 파일의 절대 경로여야 합니다');
    if (!IMG_EXT.test(p)) throw new Error('그림 파일(png·jpg·gif·bmp·webp)만 넣을 수 있습니다: ' + p);
    let st; try { st = await fs.promises.stat(p); } catch (e) { throw new Error('그림 파일이 없습니다: ' + p); }
    if (!st.isFile()) throw new Error('그림 파일이 아닙니다: ' + p);
    if (st.size > 10 * 1024 * 1024) throw new Error('그림이 너무 큽니다(10MB 이하): ' + p);
    const buf = await fs.promises.readFile(p);
    out.push(Object.assign({}, op, { image: { b64: buf.toString('base64'), ext: path.extname(p).slice(1).toLowerCase(), name: path.basename(p) } }));
  }
  return out;
}

async function runTool(name, a) {
  switch (name) {
    case 'ping': return 'ok';
    case 'status': return J(await inPage('window.SeoilAgent.status()'));
    case 'get_guide': return await inPage('window.SeoilAgent.guide()');
    case 'list_documents': return await listDocs(a.folder);
    case 'open_document': {
      if (!isDoc(a.path) || !fs.existsSync(a.path)) throw new Error('없는 파일이거나 한글 문서(.hwp/.hwpx)가 아닙니다: ' + a.path);
      const p = path.resolve(a.path);
      // 이미 열린 창이 있으면 그 창, 빈 창이 있으면 거기, 아니면 새 창 — 사람이 보던 다른 문서를 밀어내지 않는다
      front(await openPath(p));
      // 바깥 통로가 60초 안에 답을 기다리므로 그 안에 끝낸다
      await inPage(`window.SeoilAgent.waitOpened(${J(path.basename(p))}, 40000)`);
      return await inPage('window.SeoilAgent.read()');
    }
    case 'new_document': await inPage(`window.SeoilAgent.newDocument(${J(a.kind === 'blank' ? 'blank' : 'report')})`); if (win) win.seoil.path = null; return await inPage('window.SeoilAgent.read()');
    case 'rewrite_copy': await inPage('window.SeoilAgent.rewriteCopy()'); if (win) win.seoil.path = null; return await inPage('window.SeoilAgent.read()');
    case 'read_document': return await inPage('window.SeoilAgent.read()');
    case 'edit_document': {
      const ops = await loadImages(a.ops || []);
      const r = await inPage(`(window.SeoilAgent.editAsync || window.SeoilAgent.edit)(${J(ops)}, ${J({ note: a.note || '', force: !!a.force })})`);
      return { text: r.result, isError: !r.ok };
    }
    case 'undo_last': return await inPage('window.SeoilAgent.undo()');
    case 'save_document': return await saveDoc(a.path);
    default: throw new Error('없는 도구: ' + name);
  }
}

function startAgent() {
  const token = crypto.randomBytes(24).toString('hex');
  const srv = http.createServer((req, res) => {
    const done = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
    if (req.method !== 'POST' || req.url !== '/tool') return done(404, { error: 'not found' });
    if (req.headers.authorization !== 'Bearer ' + token) return done(401, { error: 'unauthorized' });
    if (req.headers.origin) return done(403, { error: 'forbidden' }); // 브라우저 페이지에서 부르는 것은 막는다
    let b = '';
    req.setEncoding('utf8');
    req.on('data', (c) => { b += c; if (b.length > 8e6) req.destroy(); });
    req.on('end', async () => {
      let m; try { m = JSON.parse(b); } catch (e) { return done(400, { error: 'bad json' }); }
      try {
        const r = await runTool(m.name, m.args || {});
        if (r && typeof r === 'object' && 'text' in r) done(200, r); else done(200, { text: r });
      } catch (e) { done(200, { text: '오류: ' + (e && e.message || e), isError: true }); }
    });
  });
  srv.listen(0, '127.0.0.1', () => {
    const port = srv.address().port;
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.writeFileSync(agentFile(), JSON.stringify({ port, token, pid: process.pid }), { mode: 0o600 });
  });
}

// 「Claude에 연결」: Claude 데스크톱 설정(claude_desktop_config.json)에 서일 오피스 통로를 넣는다.
// Claude 데스크톱은 꺼질 때 설정 파일을 다시 써서, 켜져 있는 동안 넣은 항목을 지운다(2026-11-05 실제로 겪음).
// 그래서 켜져 있으면 끄고 → 쓰고 → 다시 켠다. 사람에게는 버튼 하나, 확인 창 하나만.
const { execFile } = require('child_process');
function claudeConfigPaths() {
  const out = [];
  const roaming = process.env.APPDATA || path.join(app.getPath('home'), 'AppData', 'Roaming');
  out.push(path.join(roaming, 'Claude', 'claude_desktop_config.json'));
  const pk = path.join(process.env.LOCALAPPDATA || path.join(app.getPath('home'), 'AppData', 'Local'), 'Packages');
  try { // 스토어판 Claude는 설정이 패키지 폴더 안에 있다
    for (const d of fs.readdirSync(pk)) if (/^Claude_/i.test(d)) out.push(path.join(pk, d, 'LocalCache', 'Roaming', 'Claude', 'claude_desktop_config.json'));
  } catch (e) {}
  return out.filter((p) => fs.existsSync(path.dirname(p)));
}
function mcpEntry() {
  return { command: process.execPath, args: [mcpScript()], env: { ELECTRON_RUN_AS_NODE: '1', SEOIL_AGENT_FILE: agentFile(), SEOIL_APP_EXE: process.execPath } };
}
function claudeCodeCmd() {
  const e = mcpEntry();
  return `claude mcp add seoil-office -s user -e ELECTRON_RUN_AS_NODE=1 -e SEOIL_AGENT_FILE="${e.env.SEOIL_AGENT_FILE}" -e SEOIL_APP_EXE="${e.env.SEOIL_APP_EXE}" -- "${e.command}" "${e.args[0]}"`;
}
function readCfg(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } }
function isConnected(p) {
  const c = readCfg(p), e = c && c.mcpServers && c.mcpServers['seoil-office'];
  return !!(e && e.command === process.execPath && e.args && e.args[0] === mcpScript());
}
function ps(cmd) {
  return new Promise((resolve) => execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', cmd],
    { windowsHide: true, timeout: 20000 }, (err, out) => resolve(err ? '' : String(out || '').trim())));
}
// Claude 데스크톱 프로세스만 고른다(같은 claude.exe 이름의 Claude Code는 건드리지 않는다)
const CLAUDE_DESKTOP = "Get-Process claude -ErrorAction SilentlyContinue | Where-Object { $_.Path -match 'AnthropicClaude|WindowsApps' }";
async function claudeRunning() {
  if (process.platform !== 'win32') return false;
  const n = parseInt(await ps(`@(${CLAUDE_DESKTOP}).Count`), 10);
  return n > 0;
}
async function quitClaude() {
  await ps(`${CLAUDE_DESKTOP} | Stop-Process -Force`);
  for (let i = 0; i < 30 && await claudeRunning(); i++) await new Promise((r) => setTimeout(r, 300));
}
async function startClaude() {
  const id = await ps("(Get-StartApps | Where-Object { $_.Name -eq 'Claude' } | Select-Object -First 1).AppID");
  if (id) { await ps(`Start-Process 'shell:AppsFolder\\${id.replace(/'/g, "''")}'`); return true; }
  const stub = path.join(process.env.LOCALAPPDATA || '', 'AnthropicClaude', 'claude.exe');
  if (fs.existsSync(stub)) { require('child_process').spawn(stub, [], { detached: true, stdio: 'ignore' }).unref(); return true; }
  return false;
}
function writeEntry(p, on) {
  const c = readCfg(p) || {};
  if (fs.existsSync(p)) { try { fs.copyFileSync(p, p + '.bak-seoil'); } catch (x) {} }
  c.mcpServers = c.mcpServers || {};
  if (on) c.mcpServers['seoil-office'] = mcpEntry(); else delete c.mcpServers['seoil-office'];
  fs.writeFileSync(p, JSON.stringify(c, null, 2), 'utf8');
}
function sender(e) { if (!ours(e)) throw new Error('forbidden'); }

ipcMain.handle('seoil:claude-status', async (e) => {
  sender(e);
  const t = claudeConfigPaths();
  return { installed: t.length > 0, connected: t.length > 0 && t.some(isConnected) };
});
ipcMain.handle('seoil:claude-code-cmd', (e) => { sender(e); require('electron').clipboard.writeText(claudeCodeCmd()); return true; });
// on=true 연결, false 끊기
async function setClaude(on) {
  const targets = claudeConfigPaths();
  if (!targets.length) return { ok: false, msg: 'Claude 데스크톱이 이 PC에 없습니다.' };
  const running = await claudeRunning();
  if (running) {
    const r = await dialog.showMessageBox(win, {
      type: 'question', buttons: [on ? '다시 시작하고 연결' : '다시 시작하고 끊기', '취소'], defaultId: 0, cancelId: 1, noLink: true,
      title: '서일 오피스', message: 'Claude 데스크톱을 한 번 다시 시작합니다',
      detail: 'Claude가 답을 쓰는 중이면 끝난 뒤 눌러 주세요. 대화 기록은 그대로 남습니다.',
    });
    if (r.response !== 0) return { ok: false, cancelled: true };
    await quitClaude();
  }
  for (const p of targets) writeEntry(p, on);
  let restarted = false;
  if (running) restarted = await startClaude();
  // Claude가 켜지며 설정을 다시 쓰더라도 남았는지 확인
  if (restarted) await new Promise((r) => setTimeout(r, 4000));
  const ok = on ? targets.some(isConnected) : !targets.some(isConnected);
  if (!ok) return { ok: false, msg: 'Claude가 설정을 되돌렸습니다. Claude를 트레이에서 완전히 끈 뒤 다시 눌러 주세요.' };
  const msg = on
    ? (restarted ? '연결했습니다. Claude 데스크톱을 다시 켰습니다.' : running ? '연결했습니다. Claude 데스크톱을 켜 주세요.' : '연결했습니다. Claude 데스크톱을 켜면 서일 오피스 도구가 보입니다.')
    : '연결을 끊었습니다.';
  return { ok: true, connected: on, msg };
}
ipcMain.handle('seoil:connect-claude', async (e) => { sender(e); return setClaude(true); });
ipcMain.handle('seoil:disconnect-claude', async (e) => { sender(e); return setClaude(false); });

// 시험용(SEOIL_TEST): 통로 처리부를 바깥에서 불러 쓸 수 있게
// ---------------------------------------------------------------------------
// 내 AI 연결 주소(원격 커넥터) — 2026-11-25
// 위의 「Claude에 연결」은 PC마다 Claude 데스크톱 설정 파일을 고친다. Claude 버전·설치 방식에 따라 그 파일을 읽지 않아
// "연결됨"인데 도구가 안 보이는 PC가 나왔다. 그래서 듀얼플래너처럼 주소 하나를 Claude 계정의 커넥터로 등록하는 방식을 기본으로 한다.
// 설치판은 중계 서버에 밖으로 연결만 걸어 두고(relay.js), 주소(key)는 웹이 로그인한 계정으로 받아서 넘겨준다.
// key는 사용자 폴더의 relay.json에 적어 두어, 다음에 켤 때 웹이 뜨기 전에도 바로 붙는다.
const { createRelay } = require('./relay.js');
const RELAY_BASE = process.env.SEOIL_RELAY || 'https://seoil-ai.withsky0.workers.dev';
const RELAY_KEY = /^[A-Za-z0-9_-]{32,64}$/;
let relay = null;
function relayFile() { return path.join(app.getPath('userData'), 'relay.json'); }
function relaySaved() { try { const k = JSON.parse(fs.readFileSync(relayFile(), 'utf8')).key; return RELAY_KEY.test(k) ? k : null; } catch (e) { return null; } }
function relayInfo() { return { on: !!(relay && relay.key()), state: relay ? relay.state() : 'off' }; }
function startRelay() {
  relay = createRelay({
    base: RELAY_BASE, runTool,
    onState: (st) => { for (const w of wins) if (!w.isDestroyed()) w.webContents.send('seoil:relay-state', st); },
  });
  const k = relaySaved();
  if (k) relay.start(k);
}
ipcMain.handle('seoil:relay-status', (e) => { sender(e); return relayInfo(); });
ipcMain.handle('seoil:relay-start', (e, key) => {
  sender(e);
  if (!RELAY_KEY.test(String(key || ''))) throw new Error('연결 주소가 올바르지 않습니다');
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  fs.writeFileSync(relayFile(), JSON.stringify({ key }), { mode: 0o600 });
  relay.start(key);
  return relayInfo();
});
ipcMain.handle('seoil:relay-stop', (e) => {
  sender(e);
  try { fs.unlinkSync(relayFile()); } catch (x) {}
  relay.stop();
  return relayInfo();
});

if (process.env.SEOIL_TEST) module.exports = { runTool, startAgent, startRelay, agentFile, __setWin: (w) => { w.seoil = { ready: true, pending: [], path: null }; wins.add(w); win = w; }, openPath, wins };
