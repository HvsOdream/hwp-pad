// hwp-pad: 복사한 그림을 표 칸 안에 붙여 넣기 (2026-11-05).
// 엔진은 복사한 개체(그림)를 본문에만 붙여 넣는다 — 칸 안에서는 글 붙여넣기로 떨어져 그림이 안 들어갔다.
// 그림을 복사할 때 바이트와 크기를 기억해 두고, 칸 안에서 붙이면 그 그림을 <img> HTML로 넣는다.
// (칸 안 HTML 그림은 이음오피스 패치 ieumPasteHtmlInCell이 칸에 제대로 앉힌다.)
// 이음 패치가 찾는 줄은 건드리지 않는다(이음 패치는 빌드 때 원본에 다시 적용된다).
// 사용: node patches/picture-paste-cell.mjs <rhwp-studio/src/engine 디렉터리>
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/picture-paste-cell.mjs <studio src/engine dir>')
const p = join(dir, 'input-handler-keyboard.ts')
let src = readFileSync(p, 'utf8')
function once(find, replace) {
  const n = src.split(find).length - 1
  if (n !== 1) throw new Error(`input-handler-keyboard.ts: expected 1 match, found ${n}: ${find.slice(0, 60)}`)
  src = src.replace(find, () => replace)
}

// 1) 그림 복사: 바이트·크기 기억 — 복사 길은 둘이다(복사 이벤트 onCopy, 메뉴·Ctrl+C 명령 copySelectedObject)
const COPY = "        const text = this.wasm.getClipboardText() || '[그림]';\n"
once(COPY, COPY + '        hwpPadRememberPicture(this.wasm, ref, cellPathJson, text);\n')

// 2) 칸 안에서 붙여넣기: 기억한 그림을 HTML로
const PASTE = '    // 내부 클립보드 텍스트 붙여넣기 (서식 보존)\n'
once(PASTE, [
  '    // [hwp-pad] 표 칸 안: 엔진은 개체 붙여넣기를 본문에서만 한다 → 복사해 둔 그림을 그림 HTML로 칸에 넣는다',
  '    const hpPic = (window as any).__hwpPadCopiedPicture;',
  '    if (this.wasm.clipboardHasControl() && pos.parentParaIndex !== undefined && hpPic && hpPic.text === internalClipboardText) {',
  '      void hwpPadPastePictureInCell.call(this, hpPic, hasSelection);',
  '      return;',
  '    }',
  '',
].join('\n') + PASTE)

src += `
/** [hwp-pad] 표 칸 안 붙여넣기용: 복사한 그림의 바이트와 크기를 기억한다(그림이 아니면 지운다) */
export function hwpPadRememberPicture(wasm: any, ref: any, cellPathJson: string, text: string): void {
  (window as any).__hwpPadCopiedPicture = null;
  if (!ref || ref.type !== 'image') return;
  try {
    const pd = wasm.getControlImageData(ref.sec, ref.ppi, ref.ci, cellPathJson);
    const pm = wasm.getControlImageMime(ref.sec, ref.ppi, ref.ci, cellPathJson);
    let pw = 0, ph = 0;
    if (!cellPathJson) {
      try { const pp = wasm.getPictureProperties(ref.sec, ref.ppi, ref.ci); pw = pp.width; ph = pp.height; } catch { /* 그림 픽셀 크기로 */ }
    }
    (window as any).__hwpPadCopiedPicture = { bytes: new Uint8Array(pd), mime: pm, w: pw, h: ph, text };
  } catch { /* 기억 못 하면 칸 안 붙여넣기만 안 된다 */ }
}

/** [hwp-pad] 기억해 둔 그림을 <img> HTML로 만들어 칸 안 커서 자리에 붙인다. 크기는 원본 그림 크기(없으면 픽셀 크기). */
async function hwpPadPastePictureInCell(this: any, pic: { bytes: Uint8Array; mime: string; w: number; h: number }, hasSelection: boolean): Promise<void> {
  try {
    let w = pic.w, h = pic.h;
    if (!(w > 0 && h > 0)) {
      const url = URL.createObjectURL(new Blob([new Uint8Array(pic.bytes)], { type: pic.mime }));
      try {
        const img = new Image();
        img.src = url;
        await img.decode();
        w = img.naturalWidth * 75;
        h = img.naturalHeight * 75;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    let bin = '';
    for (let i = 0; i < pic.bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, Array.from(pic.bytes.subarray(i, i + 0x8000)));
    }
    const px = (hu: number) => Math.round((hu / 75) * 100) / 100;
    const html = '<html><body>\\n<!--StartFragment-->\\n<img src="data:' + pic.mime + ';base64,' + btoa(bin) +
      '" width="' + px(w) + '" height="' + px(h) + '" />\\n<!--EndFragment-->\\n</body></html>';
    pasteExternalHtml.call(this, html, '', hasSelection);
  } catch (err) {
    console.warn('[hwp-pad] 칸 안 그림 붙여넣기 실패:', err);
  }
}
`
writeFileSync(p, src)

// 3) 명령 복사 길(input-handler.ts copySelectedObject)
const p2 = join(dir, 'input-handler.ts')
let src2 = readFileSync(p2, 'utf8')
const COPY2 = "          const text = this.wasm.getClipboardText() || '[그림]';\n"
const n2 = src2.split(COPY2).length - 1
if (n2 !== 1) throw new Error(`input-handler.ts: expected 1 match, found ${n2}`)
src2 = src2.replace(COPY2, () => COPY2 + '          _keyboard.hwpPadRememberPicture(this.wasm, ref, cellPathJson, text);\n')
writeFileSync(p2, src2)
console.log('[hwp-pad] picture-paste-cell: ok')
