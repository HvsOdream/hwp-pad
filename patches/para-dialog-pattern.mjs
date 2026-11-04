// hwp-pad: 문단 모양 대화상자에서 아무것도 안 바꾸고 「설정」만 눌러도 문단에 네모 테두리가 생기던 문제 (2026-11-04).
// 원인: 한글 파일은 "배경 없음" 문단의 무늬 종류를 0으로 싣는데, 대화상자의 무늬 선택에는 0이 없어(없음 = -1)
// 값이 -1로 읽힌다 → 0 ≠ -1 을 "무늬 바뀜"으로 오인 → 배경·테두리 정보를 새로 만들며 테두리가 실선으로 생긴다.
// 배경이 없는 문단의 무늬 0은 -1(없음)과 같은 것으로 비교한다.
// 사용: node patches/para-dialog-pattern.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/para-dialog-pattern.mjs <studio src/engine dir>')
const p = join(dir, '..', 'ui', 'para-shape-dialog.ts')
const FIND = '    if (newPatType !== (p.patternType ?? -1)) mods.patternType = newPatType;\n'
const REPLACE = [
  '    // [hwp-pad] 배경 없는 문단의 무늬 0(한글 파일 값)은 "없음"(-1)과 같다 — 다르게 보면 테두리가 새로 생긴다.',
  "    const origPatType = ((p.fillType ?? 'none') === 'none' && (p.patternType ?? -1) === 0) ? -1 : (p.patternType ?? -1);",
  '    if (newPatType !== origPatType) mods.patternType = newPatType;',
  '',
].join('\n')
const src = readFileSync(p, 'utf8')
const n = src.split(FIND).length - 1
if (n !== 1) throw new Error(`para-shape-dialog.ts: expected exactly 1 match, found ${n}`)
writeFileSync(p, src.replace(FIND, () => REPLACE))
console.log('[hwp-pad] para-dialog-pattern: ok')
