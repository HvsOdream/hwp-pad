// 서일 오피스 — 범용 양식 채우기 (2026-11-03).
// 원본 양식 위에서만 쓴다: 표 칸·본문 문단에 글자만 넣고, 표·칸·문단 모양은 그대로 둔다.
//  scan(doc)  → 칸 지도 { tables:[{id,cells:[{id,label,text,kind}]}], paras:[{id,text,kind}], fp }
//  mapText(m) → AI에게 보낼 짧은 칸 지도 글
//  apply(doc, m, ops) → ops 실행. op 종류:
//    {cell:"T2.r0c1", text:"…"}                칸 전체를 이 글로 (줄바꿈 = 문단 나눔, 모양은 칸 첫 문단)
//    {cell:"T2.r0c1", find:"OOO", replace:"…"}  칸 안의 글자만 바꿈 (자리표시)
//    {para:"P12", find:"00월 00일", replace:"11월 03일"} 본문 문단 글자만 바꿈
//    {rows:"T6", start:1, data:[["…","…"],…]}  명단 표: start 행부터 칸을 왼→오로 채움, 모자라면 행 추가(최상위 표만)
//  verify(before, after) → 표 수·칸 수가 같은지(행 추가는 허용)
//  images(doc, m, ops) → 그림 넣기(2026-11-11). 그림 바이트는 설치판이 파일을 읽어 넣어 준다(image.bytes)
//    {image:{bytes,ext,name,w,h}, cell:"T3.r2c0", width:80}   칸 안에 글자처럼(칸 폭·높이에 맞춰 줄임). width 는 mm(선택)
//    {image:{…}, after:"P5"|"B20"|"end", width:120, align:"center"}  그 문단 뒤 새 문단에 글자처럼(본문 폭에 맞춰 줄임)
// 브라우저(window.SeoilFill)와 node 공용.
(function (root) {
  'use strict';
  var PH = /(0{3,}|\d{4}\s?\.\s?0{2}\s?\.\s?0{2}\.?|0{2}월\s?0{2}일|O{2,}|ㅇ{2,}|○{2,}|\bO\b|\(\s*\)|년\s{2,}월\s{2,}일|0{2,}\s?학과|010-0{4}-0{4})/;
  function J(s) { return typeof s === 'string' ? JSON.parse(s) : s; }
  function P(path) { return JSON.stringify(path); }
  function trimLabel(s) { return String(s || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, ''); }

  // ---------- 읽기 ----------
  // getObjects()의 para는 문서 전체에서 센 번호다. 구역 시작 번호는 구역별 문단 수를 쌓아 구한다
  // (getSectionStarts()는 [0]만 돌려줘 둘째 구역부터 표가 지도에서 빠졌다 — 2026-11-05 충원율 계획서).
  function sectionStarts(doc) {
    try {
      var n = doc.getSectionCount(), out = [], acc = 0;
      for (var i = 0; i < n; i++) { out.push(acc); acc += doc.getParagraphCount(i); }
      if (out.length) return out;
    } catch (e) {}
    return [0];
  }
  function toLocal(starts, globalPara) {
    for (var i = starts.length - 1; i >= 0; i--) if (globalPara >= starts[i]) return { sec: i, para: globalPara - starts[i] };
    return { sec: 0, para: globalPara };
  }
  function cellParaTexts(doc, sec, para, path) {
    var n = doc.getCellParagraphCountByPath(sec, para, P(path)), out = [];
    for (var i = 0; i < n; i++) {
      var pp = path.slice(); pp[pp.length - 1] = Object.assign({}, pp[pp.length - 1], { cellParaIndex: i });
      var len = doc.getCellParagraphLengthByPath(sec, para, P(pp));
      out.push(len ? String(doc.getTextInCellByPath(sec, para, P(pp), 0, len)) : '');
    }
    return out;
  }
  function tableAt(doc, sec, para, path) {
    try { return J(doc.getTableDimensionsByPath(sec, para, P(path))); } catch (e) { return null; }
  }

  function scan(doc) {
    var m = { tables: [], paras: [], fpParts: [] }, starts = sectionStarts(doc), tno = 0;
    var objs = []; try { objs = J(doc.getObjects()); } catch (e) {}
    var bodyTables = objs.filter(function (o) { return o.kind === 'table'; });
    var tableParas = {};
    function walk(sec, para, basePath, depth, parentId) {
      var dims = tableAt(doc, sec, para, basePath);
      if (!dims) return;
      var id = 'T' + (++tno), t = { id: id, sec: sec, para: para, path: basePath, rows: dims.rowCount, cols: dims.colCount, cells: [], depth: depth, parent: parentId || null, top: depth === 0 };
      m.tables.push(t); m.fpParts.push(dims.cellCount);
      for (var ci = 0; ci < dims.cellCount; ci++) {
        var cp = basePath.slice(); cp[cp.length - 1] = Object.assign({}, cp[cp.length - 1], { cellIndex: ci, cellParaIndex: 0 });
        var info; try { info = J(doc.getCellInfoByPath(sec, para, P(cp))); } catch (e) { continue; }
        var paras = cellParaTexts(doc, sec, para, cp);
        var text = paras.join('\n').replace(/\s+$/, '');
        var cell = { id: id + '.r' + info.row + 'c' + info.col, t: t, idx: ci, row: info.row, col: info.col, rs: info.rowSpan, cs: info.colSpan, path: cp, paras: paras, text: text };
        t.cells.push(cell);
        // 칸 안의 표(중첩)
        for (var pi = 0; pi < paras.length; pi++) {
          for (var k = 0; k < 4; k++) {
            var np = cp.slice(); np[np.length - 1] = Object.assign({}, np[np.length - 1], { cellParaIndex: pi });
            np.push({ controlIndex: k, cellIndex: 0, cellParaIndex: 0 });
            if (tableAt(doc, sec, para, np)) { cell.hasTable = true; walk(sec, para, np, depth + 1, cell.id); }
          }
        }
      }
      label(t);
    }
    bodyTables.forEach(function (o) {
      var L = toLocal(starts, o.para);
      tableParas[L.sec + ':' + L.para] = true;
      walk(L.sec, L.para, [{ controlIndex: o.controlIndex, cellIndex: 0, cellParaIndex: 0 }], 0, null);
    });
    // 본문 문단(표 밖)
    var nsec = doc.getSectionCount();
    for (var s = 0; s < nsec; s++) {
      var np2 = doc.getParagraphCount(s);
      for (var p = 0; p < np2; p++) {
        var len = doc.getParagraphLength(s, p);
        if (!len) continue;
        var tx = String(doc.getTextRange(s, p, 0, len)).replace(/[\u0000-\u001f￼]/g, '');
        if (!tx.trim()) continue;
        m.paras.push({ id: 'P' + (m.paras.length + 1), sec: s, para: p, text: tx, kind: PH.test(tx) ? 'ph' : (/[:：]\s*$/.test(tx) || /^\s*[가-하]\.\s*$/.test(tx) ? 'blank' : 'text') });
      }
    }
    m.fp = m.fpParts.join('-');
    return m;
  }

  function label(t) {
    // 머리글 행: 짧은 글 칸이 2개 이상이고, 바로 아래 행에 빈칸이 2개 이상(명단·표 머리)
    var grid = {}, heads = {}, byRow = {};
    t.cells.forEach(function (c) { (byRow[c.row] = byRow[c.row] || []).push(c); });
    Object.keys(byRow).map(Number).forEach(function (r) {
      var row = byRow[r], txt = row.filter(function (c) { return c.text.trim() && c.text.length < 30; });
      var below = byRow[r + 1] || [], emp = below.filter(function (c) { return !c.text.trim(); });
      if (txt.length >= 2 && txt.length >= row.length - 1 && emp.length >= 2) heads[r] = true;
    });
    t.cells.forEach(function (c) { for (var r = c.row; r < c.row + c.rs; r++) for (var k = c.col; k < c.col + c.cs; k++) grid[r + ',' + k] = c; });
    t.cells.forEach(function (c) {
      var left = c.col > 0 ? grid[c.row + ',' + (c.col - 1)] : null;
      var top = null;
      for (var r = c.row - 1; r >= 0; r--) { var u = grid[r + ',' + c.col]; if (u && u !== c && u.text.trim() && !/^[\s◯○●□■✓√VvOo]{1,3}$/.test(u.text)) { top = u; break; } }
      var l = left && left.text.trim() && left.text.length < 40 ? trimLabel(left.text) : '';
      var h = top && top.text.length < 40 ? trimLabel(top.text) : '';
      // 위쪽 글은 머리글 행일 때만 라벨로 쓴다(라벨-값 양식에서 윗줄 값이 라벨로 잘못 붙지 않게)
      var headTop = top && (heads[top.row] || !l);
      c.label = l && h && headTop && l !== h ? h + ' / ' + l : (l || (headTop ? h : ''));
      c.kind = c.hasTable ? 'box' : !c.text.trim() ? 'empty' : PH.test(c.text) ? 'ph' : /^\s*[※*]|작성|기재|내외|예\s?:/.test(c.text) && c.text.length > 8 ? 'guide' : 'text';
    });
    t.guideBox = t.cells.some(function (c) { return /^작성\s?방법|삭제하고 제출/.test(c.text.trim()); });
  }

  /** AI에게 보낼 칸 지도: 빈칸·자리표시·안내문 칸만, 라벨과 함께 */
  function mapText(m, opt) {
    opt = opt || {};
    var L = [];
    m.paras.forEach(function (p) { if (p.kind !== 'text' || opt.all) L.push(p.id + ' (본문' + (p.kind === 'ph' ? '·자리표시' : p.kind === 'blank' ? '·빈 항목' : '') + '): ' + p.text.slice(0, 160)); });
    m.tables.forEach(function (t) {
      if (t.guideBox) { L.push(t.id + ' = 작성방법 안내 상자 (채우지 말 것)'); return; }
      var rows = [];
      t.cells.forEach(function (c) {
        if (c.kind === 'box') return;
        if (c.kind === 'text' && !opt.all && t.cells.length > 40) return;
        var tag = c.kind === 'empty' ? '빈칸' : c.kind === 'ph' ? '자리표시' : c.kind === 'guide' ? '안내문(지우고 씀)' : '글';
        rows.push('  ' + c.id + (c.kind === 'text' ? '' : ' [' + (c.label || '?') + ']') + ' ' + tag + (c.kind !== 'empty' ? ': ' + c.text.replace(/\n/g, ' / ').slice(0, 140) : ''));
      });
      var heads = t.cells.filter(function (c) { return c.kind === 'text'; }).map(function (c) { return c.text.replace(/\n/g, ' ').slice(0, 30); }).slice(0, 14);
      L.push(t.id + ' 표 ' + t.rows + '행×' + t.cols + '열' + (t.parent ? ' (' + t.parent + ' 안)' : '') + (heads.length ? ' — 글: ' + heads.join(' | ') : ''));
      if (rows.length) L.push.apply(L, rows); else L.push('  (채울 칸 없음)');
    });
    return L.join('\n');
  }

  // ---------- 쓰기 ----------
  function findCell(m, id) {
    for (var i = 0; i < m.tables.length; i++) for (var j = 0; j < m.tables[i].cells.length; j++) if (m.tables[i].cells[j].id === id) return m.tables[i].cells[j];
    return null;
  }
  function withPara(path, i) { var p = path.slice(); p[p.length - 1] = Object.assign({}, p[p.length - 1], { cellParaIndex: i }); return p; }

  function writeCell(doc, c, text) {
    var sec = c.t.sec, para = c.t.para, path = c.path;
    var n = doc.getCellParagraphCountByPath(sec, para, P(path));
    // 둘째 문단부터 비우고 앞 문단에 붙여 없앤다(칸 안에 표가 있으면 손대지 않음)
    for (var i = n - 1; i >= 1; i--) {
      var pi = withPara(path, i), l = doc.getCellParagraphLengthByPath(sec, para, P(pi));
      if (l) doc.deleteTextInCellByPath(sec, para, P(pi), 0, l);
      doc.mergeParagraphInCellByPath(sec, para, P(pi));
    }
    var p0 = withPara(path, 0), l0 = doc.getCellParagraphLengthByPath(sec, para, P(p0));
    if (l0) doc.deleteTextInCellByPath(sec, para, P(p0), 0, l0);
    var lines = String(text).replace(/\r/g, '').split('\n');
    for (var k = 0; k < lines.length; k++) {
      var pk = withPara(path, k);
      if (lines[k]) doc.insertTextInCellByPath(sec, para, P(pk), 0, lines[k]);
      if (k < lines.length - 1) {
        var lk = doc.getCellParagraphLengthByPath(sec, para, P(pk));
        doc.splitParagraphInCellByPath(sec, para, P(pk), lk, undefined);
      }
    }
  }
  function replaceInCell(doc, c, find, rep) {
    var hit = false, sec = c.t.sec, para = c.t.para, n = doc.getCellParagraphCountByPath(sec, para, P(c.path));
    for (var i = 0; i < n; i++) {
      var pi = withPara(c.path, i), len = doc.getCellParagraphLengthByPath(sec, para, P(pi));
      if (!len) continue;
      var tx = String(doc.getTextInCellByPath(sec, para, P(pi), 0, len)), at = tx.lastIndexOf(find);
      while (at >= 0) {
        doc.deleteTextInCellByPath(sec, para, P(pi), at, find.length);
        if (rep) doc.insertTextInCellByPath(sec, para, P(pi), at, rep);
        hit = true;
        at = at > 0 ? tx.lastIndexOf(find, at - 1) : -1;
      }
    }
    return hit;
  }
  function replaceInPara(doc, p, find, rep) {
    var len = doc.getParagraphLength(p.sec, p.para), tx = String(doc.getTextRange(p.sec, p.para, 0, len)), at = tx.lastIndexOf(find), hit = false;
    while (at >= 0) {
      doc.replaceText(p.sec, p.para, at, find.length, rep || '');
      hit = true;
      at = at > 0 ? tx.lastIndexOf(find, at - 1) : -1;
    }
    return hit;
  }
  function fillRows(doc, m, op, log) {
    var t = m.tables.filter(function (x) { return x.id === op.rows; })[0];
    if (!t) throw new Error(op.rows + ' 표가 없습니다');
    var start = op.start | 0, data = op.data || [];
    var need = start + data.length - t.rows;
    if (need > 0) {
      if (!t.top) throw new Error(t.id + ' 표는 칸 안의 표라 행을 늘릴 수 없습니다 (' + need + '행 부족)');
      var c0 = t.path[0].controlIndex;
      for (var a = 0; a < need; a++) doc.insertTableRow(t.sec, t.para, c0, t.rows - 1 + a, true);
      log.push(t.id + ' 표에 ' + need + '행을 더했습니다');
      var fresh = scan(doc), nt = fresh.tables.filter(function (x) { return x.id === op.rows; })[0];
      // 새 행: 위 행의 고정 글자(라벨: 위원 소속·직위 같은 칸)는 그대로 옮겨 적는다
      var model = t.cells.filter(function (c) { return c.row === t.rows - 1; });
      nt.cells.forEach(function (c) {
        if (c.row < t.rows) return;
        var up = model.filter(function (u) { return u.col === c.col; })[0];
        if (up && up.kind === 'text' && up.text.trim()) { writeCell(doc, c, up.text); c.text = up.text; c.kind = 'text'; }
      });
      t = nt; m.tables = fresh.tables; m.paras = fresh.paras;
    }
    data.forEach(function (row, ri) {
      var r = start + ri;
      var cells = t.cells.filter(function (c) { return c.row === r; }).sort(function (a, b) { return a.col - b.col; });
      // 이 행에서 글이 이미 있는 칸(번호·연도 같은 고정 칸)은 건너뛰고 빈칸에 차례로
      var targets = cells.filter(function (c) { return !c.text.trim() || PH.test(c.text); });
      if (op.allCols) targets = cells;
      (row || []).forEach(function (v, k) { if (targets[k] && v != null && v !== '') writeCell(doc, targets[k], String(v)); });
    });
  }

  function apply(doc, m, ops) {
    var log = [], done = [], drops = [];
    (ops || []).forEach(function (op) {
      if (op.deleteTable) {
        var dt = m.tables.filter(function (x) { return x.id === op.deleteTable; })[0];
        if (!dt) throw new Error(op.deleteTable + ' 표가 없습니다');
        if (!dt.top) throw new Error(op.deleteTable + ' 표는 칸 안의 표라 지울 수 없습니다');
        drops.push(dt); return;
      }
      if (op.rows) { fillRows(doc, m, op, log); done.push(op.rows); return; }
      if (op.cell) {
        var c = findCell(m, op.cell);
        if (!c) throw new Error(op.cell + ' 칸이 없습니다');
        if (op.find != null) { if (!replaceInCell(doc, c, op.find, op.replace)) log.push(op.cell + ': "' + op.find + '"을 찾지 못함'); }
        else writeCell(doc, c, op.text != null ? op.text : '');
        done.push(op.cell); return;
      }
      if (op.para) {
        var p = m.paras.filter(function (x) { return x.id === op.para; })[0];
        if (!p) throw new Error(op.para + ' 문단이 없습니다');
        if (!replaceInPara(doc, p, op.find, op.replace)) log.push(op.para + ': "' + op.find + '"을 찾지 못함');
        done.push(op.para);
      }
    });
    // 표 지우기(작성 방법 상자 등)는 맨 뒤에, 문서 뒤쪽부터 — 앞에서 지우면 뒤 표의 문단 번호가 바뀐다
    drops.sort(function (a, b) { return a.sec !== b.sec ? b.sec - a.sec : (a.para !== b.para ? b.para - a.para : b.path[0].controlIndex - a.path[0].controlIndex); });
    drops.forEach(function (t) {
      doc.deleteTableControl(t.sec, t.para, t.path[0].controlIndex);
      // 표만 있던 문단은 빈 줄로 남지 않게 지운다
      try { if (!doc.getParagraphLength(t.sec, t.para) && doc.getParagraphCount(t.sec) > 1) doc.deleteParagraph(t.sec, t.para); } catch (e) {}
      done.push(t.id + ' 지움');
    });
    return { done: done, log: log };
  }

  // ---------- 그림 ----------
  var HU_PX = 75, HU_MM = 7200 / 25.4; // 1px(96dpi)=75HU, 1mm≈283.46HU
  function bodySize(doc, sec) {
    try {
      var pd = J(doc.getPageDef(sec));
      return { w: pd.width - pd.marginLeft - pd.marginRight - (pd.marginGutter || 0), h: pd.height - pd.marginTop - pd.marginBottom - (pd.marginHeader || 0) - (pd.marginFooter || 0) };
    } catch (e) { return { w: 42520, h: 65000 }; }
  }
  /** 칸 안쪽 크기(HU). 높이는 일부러 키워 둔 칸(사진 칸)일 때만 쓴다 */
  function cellInner(doc, c) {
    var pr = null;
    try { pr = c.path.length === 1 ? J(doc.getCellProperties(c.t.sec, c.t.para, c.path[0].controlIndex, c.idx)) : J(doc.getCellPropertiesByPath(c.t.sec, c.t.para, P(c.path), c.idx)); } catch (e) {}
    if (!pr || !(pr.width > 0)) return null;
    return { w: Math.max(567, pr.width - (pr.paddingLeft || 0) - (pr.paddingRight || 0)), h: pr.height - (pr.paddingTop || 0) - (pr.paddingBottom || 0) };
  }
  function fitSize(img, maxW, maxH, mm) {
    var w = mm > 0 ? mm * HU_MM : img.w * HU_PX, h = w * img.h / img.w;
    var k = Math.min(1, maxW > 0 ? maxW / w : 1, maxH > 0 ? maxH / h : 1);
    return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
  }
  function checkImage(op) {
    var im = op.image;
    if (!im || !im.bytes || !im.bytes.length) throw new Error('그림 바이트가 없습니다(설치판의 Claude 연결로만 넣을 수 있습니다)');
    if (!(im.w > 0 && im.h > 0)) throw new Error((im.name || '그림') + ': 크기를 읽지 못했습니다');
    return im;
  }
  function descOf(im) { return '그림입니다.\r\n원본 그림의 이름: ' + (im.name || '') + '\r\n원본 그림의 크기: 가로 ' + im.w + 'pixel, 세로 ' + im.h + 'pixel'; }
  function images(doc, m, ops) {
    var done = [], log = [], body = [];
    (ops || []).forEach(function (op) {
      var im = checkImage(op);
      if (op.cell) {
        var c = findCell(m, op.cell);
        if (!c) throw new Error(op.cell + ' 칸이 없습니다');
        var inner = cellInner(doc, c), bs = bodySize(doc, c.t.sec);
        var maxW = inner ? inner.w : Math.round(bs.w / 2);
        var maxH = inner && inner.h > 20 * HU_MM ? inner.h : bs.h; // 20mm 넘게 키워 둔 칸이면 그 높이 안에
        var sz = fitSize(im, maxW, maxH, Number(op.width) || 0);
        // 안내문·자리표시("사진 첨부" 등)가 있으면 지우고 넣는다
        if (c.text.trim() && (c.kind === 'guide' || c.kind === 'ph' || op.clear)) writeCell(doc, c, '');
        var cp = P(withPara(c.path, 0));
        var r = J(doc.insertPictureInCell(c.t.sec, c.t.para, 0, cp, im.bytes, sz.w, sz.h, im.w, im.h, im.ext, descOf(im), undefined, undefined));
        if (!r.ok) throw new Error(op.cell + ': 그림을 넣지 못했습니다' + (r.error ? ' — ' + r.error : ''));
        J(doc.setCellPicturePropertiesByPath(c.t.sec, c.t.para, cp, r.controlIdx, JSON.stringify({ treatAsChar: true })));
        done.push(op.cell + ' 그림');
        return;
      }
      if (!op.after) throw new Error('그림 op에는 cell(칸) 또는 after(문단)가 있어야 합니다');
      var at = null;
      if (op.after === 'end') { var ls = doc.getSectionCount() - 1; at = { sec: ls, para: doc.getParagraphCount(ls) - 1 }; }
      else if (/^P\d+$/.test(op.after)) { var pp = m.paras.filter(function (x) { return x.id === op.after; })[0]; if (pp) at = { sec: pp.sec, para: pp.para }; }
      else if (/^B\d+$/.test(op.after) && root.SeoilWrite) { var bb = root.SeoilWrite.outline(doc).filter(function (x) { return x.id === op.after; })[0]; if (bb) at = { sec: bb.sec, para: bb.para }; }
      if (!at) throw new Error(op.after + ' 문단이 없습니다');
      body.push({ op: op, im: im, at: at });
    });
    // 본문은 뒤쪽부터 — 앞에서 넣으면 뒤 문단 번호가 밀린다. 같은 문단 뒤에 여럿이면 보낸 순서가 유지되게 거꾸로.
    body.map(function (b, i) { b.i = i; return b; })
      .sort(function (a, b) { return a.at.sec !== b.at.sec ? b.at.sec - a.at.sec : (a.at.para !== b.at.para ? b.at.para - a.at.para : b.i - a.i); })
      .forEach(function (b) {
        var sec = b.at.sec, np = b.at.para + 1, bs = bodySize(doc, sec);
        J(doc.insertParagraph(sec, np));
        var nl = doc.getParagraphLength(sec, np); if (nl) doc.deleteText(sec, np, 0, nl);
        var sz = fitSize(b.im, bs.w, Math.round(bs.h * 0.9), Number(b.op.width) || 0);
        var r = J(doc.insertPicture(sec, np, 0, '', b.im.bytes, sz.w, sz.h, b.im.w, b.im.h, b.im.ext, descOf(b.im), undefined, undefined));
        if (!r.ok) throw new Error(b.op.after + ' 뒤: 그림을 넣지 못했습니다' + (r.error ? ' — ' + r.error : ''));
        var pi = r.paraIdx != null ? r.paraIdx : np;
        J(doc.setPictureProperties(sec, pi, r.controlIdx, JSON.stringify({ treatAsChar: true })));
        // 그림 문단은 앞 문단의 내어쓰기·들여쓰기를 물려받지 않게 하고 가운데로(align 으로 바꿀 수 있음)
        var al = /^(left|right|center|justify)$/.test(b.op.align || '') ? b.op.align : 'center';
        try { doc.applyParaFormat(sec, pi, JSON.stringify({ alignment: al, indent: 0, marginLeft: 0 })); } catch (e) { log.push('그림 문단 정렬은 못 맞춤'); }
        done.push(b.op.after + ' 뒤 그림');
      });
    return { done: done, log: log };
  }

  /** 원본과 구조가 같은가: 표 수·표마다 칸 수(행 추가로 늘어난 것은 허용) */
  function verify(before, after) {
    var a = before.fpParts, b = after.fpParts, bad = [];
    if (a.length !== b.length) bad.push('표 수가 ' + a.length + '→' + b.length + '개로 바뀜');
    else a.forEach(function (n, i) { if (b[i] < n) bad.push('T' + (i + 1) + ' 칸 수 줄어듦 ' + n + '→' + b[i]); });
    var left = [];
    after.tables.forEach(function (t) { if (!t.guideBox) t.cells.forEach(function (c) { if (c.kind === 'ph') left.push(c.id + ' ' + c.text.slice(0, 30)); }); });
    after.paras.forEach(function (p) { if (p.kind === 'ph') left.push(p.id + ' ' + p.text.slice(0, 30)); });
    var guide = after.tables.filter(function (t) { return t.guideBox; }).map(function (t) { return t.id; });
    return { ok: !bad.length, bad: bad, placeholders: left, guide: guide };
  }

  /** 명단 붙여넣기(엑셀·표 → 탭 구분 글): AI 없이 가장 맞는 표를 고른다 */
  function pickTableForRows(m, header, ncol) {
    var best = null, score = -1;
    m.tables.forEach(function (t) {
      if (t.guideBox) return;
      var heads = t.cells.filter(function (c) { return c.kind === 'text'; }).map(function (c) { return c.text.replace(/\s/g, ''); });
      var s = 0;
      (header || []).forEach(function (h) { h = String(h).replace(/\s/g, ''); if (h && heads.some(function (x) { return x.indexOf(h) >= 0 || h.indexOf(x) >= 0; })) s += 2; });
      var emptyRows = {}; t.cells.forEach(function (c) { if (c.kind === 'empty') emptyRows[c.row] = (emptyRows[c.row] || 0) + 1; });
      var rowsOk = Object.keys(emptyRows).filter(function (r) { return emptyRows[r] >= Math.min(ncol, 2); });
      if (rowsOk.length) s += 1;
      if (s > score) { score = s; best = { t: t, start: rowsOk.length ? Math.min.apply(null, rowsOk.map(Number)) : t.rows }; }
    });
    return score > 0 ? best : null;
  }

  /** 이미 다 쓴 문서인가: 자리표시·안내문이 없고 빈칸이 적다(장식용 빈칸·사진 칸은 남을 수 있음) */
  function looksFilled(m) {
    var all = 0, empty = 0, ph = 0;
    m.tables.forEach(function (t) { if (!t.guideBox) t.cells.forEach(function (c) { if (c.kind === 'box') return; all++; if (c.kind === 'empty') empty++; else if (c.kind === 'ph' || c.kind === 'guide') ph++; }); });
    m.paras.forEach(function (p) { if (p.kind === 'ph') ph++; });
    return all >= 4 && ph === 0 && empty / all < 0.3;
  }

  var api = { looksFilled: looksFilled, scan: scan, mapText: mapText, apply: apply, images: images, verify: verify, pickTableForRows: pickTableForRows, PH: PH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SeoilFill = api;
})(typeof window !== 'undefined' ? window : globalThis);
