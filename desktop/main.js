// 서일 오피스 — 윈도우 설치판 (Electron 껍데기, 2026-11-02).
// 편집기는 배포된 웹(서일 오피스 PWA)을 그대로 띄운다 → 웹을 고치면 설치판도 다음 실행부터 바로 새 버전.
// 브라우저와 달리 Ctrl+N/T/W 같은 키를 브라우저가 가로채지 않으므로 한글 단축키가 단축키 모드 없이 동작한다.
// 탐색기에서 .hwp/.hwpx를 "서일 오피스로 열기" → 편집기로 열고, Ctrl+S는 그 파일에 제자리 덮어쓰기.
const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

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

function sendOpen(p) {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  opened.set(token, p);
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
  });
  app.on('window-all-closed', () => app.quit());
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
