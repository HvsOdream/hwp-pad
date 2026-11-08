// hwp-pad: window.rhwpStudio.isDirty() — 저장 안 한 변경이 있는지 바깥(홈 화면 「저장하고 닫기」)에서 알 수 있게.
// rhwp-studio 는 documentState.isDirty() 를 개발 모드에서만 전역에 내놓는다.
// 사용: node patches/dirty-state.mjs <rhwp-studio/src/engine 디렉터리>  (engine 기준으로 ../main.ts 를 찾는다)
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/dirty-state.mjs <studio src/engine dir>')
const p = join(dir, '..', 'main.ts')
const src = readFileSync(p, 'utf8')
const FIND = '  notifySaved: (fileName?: string) => completeHostSave(fileName),\n'
const n = src.split(FIND).length - 1
if (n !== 1) throw new Error(`main.ts: expected exactly 1 match for anchor, found ${n}`)
writeFileSync(p, src.replace(FIND, () => FIND + '  isDirty: () => documentState.isDirty(), // [hwp-pad] 홈 화면 「저장하고 닫기」\n'))
console.log('patched main.ts')
