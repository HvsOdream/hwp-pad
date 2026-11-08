// hwp-pad: 쪽 배치 기본값을 「한 쪽」→「자동」으로.
// rhwp-studio 기본은 { kind: 'single' } 이라 배율을 줄여도 쪽이 세로 한 줄로만 늘어선다.
// 한글처럼 줄이면 화면 폭에 맞춰 두 쪽·세 쪽이 옆으로 놓이도록 자동(뷰포트 폭 기준 열 수)으로 바꾼다.
// 이미 설정이 저장된 사용자는 저장값이 'single' 이라 한 번만 자동으로 옮긴다(이후 사용자가 고른 값은 존중).
// 사용: node patches/page-auto.mjs <rhwp-studio/src/engine 디렉터리>  (engine 기준으로 ../core 를 찾는다)
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/page-auto.mjs <studio src/engine dir>')

const p = join(dir, '..', 'core', 'user-settings.ts')
let src = readFileSync(p, 'utf8')

function replaceOnce(find, replace, label) {
  const n = src.split(find).length - 1
  if (n !== 1) throw new Error(`user-settings.ts ${label}: expected exactly 1 match, found ${n}`)
  src = src.replace(find, () => replace)
}

replaceOnce(
  "      pageArrangement: { kind: 'single' },\n",
  "      pageArrangement: { kind: 'auto' }, // [hwp-pad] 줄이면 한글처럼 여러 쪽을 옆으로\n",
  'default',
)

replaceOnce(
  '        view.pageArrangement ?? defaults.view.pageArrangement,\n',
  [
    '        // [hwp-pad] 예전 기본값(한 쪽)으로 저장된 설정은 한 번만 자동으로 옮긴다.',
    '        (() => {',
    "          const MIGRATED = 'hwppad-page-auto-v1';",
    '          const stored = view.pageArrangement as { kind?: string } | undefined;',
    '          let migrated = true;',
    '          try { migrated = localStorage.getItem(MIGRATED) === \'1\'; localStorage.setItem(MIGRATED, \'1\'); } catch { /* storage blocked */ }',
    "          if (!migrated && stored?.kind === 'single') return defaults.view.pageArrangement;",
    '          return view.pageArrangement ?? defaults.view.pageArrangement;',
    '        })(),',
    '',
  ].join('\n'),
  'migration',
)

writeFileSync(p, src)
console.log('patched core/user-settings.ts')
