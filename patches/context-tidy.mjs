// hwp-pad: 우클릭 「문단 모양 맞추기」 — 블록(없으면 커서 문단)의 개조식·번호 문단을 한 번에 정리.
// 정리 규칙은 web/seoil-write.js 의 tidy(AI 「문단 모양 정리해줘」와 같은 것):
//   · 내어쓰기 — 둘째 줄이 글머리(앞 공백 + - ○ □ 1) 가. …) 다음 글자에 맞게
//   · 문단 아래 조금 띄우기(3pt), 번호 제목은 위를 조금 더
// 되돌리기(Ctrl+Z) 한 번으로 통째로 돌아간다(스냅샷 명령). 표 안 문단은 아직 안 된다(본문만).
// 또 AI 창이 블록 범위를 알 수 있게 window.rhwpStudio.ai.selection() 을 단다
// → 블록을 잡고 「문단 모양 맞춰줘」라고 하면 그 범위만 정리한다.
// 사용: node patches/context-tidy.mjs <rhwp-studio/src/engine 디렉터리>  (ai-bridge.mjs 다음에 돌 것 — 이름순)
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/context-tidy.mjs <studio src/engine dir>')

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

// 1) 명령
patch(join('..', 'command', 'commands', 'edit.ts'), [[
  "  {\n    id: 'edit:format-paste',\n",
  [
    '  {',
    "    // [hwp-pad] 개조식·번호 문단 모양 맞추기(우클릭)",
    "    id: 'format:hwppad-tidy',",
    "    label: '문단 모양 맞추기',",
    '    canExecute: (ctx) => ctx.hasDocument && !ctx.isFormMode,',
    '    execute(services) {',
    '      (services.getInputHandler() as any)?.hwppadTidySelection?.();',
    '    },',
    '  },',
    '  {',
    "    // [hwp-pad] 맞추기 양식 고르기·고치기(web/seoil-tidy.js)",
    "    id: 'format:hwppad-tidy-settings',",
    "    label: '문단 모양 맞추기 양식…',",
    '    canExecute: (ctx) => ctx.hasDocument,',
    '    execute() {',
    '      (window as any).SeoilTidy?.open?.();',
    '    },',
    '  },',
    '  {',
    "    id: 'edit:format-paste',",
    '',
  ].join('\n'),
  'command',
]])

// 2) 입력 처리기: 블록 범위 · 정리 실행 · 우클릭 항목
patch('input-handler.ts', [
  [
    '  /** 커서 위치 문단에 문단 서식을 적용한다 (커맨드 시스템용) */\n  applyParaPropsAtCursor(',
    [
      '  /** [hwp-pad] 블록(없으면 커서)이 걸친 본문 문단 범위. 표 안·머리말·각주면 null */',
      '  hwppadSelectedParas(): { s1: number; p1: number; s2: number; p2: number; block: boolean } | null {',
      '    if (this.cursor.isInHeaderFooter() || this.cursor.isInFootnote()) return null;',
      '    const sel = this.getSelection();',
      '    const a = sel ? sel.start : this.cursor.getPosition();',
      '    const b = sel ? sel.end : a;',
      '    if (a.parentParaIndex !== undefined || (a.cellPath?.length ?? 0) > 0) return null;',
      '    if (b.parentParaIndex !== undefined || (b.cellPath?.length ?? 0) > 0) return null;',
      '    return { s1: a.sectionIndex, p1: a.paragraphIndex, s2: b.sectionIndex, p2: b.paragraphIndex, block: !!sel };',
      '  }',
      '',
      '  /** [hwp-pad] 우클릭 「문단 모양 맞추기」 */',
      '  hwppadTidySelection(): void {',
      '    const W = (window as any).SeoilWrite;',
      '    const raw = (window as any).rhwpStudio?.ai?.doc?.();',
      '    if (!W?.tidyRange || !raw) return;',
      '    const r = this.hwppadSelectedParas();',
      "    if (!r) { showToast({ message: '문단 모양 맞추기는 아직 본문 문단만 됩니다(표 안은 다음에)' }); return; }",
      '    const count = W.tidyRange(raw, r.s1, r.p1, r.s2, r.p2, null, true);',
      "    if (!count) { showToast({ message: (r.block ? '블록에' : '이 문단에') + ' 글머리(- ○ □ 1) 가. 등)로 시작하는 문단이 없어 그대로 둡니다' }); return; }",
      '    let n = 0;',
      '    this.executeOperation({',
      "      kind: 'snapshot',",
      "      operationType: 'hwppadTidy',",
      '      operation: () => { n = W.tidyRange(raw, r.s1, r.p1, r.s2, r.p2, null, false); return { ...this.cursor.getPosition() }; },',
      '    });',
      "    const preset = (window as any).SeoilTidy?.currentName?.() || '보고서 기본';",
    "    showToast({ message: `「${preset}」 양식으로 문단 모양을 맞췄습니다(${n}문단) · Ctrl+Z 로 되돌리기 · 양식은 우클릭 「문단 모양 맞추기 양식…」` });",
      '    this.focusTextarea();',
      '  }',
      '',
      '  /** 커서 위치 문단에 문단 서식을 적용한다 (커맨드 시스템용) */',
      '  applyParaPropsAtCursor(',
    ].join('\n'),
    'methods',
  ],
  [
    "      { type: 'command', commandId: 'format:para-shape', label: '문단 모양' },\n      { type: 'separator' },\n      { type: 'command', commandId: 'format:para-num-shape', label: '문단 번호 모양(N)...' },\n    ];\n",
    "      { type: 'command', commandId: 'format:para-shape', label: '문단 모양' },\n      { type: 'command', commandId: 'format:hwppad-tidy', label: '문단 모양 맞추기 (개조식 내어쓰기·간격)' },\n      { type: 'command', commandId: 'format:hwppad-tidy-settings', label: '문단 모양 맞추기 양식…' },\n      { type: 'separator' },\n      { type: 'command', commandId: 'format:para-num-shape', label: '문단 번호 모양(N)...' },\n    ];\n",
    'context menu',
  ],
])

// 3) AI 창이 블록 범위를 읽는 창구
patch(join('..', 'main.ts'), [[
  ';(window as any).rhwpStudio.ai = {\n',
  ';(window as any).rhwpStudio.ai = {\n  // [hwp-pad] 블록이 걸친 본문 문단 범위(context-tidy.mjs)\n  selection: () => { try { return (inputHandler as any)?.hwppadSelectedParas?.() ?? null; } catch { return null; } },\n',
  'ai selection',
]])
