// 서일 오피스 — AI 작성 도우미 패널 (SO-03, 2026-11-03: 범용 양식 채우기).
// 편집기 오른쪽에 붙어, 열린 학교 양식(회의록·신청서·계획서 등)의 빈칸·자리표시를 대화로 채운다.
// - 칸 지도는 SeoilFill.scan(doc)(seoil-fill.js)이 원본에서 뽑고, AI는 "칸 → 값" 목록만 돌려준다.
// - 쓰기는 SeoilFill.apply가 원본 칸 위에 글자만 넣는다. 쓰고 나서 표·칸 수가 원본과 다르면 되돌린다.
// - 명단(탭 구분 글, 엑셀 복사)은 AI로 보내지 않고 앱이 직접 표에 넣는다(개인정보).
// - 내 정보(프로필)는 이 기기에만 저장, 신청서 라벨 칸·서명 블록 채우기에 쓴다.
// - AI는 Claude API를 브라우저에서 바로 부른다(파일럿: 키는 개발자 모드에서만). ?ai=mock 이면 정해진 답으로 흐름만 시험.
(function () {
  'use strict';
  var LS_KEY = 'seoil.ai.key', LS_MODEL = 'seoil.ai.model', LS_URL = 'seoil.ai.url', LS_DEV = 'seoil.ai.dev', LS_MOCK = 'seoil.ai.mock', LS_PROFILE = 'seoil.profile', LS_CODE = 'seoil.ai.code';
  var DEFAULT_MODEL = 'claude-sonnet-5-5';
  var DEFAULT_URL = 'https://api.anthropic.com/v1/messages';
  // 학교 AI 중계 서버(proxy/). 학교 키는 서버에만 있고, 앱은 관리자가 나눠 준 「AI 사용 코드」만 보낸다.
  var SCHOOL_URL = window.SEOIL_AI_URL || ''; // 첫 배포 뒤 workers.dev 주소를 넣는다
  (function () {
    var m = location.search.match(/[?&]dev=([01])\b/);
    if (m) { try { if (m[1] === '1') localStorage.setItem(LS_DEV, '1'); else localStorage.removeItem(LS_DEV); } catch (e) {} }
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
      else if (k === 'value') e.value = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function bridge() { return window.rhwpStudio && window.rhwpStudio.ai; }
  function doc() { var b = bridge(); return b && b.doc(); }
  function fileName() { var b = bridge(); return (b && b.fileName && b.fileName()) || ''; }

  // ---------- 내 정보 ----------
  var PROFILE_FIELDS = [['org', '소속 기관', '서일대학교'], ['dept', '학과·부서', '예) AI게임융합학과'], ['name', '성명', ''], ['title', '직위·직급', '예) 교수, 학과장'], ['phone', '연락처', '예) 02-490-0000'], ['email', '이메일', ''], ['etc', '그 밖에 자주 쓰는 것', '예) 겸직: AIDX혁신센터']];
  function profile() { try { return JSON.parse(ls(LS_PROFILE) || '{}'); } catch (e) { return {}; } }
  function profileText() {
    var p = profile(), L = [];
    PROFILE_FIELDS.forEach(function (f) { if (p[f[0]]) L.push(f[1] + ': ' + p[f[0]]); });
    return L.length ? L.join(' / ') : '(없음)';
  }

  // ---------- 스타일 ----------
  var css = [
    '#seoil-ai{position:fixed;top:0;right:0;bottom:0;width:' + W + 'px;max-width:100vw;background:#fff;border-left:1px solid #D9DCE1;z-index:2147482000;display:none;flex-direction:column;font:13px/1.6 "Noto Sans KR",system-ui,-apple-system,sans-serif;color:#1C1F23;box-shadow:-4px 0 16px rgba(0,0,0,.06)}',
    '#seoil-ai.open{display:flex}',
    'body.seoil-ai-open{padding-right:' + W + 'px!important;box-sizing:border-box}',
    '#seoil-ai *{box-sizing:border-box}',
    '#seoil-ai .hd{padding:12px 14px;border-bottom:1px solid #ECEEF1;display:flex;flex-direction:column;gap:8px}',
    '#seoil-ai .row{display:flex;align-items:center;gap:8px}',
    '#seoil-ai .badge{font-size:11px;padding:1px 8px;border-radius:10px;background:#EEF2FD;color:#2F5BEA}',
    '#seoil-ai .ibtn{border:0;background:transparent;font:inherit;color:#5F6670;padding:4px 6px;border-radius:6px;cursor:pointer;white-space:nowrap}',
    '#seoil-ai .badge{white-space:nowrap}',
    '#seoil-ai .ibtn:hover{background:#F4F5F7}',
    '#seoil-ai .bar{height:6px;background:#ECEEF1;border-radius:3px;overflow:hidden}#seoil-ai .bar>i{display:block;height:6px;background:#2F5BEA;width:0;transition:width .3s}',
    '#seoil-ai .log{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}',
    '#seoil-ai .ai{background:#F4F5F7;border-radius:10px;padding:9px 12px;white-space:pre-wrap;align-self:flex-start;max-width:95%}',
    '#seoil-ai .me{background:#2F5BEA;color:#fff;border-radius:10px;padding:9px 12px;white-space:pre-wrap;align-self:flex-end;max-width:85%}',
    '#seoil-ai .sys{font-size:12px;color:#5F6670;align-self:center;text-align:center;white-space:pre-wrap}',
    '#seoil-ai .err{background:#FDECEC;color:#B42318;border-radius:10px;padding:9px 12px;white-space:pre-wrap}',
    '#seoil-ai .warn{background:#FFF7E8;color:#8A4B08;border-radius:10px;padding:9px 12px;white-space:pre-wrap;font-size:12px}',
    '#seoil-ai .q{border:1px solid #B4570E;background:#FFFBF5;border-radius:10px;padding:10px 12px;display:flex;flex-direction:column;gap:8px}',
    '#seoil-ai .q b{color:#B4570E;font-weight:700}',
    '#seoil-ai .chip{font:inherit;font-size:13px;padding:5px 12px;border:1px solid #D9DCE1;border-radius:16px;background:#fff;cursor:pointer}#seoil-ai .chip:hover{border-color:#2F5BEA;color:#2F5BEA}#seoil-ai .chip:disabled{opacity:.5;cursor:default}',
    '#seoil-ai .applied{border:1px solid #CFE8DA;background:#F3FAF6;border-radius:10px;padding:8px 12px;font-size:12px;display:flex;align-items:center;gap:8px}',
    '#seoil-ai .ft{border-top:1px solid #ECEEF1;padding:10px 12px;display:flex;flex-direction:column;gap:8px}',
    '#seoil-ai .att{display:flex;flex-wrap:wrap;gap:6px}#seoil-ai .att span{font-size:12px;background:#EEF2FD;color:#2F5BEA;border-radius:6px;padding:2px 8px}',
    '#seoil-ai textarea,#seoil-ai input[type=text],#seoil-ai input[type=password]{width:100%;font:inherit;font-size:13px;border:1px solid #D9DCE1;border-radius:8px;padding:8px 10px;resize:none}',
    '#seoil-ai .send{font:inherit;font-size:13px;padding:0 14px;height:40px;border:0;border-radius:8px;background:#2F5BEA;color:#fff;cursor:pointer;flex:none}#seoil-ai .send:disabled{background:#9DB2F5;cursor:default}',
    '#seoil-ai .clip{border:1px solid #D9DCE1;background:#fff;border-radius:8px;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;flex:none;cursor:pointer}',
    '#seoil-ai .set{padding:14px;display:flex;flex-direction:column;gap:10px;border-bottom:1px solid #ECEEF1;background:#FAFAFB;max-height:60%;overflow:auto}',
    '#seoil-ai .set label{font-size:12px;color:#5F6670;display:flex;flex-direction:column;gap:4px}',
    '#seoil-ai .set h4{margin:0;font-size:13px}',
    '#seoil-ai .note{font-size:11px;color:#8A9099}',
    '#seoil-ai-fab{position:fixed;right:14px;bottom:64px;z-index:2147481999;font:600 13px "Noto Sans KR",system-ui,sans-serif;padding:10px 14px;border:0;border-radius:22px;background:#2F5BEA;color:#fff;box-shadow:0 4px 14px rgba(47,91,234,.35);cursor:pointer}',
    'body.seoil-ai-open #seoil-ai-fab{display:none}',
    'body.seoil-ai-open #hwppad-keylock,body.seoil-ai-open #hwppad-help,body.seoil-ai-open #hwppad-install{margin-right:' + W + 'px!important}',
  ].join('\n');

  // ---------- AI 지시문 ----------
  var SYSTEM = [
    '당신은 서일대학교 교직원의 학교 양식 작성 도우미입니다. 편집기에 열린 원본 양식(hwp)의 빈칸·자리표시를 채웁니다.',
    '양식을 새로 만들거나 표·칸을 바꾸지 않습니다. 칸에 들어갈 글만 정하고, 실제 쓰기는 fill_form 도구의 ops로 합니다. 글자 모양은 프로그램이 원본 칸의 것을 씁니다.',
    '',
    '[칸 지도 읽는 법] 매 메시지에 [칸 지도]가 옵니다.',
    '- T3.r0c1 = 3번째 표의 0행 1열 칸. [ ] 안은 그 칸의 라벨(왼쪽 칸 또는 위쪽 머리글).',
    '- 빈칸 = 비어 있음. 자리표시 = OOO·0000·2026.00.00. 같은 예시 글자가 있음. 안내문 = "※ 200자 내외" 같은 작성 안내(지우고 내용으로 바꿈).',
    '- P5 = 표 밖 본문 문단. 본문 자리표시도 바꿀 수 있음.',
    '- "작성방법 안내 상자"는 채우지도 지우지도 않습니다(사람이 지움).',
    '',
    '[ops 쓰는 법]',
    '- {"cell":"T4.r0c1","text":"…"} 칸 전체를 이 글로. 여러 줄은 \\n.',
    '- {"cell":"T1.r1c2","find":"0000 학과","replace":"AI게임융합학과"} 칸 안 자리표시만 바꿈. 띄어쓰기까지 포함해 정확히 찾을 글을 쓴다.',
    '- {"para":"P2","find":"00월 00일","replace":"11월 03일"} 본문 문단 자리표시만 바꿈.',
    '- 같은 자리표시(OOO)가 한 문단에 여러 번 있고 값이 다르면, 둘을 감싸는 더 긴 글을 find로 잡는다. 예) find "위원 OOO, 위원 OOO" → "위원 홍길동, 위원 이몽룡".',
    '- {"rows":"T6","start":1,"data":[["값","값"],…]} 명단·반복 행 표. start 행부터, 그 행의 빈칸에 왼쪽부터 차례로 넣음(라벨 칸은 건너뜀). 행이 모자라면 프로그램이 늘림.',
    '- 서명·도장 칸((인), (서명))은 비워 둔다. 날짜는 사용자가 따로 말하지 않으면 오늘.',
    '',
    '[쓰는 원칙]',
    '- 모르는 사실(숫자·날짜·이름·건수·금액)은 지어내지 말고 question으로 묻는다. 질문은 한 번에 하나, 고를 수 있는 답 2~3개를 options로.',
    '- 아는 칸은 바로 채운다. [내 정보]로 채울 수 있는 칸(학과·성명·직위·연락처·책임자 등)은 묻지 않고 채운다.',
    '- 서술 칸(회의 내용·필요성·추진 내용 등)은 □ 큰 항목, ○ 하위, - 세부 3단으로 쓴다. 각 줄 앞에 기호를 붙이고 ○는 앞에 공백 1칸, -는 2칸. 안내문에 분량(예: 200자 내외)이 있으면 지킨다.',
    '- 문체는 개조식 명사형 종결(…함, …임, …예정). 군더더기 없이.',
    '- 사용자가 고쳐 달라고 하면 해당 칸만 다시 보낸다.',
    '- remaining에는 아직 못 채운 칸과 이유를 짧게. 채팅 답은 한두 문장.',
    '',
    '[본문 쓰기 — 메시지에 [본문 구조]가 있을 때: 계획서·보고서]',
    '- [본문 구조]의 B12 같은 번호가 문단입니다. [Ⅰ]은 장 제목 상자, [1.][가.][1)][가)][(1)]은 제목 단계, [□][○][-]는 개조식 단계, [본문]은 일반 문단.',
    '- 쓰기 op: {"under":"B12","items":[{"level":"□","text":"…"},…]} = 제목 B12 아래 본문을 통째로 새로 씀(표·그림은 남음). {"after":"B20","items":[…]} = B20 뒤에 이어 씀. {"chapter":"추진 계획","after":"B40"} = 새 장 상자(번호 자동). {"reformat":"all"} = 손으로 친 □○- 문단을 단계 형식으로 맞춤.',
    '- items의 level은 위 단계 중 하나. 제목 단계(1. 가. 1) …)는 번호까지 text에 쓴다(예: "2. 추진 배경"). □ ○ - 단계는 기호 없이 내용만 쓴다(기호는 양식이 붙임).',
    '- under의 첫 item이 그 제목과 같은 단계면 제목 글을 그 글로 바꾼다(예: under B31(1. 절 제목) + 첫 item {"level":"1.","text":"1. 추진 배경"}). 장 제목 상자도 같음({"level":"Ⅰ","text":"서론"}).',
    '- 장(Ⅰ) 아래를 통째로 쓰는 under는 그 장 전체를 지우므로, 보통은 절(1.) 단위 under를 쓴다.',
    '- 계획서 문체: □는 핵심 한 줄, ○는 근거·내용, -는 세부. 모두 개조식 명사형 종결(…함, …임, …필요). 한 □ 아래 ○는 2~4개.',
    '- 한 번에 한 절(1. 단위)씩 쓴다. 다 쓰면 다음 절로 갈지 question으로 묻는다. 긴 md나 자료가 오면 먼저 장·절 구성(목차)을 제안하고 확인받는다.',
    '- 자료에 없는 수치·기관명·실적은 지어내지 말고 [확인 필요] 표시를 남기거나 묻는다.',
    '',
    '[부분 강조 — 사용자가 강조·굵게·밑줄·색을 부탁할 때]',
    '- 강조 op: {"emph":"B12","find":"핵심 문구","style":"bold"}. emph는 문단(B12·P5)이나 칸(T2.r0c1), 어디든이면 "all"(이때 find 필수). find가 없으면 그 문단·칸 전체.',
    '- style: bold(굵게), underline(밑줄), red(빨강), blue(파랑), shade(형광), italic. 섞을 때는 "bold+underline".',
    '- 알아서 고르라고 하면 문서를 읽고 핵심만 고른다: 한 □ 문단에 1곳, 문서 전체 5~12곳. 문장 통째보다 핵심 낱말·수치·결론 구절(2~15자). 사용자가 따로 말하지 않으면 bold. 글자는 바꾸지 않는다.',
    '- find는 문서에 있는 글자 그대로(띄어쓰기까지) 쓴다.',
    '',
    '[다시 쓰기 모드 — 메시지에 [모드] 다시 쓰기가 있을 때]',
    '- 열린 문서는 지난번에 다 쓴 문서(예: 8월 회의록)의 사본입니다. 칸 지도에 이미 쓴 글이 모두 보입니다.',
    '- 먼저 칸을 둘로 나눈다: 그대로 둘 것(학과·소속·위원 명단·양식의 고정 글) / 바꿀 것(날짜·회차·학기·안건·내용·사진 설명 등).',
    '- 바꿀 것만 고친다. 날짜·회차처럼 일부만 바뀌면 find/replace로 그 글자만, 내용 칸은 text로 통째로 새로 쓴다.',
    '- 지난 내용을 새 내용인 것처럼 남겨 두지 않는다. 새 정보가 없는 내용 칸은 비우지 말고 question으로 묻는다.',
    '- 라벨 칸(회의 안건·위원 소속 같은 머리글)은 절대 고치지 않는다.',
  ].join('\n');

  var TOOL = {
    name: 'fill_form',
    description: '열린 양식의 칸을 채우거나 본문을 쓰고, 필요하면 사용자에게 질문 하나를 낸다.',
    input_schema: {
      type: 'object',
      properties: {
        ops: { type: 'array', items: { type: 'object', properties: {
          cell: { type: 'string' }, para: { type: 'string' }, rows: { type: 'string' },
          text: { type: 'string' }, find: { type: 'string' }, replace: { type: 'string' },
          start: { type: 'integer' }, data: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
          under: { type: 'string' }, after: { type: 'string' }, chapter: { type: 'string' }, reformat: { type: 'string' },
          emph: { type: 'string' }, style: { type: 'string' },
          items: { type: 'array', items: { type: 'object', properties: { level: { type: 'string' }, text: { type: 'string' } }, required: ['level', 'text'] } },
        } } },
        remaining: { type: 'array', items: { type: 'string' } },
        question: { type: 'object', properties: { about: { type: 'string' }, text: { type: 'string' }, options: { type: 'array', items: { type: 'string' } } }, required: ['text'] },
      },
      required: ['ops'],
    },
  };

  // ---------- 상태 ----------
  var S = { msgs: [], pendingTool: null, attach: [], busy: false, mode: 'fill' };
  var ui = {};

  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var fab = el('button', { id: 'seoil-ai-fab', title: 'AI 작성 도우미', onclick: toggle, text: 'AI 작성' });
    ui.title = el('b', { style: 'font-size:15px;white-space:nowrap', text: 'AI 작성' });
    ui.engine = el('span', { class: 'badge' });
    var taps = 0, tapT = 0;
    ui.title.addEventListener('click', function () {
      var now = Date.now(); taps = now - tapT < 800 ? taps + 1 : 1; tapT = now;
      if (taps >= 5) { taps = 0; ls(LS_DEV, isDev() ? null : '1'); drawSettings(); ui.set.style.display = 'flex'; say('sys', isDev() ? '개발자 모드를 켰습니다.' : '개발자 모드를 껐습니다.'); }
    });
    ui.form = el('div', { style: 'font-size:12px;color:#5F6670' });
    ui.bar = el('i');
    ui.prog = el('div', { style: 'font-size:12px;color:#5F6670' });
    var hd = el('div', { class: 'hd' }, [
      el('div', { class: 'row' }, [ui.title, ui.engine, el('span', { style: 'flex:1' }),
        el('button', { class: 'ibtn', title: '처음부터', onclick: function () { reset(); }, text: '새 대화' }),
        el('button', { class: 'ibtn', title: '내 정보·설정', onclick: function () { drawSettings(); ui.set.style.display = ui.set.style.display === 'none' ? 'flex' : 'none'; }, text: '내 정보' }),
        el('button', { class: 'ibtn', title: '닫기', onclick: toggle, text: '닫기' })]),
      ui.form, ui.prog, el('div', { class: 'bar' }, [ui.bar]),
    ]);
    ui.set = el('div', { class: 'set', style: 'display:none' });
    drawSettings();
    ui.log = el('div', { class: 'log' });
    ui.att = el('div', { class: 'att' });
    ui.file = el('input', { type: 'file', multiple: 'multiple', accept: '.hwp,.hwpx,.pdf,.png,.jpg,.jpeg,.txt,.md,image/*', style: 'display:none', onchange: onFiles });
    ui.input = el('textarea', { rows: '2', placeholder: '메모·녹취·요청 공문을 넣거나, 무엇에 대한 문서인지 말해 주세요. 명단은 엑셀에서 복사해 붙여 넣으면 AI 없이 표에 들어갑니다.', onkeydown: function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } } });
    ui.send = el('button', { class: 'send', onclick: function () { send(); }, text: '보내기' });
    var clip = el('button', { class: 'clip', title: '자료 첨부 (메모·녹취 글, 사진, 요청 공문 hwp·pdf)', onclick: function () { ui.file.click(); } });
    clip.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5F6670" stroke-width="1.8"><path d="M21 11.5l-8.6 8.6a5 5 0 0 1-7-7l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8L10.2 17.9a1.7 1.7 0 0 1-2.4-2.4l8-8"/></svg>';
    var ft = el('div', { class: 'ft' }, [ui.att, el('div', { class: 'row', style: 'align-items:flex-end' }, [clip, ui.input, ui.send]), ui.file]);
    ui.panel = el('div', { id: 'seoil-ai' }, [hd, ui.set, ui.log, ft]);
    ['keydown', 'keyup', 'keypress'].forEach(function (t) { ui.panel.addEventListener(t, function (e) { e.stopPropagation(); }); });
    ui.panel.addEventListener('drop', function (e) { e.preventDefault(); e.stopPropagation(); addFiles(e.dataTransfer.files); });
    ui.panel.addEventListener('dragover', function (e) { e.preventDefault(); });
    document.body.appendChild(ui.panel); document.body.appendChild(fab);
    refreshForm();
  }

  function ownKey() { return !!ls(LS_KEY); } // 개발자 모드에서 넣은 자기 키 → Claude API 직접
  function aiUrl() { return ls(LS_URL) || (ownKey() ? DEFAULT_URL : SCHOOL_URL); }
  function ready() { return isMock() || ownKey() || (!!ls(LS_CODE) && !!aiUrl()); }
  var NOT_READY_CODE = 'AI 사용 코드가 아직 없습니다. 위의 「내 정보」를 눌러 관리자에게 받은 코드를 넣어 주세요.';
  function notReady() { return (!ls(LS_CODE) || ownKey()) ? NOT_READY_CODE : '학교 AI 서버가 아직 준비되지 않았습니다. 관리자에게 알려 주세요.'; }
  function checkCode(out) {
    if (!aiUrl()) { out.textContent = '학교 AI 서버가 아직 준비되지 않았습니다.'; return; }
    out.textContent = '확인 중…';
    fetch(aiUrl().replace(/\/v1\/messages$/, '/v1/me'), { headers: { 'x-seoil-code': ls(LS_CODE) } })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status)); return j; }); })
      .then(function (j) { out.textContent = j.name + ' 님 · 오늘 ' + j.today + ' / ' + j.daily + '회 사용'; })
      .catch(function (e) { out.textContent = '확인 실패: ' + (e && e.message || e); });
  }
  function mask(k) { return k ? k.slice(0, 7) + '…' + k.slice(-4) : ''; }
  function drawEngine() { ui.engine.textContent = isMock() ? '시험 모드' : (ownKey() ? '내 키' : '학교 AI'); }
  function drawSettings() {
    ui.engine.textContent = isMock() ? '시험 모드' : (ownKey() ? '내 키' : '학교 AI');
    ui.set.innerHTML = '';
    var p = profile(), inputs = {};
    ui.set.appendChild(el('h4', { text: '내 정보' }));
    ui.set.appendChild(el('div', { class: 'note', text: '신청서의 학과·성명·직위 같은 칸을 묻지 않고 채웁니다. 이 기기에만 저장됩니다.' }));
    PROFILE_FIELDS.forEach(function (f) {
      inputs[f[0]] = el('input', { type: 'text', placeholder: f[2], value: p[f[0]] || (f[0] === 'org' ? '서일대학교' : '') });
      ui.set.appendChild(el('label', null, [f[1], inputs[f[0]]]));
    });
    ui.set.appendChild(el('div', { class: 'row' }, [el('button', { class: 'send', style: 'height:34px', text: '내 정보 저장', onclick: function () {
      var o = {}; PROFILE_FIELDS.forEach(function (f) { var v = inputs[f[0]].value.trim(); if (v) o[f[0]] = v; });
      ls(LS_PROFILE, JSON.stringify(o)); ui.set.style.display = 'none'; say('sys', '내 정보를 저장했습니다.');
    } })]));
    // AI 사용 코드
    var code = el('input', { type: 'text', placeholder: 'SEOIL-XXXX-XXXX', value: ls(LS_CODE), autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false' });
    var codeOut = el('div', { class: 'note', text: ls(LS_CODE) ? '' : '관리자에게 받은 코드를 넣으면 AI를 쓸 수 있습니다. 이 기기에만 저장됩니다.' });
    ui.set.appendChild(el('h4', { style: 'margin-top:6px', text: 'AI 사용 코드' }));
    ui.set.appendChild(code);
    ui.set.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'send', style: 'height:34px', text: '코드 저장', onclick: function () { var v = code.value.trim().toUpperCase(); ls(LS_CODE, v || null); code.value = v; if (v) checkCode(codeOut); else codeOut.textContent = '코드를 지웠습니다.'; drawEngine(); } }),
      el('button', { class: 'chip', text: '사용량 보기', onclick: function () { if (ls(LS_CODE)) checkCode(codeOut); } }),
    ]));
    ui.set.appendChild(codeOut);
    if (ls(LS_CODE)) checkCode(codeOut);
    if (!isDev()) return;
    var key = el('input', { type: 'password', placeholder: 'sk-ant-…', autocomplete: 'off' });
    var model = el('input', { type: 'text', value: ls(LS_MODEL) || DEFAULT_MODEL });
    var url = el('input', { type: 'text', placeholder: DEFAULT_URL, value: ls(LS_URL) });
    var mock = el('input', { type: 'checkbox' }); mock.checked = ls(LS_MOCK) === '1';
    ui.set.appendChild(el('div', { style: 'border-top:1px dashed #D9DCE1;padding-top:10px;font-size:12px;font-weight:700;color:#B4570E', text: '개발자 모드' }));
    ui.set.appendChild(el('div', { style: 'font-size:12px', text: ls(LS_KEY) ? ('키 있음: ' + mask(ls(LS_KEY))) : '키 없음' }));
    ui.set.appendChild(el('label', null, ['Claude API 키 (이 기기에만 저장, 화면에 다시 보이지 않음)', key]));
    ui.set.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'send', style: 'height:34px', text: '키 넣기', onclick: function () { var v = key.value.trim(); if (!v) return; ls(LS_KEY, v); key.value = ''; drawSettings(); say('sys', '키를 넣었습니다.'); } }),
      el('button', { class: 'chip', text: '키 빼기', onclick: function () { ls(LS_KEY, null); drawSettings(); say('sys', '이 기기에서 키를 지웠습니다.'); } }),
      el('button', { class: 'chip', text: '키 시험', onclick: testKey }),
    ]));
    ui.set.appendChild(el('label', null, ['모델', model]));
    ui.set.appendChild(el('label', null, ['서버 주소 (비우면 자동: 내 키가 있으면 Claude API, 없으면 학교 AI 중계 서버)', url]));
    ui.set.appendChild(el('label', { style: 'flex-direction:row;align-items:center;gap:6px' }, [mock, '시험 모드 (AI 부르지 않고 정해진 답)']));
    ui.set.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'send', style: 'height:34px', text: '개발 설정 저장', onclick: function () {
        ls(LS_MODEL, model.value.trim() || null); ls(LS_URL, url.value.trim() || null); ls(LS_MOCK, mock.checked ? '1' : null);
        drawSettings(); say('sys', '개발 설정을 저장했습니다.');
      } }),
      el('button', { class: 'chip', text: '칸 지도 보기', onclick: function () { var m = scan(); say('sys', m ? window.SeoilFill.mapText(m) : '양식 없음'); } }),
      el('button', { class: 'chip', text: '개발자 모드 끄기', onclick: function () { ls(LS_DEV, null); drawSettings(); ui.set.style.display = 'none'; } }),
    ]));
  }

  function testKey() {
    if (!ready()) { say('err', notReady()); return; }
    var t = say('sys', '키 시험 중…');
    fetch(aiUrl(), { method: 'POST', headers: apiHeaders(),
      body: JSON.stringify({ model: ls(LS_MODEL) || DEFAULT_MODEL, max_tokens: 16, messages: [{ role: 'user', content: '확인. "됨"이라고만 답해.' }] }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status)); return j; }); })
      .then(function (j) { t.remove(); say('sys', '키 정상 (' + (j.model || '') + ')'); })
      .catch(function (e) { t.remove(); say('err', '키 시험 실패: ' + (e && e.message || e)); });
  }
  function apiHeaders() {
    if (!ownKey()) return { 'content-type': 'application/json', 'x-seoil-code': ls(LS_CODE) };
    return { 'content-type': 'application/json', 'x-api-key': ls(LS_KEY), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
  }

  // ---------- 양식 ----------
  function scan() { var d = doc(); if (!d || !window.SeoilFill) return null; try { return window.SeoilFill.scan(d); } catch (e) { console.warn('[seoil-ai] scan', e); return null; } }
  function counts(m) {
    var c = { empty: 0, ph: 0, guide: 0, total: 0 };
    m.tables.forEach(function (t) { if (!t.guideBox) t.cells.forEach(function (x) { if (x.kind === 'empty') c.empty++; else if (x.kind === 'ph') c.ph++; else if (x.kind === 'guide') c.guide++; }); });
    m.paras.forEach(function (p) { if (p.kind === 'ph') c.ph++; });
    c.total = c.empty + c.ph + c.guide; return c;
  }
  var base = { fp: null, total: 0 };
  function refreshForm() {
    var m = scan();
    if (!m || (!m.tables.length && !m.paras.length)) { ui.form.textContent = '열린 양식 없음'; ui.prog.textContent = ''; ui.bar.style.width = '0'; return m; }
    var c = counts(m);
    if (base.fp !== m.fp.split('-').length + ':' + fileName()) { base = { fp: m.fp.split('-').length + ':' + fileName(), total: c.total }; }
    ui.form.textContent = '양식: ' + (fileName() || '열린 문서') + ' · 표 ' + m.tables.length + '개';
    var left = c.total, all = Math.max(base.total, left);
    ui.prog.textContent = '';
    ui.bar.style.width = all ? Math.round((all - left) * 100 / all) + '%' : '0';
    return m;
  }

  function toggle() {
    var open = !ui.panel.classList.contains('open');
    ui.panel.classList.toggle('open', open);
    document.body.classList.toggle('seoil-ai-open', open);
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 50);
    if (open) { refreshForm(); if (!S.msgs.length && !ui.log.childNodes.length) greet(); ui.input.focus(); }
  }
  function openPanel(on) { if (ui.panel.classList.contains('open') !== (on !== false)) toggle(); else refreshForm(); }

  function greet() {
    var m = refreshForm();
    if (!m || (!m.tables.length && !m.paras.length)) {
      say('ai', '채울 양식(hwp·hwpx)을 먼저 열어 주세요. 공문에 붙어 온 신청서·계획서·회의록 양식이면 됩니다.');
      var r0 = el('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' }, [el('button', { class: 'chip', text: '양식 열기', onclick: function () { if (window.SeoilStart) window.SeoilStart.pickForm(); } })]);
      ui.log.appendChild(r0); return;
    }
    var c = counts(m), guide = m.tables.filter(function (t) { return t.guideBox; }).length;
    if (S.mode === 'rewrite') {
      say('ai', '지난 문서의 사본을 열었습니다 (' + fileName() + '). 원본은 그대로 있습니다.\n이번 메모·녹취·요청 공문을 넣거나, 날짜부터 말해 주세요. 그대로 둘 칸과 바꿀 칸은 제가 나눠 드릴게요.');
      ui.log.appendChild(el('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' }, [
        el('button', { class: 'chip', text: '바꿀 칸부터 정리', onclick: function () { send('이번에 바꿔야 할 칸(날짜·회차·학기·안건·내용 등)과 그대로 둘 칸을 짧게 정리하고, 바꿀 것을 하나씩 물어봐 주세요.'); } }),
      ]));
      if (!ready()) say('sys', notReady());
      return;
    }
    if (writable() && !window.SeoilFill.looksFilled(m)) {
      say('ai', '보고서 본문을 같이 씁니다. 주제·목차·메모·md 파일을 주세요.\n장·절 구성부터 잡고, 한 절씩 양식의 □·○·- 형식으로 씁니다.');
      ui.log.appendChild(el('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' }, [
        el('button', { class: 'chip', text: '목차부터 잡기', onclick: function () { send('이 문서의 장·절 목차부터 같이 잡아 주세요. 무엇에 대한 보고서인지 먼저 물어봐 주세요.'); } }),
        el('button', { class: 'chip', text: '문단 형식 맞추기', onclick: reformatAll }),
      ]));
      if (!ready()) say('sys', notReady());
      return;
    }
    if (window.SeoilFill.looksFilled(m)) {
      say('ai', '이미 다 쓴 문서로 보입니다. 이 문서를 바탕으로 새로 쓸까요?\n원본은 그대로 두고 사본으로 엽니다. 날짜·내용처럼 바뀌는 칸만 고칩니다.');
      ui.log.appendChild(el('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' }, [
        el('button', { class: 'chip', text: '이걸로 새로 쓰기', onclick: function () { rewrite(); } }),
        el('button', { class: 'chip', text: '이 문서를 고치기', onclick: function () { S.mode = 'rewrite'; say('sys', '이 문서를 그대로 고칩니다. 저장하면 원본에 덮어씁니다.'); } }),
      ]));
      return;
    }
    say('ai', '메모·녹취·사진·요청 공문을 넣거나, 무엇에 대한 문서인지 말해 주세요.' + (guide ? '\n※ 「작성방법」 안내 상자는 채우지 않습니다. 제출 전에 지워 주세요.' : ''));
    var row = el('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' });
    row.appendChild(el('button', { class: 'chip', text: '내 정보로 채울 수 있는 칸부터', onclick: function () { send('내 정보와 오늘 날짜로 채울 수 있는 칸부터 채워 주세요. 나머지는 하나씩 물어봐 주세요.'); } }));
    if (!profile().name) row.appendChild(el('button', { class: 'chip', text: '내 정보 입력', onclick: function () { drawSettings(); ui.set.style.display = 'flex'; } }));
    ui.log.appendChild(row);
    if (!ready()) say('sys', notReady());
  }

  function say(kind, text) { var b = el('div', { class: kind, text: text }); ui.log.appendChild(b); ui.log.scrollTop = ui.log.scrollHeight; return b; }

  // ---------- 첨부 ----------
  function onFiles(e) { var files = Array.prototype.slice.call(e.target.files || []); e.target.value = ''; addFiles(files); }
  function b64(buf) {
    var bytes = new Uint8Array(buf), s = '', CH = 0x8000;
    for (var i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return btoa(s);
  }
  function hwpToText(bytes, name) {
    var d = doc(); if (!d) throw new Error('편집기가 아직 준비되지 않았습니다');
    var x = new d.constructor(bytes), out = [];
    try {
      var fl = JSON.parse(x.getFieldList()), f = {};
      fl.forEach(function (v) { if (!(v.name in f)) f[v.name] = v.value; });
      if (f.doctitle) out.push('[공문 정보] 문서번호: ' + (f.docnumber || '(없음)') + ' / 시행일: ' + (f.enforcedate || '(없음)') + ' / 제목: ' + f.doctitle);
    } catch (e) { /* 누름틀 없는 문서 */ }
    out.push('[본문 텍스트]\n' + String(x.getTextFileText()).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 20000));
    try { x.free && x.free(); } catch (e) {}
    return '[첨부: ' + name + ']\n' + out.join('\n');
  }
  function addFiles(files) {
    return Promise.all(Array.prototype.map.call(files || [], function (file) { return new Promise(function (done) {
      var r = new FileReader(), name = file.name, ext = (name.split('.').pop() || '').toLowerCase();
      r.onerror = function () { say('err', name + ' 읽기 실패'); done(); };
      r.onload = function () {
        try {
          var blk;
          if (ext === 'hwp' || ext === 'hwpx') blk = { type: 'text', text: hwpToText(new Uint8Array(r.result), name) };
          else if (ext === 'pdf') blk = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64(r.result) }, title: name };
          else if (/^(png|jpe?g|heic|webp)$/.test(ext) || /^image\//.test(file.type)) blk = { type: 'image', source: { type: 'base64', media_type: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg', data: b64(r.result) } };
          else blk = { type: 'text', text: '[첨부: ' + name + ']\n' + new TextDecoder().decode(r.result).slice(0, 30000) };
          S.attach.push({ name: name, block: blk }); drawAttach();
        } catch (err) { say('err', name + ' 읽기 실패: ' + (err && err.message || err)); }
        done();
      };
      r.readAsArrayBuffer(file);
    }); }));
  }
  function drawAttach() {
    ui.att.innerHTML = '';
    S.attach.forEach(function (a, i) {
      ui.att.appendChild(el('span', { title: '눌러서 빼기', style: 'cursor:pointer', onclick: function () { S.attach.splice(i, 1); drawAttach(); }, text: a.name + ' ×' }));
    });
  }

  // ---------- 명단 붙여넣기 (AI로 보내지 않음) ----------
  function parseGrid(text) {
    if (text.indexOf('\t') < 0) return null;
    var rows = text.replace(/\r/g, '').split('\n').filter(function (l) { return l.trim(); }).map(function (l) { return l.split('\t').map(function (c) { return c.trim(); }); });
    return rows.length >= 1 && rows.some(function (r) { return r.length >= 2; }) ? rows : null;
  }
  function pasteRows(rows) {
    var m = scan(); if (!m) { say('err', '양식이 열려 있지 않습니다.'); return; }
    var first = rows[0], isHead = first.every(function (c) { return c && !/\d{3,}/.test(c); }) && rows.length > 1;
    var header = isHead ? first : null, data = isHead ? rows.slice(1) : rows;
    var pick = window.SeoilFill.pickTableForRows(m, header, (data[0] || []).length);
    if (!pick) { say('err', '명단을 넣을 표를 찾지 못했습니다.'); return; }
    applyOps([{ rows: pick.t.id, start: pick.start, data: data }], '명단 ' + data.length + '행 → ' + pick.t.id + ' (AI로 보내지 않음)');
  }

  // ---------- 대화 ----------
  function writable() { var d = doc(); try { return !!(d && window.SeoilWrite && window.SeoilWrite.supports(d)); } catch (e) { return false; } }
  function docState(m, text) {
    // 강조 부탁이면 글자를 그대로 찾아야 하므로 본문·칸 글을 다 보여 준다
    var rw = S.mode === 'rewrite', d = doc(), body = '', full = rw || /강조|굵게|볼드|밑줄|형광|빨간|빨강|파란|색/.test(text || '');
    if (writable()) {
      var o = window.SeoilWrite.outline(d), lv = window.SeoilWrite.levels(d);
      body = '[본문 구조]\n' + window.SeoilWrite.outlineText(o, { full: full }) + '\n[이 양식의 단계] ' + Object.keys(lv).join(' ') + '\n\n';
    }
    var map = window.SeoilFill.mapText(m, { all: full });
    return (rw ? '[모드] 다시 쓰기\n' : '') + body + '[칸 지도' + (rw ? ' — 이미 쓴 글 포함' : '') + ']\n' + (map || '(없음)') + '\n\n[문서 이름] ' + fileName() + '\n[내 정보] ' + profileText() + '\n[오늘] ' + new Date().toISOString().slice(0, 10);
  }

  function send(text) {
    if (S.busy) return;
    text = text != null ? text : ui.input.value.trim();
    if (!text && !S.attach.length) return;
    var grid = !S.attach.length && parseGrid(text);
    if (grid) { ui.input.value = ''; say('me', '[명단 ' + grid.length + '줄 붙여넣기]'); pasteRows(grid); return; }
    var m = scan();
    if ((!m || (!m.tables.length && !m.paras.length)) && !writable()) { say('err', '채울 양식이 열려 있지 않습니다.'); return; }
    if (!ready()) { say('err', notReady()); return; }
    var content = [];
    if (S.pendingTool) { content.push({ type: 'tool_result', tool_use_id: S.pendingTool.id, content: S.pendingTool.result || '적용됨' }); S.pendingTool = null; }
    S.attach.forEach(function (a) { content.push(a.block); });
    content.push({ type: 'text', text: docState(m, text) + '\n\n[사용자] ' + (text || '첨부한 자료로 양식을 채워 주세요.') });
    say('me', (S.attach.length ? '첨부 ' + S.attach.map(function (a) { return a.name; }).join(', ') + (text ? '\n' : '') : '') + (text || ''));
    S.attach = []; drawAttach(); ui.input.value = '';
    S.msgs.push({ role: 'user', content: content });
    ui.log.querySelectorAll('.q button').forEach(function (b) { b.disabled = true; });
    call();
  }

  function busy(on) { S.busy = on; ui.send.disabled = on; ui.send.textContent = on ? '쓰는 중…' : '보내기'; }

  function call() {
    busy(true);
    var thinking = say('sys', '읽고 쓰는 중…');
    var p = isMock() ? mockReply() : fetch(aiUrl(), {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ model: ls(LS_MODEL) || DEFAULT_MODEL, max_tokens: 8000, system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }], tools: [TOOL], messages: cached(S.msgs) }),
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

  // 프롬프트 캐시: 지시문과 지금까지의 대화(첨부 포함)를 캐시
  function cached(msgs) {
    var out = msgs.map(function (m) { return { role: m.role, content: m.content }; });
    for (var i = out.length - 1; i >= 0; i--) {
      if (out[i].role === 'user' && Array.isArray(out[i].content) && out[i].content.length) {
        var c = out[i].content.slice(), last = Object.assign({}, c[c.length - 1], { cache_control: { type: 'ephemeral' } });
        c[c.length - 1] = last; out[i] = { role: 'user', content: c }; break;
      }
    }
    return out;
  }

  function handle(blocks) {
    (blocks || []).forEach(function (b) {
      if (b.type === 'text' && b.text.trim()) say('ai', b.text.trim());
      if (b.type === 'tool_use' && b.name === 'fill_form') {
        var inp = b.input || {}, res = '적용됨';
        if (inp.ops && inp.ops.length) res = applyOps(inp.ops) || res;
        S.pendingTool = { id: b.id, result: res };
        if (inp.remaining && inp.remaining.length) say('sys', '남은 칸: ' + inp.remaining.join(' · '));
        if (inp.question && inp.question.text) ask(inp.question);
      }
    });
  }

  /** ops 실행: 스냅샷 → 쓰기 → 구조 검사(다르면 되돌림) → 결과 글(AI에게 돌려줄 tool_result) */
  function applyOps(ops, label) {
    var d = doc(); if (!d) return '문서 없음';
    var before = scan(), snap = null;
    try { snap = d.saveSnapshot(); } catch (e) {}
    try {
      var eops = (ops || []).filter(function (o) { return o.emph; });
      var wops = (ops || []).filter(function (o) { return !o.emph && (o.under || o.after || o.chapter || o.reformat); });
      var fops = (ops || []).filter(function (o) { return !o.emph && !(o.under || o.after || o.chapter || o.reformat); });
      var r = fops.length ? window.SeoilFill.apply(d, before, fops) : { done: [], log: [] };
      if (wops.length) {
        var w = window.SeoilWrite.apply(d, wops);
        r.done = r.done.concat(w.done); r.log = r.log.concat(w.log);
      }
      if (eops.length) { // 강조는 글을 다 쓴 뒤에(문단 번호가 정해진 다음)
        var e = window.SeoilWrite.emphasize(d, eops);
        r.done = r.done.concat(e.done); r.log = r.log.concat(e.log);
      }
      var after = window.SeoilFill.scan(d), v = window.SeoilFill.verify(before, after);
      if (wops.length) { // 본문을 쓰면 표 순서가 밀릴 수 있다 → 원래 표가 하나도 줄지 않았는지만 본다
        v.bad = after.tables.length < before.tables.length ? ['표가 ' + (before.tables.length - after.tables.length) + '개 사라짐'] : [];
        v.ok = !v.bad.length;
      }
      if (!v.ok) {
        if (snap != null) d.restoreSnapshot(snap);
        bridge().changed('seoil-ai-undo');
        say('err', '원본 양식과 구조가 달라져 되돌렸습니다: ' + v.bad.join(', '));
        return '실패(되돌림): ' + v.bad.join(', ');
      }
      if (!r.done.length) { // 바뀐 것이 없으면 ✓ 상자 없이 사정만
        if (r.log.length) say('warn', r.log.join('\n'));
        return '바꾼 것 없음' + (r.log.length ? ': ' + r.log.join('; ') : '');
      }
      bridge().changed('seoil-ai-fill');
      var box = el('div', { class: 'applied' }, [
        el('span', { style: 'color:#1E8E5A;font-weight:700', text: '✓' }),
        el('span', { style: 'flex:1', text: label || ('썼습니다: ' + r.done.slice(0, 8).join(', ') + (r.done.length > 8 ? ' …' : '')) }),
      ]);
      if (snap != null) {
        box.appendChild(el('button', { class: 'chip', style: 'font-size:12px;padding:2px 10px', text: '되돌리기', onclick: function () {
          try { d.restoreSnapshot(snap); bridge().changed('seoil-ai-undo'); this.disabled = true; this.textContent = '되돌림'; refreshForm(); }
          catch (e) { say('err', '되돌리기 실패: ' + e.message); }
        } }));
      }
      ui.log.appendChild(box); ui.log.scrollTop = ui.log.scrollHeight;
      if (r.log.length) say('warn', r.log.join('\n'));
      refreshForm();
      return '적용됨: ' + r.done.join(', ') + (r.log.length ? ' / 참고: ' + r.log.join('; ') : '') + (v.placeholders.length ? ' / 남은 자리표시: ' + v.placeholders.slice(0, 10).join('; ') : '');
    } catch (err) {
      if (snap != null) { try { d.restoreSnapshot(snap); bridge().changed('seoil-ai-undo'); } catch (e) {} }
      say('err', '칸 쓰기 실패: ' + (err && err.message || err));
      return '실패: ' + (err && err.message || err);
    }
  }

  function ask(q) {
    var opts = el('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' });
    (q.options || []).forEach(function (o) { opts.appendChild(el('button', { class: 'chip', text: o, onclick: function () { send(o); } })); });
    opts.appendChild(el('button', { class: 'chip', text: '직접 쓰기', onclick: function () { ui.input.focus(); } }));
    var box = el('div', { class: 'q' }, [q.about ? el('b', { text: q.about }) : null, el('div', { text: q.text }), opts]);
    ui.log.appendChild(box); ui.log.scrollTop = ui.log.scrollHeight;
  }

  /** 동일한 문단 형식으로: 손으로 친 □○- 문단을 양식의 단계 스타일로(AI 없이) */
  function reformatAll() {
    if (!writable()) { say('err', '이 문서에는 단계 스타일(1. □ ○ -)이 없어 형식을 맞출 수 없습니다.'); return; }
    applyOps([{ reformat: 'all' }], '문단 형식을 양식의 단계에 맞췄습니다');
  }
  /** 지난 문서로 새로 쓰기: 사본을 새 이름으로 열고 다시 쓰기 모드로 */
  function rewrite() {
    if (!window.SeoilStart || !window.SeoilStart.forkCopy) { S.mode = 'rewrite'; reset(); return; }
    window.SeoilStart.forkCopy().then(function () {
      setTimeout(function () { openPanel(true); S.mode = 'rewrite'; reset(false, true); }, 300);
    }, function (e) { say('err', '사본을 열지 못했습니다: ' + (e && e.message || e)); });
  }
  function reset(quiet, keepMode) { if (!keepMode) S.mode = 'fill'; S.msgs = []; S.pendingTool = null; ui.log.innerHTML = ''; base = { fp: null, total: 0 }; refreshForm(); if (!quiet) greet(); }

  // ---------- 시험 모드: 첫 자리표시 하나만 바꾸고 질문 하나 ----------
  var mockStep = 0;
  function mockReply() {
    var m = scan(), ops = [], p = m && m.paras.filter(function (x) { return x.kind === 'ph'; })[0];
    var c = null; if (m) m.tables.some(function (t) { return t.cells.some(function (x) { if (x.kind === 'empty' && x.label) { c = x; return true; } return false; }); });
    if (mockStep++ === 0 && c) ops.push({ cell: c.id, text: profile().name || '시험 값' });
    if (p) { var hit = p.text.match(window.SeoilFill.PH); if (hit) ops.push({ para: p.id, find: hit[0], replace: '◆' }); }
    var r = { content: [{ type: 'text', text: '(시험 모드) 칸 ' + ops.length + '곳을 채웠습니다.' },
      { type: 'tool_use', id: 'm' + mockStep, name: 'fill_form', input: { ops: ops, remaining: ['나머지 칸'], question: { about: '확인', text: '이대로 계속할까요?', options: ['계속', '그만'] } } }] };
    return new Promise(function (res) { setTimeout(function () { res(r); }, 500); });
  }

  window.SeoilAI = { toggle: toggle, open: openPanel, reset: reset, send: send, addFiles: addFiles, refresh: refreshForm, rewrite: rewrite, reformatAll: reformatAll, applyOps: applyOps, state: S };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
