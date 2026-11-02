// hwp-pad: 한글 2024 단축키를 브라우저에서도 끝까지 (2026-11-02).
//
// 이음오피스의 hancom-keys 플러그인이 한글 단축키 대부분(Ctrl+N/K/Q/M/G 연속키, 정렬, Ctrl+Y, 스타일 Ctrl+1~0,
// 쉬운 계산식 …)을 이미 넣어 두었다. 다만 일부는 Electron 메인 프로세스가 먼저 받아 넘기는 구조라 브라우저에서는
// 아무도 호출하지 않는다. 그 구멍과, 한컴 공식 단축키표(help.hancom.com hoffice130 Hwp)에서 빠진 대체 키를 메운다.
//
//  1. main.ts — 메인 프로세스 대행: Ctrl+E/C/X(셀 블록·표 선택), Ctrl+Shift+S(셀 블록 합계)를 window.__ieumHancomKey로.
//               + 명령 hwppad:fullscreen(전체 화면 = 단축키 모드, keylock.js) 등록.
//  2. shortcut-map.ts — Alt+O/S/V/P(불러오기·저장·다른 이름으로·인쇄), Ctrl+J(쪽 나누기), Ctrl+Shift+W/Q(줄 간격),
//               Ctrl+Shift+Insert/Delete(문단 번호·글머리표).
//  3. input-handler-keyboard.ts — Alt+V 연속키(보기, 맥 전용 계승)를 맥에서만. 윈도우에선 한글대로 '다른 이름으로 저장'.
//
// 사용: node patches/hancom-web.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/hancom-web.mjs <studio src/engine dir>')

function patch(file, pairs) {
  let src = readFileSync(file, 'utf8')
  for (const [find, replace] of pairs) {
    const n = src.split(find).length - 1
    if (n !== 1) throw new Error(`${file}: expected exactly 1 match, found ${n}:\n${find}`)
    src = src.replace(find, () => replace)
  }
  writeFileSync(file, src)
  console.log(`patched ${file}`)
}

// ── 1. main.ts ──────────────────────────────────────────────────────────────
const main = join(dir, '..', 'main.ts')
const anchor = 'installHancomMainKeys(window, () => inputHandler, dispatcher);'
if (!readFileSync(main, 'utf8').includes(anchor)) {
  throw new Error('main.ts: 이음 studio-hancom-commands 패치가 보이지 않음 — hancom-keys가 빌드에 없나?')
}
patch(main, [[
  anchor,
  anchor + `
// [hwp-pad] 브라우저에는 Electron 메인 프로세스가 없다. 그쪽이 먼저 받아 편집기에 되묻던 키
// (Ctrl+E/C/X = 셀 블록 지우기·복사·오려두기 / 표 지우기, Ctrl+Shift+S = 셀 블록 합계)를 여기서 되묻는다.
// 대화상자 입력란에 포커스가 있으면 그 입력란의 키다.
window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
  const ae = document.activeElement as HTMLElement | null;
  if (ae && ae.getAttribute('aria-label') !== '문서 편집 입력' &&
      (/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) || ae.isContentEditable)) return;
  let name: string | null = null;
  if (!e.shiftKey && e.code === 'KeyE') name = 'ctrl-e';
  else if (!e.shiftKey && e.code === 'KeyC') name = 'ctrl-c';
  else if (!e.shiftKey && e.code === 'KeyX') name = 'ctrl-x';
  else if (e.shiftKey && e.code === 'KeyS') name = 'ctrl-shift-s';
  if (!name) return;
  const take = (window as any).__ieumHancomKey;
  if (typeof take === 'function' && take(name) === true) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}, true);
// [hwp-pad] 한글 Ctrl+G,Z 전체 화면 = 단축키 모드(keylock.js: 전체 화면 + Keyboard Lock)
registry.register({
  id: 'hwppad:fullscreen',
  label: '전체 화면 (단축키 모드)',
  shortcutLabel: 'Ctrl+G,Z',
  execute: () => { (window as any).__hwppadKeylock?.toggle?.(); },
});`,
]])

