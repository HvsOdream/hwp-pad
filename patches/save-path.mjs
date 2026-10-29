// hwp-pad: 저장 경로 정리.
// 1) PC(크롬·엣지, File System Access 지원): 열기/저장 대화상자가 같은 '문서 폴더'를 기억한다
//    (picker `id` — 브라우저가 id별로 마지막 폴더를 기억). 처음엔 OS 문서 폴더에서 시작하고,
//    사용자가 「저장 폴더 지정」(showDirectoryPicker)으로 고른 폴더가 있으면 거기서 시작한다
//    (IndexedDB에 핸들 보관, 세션 간 유지). 이미 핸들이 있는 문서(Ctrl+S)는 전처럼 제자리에 덮어쓴다.
// 2) 아이패드·사파리(File System Access 없음): 다운로드 폴더에 떨어뜨리는 대신 공유 시트를 연다
//    → "파일에 저장"으로 Dropbox 폴더를 고르면 거기 저장된다. 공유가 막히면(권한·지원 없음) 기존 다운로드로.
// 사용: node patches/save-path.mjs <rhwp-studio/src/engine 디렉터리>  (engine 기준으로 ../command)
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) throw new Error('usage: node patches/save-path.mjs <studio src/engine dir>')

function patch(file, pairs) {
  let src = readFileSync(file, 'utf8')
  for (const [find, replace] of pairs) {
    const n = src.split(find).length - 1
    if (n !== 1) throw new Error(`${file}: expected exactly 1 match, found ${n}:\n${find}`)
    src = src.replace(find, () => replace)
  }
  writeFileSync(file, src)
  console.log(`patched ${file}`)
}

const fsa = join(dir, '..', 'command', 'file-system-access.ts')

// --- 저장 폴더(디렉터리 핸들) 보관소: IndexedDB. 모듈 끝에 덧붙인다. ---
const SAVE_DIR_STORE = `
// [hwp-pad] 사용자가 고른 '저장 폴더'(디렉터리 핸들)를 IndexedDB에 보관한다. 없으면 null.
const HWP_PAD_DB = 'hwp-pad';
const HWP_PAD_STORE = 'kv';
const HWP_PAD_SAVE_DIR_KEY = 'saveDir';

function hwpPadOpenDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(HWP_PAD_DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(HWP_PAD_STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function hwpPadGetSaveDir(): Promise<any | null> {
  try {
    const db = await hwpPadOpenDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(HWP_PAD_STORE, 'readonly');
      const req = tx.objectStore(HWP_PAD_STORE).get(HWP_PAD_SAVE_DIR_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function hwpPadSetSaveDir(handle: any | null): Promise<void> {
  try {
    const db = await hwpPadOpenDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(HWP_PAD_STORE, 'readwrite');
      const store = tx.objectStore(HWP_PAD_STORE);
      if (handle) store.put(handle, HWP_PAD_SAVE_DIR_KEY); else store.delete(HWP_PAD_SAVE_DIR_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // 보관 실패는 치명적이지 않다: 다음에 다시 고르면 된다
  }
}

/** 「저장 폴더 지정」: 폴더를 고르고 보관한다. 지원하지 않는 브라우저면 null. */
export async function hwpPadPickSaveDir(): Promise<any | null> {
  const w = globalThis as any;
  if (typeof w.showDirectoryPicker !== 'function') return null;
  const handle = await w.showDirectoryPicker({ id: 'hwp-pad-documents', mode: 'readwrite', startIn: 'documents' });
  await hwpPadSetSaveDir(handle);
  return handle;
}

/** 대화상자의 시작 위치: 보관된 저장 폴더(권한이 살아 있을 때) 또는 OS 문서 폴더. */
async function hwpPadStartIn(): Promise<any> {
  const saved = await hwpPadGetSaveDir();
  if (saved && typeof saved.queryPermission === 'function') {
    try {
      let p = await saved.queryPermission({ mode: 'readwrite' });
      if (p === 'prompt') p = await saved.requestPermission({ mode: 'readwrite' });
      if (p === 'granted') return saved;
    } catch {
      // 폴더가 사라졌거나 권한 거부: 문서 폴더로
    }
  }
  return 'documents';
}
`

