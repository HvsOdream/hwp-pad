// hwp-pad: 문단 여백 글쇠(Ctrl+F5~F8, Ctrl+Alt+F5~F8)용 창구 (2026-11-11, 0.4.26).
// window.rhwpStudio.ai 에 두 함수를 더한다 — 글쇠 처리 자체는 web/seoil-tidy.js 가 한다.
//   paraProps()        커서 문단의 문단 모양(본문·표 칸·머리말·각주)
//   applyPara(props)   커서 문단(블록이면 그 문단들)에 문단 모양 적용. 편집기의 문단 모양 경로라 되돌리기가 된다.
// ai-bridge.mjs 가 만든 객체 안에 넣으므로 그 뒤에 실행돼야 한다(파일 이름 순서: ai-bridge → … → para-margin-keys).
// 사용: node patches/para-margin-keys.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/para-margin-keys.mjs <studio src/engine dir>')
const main = join(dir, '..', 'main.ts')
let src = readFileSync(main, 'utf8')
const find = '  fileName: () => wasm.fileName,'
if (src.split(find).length !== 2) throw new Error('main.ts: ai-bridge anchor (fileName) not found exactly once')
src = src.replace(find, () => find + `
  // [hwp-pad] 문단 여백 글쇠(para-margin-keys.mjs)
  paraProps: () => { try { return inputHandler ? inputHandler.getParaProperties() : null; } catch { return null; } },
  applyPara: (props: Record<string, unknown>) => { (inputHandler as any)?.applyParaFormat(props); },`)
writeFileSync(main, src)
console.log('[hwp-pad] para-margin-keys: ok')
