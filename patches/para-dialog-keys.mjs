// hwp-pad: 문단 모양 대화상자 안에서 한글처럼 Alt+글자로 정렬 방식 고르기.
// 한글: 문단 모양(Alt+T)을 연 뒤 Alt+M 양쪽 · Alt+L 왼쪽 · Alt+R 오른쪽 · Alt+C 가운데 · Alt+T 배분 · Alt+N 나눔.
// (문단 정렬 단축키 Ctrl+Shift+같은 글자와 맞춤.) 단추 풍선 도움말에 키를 적는다.
// 물리키(code)로 맞춰 맥/아이패드 Option+글자(특수문자)에서도 된다.
// 사용: node patches/para-dialog-keys.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/para-dialog-keys.mjs <studio src/engine dir>')
const p = join(dir, '..', 'ui', 'para-shape-dialog.ts')
let src = readFileSync(p, 'utf8')
function rep(find, replace, label) {
  const n = src.split(find).length - 1
  if (n !== 1) throw new Error(`para-shape-dialog.ts ${label}: expected exactly 1 match, found ${n}`)
  src = src.replace(find, () => replace)
}

rep(
  "    this.overlay.addEventListener('keydown', (e) => {\n      if (e.key === 'Escape') { e.stopPropagation(); this.hide(); }\n    });\n",
  [
    "    this.overlay.addEventListener('keydown', (e) => {",
    "      if (e.key === 'Escape') { e.stopPropagation(); this.hide(); return; }",
    '      // [hwp-pad] 한글처럼 Alt+글자로 정렬 방식 (M 양쪽 · L 왼쪽 · R 오른쪽 · C 가운데 · T 배분 · N 나눔)',
    '      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {',
    "        const HWPPAD_ALIGN_KEYS: Record<string, string> = { KeyM: 'justify', KeyL: 'left', KeyR: 'right', KeyC: 'center', KeyT: 'distribute', KeyN: 'split' };",
    '        const value = HWPPAD_ALIGN_KEYS[e.code];',
    '        const btn = value ? this.alignBtns[value] : undefined;',
    '        if (btn) { e.preventDefault(); e.stopPropagation(); btn.click(); btn.focus(); }',
    '      }',
    '    });',
    '',
  ].join('\n'),
  'keydown',
)

rep(
  '      btn.title = opt.label;\n      const icon = document.createElement(\'span\');\n      icon.className = `sb-align ${opt.cssClass}`;\n',
  [
    '      // [hwp-pad] 풍선 도움말에 대화상자 안 단축키',
    "      const hwppadKey = ({ justify: 'M', left: 'L', right: 'R', center: 'C', distribute: 'T', split: 'N' } as Record<string, string>)[opt.value];",
    "      btn.title = hwppadKey ? `${opt.label} (Alt+${hwppadKey})` : opt.label;",
    "      const icon = document.createElement('span');",
    '      icon.className = `sb-align ${opt.cssClass}`;',
    '',
  ].join('\n'),
  'title',
)

writeFileSync(p, src)
console.log('patched ui/para-shape-dialog.ts (Alt+정렬 키)')
