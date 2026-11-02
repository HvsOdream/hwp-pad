// hwp-pad: 호스트(iOS 앱 껍데기)가 바이트로 문서를 열 수 있는 창구 (2026-11-02).
// window.rhwpStudio.openBytes(bytes, fileName, fileHandle?) → 내부 'open-document-bytes' 이벤트.
// fileHandle은 rhwp FileSystemFileHandleLike(createWritable 등) — 넘기면 Ctrl+S가 그 핸들로 덮어쓴다.
// 사용: node patches/native-bridge.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/native-bridge.mjs <studio src/engine dir>')
const main = join(dir, '..', 'main.ts')
let src = readFileSync(main, 'utf8')
const find = '(window as any).rhwpStudio.plugins = plugins;'
if (src.split(find).length !== 2) throw new Error('main.ts: anchor not found exactly once')
src = src.replace(find, () => find + `
// [hwp-pad] 네이티브 껍데기(app/native/native.js)용: 바이트 + (선택) 저장 핸들로 문서 열기
;(window as any).rhwpStudio.openBytes = (bytes: Uint8Array, fileName: string, fileHandle: unknown = null) => {
  eventBus.emit('open-document-bytes', { bytes, fileName: fileName || 'document.hwp', fileHandle });
};`)
writeFileSync(main, src)
console.log('[hwp-pad] native-bridge: ok')
