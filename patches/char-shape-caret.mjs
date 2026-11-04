// hwp-pad: 글자 모양(Alt+L)이 블록을 잡지 않으면 아무 일도 안 하던 문제 (2026-11-04).
// 한글은 블록이 없어도 글자 모양 대화상자를 열고, 고른 모양을 커서 자리(이어서 칠 글자)에 적용한다.
// 편집기의 캐럿 대기 서식(applyCharFormat, #4162)으로 보낸다.
// 이음 패치는 빌드 때(vite 변환) 원본 글자에 적용되므로, 이음이 찾는 줄은 건드리지 않고 그 앞에 길을 하나 더한다.
// 사용: node patches/char-shape-caret.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/char-shape-caret.mjs <studio src/engine dir>')
const p = join(dir, '..', 'command', 'commands', 'format.ts')
let src = readFileSync(p, 'utf8')
const find = '      // 대화상자 열기 전 선택 범위를 저장 (대화상자 조작 중 선택이 풀릴 수 있음)\n'
const n = src.split(find).length - 1
if (n !== 1) throw new Error(`format.ts: expected exactly 1 match, found ${n}:\n${find}`)
src = src.replace(find, () => [
  '      // [hwp-pad] 블록이 없으면 커서 자리 대기 서식으로 적용(한글과 같음)',
  '      if (!ih.getSelection() && !ih.isInCellSelectionMode()) {',
  '        const caretDlg = new CharShapeDialog(services.wasm, services.eventBus);',
  '        caretDlg.onApply = (m) => {',
  '          if (m.fontName) { const fid = services.wasm.findOrCreateFontId(m.fontName); if (fid >= 0) m.fontId = fid; delete m.fontName; }',
  '          (ih as any).applyCharFormat(m);',
  '        };',
  '        caretDlg.onClose = () => ih.focus();',
  '        caretDlg.show(charProps);',
  '        return;',
  '      }',
  '',
].join('\n') + find)
writeFileSync(p, src)
console.log('[hwp-pad] char-shape-caret: ok')
