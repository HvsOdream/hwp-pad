// hwp-pad: rhwp-studio v0.8.7 iOS 입력 경로 보정.
// iOS(iPad/iPhone)에서는 글자가 숨겨진 contenteditable DIV의 input 이벤트로 들어오고, 편집기는
// "첫 입력 위치(_iosAnchor)부터 DIV 내용 전체로 치환"한다. 그런데 그 앵커를 Enter·Backspace·
// 화살표·클릭 뒤에 초기화하지 않아, Enter 직후 다음 글자가 옛 앵커부터 다시 치환되며 문단 분리를
// 도로 합친다. 문자키가 아닌 키와 클릭에서 앵커를 끊고 DIV를 비운다.
// 사용: node patches/ios-input.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/ios-input.mjs <studio src/engine dir>')

const RESET = [
  '  // [hwp-pad] iOS: a key that edits or moves the caret outside the hidden div ends the current',
  '  // raw-input run, so the next input event starts a fresh anchor instead of replacing from the old one.',
  '  if (this._isIOS && this._iosAnchor && (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey)) {',
  '    this._iosAnchor = null;',
  '    this._iosLength = 0;',
  '    this._iosBeforePageIndex = undefined;',
  '    this._iosRequiresFullRefresh = false;',
  '    this.textarea.value = \'\';',
  '  }',
  '',
].join('\n')

const CLICK_RESET = [
  '  // [hwp-pad] iOS: a click moves the caret; the hidden div\'s raw-input run must not follow it.',
  '  if (this._isIOS && this._iosAnchor) {',
  '    this._iosAnchor = null;',
  '    this._iosLength = 0;',
  '    this._iosBeforePageIndex = undefined;',
  '    this._iosRequiresFullRefresh = false;',
  '    this.textarea.value = \'\';',
  '  }',
].join('\n')

function patch(file, find, replace) {
  const p = join(dir, file)
  const src = readFileSync(p, 'utf8')
  const n = src.split(find).length - 1
  if (n !== 1) throw new Error(`${file}: expected exactly 1 match for anchor, found ${n}:\n${find}`)
  writeFileSync(p, src.replace(find, () => replace))
  console.log(`patched ${file}`)
}

// 1) keyboard: IME 조합 분기(early return) 다음, 셀 Enter 처리 직전
patch(
  'input-handler-keyboard.ts',
  '  // [#4031] 셀 Enter는 `SplitParagraphInCellCommand`의 동기 full pagination이 확정이라,\n',
  RESET + '  // [#4031] 셀 Enter는 `SplitParagraphInCellCommand`의 동기 full pagination이 확정이라,\n',
)

// 2) mouse: 클릭 진입점
patch(
  'input-handler-mouse.ts',
  'export function onClick(this: any, e: MouseEvent): void {\n',
  'export function onClick(this: any, e: MouseEvent): void {\n' + CLICK_RESET + '\n',
)
