// hwp-pad: 저장은 항상 HWPX 로 (2026-11-09).
// 서일 오피스에서 고친 문서를 HWP(5)로 저장하면 한글(Office NEO)에서 「파일이 손상되었습니다」로 안 열리는
// 경우가 확인됐다(재학생 충원율 계획서 v2~v5). 같은 내용을 HWPX 로 저장하면 한글에서 그대로 열린다.
// HWP 직렬화 원인을 찾을 때까지 HWP 로 쓰는 길을 모두 HWPX 로 돌린다:
//   · 저장(Ctrl+S): .hwp 로 연 문서 → 같은 이름의 .hwpx 로 「다른 이름으로 저장」(원본 .hwp 는 그대로 둔다).
//     한 번 .hwpx 로 저장한 뒤에는 그 파일에 제자리 저장.
//   · 다른 이름으로 저장 / HWP 형식으로 저장 → HWPX.
// 사용: node patches/save-hwpx.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/save-hwpx.mjs <studio src/engine dir>')

function patch(file, pairs) {
  const p = join(dir, file)
  let src = readFileSync(p, 'utf8')
  for (const [find, replace, label] of pairs) {
    const n = src.split(find).length - 1
    if (n !== 1) throw new Error(`${file} ${label}: expected exactly 1 match, found ${n}`)
    src = src.replace(find, () => replace)
  }
  writeFileSync(p, src)
  console.log('patched', file)
}

patch(join('..', 'command', 'save-target.ts'), [[
  "  const format: SaveFormat = convertedFormat\n    ?? (sourceFormat === 'hwpx' ? 'hwpx' : 'hwp');\n",
  [
    "  const format: SaveFormat = convertedFormat",
    "    ?? (sourceFormat === 'hwpx' ? 'hwpx' : 'hwp');",
    '  // [hwp-pad] HWP 저장은 한글에서 손상 파일로 열리는 경우가 있어 항상 HWPX 로(save-hwpx.mjs).',
    "  if (format === 'hwp') {",
    "    const handleName = currentHandle?.name ?? '';",
    '    return {',
    "      format: 'hwpx',",
    '      forceSaveAs: !/\\.hwpx$/i.test(handleName),',
    "      suggestedName: fileNameForFormat(handleName || fileName, 'hwpx'),",
    '    };',
    '  }',
    '',
  ].join('\n'),
  'resolveSaveTarget',
]])

patch(join('..', 'command', 'commands', 'file.ts'), [
  [
    "  if (sourceFormat !== 'hml') return sourceFormat === 'hwpx' ? 'hwpx' : 'hwp';\n",
    "  if (sourceFormat !== 'hml') return 'hwpx'; // [hwp-pad] HWP 대신 항상 HWPX\n",
    'chooseSaveAsFormat',
  ],
  [
    'async function saveAsFormat(services: CommandServices, format: SaveFormat): Promise<void> {\n',
    "async function saveAsFormat(services: CommandServices, format: SaveFormat): Promise<void> {\n  if (format === 'hwp') format = 'hwpx'; // [hwp-pad] HWP 저장 막음 → HWPX\n",
    'saveAsFormat',
  ],
])
