// 서일 오피스 — 바깥 AI 창구 (2026-11-05).
// 사용자의 Claude(데스크톱·Claude Code)가 설치판의 연결 통로(MCP)를 거쳐 이 함수들을 부른다.
// 패널 AI와 같은 엔진(SeoilFill·SeoilWrite·SeoilAI.applyOps)을 쓰고, 결과는 AI 패널에 ✓ 상자로 남아
// 사람이 보고 「되돌리기」할 수 있다.
// 사람이 고친 칸: AI가 마지막으로 쓴 뒤 사람이 손댄 칸·문단은 표시하고, force 없이는 덮어쓰지 않는다.
(function () {
  'use strict';
  function bridge() { return window.rhwpStudio && window.rhwpStudio.ai; }
  function doc() { var b = bridge(); return b && b.doc(); }
  function fileName() { var b = bridge(); return (b && b.fileName && b.fileName()) || ''; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  var known = null;   // AI가 마지막으로 쓴 뒤의 {id: 글}
  var known4 = '';    // 그때의 문서 이름(다른 문서면 무효)
  var undoStack = [];
  var guarded = {};   // 한 번 사람이 고친 것으로 본 칸 — AI가 다시 써도 되는 허락(force)이 있을 때까지 지킨다

  function writable(d) { try { return !!(window.SeoilWrite && window.SeoilWrite.supports(d)); } catch (e) { return false; } }
  function fingerprint(d) {
    var f = {};
    try {
      var m = window.SeoilFill.scan(d);
      m.tables.forEach(function (t) { t.cells.forEach(function (c) { f[c.id] = c.text || ''; }); });
      m.paras.forEach(function (p) { f[p.id] = p.text || ''; });
    } catch (e) {}
    if (writable(d)) { try { window.SeoilWrite.outline(d).forEach(function (b) { f[b.id] = b.text || ''; }); } catch (e) {} }
    return f;
  }
  function remember() { var d = doc(); if (known4 !== fileName()) guarded = {}; known = d ? fingerprint(d) : null; known4 = fileName(); }
  function humanEdited() {
    var d = doc(); if (!d || !known || known4 !== fileName()) return [];
    var now = fingerprint(d);
    Object.keys(known).forEach(function (k) { if (k in now && now[k] !== known[k]) guarded[k] = true; });
    return Object.keys(guarded);
  }
  function targetOf(op) { return op.cell || op.para || op.under || (op.emph && op.emph !== 'all' ? op.emph : null); }

  function status() {
    var d = doc();
    return {
      open: !!d, fileName: fileName(), writable: d ? writable(d) : false,
      desktop: !!(window.seoilDesktop && window.seoilDesktop.isDesktop),
      humanEdited: humanEdited(),
    };
  }

  /** 문서 상태 글: 본문 구조 + 칸 지도(이미 쓴 글 포함) + 사람이 고친 칸 */
  function read() {
    var d = doc(); if (!d) return '열린 문서가 없습니다. open_document나 new_document로 먼저 여세요.';
    var body = '';
    if (writable(d)) {
      var o = window.SeoilWrite.outline(d), lv = window.SeoilWrite.levels(d);
      body = '[본문 구조]\n' + window.SeoilWrite.outlineText(o, { full: true }) + '\n[이 양식의 단계] ' + Object.keys(lv).join(' ') + '\n\n';
    }
    var m = window.SeoilFill.scan(d), map = window.SeoilFill.mapText(m, { all: true });
    var he = humanEdited();
    var prof = '';
    try { var p = JSON.parse(localStorage.getItem('seoil.profile') || '{}'); prof = Object.keys(p).map(function (k) { return k + ': ' + p[k]; }).join(', '); } catch (e) {}
    return '[문서 이름] ' + fileName() + '\n' + body + '[칸 지도 — 이미 쓴 글 포함]\n' + (map || '(없음)') +
      (he.length ? '\n\n[사람이 고친 칸 — 덮어쓰지 말 것] ' + he.join(', ') : '') +
      '\n\n[내 정보] ' + (prof || '(없음)') + '\n[오늘] ' + new Date().toISOString().slice(0, 10);
  }

  function edit(ops, opt) {
    opt = opt || {};
    var d = doc(); if (!d) return { ok: false, result: '열린 문서가 없습니다.' };
    if (!Array.isArray(ops) || !ops.length) return { ok: false, result: 'ops가 비었습니다.' };
    var he = humanEdited(), skipped = [];
    if (opt.force) { ops.forEach(function (op) { var t = targetOf(op); if (t) delete guarded[t]; }); he = []; }
    if (he.length) {
      ops = ops.filter(function (op) { var t = targetOf(op); if (t && he.indexOf(t) >= 0) { skipped.push(t); return false; } return true; });
      if (!ops.length) return { ok: false, result: '모두 사람이 고친 칸이라 건너뜀: ' + skipped.join(', ') + ' (덮어쓰려면 force:true — 사람에게 먼저 물어볼 것)' };
    }
    if (window.SeoilAI) { window.SeoilAI.open(true); if (window.SeoilAI.settings) window.SeoilAI.settings(false); } // 고친 기록(✓)이 보이게 설정 화면은 닫는다
    try { undoStack.push({ snap: d.saveSnapshot(), name: fileName() }); if (undoStack.length > 20) undoStack.shift(); } catch (e) {}
    var res = window.SeoilAI ? window.SeoilAI.applyOps(ops, opt.note ? 'Claude: ' + opt.note : null) : '패널 없음';
    remember();
    return { ok: !/^실패/.test(res), result: res + (skipped.length ? ' / 사람이 고친 칸이라 건너뜀: ' + skipped.join(', ') : '') };
  }

  /** 그림 op 준비: 설치판이 읽어 준 그림({b64,ext,name})을 바이트로 풀고 가로·세로 픽셀을 잰다 */
  var MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp' };
  function prepareImage(im) {
    if (typeof im === 'string') return Promise.reject(new Error('그림을 넣으려면 서일 오피스 설치판 0.4.24 이상이 필요합니다(설치판을 새로 설치해 주세요)'));
    if (!im || !im.b64) return Promise.reject(new Error('그림 파일을 읽지 못했습니다'));
    var bin = atob(im.b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var ext = String(im.ext || 'png').toLowerCase();
    var url = URL.createObjectURL(new Blob([bytes], { type: MIME[ext] || 'image/png' }));
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); if (img.naturalWidth > 0 && img.naturalHeight > 0) res({ bytes: bytes, ext: ext === 'jpeg' ? 'jpg' : ext, name: im.name || '', w: img.naturalWidth, h: img.naturalHeight }); else rej(new Error((im.name || '그림') + ': 크기를 읽지 못했습니다')); };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error((im.name || '그림') + ': 그림 파일로 읽을 수 없습니다')); };
      img.src = url;
    });
  }
  /** edit + 그림: 그림 op가 있으면 먼저 준비한 뒤 edit 한다(설치판은 이것을 부른다) */
  async function editAsync(ops, opt) {
    if (Array.isArray(ops) && ops.some(function (o) { return o && o.image; })) {
      try {
        ops = await Promise.all(ops.map(async function (o) { return o && o.image ? Object.assign({}, o, { image: await prepareImage(o.image) }) : o; }));
      } catch (e) { return { ok: false, result: '실패: ' + (e && e.message || e) }; }
    }
    return edit(ops, opt);
  }

  function undo() {
    var d = doc(), u = undoStack.pop();
    if (!d || !u) return '되돌릴 것이 없습니다.';
    if (u.name !== fileName()) return '다른 문서의 기록이라 되돌리지 않았습니다.';
    d.restoreSnapshot(u.snap);
    try { bridge().changed('seoil-agent-undo'); } catch (e) {}
    try { window.SeoilAI && window.SeoilAI.refresh(); } catch (e) {}
    remember();
    return '마지막 AI 수정을 되돌렸습니다.';
  }

  /** 새 문서: blank | report */
  async function newDocument(kind) {
    var S = window.SeoilStart; if (!S) throw new Error('홈 기능 없음');
    var before = doc();
    if (kind === 'report') await S.newReport(); else S.newDoc();
    for (var i = 0; i < 400 && doc() === before; i++) await wait(150);
    if (doc() === before) throw new Error('새 문서가 열리지 않았습니다 — 화면에 「저장 확인」 창이 떠 있으면 사람이 고르길 기다려 주세요');
    await wait(300); remember(); undoStack = [];
    return status();
  }
  /** 열린 문서(지난 회의록 등)를 오늘 날짜 사본으로 — 다시 쓰기 */
  async function rewriteCopy() {
    var before = fileName();
    await window.SeoilStart.forkCopy();
    for (var i = 0; i < 400 && fileName() === before; i++) await wait(150);
    if (fileName() === before) throw new Error('사본이 열리지 않았습니다 — 화면에 「저장 확인」 창이 떠 있으면 사람이 고르길 기다려 주세요');
    remember(); undoStack = [];
    return status();
  }
  /** 문서가 바뀌기를 기다린다(설치판이 파일을 열 때) */
  async function waitOpened(name, ms) {
    var t = Date.now();
    while (Date.now() - t < (ms || 60000)) { if (doc() && fileName() === name) { await wait(300); try { window.SeoilStart && window.SeoilStart.close(); } catch (e) {} remember(); undoStack = []; return status(); } await wait(200); }
    throw new Error('문서가 열리지 않았습니다(저장 확인 창이 떠 있는지 화면을 봐 주세요)');
  }
  function exportBytes(fmt) {
    var d = doc(); if (!d) throw new Error('열린 문서가 없습니다');
    // HWP(5) 저장은 한글에서 「파일이 손상되었습니다」로 안 열리는 경우가 있어 막는다(2026-11-09) → .hwpx 로
    if (fmt !== 'hwpx') throw new Error('HWP(.hwp) 저장은 막혀 있습니다 — 한글에서 손상 파일로 열릴 수 있습니다. path 를 .hwpx 로 바꿔 저장하세요(원본 .hwp 는 그대로 두고 같은 이름의 .hwpx 로).');
    return d.exportHwpx();
  }
  // 그림은 설치판의 Claude 연결로만(파일 경로를 설치판이 읽어 준다) — 패널 AI 안내문(SYSTEM)에는 넣지 않는다
  var IMAGE_GUIDE = [
    '',
    '[그림 넣기 — 사람이 그림·사진을 넣어 달라고 할 때]',
    '- 칸에: {"image":"C:\\\\Users\\\\…\\\\사진.jpg","cell":"T3.r2c0"} = 그 칸에 그림을 글자처럼 넣는다. 칸 폭(높이를 키워 둔 사진 칸이면 높이도)에 맞춰 줄인다. 칸의 안내문·자리표시는 지워진다(이미 쓴 글 위에 넣을 때 글을 지우려면 "clear":true).',
    '- 본문에: {"image":"C:\\\\…\\\\그림.png","after":"B20"} = 그 문단(B·P id, 맨 끝은 "end") 바로 뒤에 새 문단을 만들어 가운데로 넣는다. 본문 폭보다 크면 줄인다.',
    '- 선택: "width":80 = 가로 mm(비우면 원래 크기, 넘치면 맞춤). 본문 그림은 "align":"left|center|right".',
    '- image는 이 PC에 있는 그림 파일의 절대 경로(png·jpg·gif·bmp·webp). 경로를 모르면 사람에게 묻는다. 그림을 만들어 내거나 웹 주소를 넣지 않는다.',
    '- 그림 op는 다른 op와 섞지 않는다. 글을 먼저 쓰고 → read_document로 번호를 다시 확인 → 그림 op만 따로 보낸다. 한 번에 그림 여러 장은 된다.',
    '- 서명·도장 칸에는 넣지 않는다(사람이 따로 말할 때만).',
  ].join('\n');
  function guide() { var g = (window.SeoilAI && window.SeoilAI.system) || ''; return g ? g + '\n' + IMAGE_GUIDE : ''; }

  window.SeoilAgent = { status: status, read: read, edit: edit, editAsync: editAsync, undo: undo, newDocument: newDocument, rewriteCopy: rewriteCopy, waitOpened: waitOpened, exportBytes: exportBytes, guide: guide, remember: remember };
})();
