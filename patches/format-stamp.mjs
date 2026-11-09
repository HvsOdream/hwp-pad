// hwp-pad: 모양 복사(Alt+C)를 「도장」처럼 — 한 문단을 고친 뒤 그 모양을 기억해 여러 문단에 찍는다.
// 원래: Alt+C(커서) 로 복사 → 블록 지정 후 Alt+C 로 한 번 붙이면 기억이 지워짐. 블록 없이 다른 문단에서
// Alt+C 를 누르면 그 문단 모양을 다시 복사해 버려, 문단마다 블록을 잡아야 했다(「문단 복사가 안 된다」).
// 바뀐 점:
//   · 복사한 모양은 Esc 를 누르거나 새로 복사할 때까지 기억한다(여러 번 찍기).
//   · 블록이 없을 때 커서가 복사한 문단이 아닌 다른 문단에 있으면 그 문단에 문단 모양을 찍는다.
//     (복사한 그 문단에서 다시 Alt+C → 새로 복사)
//   · 복사·찍기 때 알림으로 상태를 보여 준다.
// 사용: node patches/format-stamp.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/format-stamp.mjs <studio src/engine dir>')
const p = join(dir, 'input-handler.ts')
let src = readFileSync(p, 'utf8')
function rep(find, replace, label) {
  const n = src.split(find).length - 1
  if (n !== 1) throw new Error(`input-handler.ts ${label}: expected exactly 1 match, found ${n}`)
  src = src.replace(find, () => replace)
}

rep(
  'type FormatCopyState = {\n  charProps: Partial<CharProperties>;\n  paraProps: Partial<ParaProperties>;\n  cellProps?: Partial<CellProperties>;\n};\n',
  'type FormatCopyState = {\n  charProps: Partial<CharProperties>;\n  paraProps: Partial<ParaProperties>;\n  cellProps?: Partial<CellProperties>;\n  /** [hwp-pad] 복사한 문단 위치(같은 문단에서 다시 누르면 새로 복사) */\n  sourceKey?: string;\n};\n\n/** [hwp-pad] 커서가 있는 문단을 가리키는 열쇠(본문·표 칸·중첩 칸 공통) */\nfunction hwppadParaKey(pos: DocumentPosition): string {\n  return JSON.stringify([pos.sectionIndex, pos.paragraphIndex, pos.parentParaIndex ?? null, pos.controlIndex ?? null, pos.cellIndex ?? null, pos.cellParaIndex ?? null, pos.cellPath ?? null]);\n}\n',
  'state type',
)

rep(
  '  performFormatCopy(): void {\n    if (this.applyCopiedFormatToCurrentTarget()) return;\n    this.copyFormatAtCursor();\n  }\n',
  [
    '  performFormatCopy(): void {',
    '    if (this.applyCopiedFormatToCurrentTarget()) return;',
    '    // [hwp-pad] 블록 없이 다른 문단에 커서 → 기억한 문단 모양을 그 문단에 찍는다',
    '    const st = this.formatCopyState;',
    '    if (st && !this.getSelection() && !this.cursor.isInCellSelectionMode()',
    '        && Object.keys(st.paraProps).length > 0',
    '        && st.sourceKey !== hwppadParaKey(this.cursor.getPosition())) {',
    '      this.applyParaPropsAtCursor(JSON.parse(JSON.stringify(st.paraProps)));',
    "      showToast({ message: '문단 모양을 찍었습니다 · 다른 문단에서 Alt+C 로 계속 · Esc 로 끝내기' });",
    '      this.focusTextarea();',
    '      return;',
    '    }',
    '    this.copyFormatAtCursor();',
    "    showToast({ message: '모양을 기억했습니다 · 다른 문단에 커서를 두고(또는 블록 지정) Alt+C 로 찍기 · Esc 로 끝내기' });",
    '  }',
    '',
    '  /** [hwp-pad] 기억한 모양 지우기(Esc) — 지운 게 있으면 true */',
    '  clearFormatStamp(): boolean {',
    '    if (!this.formatCopyState) return false;',
    '    this.formatCopyState = null;',
    "    showToast({ message: '모양 복사를 끝냈습니다' });",
    '    return true;',
    '  }',
    '',
  ].join('\n'),
  'performFormatCopy',
)

rep(
  '    // 한컴 호환: 복사한 모양은 한 번 붙여넣으면 자동 해제한다.\n    this.formatCopyState = null;\n',
  '    // [hwp-pad] 여러 문단에 이어서 찍을 수 있게 기억을 유지한다(Esc·새 복사 때 해제).\n',
  'keep after paste',
)

rep(
  '      cellProps: cellProps ? JSON.parse(JSON.stringify(cellProps)) : undefined,\n    };\n',
  '      cellProps: cellProps ? JSON.parse(JSON.stringify(cellProps)) : undefined,\n      sourceKey: hwppadParaKey(pos),\n    };\n',
  'source key',
)

writeFileSync(p, src)
console.log('patched engine/input-handler.ts (모양 복사 도장)')

// Esc → 기억한 모양 지우기(형광펜 모드 Esc 처리 바로 앞)
const kp = join(dir, 'input-handler-keyboard.ts')
let ks = readFileSync(kp, 'utf8')
const KF = '  // 연속 형광펜 모드에서 Escape → 종료\n'
if (ks.split(KF).length - 1 !== 1) throw new Error('input-handler-keyboard.ts esc anchor')
ks = ks.replace(KF, () => [
  '  // [hwp-pad] 모양 복사 도장 끝내기',
  "  if (e.key === 'Escape' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && this.clearFormatStamp()) {",
  '    e.preventDefault();',
  '    return;',
  '  }',
  '',
  KF,
].join('\n'))
writeFileSync(kp, ks)
console.log('patched engine/input-handler-keyboard.ts (Esc)')