// ── 2. shortcut-map.ts ──────────────────────────────────────────────────────
const map = join(dir, '..', 'command', 'shortcut-map.ts')
patch(map, [[
  "  [{ key: 'p', ctrl: true, shift: true }, 'table:block-product'],\n];",
  `  [{ key: 'p', ctrl: true, shift: true }, 'table:block-product'],

  // [hwp-pad] 한글 2024 공식 단축키표의 대체 키 (help.hancom.com hoffice130/Hwp)
  // 파일: Alt+O 불러오기 · Alt+S 저장 · Alt+V 다른 이름으로 저장 · Alt+P 인쇄 (맥은 Option+글자가 문자라 제외)
  [{ key: 'o', code: 'KeyO', alt: true, platform: 'other' }, 'file:open'],
  [{ key: 'ㅐ', alt: true, platform: 'other' }, 'file:open'],
  [{ key: 's', code: 'KeyS', alt: true, platform: 'other' }, 'file:save'],
  [{ key: 'ㄴ', alt: true, platform: 'other' }, 'file:save'],
  [{ key: 'v', code: 'KeyV', alt: true, platform: 'other' }, 'file:save-as'],
  [{ key: 'ㅍ', alt: true, platform: 'other' }, 'file:save-as'],
  [{ key: 'p', code: 'KeyP', alt: true, platform: 'other' }, 'file:print'],
  [{ key: 'ㅔ', alt: true, platform: 'other' }, 'file:print'],
  // 쪽: Ctrl+J 쪽 나누기 (Ctrl+Enter와 같음)
  [{ key: 'j', code: 'KeyJ', ctrl: true }, 'page:break'],
  [{ key: 'ㅓ', ctrl: true }, 'page:break'],
  // 문단: Ctrl+Shift+W 줄 간격 넓게 · Ctrl+Shift+Q 좁게 (Alt+Shift+Z/A와 같음)
  [{ key: 'w', code: 'KeyW', ctrl: true, shift: true }, 'format:line-spacing-increase'],
  [{ key: 'ㅈ', ctrl: true, shift: true }, 'format:line-spacing-increase'],
  [{ key: 'q', code: 'KeyQ', ctrl: true, shift: true }, 'format:line-spacing-decrease'],
  [{ key: 'ㅂ', ctrl: true, shift: true }, 'format:line-spacing-decrease'],
  // 서식: Ctrl+Shift+Insert 문단 번호 적용/해제 · Ctrl+Shift+Delete 글머리표 적용/해제
  [{ key: 'insert', code: 'Insert', ctrl: true, shift: true }, 'format:toggle-numbering'],
  [{ key: 'delete', code: 'Delete', ctrl: true, shift: true }, 'format:toggle-bullet'],
];`,
]])

// ── 3. input-handler-keyboard.ts — Alt+V 연속키는 맥에서만 ──────────────────
const kb = join(dir, 'input-handler-keyboard.ts')
patch(kb, [[
  "    if ((e.key === 'v' || e.key === 'V' || e.key === 'ㅍ') && !e.shiftKey && !e.ctrlKey) {\n      e.preventDefault();\n      this._pendingChordV = true;",
  "    // [hwp-pad] 윈도우·아이패드에서 Alt+V는 한글대로 '다른 이름으로 저장'(shortcut-map). 보기 연속키는 맥만.\n" +
  "    if ((e.key === 'v' || e.key === 'V' || e.key === 'ㅍ') && !e.shiftKey && !e.ctrlKey && /Mac/.test(navigator.platform)) {\n      e.preventDefault();\n      this._pendingChordV = true;",
]])

// 확인용 표식
for (const f of [main, map, kb]) if (!existsSync(f)) throw new Error('missing ' + f)
console.log('[hwp-pad] hancom-web: ok')
