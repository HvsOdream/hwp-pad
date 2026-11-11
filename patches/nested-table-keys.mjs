// hwp-pad: 표 안의 표(중첩 표)에서도 셀 블록 크기 조절 키가 되게 (2026-11-11, 0.4.26).
//
// 학교 양식은 대부분 바깥 틀 표 안에 표가 든 구조다(회의록 등). 이음의 hancom-keys 플러그인은 셀 블록의
// Shift+화살표 · Ctrl+화살표 · Alt+화살표를 「표 안의 표는 아직 크기를 바꿀 수 없습니다」로 거절해서, 테스터가
// Ctrl+Shift+화살표(편집기 자체 경로)로만 크기를 바꿀 수 있었다. 엔진에는 경로형 API
// (getTableDimensionsByPath · getCellInfoByPath · getCellPropertiesByPath · getTableCellBboxesByPath ·
// resizeTableCellsByPath)가 있으므로 중첩 표는 그쪽으로 읽고 쓴다.
//
//  - Ctrl+화살표: 선택한 줄·칸 크기를 바꾸고 표도 함께 커지거나 줄어든다(한글과 같음).
//  - Alt+화살표: 블록 끝 경계선을 옮기고 표 크기는 그대로(한글과 같음).
//  - Shift+화살표: 중첩 표에는 엔진의 한 칸만 조절(resizeTableCell)이 없어, 그 칸의 오른쪽/아래 경계선을 옮긴다
//    (표 크기 유지, 같은 줄·칸의 경계가 함께 움직임). 표 끝 칸이면 표가 커지거나 줄어든다.
//  - 줄 높이를 다시 앉히는 보정(settleRows)은 경로형 API가 없어 중첩 표에서는 건너뛴다.
//
// 이 패치는 이음 플러그인 파일(openoffice/apps/hwp/studio-plugin/hancom-keys.mjs)을 고친다.
// 사용: node patches/nested-table-keys.mjs <rhwp-studio/src/engine 디렉터리>  (저장소 루트에서 실행)
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const file = process.env.HANCOM_KEYS || join(process.cwd(), 'openoffice/apps/hwp/studio-plugin/hancom-keys.mjs')
if (!existsSync(file)) throw new Error(`nested-table-keys: ${file} 가 없습니다(저장소 루트에서 실행)`)

let src = readFileSync(file, 'utf8')
function rep(find, replace) {
  const n = src.split(find).length - 1
  if (n !== 1) throw new Error(`${file}: expected exactly 1 match, found ${n}:\n${find}`)
  src = src.replace(find, () => replace)
}

// 1. 그려진 높이·칸 목록을 경로로도 읽는다
rep(
  `  for (const box of wasm.getTableCellBboxes(at.sec, at.ppi, at.ci)) {`,
  `  // [hwp-pad] 표 안의 표는 경로로 읽는다
  const nestedJson = hwppadNestedPath(at)
  const boxes = nestedJson
    ? wasm.getTableCellBboxesByPath(at.sec, at.ppi, nestedJson)
    : wasm.getTableCellBboxes(at.sec, at.ppi, at.ci)
  for (const box of boxes) {`,
)
rep(
  `function tableCells(wasm, at) {
  const dims = wasm.getTableDimensions(at.sec, at.ppi, at.ci)`,
  `function tableCells(wasm, at) {
  // [hwp-pad] 표 안의 표는 경로형 API로 읽는다
  const nestedJson = hwppadNestedPath(at)
  const dims = nestedJson
    ? wasm.getTableDimensionsByPath(at.sec, at.ppi, nestedJson)
    : wasm.getTableDimensions(at.sec, at.ppi, at.ci)`,
)
rep(
  `    const info = wasm.getCellInfo(at.sec, at.ppi, at.ci, i)
    const props = wasm.getCellProperties(at.sec, at.ppi, at.ci, i)`,
  `    const info = nestedJson
      ? wasm.getCellInfoByPath(at.sec, at.ppi, JSON.stringify(hwppadPathToCell(at.cellPath, i)))
      : wasm.getCellInfo(at.sec, at.ppi, at.ci, i)
    const props = nestedJson
      ? wasm.getCellPropertiesByPath(at.sec, at.ppi, nestedJson, i)
      : wasm.getCellProperties(at.sec, at.ppi, at.ci, i)`,
)
rep(
  `/** The table's cells with their stored sizes and how tall each draws (HWPUNIT). */`,
  `/** [hwp-pad] 표 안의 표면 그 경로(JSON), 아니면 null. */
function hwppadNestedPath(at) {
  return at?.cellPath && at.cellPath.length > 1 ? JSON.stringify(at.cellPath) : null
}
/** [hwp-pad] 같은 표의 cellIdx 번째 칸을 가리키는 경로. */
function hwppadPathToCell(path, cellIdx) {
  const last = path[path.length - 1]
  return [...path.slice(0, -1), { ...last, cellIndex: cellIdx, cellParaIndex: 0 }]
}

/** The table's cells with their stored sizes and how tall each draws (HWPUNIT). */`,
)

