// 서일 오피스 — 학교 양식 칸 쓰기 (2026-11-02).
// 원본 양식을 베끼지 않고, 열린 문서의 누름틀·본문 칸에 직접 쓴다. 문단 모양(번호·들여쓰기·글자)은
// 양식에 이미 있는 문단에서 단계별로 골라 그대로 붙인다. 브라우저(window.SeoilForm)와 node(module.exports) 공용.
(function (root) {
  'use strict';

  function J(s) { return typeof s === 'string' ? JSON.parse(s) : s; }

  function fieldMap(doc) {
    var out = {};
    J(doc.getFieldList()).forEach(function (f) { if (!(f.name in out)) out[f.name] = f; });
    return out;
  }

  function cellRef(f) {
    var L = f.location, c = L.path && L.path[0];
    if (!c || c.type !== 'cell') return null;
    return { s: L.sectionIndex, p: L.paraIndex, c: c.controlIndex, cell: c.cellIndex };
  }

  function readCell(doc, r) {
    var n = doc.getCellParagraphCount(r.s, r.p, r.c, r.cell), paras = [];
    for (var i = 0; i < n; i++) {
      var len = doc.getCellParagraphLength(r.s, r.p, r.c, r.cell, i);
      var text = len ? doc.getTextInCell(r.s, r.p, r.c, r.cell, i, 0, len) : '';
      var pp = J(doc.getCellParaPropertiesAt(r.s, r.p, r.c, r.cell, i));
      var cp = J(doc.getCellCharPropertiesAt(r.s, r.p, r.c, r.cell, i, 0));
      paras.push({ i: i, len: len, text: text, ps: pp.paraShapeId, cs: cp.charShapeId, numbered: pp.headType === 'Number' });
    }
    return paras;
  }

  // 양식 안의 문단에서 단계별 모양을 고른다: num(자동 번호 1. 2.), sub(가. 나.), attach(붙임), cont(붙임 둘째 줄 이후)
  function styles(paras) {
    var st = {};
    paras.forEach(function (p) {
      if (p.numbered && !st.num) st.num = { ps: p.ps, cs: p.cs, prefix: '' };
      else if (/^\s*[가-하]\.\s/.test(p.text) && !st.sub) st.sub = { ps: p.ps, cs: p.cs, prefix: p.text.match(/^\s*/)[0] };
      else if (/^붙임/.test(p.text) && !st.attach) st.attach = { ps: p.ps, cs: p.cs, gap: (p.text.match(/^붙임(\s*)/) || [])[1] || '  ' };
      else if (st.attach && !st.cont && /^\s+\d+\./.test(p.text)) st.cont = { ps: p.ps, cs: p.cs, prefix: p.text.match(/^\s*/)[0] };
    });
    var plain = paras.find(function (p) { return !p.numbered; }) || paras[0];
    st.plain = { ps: plain.ps, cs: plain.cs, prefix: '' };
    if (!st.num) st.num = { ps: st.plain.ps, cs: st.plain.cs, prefix: '', manual: true };
    if (!st.sub) st.sub = { ps: st.plain.ps, cs: st.plain.cs, prefix: '  ' };
    if (!st.attach) st.attach = { ps: st.plain.ps, cs: st.plain.cs, gap: '  ' };
    if (!st.cont) st.cont = { ps: st.attach.ps, cs: st.attach.cs, prefix: '      ' };
    return st;
  }

  /** 열린 문서가 아는 양식인지 본다. 지금은 서일대 업무협조전(그룹웨어 기안 양식). */
  function detect(doc) {
    var fm = fieldMap(doc);
    if (!fm.body || !fm.doctitle) return null;
    var r = cellRef(fm.body);
    if (!r) return null;
    var paras = readCell(doc, r);
    return {
      kind: (fm.organ && fm.organ.value.trim()) || '기안문',
      fields: {
        recipient: fm.recipient ? fm.recipient.value : '',
        doctitle: fm.doctitle.value,
        refers: fm.refers ? fm.refers.value : '',
      },
      body: paras.map(function (p) { return p.text; }),
      bodyRef: r,
      styles: styles(paras),
    };
  }

  // 본문 줄 목록 → 실제 문단 목록 {text, ps, cs}
  function layout(st, lines, attachments) {
    var out = [], n = 0;
    (lines || []).forEach(function (ln) {
      var lv = ln.level === 'sub' ? 'sub' : ln.level === 'plain' ? 'plain' : 'num';
      var s = st[lv], t = String(ln.text || '').replace(/^\s+/, '');
      if (lv === 'num') { n++; t = s.manual ? n + '. ' + t.replace(/^\d+\.\s*/, '') : t.replace(/^\d+\.\s*/, ''); }
      out.push({ text: s.prefix + t, ps: s.ps, cs: s.cs });
    });
    var att = (attachments || []).filter(Boolean);
    if (att.length === 1) {
      out.push({ text: '붙임' + st.attach.gap + att[0], ps: st.attach.ps, cs: st.attach.cs });
    } else if (att.length > 1) {
      att.forEach(function (a, i) {
        var s = i ? st.cont : st.attach;
        out.push({ text: (i ? s.prefix : '붙임' + st.attach.gap) + (i + 1) + '. ' + a, ps: s.ps, cs: s.cs });
      });
    }
    if (out.length) out[out.length - 1].text = out[out.length - 1].text.replace(/\s*끝\.?\s*$/, '') + '  끝.';
    return out;
  }

  function writePara(doc, r, i, para) {
    var len = doc.getCellParagraphLength(r.s, r.p, r.c, r.cell, i);
    if (len) doc.deleteTextInCell(r.s, r.p, r.c, r.cell, i, 0, len);
    if (para.text) doc.insertTextInCell(r.s, r.p, r.c, r.cell, i, 0, para.text);
    doc.setCellParaShapeId(r.s, r.p, r.c, r.cell, i, para.ps);
    var n = doc.getCellParagraphLength(r.s, r.p, r.c, r.cell, i);
    if (n) doc.setCharShapeIdInCell(r.s, r.p, r.c, r.cell, i, 0, n, para.cs);
  }

  /**
   * 칸 채우기. spec = { recipient?, doctitle?, refers?, body?: [{level:'num'|'sub'|'plain', text}], attachments?: [] }
   * body가 오면 본문 칸의 문단을 통째로 다시 쓴다(첫 문단은 누름틀 'body'를 살린다).
   */
  function apply(doc, spec) {
    var info = detect(doc);
    if (!info) throw new Error('알 수 없는 양식입니다 (body/doctitle 누름틀 없음)');
    var done = [];
    ['recipient', 'doctitle', 'refers'].forEach(function (k) {
      if (typeof spec[k] === 'string') {
        var res = J(doc.setFieldValueByName(k, spec[k]));
        if (!res.ok) throw new Error(k + ' 칸 쓰기 실패');
        done.push(k);
      }
    });
    if (spec.body || spec.attachments) {
      var r = info.bodyRef, want = layout(info.styles, spec.body, spec.attachments);
      if (!want.length) throw new Error('본문이 비었습니다');
      var have = doc.getCellParagraphCount(r.s, r.p, r.c, r.cell);
      // 모자란 문단은 마지막 문단 끝에서 나눠 늘리고, 남는 문단은 비운 뒤 앞 문단에 붙여 없앤다
      while (have < want.length) {
        var last = have - 1, L = doc.getCellParagraphLength(r.s, r.p, r.c, r.cell, last);
        doc.splitParagraphInCell(r.s, r.p, r.c, r.cell, last, L);
        have++;
      }
      while (have > want.length) {
        var k = have - 1, kl = doc.getCellParagraphLength(r.s, r.p, r.c, r.cell, k);
        if (kl) doc.deleteTextInCell(r.s, r.p, r.c, r.cell, k, 0, kl);
        doc.mergeParagraphInCell(r.s, r.p, r.c, r.cell, k);
        have--;
      }
      // 첫 문단: 누름틀 값으로 쓴다(누름틀 표식 보존), 뒤에 남은 글자는 지운다
      doc.setFieldValueByName('body', want[0].text);
      var f0 = fieldMap(doc).body, l0 = doc.getCellParagraphLength(r.s, r.p, r.c, r.cell, 0);
      if (f0.endCharIdx < l0) doc.deleteTextInCell(r.s, r.p, r.c, r.cell, 0, f0.endCharIdx, l0 - f0.endCharIdx);
      doc.setCellParaShapeId(r.s, r.p, r.c, r.cell, 0, want[0].ps);
      for (var i = 1; i < want.length; i++) writePara(doc, r, i, want[i]);
      done.push('body');
    }
    return done;
  }

  // 남은 예시 글자 찾기: 000, 2023.00.00., ○, ○○ 같은 양식 자리표시
  var PLACEHOLDER = /(0{3,}|\d{4}\.00\.00\.?|○+|□□+|00관|0학년|0명|0원|\(0학과\))/;
  function check(doc) {
    var info = detect(doc);
    if (!info) return null;
    var left = [];
    Object.keys(info.fields).forEach(function (k) { var m = String(info.fields[k]).match(PLACEHOLDER); if (m) left.push({ where: k, text: info.fields[k], hit: m[0] }); });
    info.body.forEach(function (t, i) { var m = t.match(PLACEHOLDER); if (m) left.push({ where: 'body', line: i, text: t, hit: m[0] }); });
    return { filled: { recipient: !!info.fields.recipient.trim(), doctitle: !!info.fields.doctitle.trim(), body: info.body.join('').trim().length > 10 }, left: left };
  }

  var api = { detect: detect, apply: apply, check: check, layout: layout };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SeoilForm = api;
})(typeof window !== 'undefined' ? window : globalThis);
