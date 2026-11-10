// hwp-pad: 글자 칠 때 버벅임 줄이기 1단계 — 쪽 그림 요약을 글자마다 다시 만들지 않는다 (2026-11-10).
// 측정(계획서 v2 본문 타자, 한 글자 ~55ms): 글자를 칠 때마다 렌더러 선택 키(문서 revision 포함)가 바뀌어
// PageRenderer.invalidateDocumentRevision() 이 쪽 층 요약 캐시를 비웠다. 그래서 같은 쪽의
// getCanvasPageLayerTree(쪽 전체 그림 목록 JSON, 한 번 ~11ms)가 글자마다 두 번, 배경·뒤 그림 층도
// 거의 매번 다시 그려졌다. 글자만 고친 쪽-국소 편집(document-page-invalidated: text-edit)은
// 그림·개체 층 구성이 바뀌지 않으므로, 구조 편집이 올 때까지 무효화에서 층 요약 캐시를 유지한다.
// 구조가 바뀌는 편집(document-changed)이 오면 예전처럼 모두 비운다.
// 사용: node patches/typing-fast.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/typing-fast.mjs <studio src/engine dir>')

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

patch(join('..', 'view', 'page-renderer.ts'), [[
  '  invalidateDocumentRevision(): void {\n    this.cancelAll();\n    this.releaseAllPageDiagnostics();\n    this.layerSummaryCache.clear();\n    this.surfaceLayerCountCache.clear();\n',
  [
    '  /** [hwp-pad] 마지막 편집이 글자만 고친 쪽-국소 편집이면 층 요약 캐시를 유지(typing-fast.mjs) — 구조 편집(document-changed)에서 false */',
    '  hwppadKeepLayerSummary = false;',
    '',
    '  invalidateDocumentRevision(): void {',
    '    // 마지막 편집 종류(글자만 / 구조) 그대로 — 한 글자에 재선택이 두 번 와도 유지',
    '    const keepLayers = this.hwppadKeepLayerSummary;',
    '    this.cancelAll();',
    '    this.releaseAllPageDiagnostics();',
    '    if (!keepLayers) {',
    '      this.layerSummaryCache.clear();',
    '      this.surfaceLayerCountCache.clear();',
    '    }',
    '',
  ].join('\n'),
  'invalidateDocumentRevision',
]])

patch(join('..', 'view', 'canvas-view.ts'), [
  [
    "      eventBus.on('document-page-invalidated', (payload) => {\n        void this.refreshInvalidatedPageForMutation(payload);\n",
    [
      "      eventBus.on('document-page-invalidated', (payload) => {",
      '        // [hwp-pad] 글자만 고친 편집 → 이어지는 렌더러 재선택에서 층 요약 캐시 유지',
      "        const hwppadReason = typeof payload === 'object' && payload !== null ? (payload as { reason?: unknown }).reason : undefined;",
      "        this.pageRenderer.hwppadKeepLayerSummary = hwppadReason === 'text-edit';",
      '        void this.refreshInvalidatedPageForMutation(payload);',
      '',
    ].join('\n'),
    'page-invalidated',
  ],
  [
    "        if (reason === 'document-agent-rendered') return;\n        void this.refreshPagesForMutation();\n",
    "        if (reason === 'document-agent-rendered') return;\n        this.pageRenderer.hwppadKeepLayerSummary = false; // [hwp-pad] 구조 편집은 모두 비운다\n        void this.refreshPagesForMutation();\n",
    'document-changed',
  ],
])
