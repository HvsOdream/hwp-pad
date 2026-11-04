// hwp-pad: 글자 모양(Alt+L)이 블록을 잡지 않으면 아무 일도 안 하던 문제 (2026-11-04).
// 한글은 블록이 없어도 글자 모양 대화상자를 열고, 고른 모양을 커서 자리(이어서 칠 글자)에 적용한다.
// 편집기에도 같은 길(applyCharFormat: 캐럿 대기 서식, #4162)이 있으니 블록이 없을 때는 그 길로 보낸다.
// 이음 패치(studio-hancom-block-format-dialogs)가 적용된 뒤의 소스를 고친다.
// 사용: node patches/char-shape-caret.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/char-shape-caret.mjs <studio src/engine dir>')
const p = join(dir, '..', 'command', 'commands', 'format.ts')
let src = readFileSync(p, 'utf8')
function edit(find, replace) {
  const n = src.split(find).length - 1
  if (n !== 1) throw new Error(`format.ts: expected exactly 1 match, found ${n}:\n${find}`)
  src = src.replace(find, () => replace)
}
edit(
  '      if (!savedSel && !ieumBlock) return;\n',
  '      // [hwp-pad] 블록이 없어도 연다 — 적용은 커서 자리 대기 서식으로(한글과 같음)\n',
)
edit(
  '        else if (savedSel) ih.applyCharPropsToRange(savedSel.start, savedSel.end, mods);\n',
  '        else if (savedSel) ih.applyCharPropsToRange(savedSel.start, savedSel.end, mods);\n' +
  '        else (ih as any).applyCharFormat(mods);\n',
)
writeFileSync(p, src)
console.log('[hwp-pad] char-shape-caret: ok')
