// hwp-pad: 바탕쪽 그림·도형이 본문 클릭을 가로채지 않게.
// 스튜디오는 plane === 1(글 뒤)일 때만 바탕쪽 장식으로 보고 건너뛴다. 어울림·글 앞으로 놓인
// 바탕쪽 그림(쪽 전체 배경 그림 등)은 plane 이 2·3이라 본문 개체로 잡혀, 본문 어디를 눌러도
// 배경 그림이 선택되고 글을 고칠 수 없었다(학과 계획서 양식). 엔진 패치 9005 가 컨트롤 배치에
// masterPage 를 싣고, 여기서 그것도 바탕쪽 장식으로 친다.
// 사용: node patches/master-page-hit.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/master-page-hit.mjs <studio src/engine dir>')
const p = join(dir, 'picture-hit-policy.ts')
const FIND = [
  'export function isMasterPageDecoration(control: {',
  '  plane?: number;',
  '  headerFooter?: unknown;',
  '}): boolean {',
  '  return control.plane === 1 && !control.headerFooter;',
  '}',
].join('\n')
const REPLACE = [
  'export function isMasterPageDecoration(control: {',
  '  plane?: number;',
  '  headerFooter?: unknown;',
  '  masterPage?: boolean;',
  '}): boolean {',
  '  // [hwp-pad] 엔진이 바탕쪽 유래를 표시하면 감싸기 방식과 관계없이 본문 클릭에서 뺀다',
  '  if (control.masterPage === true) return true;',
  '  return control.plane === 1 && !control.headerFooter;',
  '}',
].join('\n')
const src = readFileSync(p, 'utf8')
const n = src.split(FIND).length - 1
if (n !== 1) throw new Error(`picture-hit-policy.ts: expected exactly 1 match, found ${n}`)
writeFileSync(p, src.replace(FIND, () => REPLACE))
console.log('patched engine/picture-hit-policy.ts')