patch(fsa, [
  // 열기 대화상자: 같은 id로 폴더를 기억하고, 저장 폴더/문서 폴더에서 시작
  [
    `    const handles = await windowLike.showOpenFilePicker!({
      excludeAcceptAllOption: true,
      multiple: false,
      types: HWP_OPEN_PICKER_TYPES,
    });`,
    `    const handles = await windowLike.showOpenFilePicker!({
      excludeAcceptAllOption: true,
      multiple: false,
      types: HWP_OPEN_PICKER_TYPES,
      // [hwp-pad] 열기/저장이 같은 '문서 폴더'를 기억한다
      id: 'hwp-pad-documents',
      startIn: await hwpPadStartIn(),
    } as any);`,
  ],
  // 저장 대화상자: 같은 id + 시작 폴더
  [
    `    const handle = await windowLike.showSaveFilePicker({
      excludeAcceptAllOption: true,
      suggestedName,
      types: pickerTypes,
    });`,
    `    const handle = await windowLike.showSaveFilePicker({
      excludeAcceptAllOption: true,
      suggestedName,
      types: pickerTypes,
      // [hwp-pad] 열기/저장이 같은 '문서 폴더'를 기억한다 (브라우저가 id별 마지막 폴더 기억)
      id: 'hwp-pad-documents',
      startIn: await hwpPadStartIn(),
    } as any);`,
  ],
  // File System Access가 없는 브라우저(아이패드·사파리): 다운로드 대신 공유 시트
  [
    `  return {
    method: 'fallback',
    handle: null,
    fileName: suggestedName,
  };
}`,
    `  // [hwp-pad] 아이패드·사파리: 다운로드 폴더 대신 공유 시트("파일에 저장" → Dropbox 폴더 선택).
  // 취소(AbortError)는 취소로, 그 밖의 실패(권한·미지원)는 기존 다운로드 폴백으로.
  const nav = (globalThis as any).navigator;
  if (nav && typeof nav.share === 'function' && typeof nav.canShare === 'function') {
    const file = new File([blob], suggestedName, { type: blob.type || 'application/octet-stream' });
    if (nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: suggestedName });
        return { method: 'share' as any, handle: null, fileName: suggestedName };
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') throw error;
        console.warn('[hwp-pad] share sheet unavailable, falling back to download:', error);
      }
    }
  }

  return {
    method: 'fallback',
    handle: null,
    fileName: suggestedName,
  };
}` + SAVE_DIR_STORE,
  ],
  // 결과 타입에 share 추가
  [
    `  method: 'current-handle' | 'save-picker' | 'fallback';`,
    `  method: 'current-handle' | 'save-picker' | 'share' | 'fallback';`,
  ],
])

// --- 「저장 폴더 지정」 명령: 파일 명령 목록에 추가 (Ctrl+S 흐름은 그대로) ---
const fileCmds = join(dir, '..', 'command', 'commands', 'file.ts')
patch(fileCmds, [
  [
    `  {
    id: 'file:page-setup',`,
    `  {
    // [hwp-pad] 저장 폴더 지정 — 열기/저장 대화상자가 이 폴더에서 시작한다 (크롬·엣지). 아이패드는 공유 시트로 고른다.
    id: 'hwppad:save-dir',
    label: '저장 폴더 지정…',
    canExecute: () => typeof (globalThis as any).showDirectoryPicker === 'function',
    async execute() {
      try {
        const handle = await hwpPadPickSaveDir();
        if (handle) alert('저장 폴더: ' + handle.name + '\\n열기/저장 대화상자가 이 폴더에서 시작합니다.');
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          alert('저장 폴더를 지정하지 못했습니다: ' + (error instanceof Error ? error.message : String(error)));
        }
      }
    },
  },
  {
    id: 'file:page-setup',`,
  ],
  [
    `  readFileFromHandle,
  saveDocumentToFileSystem,`,
    `  readFileFromHandle,
  hwpPadPickSaveDir,
  saveDocumentToFileSystem,`,
  ],
])

// --- 파일 메뉴에 항목 추가 (index.html은 정적 메뉴) ---
const indexHtml = join(dir, '..', '..', 'index.html')
patch(indexHtml, [
  [
    `<div class="md-item disabled" data-cmd="file:save-as-hwpx">`,
    `<div class="md-item" data-cmd="hwppad:save-dir" title="열기/저장 대화상자가 시작할 폴더를 정합니다 (크롬·엣지). 아이패드는 저장 시 공유 시트에서 폴더를 고릅니다."><span class="md-icon"></span><span class="md-label">저장 폴더 지정…</span></div>
          <div class="md-item disabled" data-cmd="file:save-as-hwpx">`,
  ],
])
