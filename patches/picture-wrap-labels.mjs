// hwp-pad: 개체 속성 대화상자 「본문과의 배치」 단추를 그림 + 이름으로.
// 원본은 ⬒ ⬓ ⬔ ⬕ ⬖ 다섯 글자뿐이라 어느 것이 「글 앞으로」인지 알 수 없고,
// 풍선 도움말(title)은 터치 화면에서는 아예 안 뜨고 PC 에서도 한참 기다려야 뜬다.
// 단추마다 배치 모양 그림(글줄 + 그림 상자)과 이름(자리 차지·어울림·빈 공간 채움·글 뒤로·글 앞으로)을
// 항상 보이게 넣는다. 동작(selectWrap)과 값 순서는 그대로.
// 사용: node patches/picture-wrap-labels.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/picture-wrap-labels.mjs <studio src/engine dir>')

function patch(path, edits) {
  let src = readFileSync(path, 'utf8')
  if (src.includes('[hwp-pad] wrap-labels')) return console.log(`picture-wrap-labels: ${path} already patched`)
  for (const [find, replace, label] of edits) {
    const n = src.split(find).length - 1
    if (n !== 1) throw new Error(`${path} ${label}: expected exactly 1 match, found ${n}`)
    src = src.replace(find, () => replace)
  }
  writeFileSync(path, src)
  console.log(`picture-wrap-labels: patched ${path}`)
}

// 글줄(L)과 그림 상자(B)로 그린 30×22 그림. 순서는 wrapValues 와 같다:
// TopAndBottom(자리 차지) · Square(어울림) · Tight(빈 공간 채움) · BehindText(글 뒤로) · InFrontOfText(글 앞으로)
const L = (x1, y, x2) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>`
const full = [3, 7, 11, 15, 19].map((y) => L(2, y, 28)).join('')
const svg = (inner) =>
  `<svg class="pp-wrap-ico" viewBox="0 0 30 22" width="30" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">${inner}</svg>`
const box = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" class="pp-wrap-box"${extra}/>`
const ICONS = [
  // 자리 차지: 그림이 줄 전체를 차지하고 글은 위·아래로만
  svg(L(2, 3, 28) + box(9, 6.5, 12, 9) + L(2, 19, 28)),
  // 어울림: 글이 그림 옆으로 흐름
  svg(L(2, 3, 28) + box(2, 6.5, 11, 9) + L(16, 7, 28) + L(16, 11, 28) + L(16, 15, 28) + L(2, 19, 28)),
  // 빈 공간 채움: 그림 양옆을 글이 채움
  svg(L(2, 3, 28) + L(2, 7, 7) + L(23, 7, 28) + L(2, 11, 7) + L(23, 11, 28) + L(2, 15, 7) + L(23, 15, 28) + box(9.5, 5.5, 11, 11) + L(2, 19, 28)),
  // 글 뒤로: 그림 위로 글줄이 지나감
  svg(box(8, 4.5, 14, 13, ' data-behind="1"') + full),
  // 글 앞으로: 그림이 글줄을 가림
  svg(full + box(8, 4.5, 14, 13, ' data-front="1"')),
]

patch(join(dir, '..', 'ui', 'picture-props-dialog.ts'), [
  [
    "      btn.textContent = wrapIcons[i];\n      btn.title = title;\n      btn.addEventListener('click', () => this.selectWrap(i));\n",
    [
      '      // [hwp-pad] wrap-labels: 글자 아이콘 대신 배치 그림 + 이름(항상 보임)',
      `      const HWPPAD_WRAP_SVG: string[] = ${JSON.stringify(ICONS)};`,
      "      btn.type = 'button';",
      "      btn.classList.add('pp-wrap-labeled');",
      '      btn.innerHTML = HWPPAD_WRAP_SVG[i] ?? wrapIcons[i];',
      "      const hwppadCap = document.createElement('span');",
      "      hwppadCap.className = 'pp-wrap-cap';",
      '      hwppadCap.textContent = title;',
      '      btn.appendChild(hwppadCap);',
      '      btn.title = title;',
      "      btn.setAttribute('aria-label', title);",
      "      btn.addEventListener('click', () => this.selectWrap(i));",
      '',
    ].join('\n'),
    'wrap button',
  ],
  [
    "    wrapRow.classList.add('pp-pos-detail');\n",
    "    wrapRow.classList.add('pp-pos-detail');\n    wrapRow.classList.add('pp-wrap-row'); // [hwp-pad] 좁은 화면에서 줄바꿈\n",
    'wrap row',
  ],
])

patch(join(dir, '..', 'styles', 'picture-props.css'), [
  [
    '.pp-wrap-btn:hover:not(:disabled) {',
    [
      '/* [hwp-pad] wrap-labels: 본문과의 배치 단추 = 그림 + 이름 */',
      '.pp-wrap-row { flex-wrap: wrap; row-gap: 6px; }',
      '.pp-wrap-btn.pp-wrap-labeled {',
      '  width: auto;',
      '  min-width: 62px;',
      '  height: auto;',
      '  padding: 4px 6px 3px;',
      '  flex-direction: column;',
      '  gap: 2px;',
      '  color: var(--color-text);',
      '}',
      '.pp-wrap-labeled .pp-wrap-ico { display: block; opacity: 0.75; }',
      '.pp-wrap-labeled .pp-wrap-box { fill: var(--color-surface); stroke: var(--color-primary); stroke-width: 1.4; }',
      '.pp-wrap-labeled .pp-wrap-box[data-behind] { fill: var(--color-accent-bg-light); stroke-opacity: 0.55; }',
      '.pp-wrap-labeled .pp-wrap-box[data-front] { fill: var(--color-primary); fill-opacity: 0.9; }',
      '.pp-wrap-labeled .pp-wrap-cap { font-size: 11px; line-height: 1.2; white-space: nowrap; }',
      '.pp-wrap-labeled.active .pp-wrap-cap { font-weight: 600; color: var(--color-primary); }',
      '.pp-wrap-labeled.active .pp-wrap-ico { opacity: 1; }',
      '.pp-wrap-btn:hover:not(:disabled) {',
    ].join('\n'),
    'css',
  ],
])
