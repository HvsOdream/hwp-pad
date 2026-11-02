// 서일 오피스 — AI 작성 도우미 패널 (SO-02, 2026-11-02 시제품).
// 편집기 오른쪽에 붙어 열린 학교 양식(지금은 업무협조전)의 칸을 대화로 채운다.
// - 문서는 window.rhwpStudio.ai.doc()(patches/ai-bridge.mjs)로 받은 WASM 문서에 SeoilForm(seoil-form.js)으로 직접 쓴다.
// - AI는 Claude API를 브라우저에서 바로 부른다(파일럿: 각자 API 키를 이 기기에만 저장). 나중에 교내 sLLM 주소로 바꾼다.
// - ?ai=mock 이면 API 없이 정해진 답으로 흐름만 시험한다.
(function () {
  'use strict';
  var LS_KEY = 'seoil.ai.key', LS_MODEL = 'seoil.ai.model', LS_DEPT = 'seoil.ai.dept', LS_URL = 'seoil.ai.url';
  var DEFAULT_MODEL = 'claude-sonnet-5-5';
  var DEFAULT_URL = 'https://api.anthropic.com/v1/messages';
  var LS_DEV = 'seoil.ai.dev', LS_MOCK = 'seoil.ai.mock';
  // 개발자 모드: 주소에 ?dev=1(끄기 ?dev=0), 또는 패널 제목을 5번 누르기. 키 넣기·빼기, 모델, 서버 주소, 시험 모드는 여기서만.
  (function () {
    var m = location.search.match(/[?&]dev=([01])\b/);
    if (m) { try { if (m[1] === '1') localStorage.setItem('seoil.ai.dev', '1'); else localStorage.removeItem('seoil.ai.dev'); } catch (e) {} }
  })();
  function isDev() { return ls(LS_DEV) === '1'; }
  function isMock() { return /[?&]ai=mock\b/.test(location.search) || ls(LS_MOCK) === '1'; }
  var W = 380;

  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k) || ''; if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return ''; }
  }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'style') e.style.cssText = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function bridge() { return window.rhwpStudio && window.rhwpStudio.ai; }
  function doc() { var b = bridge(); return b && b.doc(); }

  // ---------- 스타일 ----------
  var css = [
    '#seoil-ai{position:fixed;top:0;right:0;bottom:0;width:' + W + 'px;max-width:100vw;background:#fff;border-left:1px solid #D9DCE1;z-index:2147482000;display:none;flex-direction:column;font:13px/1.6 "Noto Sans KR",system-ui,-apple-system,sans-serif;color:#1C1F23;box-shadow:-4px 0 16px rgba(0,0,0,.06)}',
    '#seoil-ai.open{display:flex}',
    'body.seoil-ai-open{padding-right:' + W + 'px!important;box-sizing:border-box}',
    '#seoil-ai *{box-sizing:border-box}',
    '#seoil-ai .hd{padding:12px 14px;border-bottom:1px solid #ECEEF1;display:flex;flex-direction:column;gap:8px}',
    '#seoil-ai .row{display:flex;align-items:center;gap:8px}',
    '#seoil-ai .badge{font-size:11px;padding:1px 8px;border-radius:10px;background:#EEF2FD;color:#2F5BEA}',
    '#seoil-ai .ibtn{border:0;background:transparent;font:inherit;color:#5F6670;padding:4px 6px;border-radius:6px;cursor:pointer}',
    '#seoil-ai .ibtn:hover{background:#F4F5F7}',
    '#seoil-ai .bar{height:6px;background:#ECEEF1;border-radius:3px;overflow:hidden}#seoil-ai .bar>i{display:block;height:6px;background:#2F5BEA;width:0;transition:width .3s}',
    '#seoil-ai .chk{display:flex;flex-wrap:wrap;gap:4px}#seoil-ai .chk span{font-size:11px;padding:1px 8px;border-radius:10px;background:#F4F5F7;color:#5F6670}#seoil-ai .chk span.ok{background:#EAF6EF;color:#1E8E5A}',
    '#seoil-ai .log{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}',
    '#seoil-ai .ai{background:#F4F5F7;border-radius:10px;padding:9px 12px;white-space:pre-wrap;align-self:flex-start;max-width:95%}',
    '#seoil-ai .me{background:#2F5BEA;color:#fff;border-radius:10px;padding:9px 12px;white-space:pre-wrap;align-self:flex-end;max-width:85%}',
    '#seoil-ai .sys{font-size:12px;color:#5F6670;align-self:center;text-align:center}',
    '#seoil-ai .err{background:#FDECEC;color:#B42318;border-radius:10px;padding:9px 12px;white-space:pre-wrap}',
    '#seoil-ai .q{border:1px solid #B4570E;background:#FFFBF5;border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:8px}',
    '#seoil-ai .q b{color:#B4570E;font-weight:700}',
    '#seoil-ai .chip{font:inherit;font-size:13px;padding:5px 12px;border:1px solid #D9DCE1;border-radius:16px;background:#fff;cursor:pointer}#seoil-ai .chip:hover{border-color:#2F5BEA;color:#2F5BEA}',
    '#seoil-ai .applied{border:1px solid #CFE8DA;background:#F3FAF6;border-radius:10px;padding:8px 12px;font-size:12px;display:flex;align-items:center;gap:8px}',
    '#seoil-ai .ft{border-top:1px solid #ECEEF1;padding:10px 12px;display:flex;flex-direction:column;gap:8px}',
    '#seoil-ai .att{display:flex;flex-wrap:wrap;gap:6px}#seoil-ai .att span{font-size:12px;background:#EEF2FD;color:#2F5BEA;border-radius:6px;padding:2px 8px}',
    '#seoil-ai textarea,#seoil-ai input[type=text],#seoil-ai input[type=password]{width:100%;font:inherit;font-size:13px;border:1px solid #D9DCE1;border-radius:8px;padding:8px 10px;resize:none}',
    '#seoil-ai .send{font:inherit;font-size:13px;padding:0 14px;height:40px;border:0;border-radius:8px;background:#2F5BEA;color:#fff;cursor:pointer;flex:none}#seoil-ai .send:disabled{background:#9DB2F5;cursor:default}',
    '#seoil-ai .clip{border:1px solid #D9DCE1;background:#fff;border-radius:8px;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;flex:none;cursor:pointer}',
    '#seoil-ai .set{padding:14px;display:flex;flex-direction:column;gap:10px;border-bottom:1px solid #ECEEF1;background:#FAFAFB}',
    '#seoil-ai .set label{font-size:12px;color:#5F6670;display:flex;flex-direction:column;gap:4px}',
    '#seoil-ai .note{font-size:11px;color:#8A9099}',
    '#seoil-ai-fab{position:fixed;right:14px;bottom:64px;z-index:2147481999;font:600 13px "Noto Sans KR",system-ui,sans-serif;padding:10px 14px;border:0;border-radius:22px;background:#2F5BEA;color:#fff;box-shadow:0 4px 14px rgba(47,91,234,.35);cursor:pointer}',
    'body.seoil-ai-open #seoil-ai-fab{display:none}',
    'body.seoil-ai-open #hwppad-keylock,body.seoil-ai-open #hwppad-help,body.seoil-ai-open #hwppad-install{margin-right:' + W + 'px!important}',
  ].join('\n');

  // ---------- AI 지시문 ----------
  var SYSTEM = [
    '당신은 서일대학교 교직원의 공문 작성 도우미입니다. 편집기에 열린 학교 원본 양식(업무협조전)의 칸을 채웁니다.',
    '양식을 새로 만들거나 꾸미지 않습니다. 칸에 들어갈 글만 정하고, 실제 쓰기는 update_form 도구로 합니다. 글자 모양·번호·들여쓰기는 프로그램이 원본 양식에서 그대로 가져옵니다.',
    '',
    '[칸]',
    '- recipient(수신처): 받는 부서 이름. 예) 산학협력처',
    '- doctitle(제목)',
    '- body(본문): 줄 목록. level은 num(1. 2. 번호 문단, 번호는 쓰지 말 것), sub(가. 나. 하위 항목, "가. "부터 직접 씀), plain(번호 없는 문단)',
    '- attachments(붙임): 붙임 목록. 각 항목은 "서류명 1부." 꼴. "붙임"·번호·"끝."은 프로그램이 붙임.',
    '',
    '[제출 회신 공문 쓰는 법 — 요청 공문에 답할 때]',
    '- 제목: 요청 공문 제목에서 "요청·안내·협조" 같은 말을 빼고 "제출"로 끝낸다. 예) 「○○ 운영계획서 제출 요청」 → 「○○ 운영계획서 제출」. 회신 주체가 필요하면 끝에 (부서명).',
    '- 1. 관련: {요청 문서번호}({시행일 YYYY.MM.DD.}) "{요청 공문 제목}"   ← 문서번호·날짜·제목은 요청 공문에 적힌 그대로',
    '- 2. 위 호와 관련하여 {우리 부서}의 {제출할 것}을 붙임과 같이 제출합니다.  (붙임이 없으면 "아래와 같이 제출합니다." 뒤에 sub 항목)',
    '- 해당 사항이 없을 때: 2. 위 호와 관련하여 {우리 부서}는 해당 사항 없음을 회신합니다.',
    '- 수신처: 요청 공문을 보낸 부서.',
    '',
    '[규칙]',
    '- 모르는 사실(숫자·날짜·이름·건수)은 지어내지 말고 question으로 묻는다. 질문은 한 번에 하나, 고를 수 있는 답 2~3개를 options로.',
    '- 아는 칸은 바로 채운다. 이미 맞게 채워진 칸은 다시 보내지 않아도 된다(body는 보낼 때마다 전체를 보냄).',
    '- 사용자가 고쳐 달라고 하면 해당 칸만 고쳐서 다시 보낸다.',
    '- checklist에는 이 문서에 필요한 항목(수신처, 제목, 관련 근거, 제출 내용, 붙임 등)과 완료 여부를 넣는다.',
    '- 문체는 공문체(합니다/바랍니다), 군더더기 없이. 채팅 답은 한두 문장으로 짧게.',
  ].join('\n');

  var TOOL = {
    name: 'update_form',
    description: '열린 양식의 칸을 채우거나 고치고, 필요하면 사용자에게 질문 하나를 낸다.',
    input_schema: {
      type: 'object',
      properties: {
        fill: {
          type: 'object',
          properties: {
            recipient: { type: 'string' },
            doctitle: { type: 'string' },
            body: { type: 'array', items: { type: 'object', properties: { level: { type: 'string', enum: ['num', 'sub', 'plain'] }, text: { type: 'string' } }, required: ['level', 'text'] } },
            attachments: { type: 'array', items: { type: 'string' } },
          },
        },
        checklist: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, done: { type: 'boolean' } }, required: ['label', 'done'] } },
        question: { type: 'object', properties: { about: { type: 'string' }, text: { type: 'string' }, options: { type: 'array', items: { type: 'string' } } }, required: ['text'] },
      },
      required: ['checklist'],
    },
  };

  // ---------- 상태 ----------
  var S = { msgs: [], pendingTool: null, attach: [], busy: false, snapshots: [] };
  var ui = {};

  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var fab = el('button', { id: 'seoil-ai-fab', title: 'AI 작성 도우미', onclick: toggle, text: 'AI 작성' });
    ui.title = el('b', { style: 'font-size:15px', text: 'AI 작성 도우미' });
    ui.engine = el('span', { class: 'badge' });
    var taps = 0, tapT = 0;
    ui.title.addEventListener('click', function () {
      var now = Date.now(); taps = now - tapT < 800 ? taps + 1 : 1; tapT = now;
      if (taps >= 5) { taps = 0; ls(LS_DEV, isDev() ? null : '1'); drawSettings(); ui.set.style.display = isDev() ? 'flex' : 'none'; say('sys', isDev() ? '개발자 모드를 켰습니다.' : '개발자 모드를 껐습니다.'); }
    });
    ui.form = el('div', { style: 'font-size:12px;color:#5F6670', text: '' });
    ui.bar = el('i'); ui.chk = el('div', { class: 'chk' });
    ui.prog = el('div', { style: 'font-size:12px;color:#5F6670' });
    var hd = el('div', { class: 'hd' }, [
      el('div', { class: 'row' }, [ui.title, ui.engine, el('span', { style: 'flex:1' }),
        el('button', { class: 'ibtn', title: '처음부터', onclick: reset, text: '새 대화' }),
        el('button', { class: 'ibtn', title: '설정', onclick: function () { ui.set.style.display = ui.set.style.display === 'none' ? 'flex' : 'none'; }, text: '설정' }),
        el('button', { class: 'ibtn', title: '닫기', onclick: toggle, text: '닫기' })]),
      ui.form, ui.prog, el('div', { class: 'bar' }, [ui.bar]), ui.chk,
    ]);
    ui.set = el('div', { class: 'set', style: 'display:none' });
    drawSettings();
    ui.log = el('div', { class: 'log' });
    ui.att = el('div', { class: 'att' });
    ui.file = el('input', { type: 'file', multiple: 'multiple', accept: '.hwp,.hwpx,.pdf,.png,.jpg,.jpeg,.txt,.md', style: 'display:none', onchange: onFiles });
    ui.input = el('textarea', { rows: '2', placeholder: '요청 공문을 첨부하거나, 무엇을 쓸지 말해 주세요', onkeydown: function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } } });
    ui.send = el('button', { class: 'send', onclick: function () { send(); }, text: '보내기' });
    var clip = el('button', { class: 'clip', title: '자료 첨부 (요청 공문 hwp·pdf, 사진, 메모)', onclick: function () { ui.file.click(); } });
    clip.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5F6670" stroke-width="1.8"><path d="M21 11.5l-8.6 8.6a5 5 0 0 1-7-7l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8L10.2 17.9a1.7 1.7 0 0 1-2.4-2.4l8-8"/></svg>';
    var ft = el('div', { class: 'ft' }, [ui.att, el('div', { class: 'row', style: 'align-items:flex-end' }, [clip, ui.input, ui.send]), ui.file]);
    ui.panel = el('div', { id: 'seoil-ai' }, [hd, ui.set, ui.log, ft]);
    // 편집기 단축키가 패널 입력을 가로채지 않게
    ['keydown', 'keyup', 'keypress'].forEach(function (t) { ui.panel.addEventListener(t, function (e) { e.stopPropagation(); }); });
    ui.panel.addEventListener('drop', function (e) { e.preventDefault(); e.stopPropagation(); addFiles(e.dataTransfer.files); });
    ui.panel.addEventListener('dragover', function (e) { e.preventDefault(); e.stopPropagation(); });
    document.body.appendChild(ui.panel); document.body.appendChild(fab);
    refreshForm();
  }

  function mask(k) { return k ? k.slice(0, 7) + '…' + k.slice(-4) : ''; }
  function drawSettings() {
    ui.engine.textContent = isMock() ? '시험 모드' : (ls(LS_URL) ? '교내 서버' : 'Claude API');
    ui.set.innerHTML = '';
    var dept = el('input', { type: 'text', placeholder: '예) AI게임융합학과', value: ls(LS_DEPT) || 'AI게임융합학과' });
    ui.set.appendChild(el('label', null, ['우리 부서 (회신 공문의 주체)', dept]));
    ui.set.appendChild(el('div', { class: 'row' }, [el('button', { class: 'send', style: 'height:34px', text: '저장', onclick: function () {
      ls(LS_DEPT, dept.value.trim() || null); ui.set.style.display = 'none'; say('sys', '부서를 저장했습니다.');
    } })]));
    if (!isDev()) { ui.set.appendChild(el('div', { class: 'note', text: 'AI 키는 관리자가 개발자 모드에서 넣습니다.' + (ls(LS_KEY) ? ' (이 기기: 키 있음)' : ' (이 기기: 키 없음)') })); return; }
    var key = el('input', { type: 'password', placeholder: 'sk-ant-…', autocomplete: 'off' });
    var model = el('input', { type: 'text', value: ls(LS_MODEL) || DEFAULT_MODEL });
    var url = el('input', { type: 'text', placeholder: DEFAULT_URL, value: ls(LS_URL) });
    var mock = el('input', { type: 'checkbox' }); mock.checked = ls(LS_MOCK) === '1';
    var keyState = el('div', { style: 'font-size:12px', text: ls(LS_KEY) ? ('키 있음: ' + mask(ls(LS_KEY))) : '키 없음' });
    ui.set.appendChild(el('div', { style: 'border-top:1px dashed #D9DCE1;padding-top:10px;font-size:12px;font-weight:700;color:#B4570E', text: '개발자 모드' }));
    ui.set.appendChild(keyState);
    ui.set.appendChild(el('label', null, ['Claude API 키 (이 기기에만 저장, 화면에 다시 보이지 않음)', key]));
    ui.set.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'send', style: 'height:34px', text: '키 넣기', onclick: function () {
        var v = key.value.trim(); if (!v) return; ls(LS_KEY, v); key.value = ''; drawSettings(); say('sys', '키를 넣었습니다.');
      } }),
      el('button', { class: 'chip', text: '키 빼기', onclick: function () { ls(LS_KEY, null); drawSettings(); say('sys', '이 기기에서 키를 지웠습니다.'); } }),
      el('button', { class: 'chip', text: '키 시험', onclick: testKey }),
    ]));
    ui.set.appendChild(el('label', null, ['모델', model]));
    ui.set.appendChild(el('label', null, ['서버 주소 (비우면 Claude API — 나중에 교내 sLLM 주소)', url]));
    ui.set.appendChild(el('label', { style: 'flex-direction:row;align-items:center;gap:6px' }, [mock, '시험 모드 (AI 부르지 않고 정해진 답)']));
    ui.set.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'send', style: 'height:34px', text: '개발 설정 저장', onclick: function () {
        ls(LS_MODEL, model.value.trim() || null); ls(LS_URL, url.value.trim() || null); ls(LS_MOCK, mock.checked ? '1' : null);
        drawSettings(); say('sys', '개발 설정을 저장했습니다.');
      } }),
      el('button', { class: 'chip', text: '개발자 모드 끄기', onclick: function () { ls(LS_DEV, null); drawSettings(); ui.set.style.display = 'none'; } }),
    ]));
  }

  function testKey() {
    if (!ls(LS_KEY)) { say('err', '키가 없습니다.'); return; }
    var t = say('sys', '키 시험 중…');
    fetch(ls(LS_URL) || DEFAULT_URL, { method: 'POST', headers: apiHeaders(),
      body: JSON.stringify({ model: ls(LS_MODEL) || DEFAULT_MODEL, max_tokens: 16, messages: [{ role: 'user', content: '확인. "됨"이라고만 답해.' }] }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status)); return j; }); })
      .then(function (j) { t.remove(); say('sys', '키 정상 (' + (j.model || '') + ')'); })
      .catch(function (e) { t.remove(); say('err', '키 시험 실패: ' + (e && e.message || e)); });
  }
  function apiHeaders() {
    return { 'content-type': 'application/json', 'x-api-key': ls(LS_KEY), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
  }

  function toggle() {
    var open = !ui.panel.classList.contains('open');
    ui.panel.classList.toggle('open', open);
    document.body.classList.toggle('seoil-ai-open', open);
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 50);
    if (open) { refreshForm(); if (!S.msgs.length && !ui.log.childNodes.length) greet(); ui.input.focus(); }
  }

  function info() { var d = doc(); try { return d && window.SeoilForm.detect(d); } catch (e) { return null; } }

  function refreshForm() {
    var i = info();
    ui.form.textContent = i ? ('열린 양식: ' + i.kind + ' · ' + ((bridge() && bridge().fileName()) || '')) : '아는 양식이 열려 있지 않습니다 (업무협조전 hwp를 열어 주세요)';
    if (!S.lastChecklist) setChecklist(null);
  }

  function greet() {
    var i = info();
    if (!i) say('ai', '업무협조전 양식(hwp)을 먼저 열어 주세요. 그룹웨어에서 내려받은 기안 양식이나 지난 업무협조전 파일이면 됩니다.\n\n그다음 받은 요청 공문을 첨부하면, 제출 회신을 채워 드릴게요.');
    else say('ai', '받은 요청 공문(hwp·pdf)을 첨부하거나, 무엇을 쓸지 말해 주세요.\n칸은 원본 양식 위에 그대로 씁니다.');
    if (!isMock() && !ls(LS_KEY)) say('sys', '이 기기에 AI 키가 아직 없습니다. 관리자가 개발자 모드에서 넣어 주세요.');
  }

  function say(kind, text) { var b = el('div', { class: kind, text: text }); ui.log.appendChild(b); ui.log.scrollTop = ui.log.scrollHeight; return b; }

  function setChecklist(list) {
    var i = info();
    if (!list) {
      var c = i && window.SeoilForm.check(doc());
      list = c ? [{ label: '수신처', done: c.filled.recipient }, { label: '제목', done: c.filled.doctitle }, { label: '본문', done: c.filled.body }] : [];
    }
    S.lastChecklist = list;
    var done = list.filter(function (x) { return x.done; }).length;
    ui.prog.textContent = list.length ? ('칸 ' + list.length + '개 중 ' + done + '개 채움') : '';
    ui.bar.style.width = list.length ? Math.round(done * 100 / list.length) + '%' : '0';
    ui.chk.innerHTML = '';
    list.forEach(function (x) { ui.chk.appendChild(el('span', { class: x.done ? 'ok' : '', text: (x.done ? '✓ ' : '') + x.label })); });
  }

  // ---------- 첨부 ----------
  function onFiles(e) { addFiles(e.target.files); e.target.value = ''; }
  function b64(buf) {
    var bytes = new Uint8Array(buf), s = '', CH = 0x8000;
    for (var i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(s);
  }
  function hwpToText(bytes, name) {
    var d = doc(); if (!d) throw new Error('편집기가 아직 준비되지 않았습니다');
    var Ctor = d.constructor, x = new Ctor(bytes), out = [];
    try {
      var fl = JSON.parse(x.getFieldList()), f = {};
      fl.forEach(function (v) { if (!(v.name in f)) f[v.name] = v.value; });
      if (f.doctitle) {
        out.push('[요청 공문 정보] 문서번호: ' + (f.docnumber || '(없음)') + ' / 시행일: ' + (f.enforcedate || '(없음)') + ' / 제목: ' + f.doctitle);
        if (f.docnumber) out.push('보낸 부서(문서번호 앞부분): ' + String(f.docnumber).split('-')[0]);
      }
    } catch (e) { /* 누름틀 없는 문서 */ }
    out.push('[본문 텍스트]\n' + String(x.getTextFileText()).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 20000));
    try { x.free && x.free(); } catch (e) {}
    return '[첨부: ' + name + ']\n' + out.join('\n');
  }
  function addFiles(files) {
    Array.prototype.forEach.call(files || [], function (file) {
      var r = new FileReader(), name = file.name, ext = (name.split('.').pop() || '').toLowerCase();
      r.onload = function () {
        try {
          var blk;
          if (ext === 'hwp' || ext === 'hwpx') blk = { type: 'text', text: hwpToText(new Uint8Array(r.result), name) };
          else if (ext === 'pdf') blk = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64(r.result) }, title: name };
          else if (/^(png|jpe?g)$/.test(ext)) blk = { type: 'image', source: { type: 'base64', media_type: ext === 'png' ? 'image/png' : 'image/jpeg', data: b64(r.result) } };
          else blk = { type: 'text', text: '[첨부: ' + name + ']\n' + new TextDecoder().decode(r.result).slice(0, 20000) };
          S.attach.push({ name: name, block: blk }); drawAttach();
        } catch (err) { say('err', name + ' 읽기 실패: ' + (err && err.message || err)); }
      };
      r.readAsArrayBuffer(file);
    });
  }
  function drawAttach() {
    ui.att.innerHTML = '';
    S.attach.forEach(function (a, i) {
      ui.att.appendChild(el('span', { title: '눌러서 빼기', style: 'cursor:pointer', onclick: function () { S.attach.splice(i, 1); drawAttach(); }, text: a.name + ' ×' }));
    });
  }

  // ---------- 대화 ----------
  function docState() {
    var i = info();
    if (!i) return '[현재 문서] 아는 양식 아님';
    return '[현재 문서: ' + i.kind + ']\n수신처: ' + i.fields.recipient + '\n제목: ' + i.fields.doctitle + '\n본문:\n' + i.body.join('\n') +
      '\n[우리 부서] ' + (ls(LS_DEPT) || 'AI게임융합학과') + '\n[오늘] ' + new Date().toISOString().slice(0, 10);
  }

  function send(text) {
    if (S.busy) return;
    text = text != null ? text : ui.input.value.trim();
    if (!text && !S.attach.length) return;
    if (!info()) { say('err', '업무협조전 양식을 먼저 열어 주세요.'); return; }
    if (!isMock() && !ls(LS_KEY)) { say('err', '이 기기에 AI 키가 없습니다. 관리자에게 개발자 모드에서 키를 넣어 달라고 해 주세요.'); return; }
    var content = [];
    if (S.pendingTool) { content.push({ type: 'tool_result', tool_use_id: S.pendingTool, content: '적용됨' }); S.pendingTool = null; }
    S.attach.forEach(function (a) { content.push(a.block); });
    content.push({ type: 'text', text: docState() + '\n\n[사용자] ' + (text || '첨부한 요청 공문에 대한 제출 회신을 써 주세요.') });
    say('me', (S.attach.length ? '첨부 ' + S.attach.map(function (a) { return a.name; }).join(', ') + (text ? '\n' : '') : '') + (text || ''));
    S.attach = []; drawAttach(); ui.input.value = '';
    S.msgs.push({ role: 'user', content: content });
    var q = ui.log.querySelector('.q:last-of-type'); if (q) q.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    call();
  }

  function busy(on) { S.busy = on; ui.send.disabled = on; ui.send.textContent = on ? '쓰는 중…' : '보내기'; }

  function call() {
    busy(true);
    var thinking = say('sys', '읽고 쓰는 중…');
    var p = isMock() ? mockReply() : fetch(ls(LS_URL) || DEFAULT_URL, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ model: ls(LS_MODEL) || DEFAULT_MODEL, max_tokens: 2048, system: SYSTEM, tools: [TOOL], messages: S.msgs }),
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status)); return j; }); });
    p.then(function (res) {
      thinking.remove();
      S.msgs.push({ role: 'assistant', content: res.content });
      handle(res.content);
    }).catch(function (err) {
      thinking.remove(); S.msgs.pop();
      say('err', 'AI 호출 실패: ' + (err && err.message || err));
    }).then(function () { busy(false); });
  }

  function handle(blocks) {
    (blocks || []).forEach(function (b) {
      if (b.type === 'text' && b.text.trim()) say('ai', b.text.trim());
      if (b.type === 'tool_use' && b.name === 'update_form') {
        S.pendingTool = b.id;
        var inp = b.input || {};
        if (inp.fill && Object.keys(inp.fill).length) applyFill(inp.fill);
        setChecklist(inp.checklist || null);
        if (inp.question && inp.question.text) ask(inp.question);
      }
    });
  }

  function applyFill(fill) {
    var d = doc(); if (!d) return;
    var snap = null;
    try { snap = d.saveSnapshot(); } catch (e) {}
    try {
      var done = window.SeoilForm.apply(d, fill);
      bridge().changed('seoil-ai-fill');
      var names = { recipient: '수신처', doctitle: '제목', body: '본문·붙임', refers: '참조' };
      var box = el('div', { class: 'applied' }, [
        el('span', { style: 'color:#1E8E5A;font-weight:700', text: '✓' }),
        el('span', { style: 'flex:1', text: done.map(function (k) { return names[k] || k; }).join(', ') + ' 칸에 썼습니다' }),
      ]);
      if (snap != null) {
        box.appendChild(el('button', { class: 'chip', style: 'font-size:12px;padding:2px 10px', text: '되돌리기', onclick: function () {
          try { d.restoreSnapshot(snap); bridge().changed('seoil-ai-undo'); this.disabled = true; this.textContent = '되돌림'; setChecklist(null); }
          catch (e) { say('err', '되돌리기 실패: ' + e.message); }
        } }));
      }
      ui.log.appendChild(box); ui.log.scrollTop = ui.log.scrollHeight;
    } catch (err) {
      if (snap != null) { try { d.restoreSnapshot(snap); } catch (e) {} }
      say('err', '칸 쓰기 실패: ' + (err && err.message || err));
    }
  }

  function ask(q) {
    var opts = el('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' });
    (q.options || []).forEach(function (o) { opts.appendChild(el('button', { class: 'chip', text: o, onclick: function () { send(o); } })); });
    opts.appendChild(el('button', { class: 'chip', text: '직접 쓰기', onclick: function () { ui.input.focus(); } }));
    var box = el('div', { class: 'q' }, [q.about ? el('b', { text: q.about }) : null, el('div', { text: q.text }), opts]);
    ui.log.appendChild(box); ui.log.scrollTop = ui.log.scrollHeight;
  }

  function reset() { S.msgs = []; S.pendingTool = null; S.lastChecklist = null; ui.log.innerHTML = ''; setChecklist(null); greet(); }

  // ---------- 시험 모드 ----------
  var mockStep = 0;
  function mockReply() {
    var dept = ls(LS_DEPT) || 'AI게임융합학과';
    var steps = [
      { content: [{ type: 'text', text: '요청 공문을 읽었습니다. 수신처·제목·관련 근거를 채웠어요. 제출할 서류만 알려 주세요.' },
        { type: 'tool_use', id: 'm1', name: 'update_form', input: {
          fill: { recipient: '산학협력처', doctitle: '2026학년도 산학협력 인프라 공유 운영계획서 제출',
            body: [{ level: 'num', text: '관련: 산학협력처-413(2026.04.02.) "2026학년도 산학협력 인프라 공유 사업 운영계획서 제출 요청"' },
              { level: 'num', text: '위 호와 관련하여 ' + dept + '의 운영계획서를 붙임과 같이 제출합니다.' }] },
          checklist: [{ label: '수신처', done: true }, { label: '제목', done: true }, { label: '관련 근거', done: true }, { label: '제출 내용', done: true }, { label: '붙임', done: false }],
          question: { about: '붙임', text: '함께 낼 서류가 무엇인가요?', options: ['운영계획서 1부', '운영계획서 1부, 참여동의서 2부'] } } }] },
      { content: [{ type: 'text', text: '붙임을 넣었습니다. 저장 전에 확인해 주세요.' },
        { type: 'tool_use', id: 'm2', name: 'update_form', input: {
          fill: { body: [{ level: 'num', text: '관련: 산학협력처-413(2026.04.02.) "2026학년도 산학협력 인프라 공유 사업 운영계획서 제출 요청"' },
              { level: 'num', text: '위 호와 관련하여 ' + dept + '의 운영계획서를 붙임과 같이 제출합니다.' }],
            attachments: ['2026 인프라 공유 운영계획서 1부.', '참여기업 참여동의서 2부.'] },
          checklist: [{ label: '수신처', done: true }, { label: '제목', done: true }, { label: '관련 근거', done: true }, { label: '제출 내용', done: true }, { label: '붙임', done: true }] } }] },
    ];
    var r = steps[Math.min(mockStep++, steps.length - 1)];
    return new Promise(function (res) { setTimeout(function () { res(r); }, 600); });
  }

  window.SeoilAI = { toggle: toggle, send: send, state: S };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