// 2. 크기 쓰기: 중첩 표는 경로형으로, 줄 높이 보정은 건너뜀
rep(
  `        if (!bridge.resizeTableCells(at.sec, at.ppi, at.ci, updates)?.ok) {
          failed = true
          return null
        }`,
  `        // [hwp-pad] 표 안의 표: 경로형으로 쓴다(줄 높이 보정 settleRows 는 경로형이 없어 건너뜀)
        const nestedJson = hwppadNestedPath(at)
        if (nestedJson) {
          const r = bridge.resizeTableCellsByPath(at.sec, at.ppi, nestedJson, updates)
          if (r && r.ok === false) {
            failed = true
            return null
          }
          return ih.getCursorPosition()
        }
        if (!bridge.resizeTableCells(at.sec, at.ppi, at.ci, updates)?.ok) {
          failed = true
          return null
        }`,
)

// 3. Ctrl·Alt+화살표(blockTable): 중첩 표 거절을 없앤다
rep(
  `  if (!ih || !context || !range) return null
  if ((context.cellPath?.length ?? 0) > 1) {
    tellUser(
      koreanUi
        ? '표 안의 표는 아직 크기를 바꿀 수 없습니다.'
        : 'A table inside a cell cannot be resized yet.',
    )
    return null
  }
  let table`,
  `  if (!ih || !context || !range) return null
  // [hwp-pad] 표 안의 표도 받는다(tableCells · applyCellSizes 가 경로형으로 처리)
  let table`,
)

// 4. Shift+화살표(resizeSelectedCell): 중첩 표는 그 칸의 경계선을 옮긴다
rep(
  `  if ((context.cellPath?.length ?? 0) > 1) {
    tellUser(
      koreanUi
        ? '표 안의 표는 아직 크기를 바꿀 수 없습니다.'
        : 'A table inside a cell cannot be resized yet.',
    )
    return false
  }
  let cells
  try {
    cells = tableCells(services.wasm, context).cells
  } catch {
    return false
  }
  const vertical = direction === 'up' || direction === 'down'`,
  `  if ((context.cellPath?.length ?? 0) > 1) {
    // [hwp-pad] 표 안의 표: 한 칸만 조절하는 엔진 호출이 없어, 그 칸의 오른쪽/아래 경계선을 옮긴다
    // (표 크기 유지). 표의 끝 칸이면 그 줄·칸과 표가 함께 커지거나 줄어든다.
    let nested
    try {
      nested = tableCells(services.wasm, context).cells
    } catch {
      return false
    }
    const pos0 = ih.getCursorPosition?.()
    const cell =
      nested.find((c) => c.row === range.startRow && c.col === range.startCol) ??
      nested.find((c) => c.cellIdx === pos0?.cellIndex)
    if (!cell) return false
    const axis = direction === 'up' || direction === 'down' ? 'row' : 'col'
    const lastLine = axis === 'row' ? cell.row + cell.rowSpan - 1 : cell.col + cell.colSpan - 1
    const step = direction === 'right' || direction === 'down' ? SIZE_STEP : -SIZE_STEP
    let updates = moveBoundary(nested, axis, lastLine, step)
    if (!updates.length) updates = resizeLines(nested, axis, lastLine, lastLine, step)
    if (!applyCellSizes(ih, context, updates, 'resizeTableCell', nested)) return false
    ih.updateCellSelection?.()
    return true
  }
  let cells
  try {
    cells = tableCells(services.wasm, context).cells
  } catch {
    return false
  }
  const vertical = direction === 'up' || direction === 'down'`,
)

writeFileSync(file, src)
console.log(`patched ${file} (nested table resize keys)`)
