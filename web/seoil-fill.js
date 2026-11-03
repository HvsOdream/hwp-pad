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
// 브라우저(window.SeoilFill)와 node 공용.
(function (root) {
  'use strict';
  var PH = /(0{3,}|\d{4}\s?\.\s?0{2}\s?\.\s?0{2}\.?|0{2}월\s?0{2}일|O{2,}|ㅇ{2,}|○{2,}|\bO\b|\(\s*\)|년\s{2,}월\s{2,}일|0{2,}\s?학과|010-0{4}-0{4})/;
  function J(s) { return typeof s === 'string' ? JSON.parse(s) : s; }
  function P(path) { return JSON.stringify(path); }
  function trimLabel(s) { return String(s || '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, ''); }

  // ---------- 읽기 ----------
  function sectionStarts(doc) {
    try { var s = J(doc.getSectionStarts()); if (Array.isArray(s) && s.length) return s.map(function (x) { return typeof x === 'number' ? x : (x.para || x.start || 0); }); } catch (e) {}
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
    var grid = {};
    t.cells.forEach(function (c) { for (var r = c.row; r < c.row + c.rs; r++) for (var k = c.col; k < c.col + c.cs; k++) grid[r + ',' + k] = c; });
    t.cells.forEach(function (c) {
      var left = c.col > 0 ? grid[c.row + ',' + (c.col - 1)] : null;
      var top = null;
      for (var r = c.row - 1; r >= 0; r--) { var u = grid[r + ',' + c.col]; if (u && u !== c && u.text.trim()) { top = u; break; } }
      var l = left && left.text.trim() && left.text.length < 40 ? trimLabel(left.text) : '';
      var h = top && top.text.length < 40 ? trimLabel(top.text) : '';
      c.label = l && h && l !== h ? h + ' / ' + l : (l || h);
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
        rows.push('  ' + c.id + ' [' + (c.label || '?') + '] ' + tag + (c.kind !== 'empty' ? ': ' + c.text.replace(/\n/g, ' / ').slice(0, 140) : ''));
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
    var log = [], done = [];
    (ops || []).forEach(function (op) {
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

  var api = { scan: scan, mapText: mapText, apply: apply, verify: verify, pickTableForRows: pickTableForRows, PH: PH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SeoilFill = api;
})(typeof window !== 'undefined' ? window : globalThis);
