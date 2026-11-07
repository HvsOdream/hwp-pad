// hwp-pad: AI 작성 도우미(web/ai-panel.js)가 열린 문서에 직접 쓰는 창구 (2026-11-02).
// window.rhwpStudio.ai = { doc(), changed(reason), fileName() }
//  - doc(): 지금 열린 WASM HwpDocument (누름틀·셀 문단 API를 그대로 씀)
//  - changed(): 다시 그리기 + 수정됨 표시(document-changed 이벤트)
// 사용: node patches/ai-bridge.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/ai-bridge.mjs <studio src/engine dir>')
const main = join(dir, '..', 'main.ts')
let src = readFileSync(main, 'utf8')
const find = '(window as any).rhwpStudio.automation = automation;'
if (src.split(find).length !== 2) throw new Error('main.ts: anchor not found exactly once')
src = src.replace(find, () => find + `
// [hwp-pad] AI 작성 도우미용 문서 창구
;(window as any).rhwpStudio.ai = {
  doc: () => (wasm as any).doc,
  changed: (reason: string = 'seoil-ai') => eventBus.emit('document-changed', reason),
  fileName: () => wasm.fileName,
  // [hwp-pad] 뷰어 모드(seoil-view.js)용: 명령 실행·키보드 입력 끊기/잇기
  dispatch: (id: string) => dispatcher.dispatch(id),
  inputActive: (on: boolean) => { try { on ? inputHandler?.focus() : (inputHandler as any)?.textarea?.blur(); } catch {} },
};`)
writeFileSync(main, src)
console.log('[hwp-pad] ai-bridge: ok')
