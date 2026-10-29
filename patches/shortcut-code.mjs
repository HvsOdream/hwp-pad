// hwp-pad: 단축키 매칭을 물리키(code)로도 한다.
// rhwp의 단축키 표에서 자간·장평(Alt+Shift+J/K/N/W)은 `code: 'KeyJ'`가 같이 적혀 있지만 줄간격(Alt+Shift+A/Z),
// 글자 크기(Alt+Shift+E/R), Alt+N/L/T 등은 `key`만 적혀 있다. 맥/아이패드에서 Option+Shift+A는 key가 'Å' 같은
// 특수문자로 오므로 key 비교가 실패한다. 정의에 code가 없고 key가 ASCII 글자/숫자면 물리키(KeyA/Digit1)로도 맞춘다.
// 사용: node patches/shortcut-code.mjs <rhwp-studio/src/engine 디렉터리>  (engine 기준으로 ../command 를 찾는다)
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/shortcut-code.mjs <studio src/engine dir>')

const FIND = [
  '    if (eventKey === def.key) return cmdId;',
  '    if (def.code && eventCode === def.code.toLowerCase()) return cmdId;',
  '',
].join('\n')

const REPLACE = [
  '    if (eventKey === def.key) return cmdId;',
  "    // [hwp-pad] Option+letter on Mac/iPad yields a symbol key ('Å'), so an ASCII letter/digit",
  '    // definition without a code matches its physical key too (KeyA, Digit1).',
  '    const defCode = def.code',
  "      ?? (/^[a-z]$/.test(def.key) ? 'Key' + def.key.toUpperCase()",
  "        : /^[0-9]$/.test(def.key) ? 'Digit' + def.key : null);",
  '    if (defCode && eventCode === defCode.toLowerCase()) return cmdId;',
  '',
].join('\n')

const p = join(dir, '..', 'command', 'shortcut-map.ts')
const src = readFileSync(p, 'utf8')
const n = src.split(FIND).length - 1
if (n !== 1) throw new Error(`shortcut-map.ts: expected exactly 1 match for anchor, found ${n}`)
writeFileSync(p, src.replace(FIND, () => REPLACE))
console.log('patched command/shortcut-map.ts')
