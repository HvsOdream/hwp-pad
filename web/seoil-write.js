// 서일 오피스 — 본문 쓰기 (2026-11-04).
// 계획서·보고서 본문을 양식의 "단계별 스타일"로 쓴다. 들여쓰기·글꼴·□○ 기호를 흉내 내지 않고, 양식에 이미 있는
// 스타일(1. / 가. / 1) / 가) / (1) / □ / ○ / - / 본문)을 문단에 입힌다 → 원본과 같은 모양.
//  levels(doc)   → { '1.': {id, auto:false}, '□': {id, auto:true}, … }  auto = 기호가 스타일에 붙어 있음(글에 기호를 쓰지 않음)
//  outline(doc)  → 본문 문단 목록 [{id:'B12', sec, para, level, text, ctrl}] (표 안 문단 제외)
//  outlineText(o)→ AI에게 보낼 짧은 본문 구조
//  apply(doc, ops) → ops 실행:
//    {under:"B12", items:[{level:"□", text:"…"}, …]}  제목 B12 아래 본문(다음 같은/윗 단계 제목 전까지)을 새 글로 바꿈. 표·그림 문단은 남김
//    {after:"B15", items:[…]}                         B15 바로 뒤에 새 문단들을 넣음
//    {chapter:"추진 계획", after:"B30"}               장 제목 상자(Ⅰ. 서론 같은)를 복제해 새 장을 만듦(번호는 자동으로 다음 로마 숫자)
//    {reformat:"all" | "B10-B30"}                     손으로 친 □○- 문단을 알맞은 단계 스타일로 다시 맞춤("동일한 문단 형식으로")
(function (root) {
  'use strict';
  function J(s) { return typeof s === 'string' ? JSON.parse(s) : s; }
  var HEADS = ['Ⅰ', '1.', '가.', '1)', '가)', '(1)'];          // 위일수록 큰 제목
  var BODY = ['□', '○', '-', '·', '본문'];
  var ORDER = HEADS.concat(BODY);
  var ROMAN = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'];
  function rank(level) { var i = ORDER.indexOf(level); return i < 0 ? 99 : i; }
  function isHead(level) { return HEADS.indexOf(level) >= 0; }

  function bulletLevel(ch) {
    if (/[□☐▢]/.test(ch)) return '□';
    if (/[❍○◦o◯]/.test(ch)) return '○';
    if (/[-–—]/.test(ch)) return '-';
    if (/[·•▪∙]/.test(ch)) return '·';
    return null;
  }
  function nameLevel(name) {
    var n = String(name || '').replace(/\s/g, '');
    if (n === '1.') return '1.'; if (n === '가.') return '가.'; if (n === '1)') return '1)';
    if (n === '가)') return '가)'; if (n === '(1)') return '(1)';
    if (/^본문/.test(n)) return '본문';
    return null;
  }

  // ---------- 양식의 단계별 스타일 ----------
  var cache = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  function levels(doc) {
    if (cache && cache.get(doc)) return cache.get(doc);
    var bullets = {}; try { J(doc.getBulletList()).forEach(function (b) { bullets[b.id] = b.char; }); } catch (e) {}
    var used = {}; // 스타일별 실제 사용 횟수 — 같은 단계 후보가 여럿이면 많이 쓴 쪽
    var nsec = doc.getSectionCount();
    for (var s = 0; s < nsec; s++) for (var p = 0, n = doc.getParagraphCount(s); p < n; p++) { try { var st = J(doc.getStyleAt(s, p)); used[st.id] = (used[st.id] || 0) + 1; } catch (e) {} }
    var out = {}, list = []; try { list = J(doc.getStyleList()); } catch (e) {}
    list.forEach(function (st) {
      var lv = nameLevel(st.name), auto = false, det = null;
      try { det = J(doc.getStyleDetail(st.id)); } catch (e) {}
      var pp = det && det.paraProps;
      if (pp && pp.headType === 'Bullet' && bullets[pp.numberingId]) { var b = bulletLevel(bullets[pp.numberingId]); if (b) { lv = b; auto = true; } }
      if (!lv) return;
      var c = out[lv];
      if (!c || (used[st.id] || 0) > (used[c.id] || 0)) out[lv] = { id: st.id, name: st.name, auto: auto, cs: st.charShapeId, ps: st.paraShapeId };
    });
    if (!out['본문']) { var base = list.filter(function (st) { return st.name === '바탕글'; })[0]; if (base) out['본문'] = { id: base.id, name: base.name, auto: false, cs: base.charShapeId, ps: base.paraShapeId }; }
    if (cache) cache.set(doc, out);
    return out;
  }

  // ---------- 본문 구조 ----------
  function textOf(doc, s, p) { var L = doc.getParagraphLength(s, p); return L ? String(doc.getTextRange(s, p, 0, L)).replace(/[\u0000-\u001f￼]/g, '') : ''; }
  function ctrlCount(doc, s, p) { try { return J(doc.getControlTextPositions(s, p)).length; } catch (e) { return 0; } }
  /** 문단 하나의 단계: 스타일 → 글머리 글자 순으로 본다 */
  function levelOf(doc, lv, s, p, text) {
    var st = null; try { st = J(doc.getStyleAt(s, p)); } catch (e) {}
    if (st) for (var k in lv) if (lv[k].id === st.id && k !== '본문') return k;
    if (st && /^󰊱|^[-\u{F0000}-\u{FFFFD}]/u.test(st.name || '') && !text.trim()) return 'Ⅰ?';
    var t = text.replace(/^\s+/, '');
    if (/^[□☐]/.test(t)) return '□';
    if (/^[❍○◦◯]/.test(t)) return '○';
    if (/^[-–]\s/.test(t)) return '-';
    if (/^[·•▪]\s?/.test(t)) return '·';
    if (/^\d{1,2}\.\s/.test(t)) return '1.';
    if (/^[가-하]\.\s/.test(t)) return '가.';
    if (/^\d+\)\s/.test(t)) return '1)';
    if (/^[가-하]\)\s/.test(t)) return '가)';
    if (/^\(\d+\)\s/.test(t)) return '(1)';
    return '본문';
  }
  /** 장 제목 상자: 표 하나짜리 문단, 칸에 Ⅰ. 같은 로마 숫자 + 제목 */
  function chapterOf(doc, s, p) {
    try {
      var path = JSON.stringify([{ controlIndex: 0, cellIndex: 0, cellParaIndex: 0 }]);
      var dims = J(doc.getTableDimensionsByPath(s, p, path));
      if (dims.cellCount > 4) return null;
      var texts = [];
      for (var c = 0; c < dims.cellCount; c++) {
        var cp = JSON.stringify([{ controlIndex: 0, cellIndex: c, cellParaIndex: 0 }]);
        var L = doc.getCellParagraphLengthByPath(s, p, cp);
        texts.push(L ? String(doc.getTextInCellByPath(s, p, cp, 0, L)).trim() : '');
      }
      var ri = -1; texts.forEach(function (t, i) { if (ri < 0 && /^(Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|Ⅵ|Ⅶ|Ⅷ|Ⅸ|Ⅹ|I|II|III|IV|V|VI)\.?$/.test(t)) ri = i; });
      if (ri < 0) return null;
      var ti = -1; texts.forEach(function (t, i) { if (ti < 0 && i !== ri && t) ti = i; });
      return { roman: texts[ri], title: ti >= 0 ? texts[ti] : '', romanCell: ri, titleCell: ti };
    } catch (e) { return null; }
  }
  /** 표·그림·도형이 있는 문단(구역별 문단 번호). 책갈피 같은 보이지 않는 컨트롤은 셈하지 않는다 */
  function objectParas(doc) {
    var set = {}, starts = [0];
    try { var ss = J(doc.getSectionStarts()); if (Array.isArray(ss) && ss.length) starts = ss.map(function (x) { return typeof x === 'number' ? x : (x.para || x.start || 0); }); } catch (e) {}
    try {
      J(doc.getObjects()).forEach(function (ob) {
        if (!/table|picture|image|shape|equation|chart|ole|textbox|group/i.test(ob.kind || '')) return;
        for (var i = starts.length - 1; i >= 0; i--) if (ob.para >= starts[i]) { set[i + ':' + (ob.para - starts[i])] = true; break; }
      });
    } catch (e) {}
    return set;
  }
  function outline(doc) {
    var lv = levels(doc), out = [], nsec = doc.getSectionCount(), k = 0, objs = objectParas(doc);
    for (var s = 0; s < nsec; s++) for (var p = 0, n = doc.getParagraphCount(s); p < n; p++) {
      var t = textOf(doc, s, p), c = objs[s + ':' + p] ? 1 : 0, level;
      var ch = c ? chapterOf(doc, s, p) : null;
      if (ch) { level = 'Ⅰ'; t = ch.roman + ' ' + ch.title; }
      else level = levelOf(doc, lv, s, p, t);
      if (level === 'Ⅰ?') level = '본문';
      out.push({ id: 'B' + (++k), sec: s, para: p, level: level, text: t, ctrl: c, chapter: ch });
    }
    // 첫 장 제목 상자 앞(표지·제출문·목차)은 본문이 아니다
    var first = -1; out.some(function (b, i) { if (b.level === 'Ⅰ') { first = i; return true; } return false; });
    for (var i = 0; i < first; i++) { out[i].level = '표지'; }
    return out;
  }
  /** AI에게 보낼 본문 구조: 제목은 다 보이고, 본문 글은 앞부분만. 빈 문단·표지 앞부분은 줄인다 */
  function outlineText(o, opt) {
    opt = opt || {};
    var L = [];
    o.forEach(function (b) {
      if (b.level === '표지' && !opt.all) return;
      if (!b.text.trim() && !b.ctrl) return;
      var ind = isHead(b.level) ? '' : '  ';
      var t = b.ctrl && !b.text.trim() ? '(표·그림)' : b.text.slice(0, isHead(b.level) ? 80 : (opt.full ? 400 : 60));
      L.push(b.id + ' ' + ind + '[' + b.level + '] ' + t);
    });

    return L.join('\n');
  }

  // ---------- 쓰기 ----------
  function find(o, id) { for (var i = 0; i < o.length; i++) if (o[i].id === id) return i; return -1; }
  function stripMark(level, text, auto) {
    var t = String(text || '').replace(/^\s+/, '');
    if (level !== '본문' && (auto || BODY.indexOf(level) >= 0)) t = t.replace(/^[□☐❍○◦◯·•▪]\s*/, '').replace(/^[-–]\s+/, '');
    return t;
  }
  /** (sec, para) 뒤에 문단 하나: 빈 문단을 만들고 → 글 넣고 → 단계 스타일·글자 모양 */
  function insertAfter(doc, lv, sec, para, level, text) {
    // 새 빈 문단을 anchor 바로 뒤에 만든다(나누기는 표가 든 문단에서 표를 옮길 수 있어 쓰지 않음)
    var np = para + 1;
    J(doc.insertParagraph(sec, np));
    var nl = doc.getParagraphLength(sec, np);
    if (nl) doc.deleteText(sec, np, 0, nl);
    var key = lv[level] ? level : (level === '·' && lv['-'] ? '-' : (BODY.indexOf(level) >= 0 ? '본문' : level));
    var st = lv[key] || lv['본문'];
    var t = stripMark(level, text, st && st.auto);
    if (!st || !st.auto) {
      // 기호가 스타일에 없으면 글에 붙인다(□ ○ -), 제목은 AI가 번호까지 씀
      if (level === '□' && !/^□/.test(t)) t = '□ ' + t;
      else if (level === '○' && !/^[❍○]/.test(t)) t = '❍ ' + t;
      else if ((level === '-' || level === '·') && !/^[-·]/.test(t)) t = (level === '-' ? '- ' : '· ') + t;
    }
    if (t) doc.insertText(sec, np, 0, t);
    if (st) {
      doc.applyStyle(sec, np, st.id);
      // 새 문단은 앞 문단의 문단 모양(쪽 나눔 등)을 물려받으므로 스타일의 문단 모양으로 덮는다
      if (st.ps != null) { try { doc.setParaShapeId(sec, np, st.ps); } catch (e) {} }
      // 나눈 문단은 앞 문단의 글자 모양을 물려받으므로, 스타일의 글자 모양으로 덮는다
      var len = doc.getParagraphLength(sec, np);
      if (len && st.cs != null) { try { doc.setCharShapeId(sec, np, 0, len, st.cs); } catch (e) {} }
    }
    return np;
  }
  function isBoundary(b, level) { return b.level === 'Ⅰ' || (isHead(b.level) && rank(b.level) <= rank(level)); }

  function writeUnder(doc, lv, o, op, log) {
    var i = find(o, op.under); if (i < 0) throw new Error(op.under + ' 문단이 없습니다');
    var h = o[i], j = i + 1;
    while (j < o.length && o[j].sec === h.sec && !isBoundary(o[j], h.level === 'Ⅰ' ? 'Ⅰ' : h.level)) j++;
    // 제목만 바꾸는 경우(같은 단계 항목 하나뿐)는 아래 본문을 건드리지 않는다
    var renameOnly = (op.items || []).length === 1 && op.items[0].level === h.level;
    if (renameOnly) j = i + 1;
    // 지울 문단: 표·그림이 없는 글 문단만(뒤에서부터)
    var kept = 0;
    for (var k = j - 1; k > i; k--) {
      var b = o[k];
      if (b.ctrl) { kept++; continue; }
      doc.deleteParagraph(b.sec, b.para);
    }
    if (kept) log.push(h.id + ' 아래 표·그림 ' + kept + '개는 그대로 두었습니다');
    var items = (op.items || []).slice(), at = h.para, n = 0;
    // 첫 항목이 같은 단계 제목이면 제목 자체를 바꾼다(예: "1. 절 제목" → "1. 추진 배경")
    if (items.length && items[0].level === h.level) {
      var first = items.shift();
      if (h.level === 'Ⅰ' && h.chapter) { if (h.chapter.titleCell >= 0) setCell(doc, h.sec, h.para, h.chapter.titleCell, String(first.text).replace(/^\s*(Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|Ⅵ|Ⅶ|Ⅷ|Ⅸ|Ⅹ)\.?\s*/, '')); }
      else { var L = doc.getParagraphLength(h.sec, h.para); if (L) doc.deleteText(h.sec, h.para, 0, L); if (first.text) doc.insertText(h.sec, h.para, 0, first.text); }
    }
    items.forEach(function (it) { at = insertAfter(doc, lv, h.sec, at, it.level, it.text); n++; });
    return n;
  }
  function writeAfter(doc, lv, o, op) {
    var i = op.after === 'end' ? o.length - 1 : find(o, op.after); if (i < 0) throw new Error(op.after + ' 문단이 없습니다');
    var b = o[i], at = b.para, n = 0;
    (op.items || []).forEach(function (it) { at = insertAfter(doc, lv, b.sec, at, it.level, it.text); n++; });
    return n;
  }
  /** 장 제목 상자 복제: 마지막(또는 지정) 장 상자를 복사해 붙이고 번호·제목을 바꾼다 */
  function addChapter(doc, lv, o, op) {
    var boxes = o.filter(function (b) { return b.level === 'Ⅰ' && b.chapter; });
    if (!boxes.length) throw new Error('이 양식에는 장 제목 상자가 없습니다');
    var src = boxes[boxes.length - 1];
    var ai = op.after === 'end' || !op.after ? o.length - 1 : find(o, op.after);
    if (ai < 0) throw new Error(op.after + ' 문단이 없습니다');
    var b = o[ai];
    doc.copyControl(src.sec, src.para, '', 0);
    var np = insertAfter(doc, lv, b.sec, b.para, '본문', '');
    // 원본 장 상자 문단의 스타일·모양을 따른다
    try { var st = J(doc.getStyleAt(src.sec, src.para)); doc.applyStyle(b.sec, np, st.id); } catch (e) {}
    var pr = J(doc.pasteControl(b.sec, np, 0));
    if (pr.paraIdx != null) np = pr.paraIdx;
    // 붙여넣기가 뒤에 만든 빈 문단은 지운다
    try { if (np + 1 < doc.getParagraphCount(b.sec) && !doc.getParagraphLength(b.sec, np + 1) && !J(doc.getControlTextPositions(b.sec, np + 1)).length) doc.deleteParagraph(b.sec, np + 1); } catch (e) {}
    // 새 장은 새 쪽에서
    try { doc.applyParaFormat(b.sec, np, JSON.stringify({ pageBreakBefore: true })); } catch (e) {}
    var ch = chapterOf(doc, b.sec, np);
    var num = ROMAN[Math.min(boxes.length, ROMAN.length - 1)];
    if (ch) {
      setCell(doc, b.sec, np, ch.romanCell, (/\.$/.test(ch.roman) ? num + '.' : num));
      if (ch.titleCell >= 0) setCell(doc, b.sec, np, ch.titleCell, op.chapter);
    }
    return np;
  }
  function setCell(doc, s, p, cell, text) {
    var cp = JSON.stringify([{ controlIndex: 0, cellIndex: cell, cellParaIndex: 0 }]);
    var L = doc.getCellParagraphLengthByPath(s, p, cp);
    if (L) doc.deleteTextInCellByPath(s, p, cp, 0, L);
    if (text) doc.insertTextInCellByPath(s, p, cp, 0, text);
  }
  /** 동일한 문단 형식으로: 글머리·번호로 단계를 알아보고 그 단계 스타일을 입힌다 */
  function reformat(doc, lv, o, range) {
    var a = 0, z = o.length - 1;
    if (range && range !== 'all') { var m = String(range).split('-'); a = find(o, m[0]); z = find(o, m[1] || m[0]); if (a < 0 || z < 0) throw new Error(range + ' 범위를 찾지 못했습니다'); }
    var n = 0;
    for (var i = a; i <= z; i++) {
      var b = o[i]; if (b.ctrl || !b.text.trim() || b.level === 'Ⅰ') continue;
      var t = b.text.replace(/^\s+/, ''), level = null;
      if (/^[□☐]/.test(t)) level = '□'; else if (/^[❍○◦◯]/.test(t)) level = '○'; else if (/^[-–]\s/.test(t)) level = '-';
      else if (/^\d+\.\s/.test(t)) level = '1.'; else if (/^[가-하]\.\s/.test(t)) level = '가.'; else if (/^\d+\)\s/.test(t)) level = '1)'; else if (/^[가-하]\)\s/.test(t)) level = '가)'; else if (/^\(\d+\)\s/.test(t)) level = '(1)';
      if (!level || !lv[level]) continue;
      var st = lv[level];
      if (st.auto) { var lead = b.text.length - b.text.replace(/^\s*[□☐❍○◦◯·•▪]\s*/, '').replace(/^\s*[-–]\s+/, '').length; if (lead > 0) doc.deleteText(b.sec, b.para, 0, lead); }
      else { var sp = b.text.length - b.text.replace(/^\s+/, '').length; if (sp > 0) doc.deleteText(b.sec, b.para, 0, sp); }
      doc.applyStyle(b.sec, b.para, st.id); n++;
    }
    return n;
  }

  function apply(doc, ops) {
    var lv = levels(doc), log = [], done = [], total = 0;
    (ops || []).forEach(function (op) {
      var o = outline(doc); // 매 op마다 다시(문단 번호가 바뀌므로)
      if (op.under) { total += writeUnder(doc, lv, o, op, log); done.push(op.under + ' 아래'); }
      else if (op.after) { if (op.chapter) { addChapter(doc, lv, o, op); done.push('새 장 ' + op.chapter); } else { total += writeAfter(doc, lv, o, op); done.push(op.after + ' 뒤'); } }
      else if (op.chapter) { addChapter(doc, lv, o, op); done.push('새 장 ' + op.chapter); }
      else if (op.reformat) { var n = reformat(doc, lv, o, op.reformat); done.push('형식 맞춤 ' + n + '문단'); }
    });
    return { done: done, log: log, paragraphs: total };
  }

  // ---------- 부분 강조 ----------
  // op: {emph:"all"|"B12"|"P5"|"T2.r0c1", find:"핵심 문구", style:"bold"|"underline"|"red"|"blue"|"shade"|"bold+red"…}
  // find가 없으면 그 문단·칸 전체. 같은 문구가 여러 번 있으면 모두.
  var EMPH = {
    bold: { bold: true }, '굵게': { bold: true },
    underline: { underline: true, underlineType: 'Bottom' }, '밑줄': { underline: true, underlineType: 'Bottom' },
    italic: { italic: true }, '기울임': { italic: true },
    red: { textColor: '#C00000' }, '빨강': { textColor: '#C00000' },
    blue: { textColor: '#0050B4' }, '파랑': { textColor: '#0050B4' },
    shade: { shadeColor: '#FFF2A8' }, '형광': { shadeColor: '#FFF2A8' },
  };
  function emphProps(style) {
    var props = {};
    String(style || 'bold').split(/[+,\s]+/).forEach(function (k) { var p = EMPH[k.toLowerCase()] || EMPH[k]; if (p) Object.keys(p).forEach(function (x) { props[x] = p[x]; }); });
    if (!Object.keys(props).length) props.bold = true;
    return JSON.stringify(props);
  }
  function rawText(doc, s, p) { var L = doc.getParagraphLength(s, p); return L ? String(doc.getTextRange(s, p, 0, L)) : ''; }
  function hits(text, find) {
    var r = []; if (!find) { return text.trim() ? [[0, text.length]] : r; }
    for (var at = text.indexOf(find); at >= 0; at = text.indexOf(find, at + find.length)) r.push([at, find.length]);
    return r;
  }
  function emphasize(doc, ops) {
    var log = [], done = [];
    (ops || []).forEach(function (op) {
      var props = emphProps(op.style), id = String(op.emph || 'all'), find = op.find || '', n = 0;
      var paras = [], cells = [];
      if (/^B\d+$/.test(id)) { var o = outline(doc); for (var i = 0; i < o.length; i++) if (o[i].id === id) paras.push(o[i]); }
      else if (/^P\d+$/.test(id) || /^T\d+/.test(id) || id === 'all') {
        var m = root.SeoilFill ? root.SeoilFill.scan(doc) : { paras: [], tables: [] };
        if (id === 'all') {
          if (!find) { log.push('강조: 전체에는 찾을 글(find)이 필요함'); return; }
          for (var s = 0; s < doc.getSectionCount(); s++) for (var p = 0, np = doc.getParagraphCount(s); p < np; p++) paras.push({ sec: s, para: p });
          m.tables.forEach(function (t) { t.cells.forEach(function (c) { cells.push(c); }); });
        } else if (id[0] === 'P') paras = m.paras.filter(function (x) { return x.id === id; });
        else m.tables.forEach(function (t) { t.cells.forEach(function (c) { if (c.id === id || (id === t.id)) cells.push(c); }); });
      }
      paras.forEach(function (b) {
        hits(rawText(doc, b.sec, b.para), find).forEach(function (h) { doc.applyCharFormat(b.sec, b.para, h[0], h[0] + h[1], props); n++; });
      });
      cells.forEach(function (c) {
        if (c.path.length !== 1) return; // 표 안의 표는 아직 못 함
        var ctrl = c.path[0].controlIndex, cnt = doc.getCellParagraphCountByPath(c.t.sec, c.t.para, JSON.stringify(c.path));
        for (var k = 0; k < cnt; k++) {
          var pp = c.path.slice(); pp[0] = Object.assign({}, pp[0], { cellParaIndex: k });
          var L = doc.getCellParagraphLengthByPath(c.t.sec, c.t.para, JSON.stringify(pp));
          var tx = L ? String(doc.getTextInCellByPath(c.t.sec, c.t.para, JSON.stringify(pp), 0, L)) : '';
          hits(tx, find).forEach(function (h) { doc.applyCharFormatInCell(c.t.sec, c.t.para, ctrl, c.idx, k, h[0], h[0] + h[1], props); n++; });
        }
      });
      if (n) done.push('강조 ' + (find ? '"' + find.slice(0, 20) + '"' : id) + (n > 1 ? ' ' + n + '곳' : ''));
      else log.push('강조: ' + (find ? '"' + find + '"을 ' : '') + id + '에서 찾지 못함');
    });
    return { done: done, log: log };
  }

  /** 이 문서가 본문 쓰기를 할 만한가: 단계 스타일이 3개 이상 */
  function supports(doc) { var lv = levels(doc), n = 0; ['1.', '가.', '□', '○', '-'].forEach(function (k) { if (lv[k]) n++; }); return n >= 3; }

  var api = { levels: levels, outline: outline, outlineText: outlineText, apply: apply, emphasize: emphasize, supports: supports, HEADS: HEADS, BODY: BODY };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SeoilWrite = api;
})(typeof window !== 'undefined' ? window : globalThis);
