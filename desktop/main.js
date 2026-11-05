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

let win = null;
let pageReady = false;
const pending = [];
const opened = new Map(); // token -> 절대 경로 (이 앱이 연 파일만 다시 쓸 수 있다)

function docArgs(argv) {
  return argv.slice(1).filter((a) => DOC_RE.test(a) && fs.existsSync(a)).map((a) => path.resolve(a));
}

let currentPath = null; // 마지막으로 이 앱이 연 파일(바깥 AI 저장용)
function sendOpen(p) {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  opened.set(token, p); currentPath = p;
  const msg = { token, name: path.basename(p), bytes: fs.readFileSync(p) };
  if (pageReady && win) win.webContents.send('seoil:open-file', msg); else pending.push(msg);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
    docArgs(argv).forEach(sendOpen);
  });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null); // 메뉴 단축키(Ctrl+W·Ctrl+R…)가 한글 단축키를 먹지 않게
    createWindow();
    docArgs(process.argv).forEach(sendOpen);
    startAgent();
  });
  app.on('window-all-closed', () => app.quit());
  app.on('will-quit', () => { try { fs.unlinkSync(agentFile()); } catch (e) {} });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: '서일 오피스',
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
  win.maximize();

  // 서일 오피스 주소 밖으로는 창 안에서 이동하지 않고 기본 브라우저로 연다
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(ORIGIN)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(ORIGIN)) { e.preventDefault(); shell.openExternal(url); }
  });

  // 저장 안 한 변경이 있을 때(웹의 beforeunload) 닫기 확인
  win.webContents.on('will-prevent-unload', (e) => {
    const r = dialog.showMessageBoxSync(win, {
      type: 'question',
      buttons: ['닫기', '취소'],
      defaultId: 1,
      cancelId: 1,
      title: '서일 오피스',
      message: '저장하지 않은 변경이 있습니다. 그래도 닫을까요?',
    });
    if (r === 0) e.preventDefault();
  });

  // 개발용: F12 개발자 도구, Ctrl+Shift+F5 새로 불러오기(캐시 무시)
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F12') { win.webContents.toggleDevTools(); e.preventDefault(); }
    if (input.key === 'F5' && input.control && input.shift) { win.webContents.reloadIgnoringCache(); e.preventDefault(); }
  });

  win.webContents.on('did-start-loading', () => { pageReady = false; });
  win.webContents.on('did-fail-load', (_e, code, desc, url, isMain) => {
    if (!isMain || code === -3) return;
    dialog.showMessageBox(win, {
      type: 'warning',
      title: '서일 오피스',
      message: '편집기를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.',
      detail: `${desc} (${code})\n${url}`,
      buttons: ['다시 시도', '닫기'],
    }).then(({ response }) => { if (response === 0) win.loadURL(START_URL); else app.quit(); });
  });

  win.loadURL(START_URL);
}

// 페이지(preload)가 편집기 준비를 알리면 보류 중인 파일을 넘긴다
ipcMain.on('seoil:ready', (e) => {
  if (!win || e.sender !== win.webContents) return;
  pageReady = true;
  while (pending.length) win.webContents.send('seoil:open-file', pending.shift());
});

// 제자리 저장: 이 앱이 연 파일(token)에만 쓴다. 먼저 임시 파일에 쓰고 바꿔 끼워 반쯤 쓴 파일이 남지 않게.
ipcMain.handle('seoil:write', async (e, token, bytes) => {
  if (!win || e.sender !== win.webContents) throw new Error('forbidden');
  const p = opened.get(token);
  if (!p) throw new Error('알 수 없는 파일입니다');
  const tmp = p + '.seoil-tmp';
  await fs.promises.writeFile(tmp, Buffer.from(bytes));
  await fs.promises.rename(tmp, p);
  return { ok: true, path: p };
});

