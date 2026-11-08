// hwp-pad: 중첩 표 셀에서 Home/End·Shift+Home/End 가 맞는 줄로 가게.
// 스튜디오의 줄 정보 조회는 바깥 셀 색인(parentPara/control/cell/cellPara)만 써서, 표 안의 표
// (학회 논문 양식 요약 칸처럼 1×1 표 안 4×4 표) 셀에서는 바깥 셀 문단의 줄을 읽었다 → End 가
// 한 글자 뒤에 서거나 다른 줄로 가 Shift+End 선택이 엉뚱해짐.
// cellPath 가 2단 이상이면 엔진 패치 9003 의 getLineInfoByPath 를 쓰고, 줄 위 캐럿 좌표는
// 경로 기반 updateRect 로 구한다. 엔진에 API 가 없으면(옛 엔진) 종전 동작 그대로.
// 사용: node patches/nested-cell-line.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/nested-cell-line.mjs <studio src/engine dir>')

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

patch(join('..', 'core', 'wasm-bridge.ts'), [[
  '  getLineInfoInCell(sec: number, parentPara: number, controlIdx: number, cellIdx: number, cellParaIdx: number, charOffset: number): LineInfo {\n',
  [
    '  /** [hwp-pad] 중첩 셀 경로 기반 줄 정보. 엔진에 API 가 없으면 null. */',
    '  getLineInfoByPath(sec: number, parentPara: number, pathJson: string, charOffset: number): LineInfo | null {',
    '    if (!this.doc) throw new Error(\'문서가 로드되지 않았습니다\');',
    '    const fn = (this.doc as any).getLineInfoByPath;',
    '    if (typeof fn !== \'function\') return null;',
    '    return JSON.parse(fn.call(this.doc, sec, parentPara, pathJson, charOffset));',
    '  }',
    '',
    '  getLineInfoInCell(sec: number, parentPara: number, controlIdx: number, cellIdx: number, cellParaIdx: number, charOffset: number): LineInfo {',
    '',
  ].join('\n'),
  'bridge',
]])

patch('cursor.ts', [
  [
    '    const inCell = (pos.cellPath?.length ?? 0) > 0 || pos.parentParaIndex !== undefined;\n    if (inCell) {\n',
    [
      '    const inCell = (pos.cellPath?.length ?? 0) > 0 || pos.parentParaIndex !== undefined;',
      '    // [hwp-pad] 표 안의 표: 바깥 셀 색인으로는 다른 문단을 읽는다 → 경로로 조회',
      '    if (inCell && (pos.cellPath?.length ?? 0) > 1 && pos.parentParaIndex !== undefined) {',
      '      const byPath = this.wasm.getLineInfoByPath(',
      '        pos.sectionIndex, pos.parentParaIndex, JSON.stringify(pos.cellPath), charOffset,',
      '      );',
      '      if (byPath) return byPath;',
      '    }',
      '    if (inCell) {',
      '',
    ].join('\n'),
    'getLineInfoForOffset',
  ],
  [
    '        const prevLineInfo = this.isInCell()\n          ? this.wasm.getLineInfoInCell(\n              pos.sectionIndex, pos.parentParaIndex!, pos.controlIndex!,\n              pos.cellIndex!, pos.cellParaIndex!, pos.charOffset - 1)\n          : this.wasm.getLineInfo(pos.sectionIndex, pos.paragraphIndex, pos.charOffset - 1);\n',
    '        const prevLineInfo = this.getLineInfoForOffset(pos, pos.charOffset - 1); // [hwp-pad] 중첩 셀도 같은 조회\n',
    'moveToLineStart prev line',
  ],
  [
    '  private getCursorRectOnVisualLine(lineIndex: number, atEnd: boolean): CursorRect | null {\n    const pos = this.position;\n',
    '  private getCursorRectOnVisualLine(lineIndex: number, atEnd: boolean): CursorRect | null {\n    const pos = this.position;\n    if ((pos.cellPath?.length ?? 0) > 1) return null; // [hwp-pad] 중첩 셀: 경로 기반 updateRect 로\n',
    'visual line rect',
  ],
])
