// hwp-pad: 제품명 「한결 오피스」. 브라우저 탭 제목과 index.html <title>의 'rhwp-studio'를 바꾼다.
// (설치형 PWA 창에서는 파일명만 보이므로 탭 제목만 해당. 메뉴·도움말 안의 rhwp-studio 표기는 그대로 둔다.)
// 사용: node patches/branding.mjs <rhwp-studio/src/engine 디렉터리>  (engine 기준으로 ../ui, ../../index.html)
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/branding.mjs <studio src/engine dir>')

const APP_NAME = '한결 오피스'

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

patch(join(dir, '..', 'ui', 'document-title.ts'), [
  ["`${bridge.fileName} - rhwp-studio`", "`${bridge.fileName} - " + APP_NAME + '`'],
  ["      : 'rhwp-studio';", "      : '" + APP_NAME + "';"],
])

patch(join(dir, '..', '..', 'index.html'), [
  ['<title>rhwp-studio</title>', `<title>${APP_NAME}</title>`],
])