ipcMain.handle('seoil:read', async (e, token) => {
  if (!win || e.sender !== win.webContents) throw new Error('forbidden');
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
  let p = target;
  if (!p) {
    if (currentPath && path.basename(currentPath) === st.fileName) p = currentPath;
    else throw new Error(`"${st.fileName}"은 PC 파일과 연결되어 있지 않습니다. path에 저장할 절대 경로를 주세요.`);
  }
  if (!isDoc(p)) throw new Error('path는 .hwp/.hwpx 절대 경로여야 합니다');
  if (fs.existsSync(p) && p !== currentPath) {
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
  if (p === currentPath) {
    await inPage(`window.rhwpStudio.notifySaved ? window.rhwpStudio.notifySaved() : null`).catch(() => {});
    return `저장했습니다: ${p}`;
  }
  // 다른 이름으로 저장: 저장한 파일을 다시 열어 이후 Ctrl+S가 새 파일에 쓰이게(원본 양식을 덮지 않게)
  await inPage(`window.rhwpStudio.notifySaved ? window.rhwpStudio.notifySaved() : null`).catch(() => {});
  sendOpen(p);
  await inPage(`window.SeoilAgent.waitOpened(${J(path.basename(p))}, 30000)`).catch(() => {});
  return `저장했습니다: ${p} (이제 이 파일이 열려 있고, Ctrl+S도 이 파일에 저장됩니다)`;
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
      sendOpen(p);
      if (win) win.focus();
      await inPage(`window.SeoilAgent.waitOpened(${J(path.basename(p))}, 90000)`);
      return await inPage('window.SeoilAgent.read()');
    }
    case 'new_document': await inPage(`window.SeoilAgent.newDocument(${J(a.kind === 'blank' ? 'blank' : 'report')})`); currentPath = null; return await inPage('window.SeoilAgent.read()');
    case 'rewrite_copy': await inPage('window.SeoilAgent.rewriteCopy()'); currentPath = null; return await inPage('window.SeoilAgent.read()');
    case 'read_document': return await inPage('window.SeoilAgent.read()');
    case 'edit_document': {
      const r = await inPage(`window.SeoilAgent.edit(${J(a.ops || [])}, ${J({ note: a.note || '', force: !!a.force })})`);
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
function claudeConfigPaths() {
  const out = [];
  const roaming = process.env.APPDATA || path.join(app.getPath('home'), 'AppData', 'Roaming');
  out.push(path.join(roaming, 'Claude', 'claude_desktop_config.json'));
  const pk = path.join(process.env.LOCALAPPDATA || path.join(app.getPath('home'), 'AppData', 'Local'), 'Packages');
  try { // 스토어판 Claude는 설정이 패키지 폴더 안에 있다
    for (const d of fs.readdirSync(pk)) if (/^Claude_/i.test(d)) out.push(path.join(pk, d, 'LocalCache', 'Roaming', 'Claude', 'claude_desktop_config.json'));
  } catch (e) {}
  return out;
}
function mcpEntry() {
  return { command: process.execPath, args: [mcpScript()], env: { ELECTRON_RUN_AS_NODE: '1', SEOIL_AGENT_FILE: agentFile(), SEOIL_APP_EXE: process.execPath } };
}
ipcMain.handle('seoil:connect-claude', async (e) => {
  if (!win || e.sender !== win.webContents) throw new Error('forbidden');
  const targets = claudeConfigPaths().filter((p) => fs.existsSync(path.dirname(p)));
  const entry = mcpEntry();
  const cc = `claude mcp add seoil-office -s user -e ELECTRON_RUN_AS_NODE=1 -e SEOIL_AGENT_FILE="${entry.env.SEOIL_AGENT_FILE}" -e SEOIL_APP_EXE="${entry.env.SEOIL_APP_EXE}" -- "${entry.command}" "${entry.args[0]}"`;
  const r = await dialog.showMessageBox(win, {
    type: 'question', buttons: ['연결', '취소'], defaultId: 0, cancelId: 1, title: '내 Claude와 연결',
    message: targets.length ? 'Claude 데스크톱 설정에 서일 오피스를 더합니다.' : 'Claude 데스크톱 설치를 찾지 못했습니다.',
    detail: (targets.length ? targets.join('\n') + '\n\nClaude 데스크톱을 완전히 껐다 켜면 서일 오피스 도구가 보입니다.\n\n' : '') + 'Claude Code에서는 이 명령을 한 번 실행하세요(연결을 누르면 클립보드에 복사):\n' + cc,
  });
  if (r.response !== 0) return { ok: false };
  require('electron').clipboard.writeText(cc);
  const written = [];
  for (const p of targets) {
    let cfg = {};
    try { cfg = JSON.parse(await fs.promises.readFile(p, 'utf8')); } catch (x) { cfg = {}; }
    if (fs.existsSync(p)) { try { await fs.promises.copyFile(p, p + '.bak-seoil'); } catch (x) {} }
    cfg.mcpServers = cfg.mcpServers || {};
    cfg.mcpServers['seoil-office'] = entry;
    await fs.promises.writeFile(p, JSON.stringify(cfg, null, 2), 'utf8');
    written.push(p);
  }
  return { ok: true, written, claudeCode: cc };
});

// 시험용(SEOIL_TEST): 통로 처리부를 바깥에서 불러 쓸 수 있게
if (process.env.SEOIL_TEST) module.exports = { runTool, startAgent, agentFile, __setWin: (w) => { win = w; pageReady = true; } };
