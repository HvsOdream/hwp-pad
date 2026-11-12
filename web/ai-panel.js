// 서일 오피스 — AI 작성 도우미 패널 (SO-03, 2026-11-03: 범용 양식 채우기).
// 편집기 오른쪽에 붙어, 열린 학교 양식(회의록·신청서·계획서 등)의 빈칸·자리표시를 대화로 채운다.
// - 칸 지도는 SeoilFill.scan(doc)(seoil-fill.js)이 원본에서 뽑고, AI는 "칸 → 값" 목록만 돌려준다.
// - 쓰기는 SeoilFill.apply가 원본 칸 위에 글자만 넣는다. 쓰고 나서 표·칸 수가 원본과 다르면 되돌린다.
// - 명단(탭 구분 글, 엑셀 복사)은 AI로 보내지 않고 앱이 직접 표에 넣는다(개인정보).
// - 내 정보(프로필)는 이 기기에만 저장, 신청서 라벨 칸·서명 블록 채우기에 쓴다.
// - AI는 Claude API를 브라우저에서 바로 부른다(파일럿: 키는 개발자 모드에서만). ?ai=mock 이면 정해진 답으로 흐름만 시험.
(function () {
  'use strict';
  var LS_KEY = 'seoil.ai.key', LS_MODEL = 'seoil.ai.model', LS_URL = 'seoil.ai.url', LS_DEV = 'seoil.ai.dev', LS_MOCK = 'seoil.ai.mock', LS_PROFILE = 'seoil.profile', LS_CODE = 'seoil.ai.code', LS_TOKEN = 'seoil.ai.token';
  var DEFAULT_MODEL = 'claude-sonnet-5-5';
  var DEFAULT_URL = 'https://api.anthropic.com/v1/messages';
  // 학교 AI 중계 서버(proxy/). 학교 키는 서버에만 있고, 앱은 관리자가 나눠 준 「AI 사용 코드」만 보낸다.
  var SCHOOL_URL = window.SEOIL_AI_URL || 'https://seoil-ai.withsky0.workers.dev/v1/messages';
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
    '#seoil-ai .len{display:flex;align-items:center;gap:4px;font-size:12px;color:#5F6670}#seoil-ai .len span{margin-right:4px}#seoil-ai .len button{font:inherit;font-size:12px;padding:2px 10px;border:1px solid #D9DCE1;border-radius:12px;background:#fff;color:#5F6670;cursor:pointer}#seoil-ai .len button.on{border-color:#2F5BEA;background:#EEF2FD;color:#2F5BEA;font-weight:600}',
    '#seoil-ai .len .fbtn{border-color:#C9D4F8;color:#2F5BEA}',
    '#seoil-ai .fold{border:1px solid #D9DCE1;border-radius:10px;background:#fff;display:flex;flex-direction:column;max-height:300px;overflow:hidden}',
    '#seoil-ai .fold .fh{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid #ECEEF1;font-size:12px;color:#5F6670}#seoil-ai .fold .fh b{color:#1F2329;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px}',
    '#seoil-ai .fold .fh button{font:inherit;font-size:12px;border:0;background:none;color:#2F5BEA;cursor:pointer;padding:0 2px}',
    '#seoil-ai .fold input{font:inherit;font-size:13px;border:0;border-bottom:1px solid #ECEEF1;padding:7px 10px;outline:none}',
    '#seoil-ai .fold .fl{overflow:auto;display:flex;flex-direction:column}',
    '#seoil-ai .fold .fi{display:flex;gap:8px;align-items:baseline;padding:7px 10px;border:0;background:none;text-align:left;font:inherit;font-size:13px;cursor:pointer}#seoil-ai .fold .fi:hover{background:#F3F6FE}',
    '#seoil-ai .fold .fi span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#seoil-ai .fold .fi small{color:#8A9099;flex:none}',
    '#seoil-ai .fold .fn{padding:14px 10px;font-size:12px;color:#5F6670;text-align:center}',
    '#seoil-ai .att{display:flex;flex-wrap:wrap;gap:6px}#seoil-ai .att span{font-size:12px;background:#EEF2FD;color:#2F5BEA;border-radius:6px;padding:2px 8px}',
    '#seoil-ai textarea,#seoil-ai input[type=text],#seoil-ai input[type=password]{width:100%;font:inherit;font-size:13px;border:1px solid #D9DCE1;border-radius:8px;padding:8px 10px;resize:none}',
    '#seoil-ai .send{font:inherit;font-size:13px;padding:0 14px;height:40px;border:0;border-radius:8px;background:#2F5BEA;color:#fff;cursor:pointer;flex:none}#seoil-ai .send:disabled{background:#9DB2F5;cursor:default}',
    '#seoil-ai .clip{border:1px solid #D9DCE1;background:#fff;border-radius:8px;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;flex:none;cursor:pointer}',
    '#seoil-ai .set{flex:1;padding:12px 14px 16px;display:flex;flex-direction:column;gap:10px;background:#FAFAFB;overflow:auto}',
    '#seoil-ai .card{background:#fff;border:1px solid #ECEEF1;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px}',
    '#seoil-ai .card .top{display:flex;align-items:center;gap:8px}#seoil-ai .card .top b{font-size:13px;flex:none}',
    '#seoil-ai .card .sum{font-size:12px;color:#5F6670;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}',
    '#seoil-ai .card .body{display:flex;flex-direction:column;gap:8px}',
    '#seoil-ai .on-dot{color:#1E8E3E}#seoil-ai .off-dot{color:#B0B5BD}',
    '#seoil-ai .link{border:0;background:none;color:#2F5BEA;font:inherit;font-size:12px;cursor:pointer;padding:0;text-align:left}#seoil-ai .link:hover{text-decoration:underline}',
    '#seoil-ai .ibtn.on{background:#EEF2FD;color:#2F5BEA}',
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
    '- {"deleteTable":"T5"} 표 하나를 통째로 지움(다 채운 부분의 [작성 방법] 안내 상자를 지울 때만. 사람이 지워 달라고 할 때).',
    '- {"rows":"T6","start":1,"data":[["값","값"],…]} 명단·반복 행 표. start 행부터, 그 행의 빈칸에 왼쪽부터 차례로 넣음(라벨 칸은 건너뜀). 행이 모자라면 프로그램이 늘림.',
    '- 서명·도장 칸((인), (서명))은 비워 둔다. 날짜는 사용자가 따로 말하지 않으면 오늘.',
    '',
    '[쓰는 원칙]',
    '- 모르는 사실(숫자·날짜·이름·건수·금액)은 지어내지 말고 question으로 묻는다. 질문은 한 번에 하나, 고를 수 있는 답 2~3개를 options로.',
    '- 아는 칸은 바로 채운다. [내 정보]로 채울 수 있는 칸(학과·성명·직위·연락처·책임자 등)은 묻지 않고 채운다.',
    '- 서술 칸(회의 내용·필요성·추진 내용 등)은 □ 큰 항목, ○ 하위, - 세부 3단으로 쓴다. 각 줄 앞에 기호를 붙이고 ○는 앞에 공백 1칸, -는 2칸. 안내문에 분량(예: 200자 내외)이 있으면 지킨다.',
    '- 문체는 개조식 명사형 종결(…함, …임, …예정). 군더더기 없이.',
    '- 사용자가 고쳐 달라고 하면 해당 칸만 다시 보낸다.',
    '- 범위를 말하지 않은 고쳐 쓰기 부탁("더 구체적으로", "길게", "자세히", "다시 써 줘")은 서술 칸(회의 내용·회의 결과·필요성·추진 내용처럼 긴 글 칸)만 다시 쓴다. 이미 채운 짧은 칸(프로그램명·회의명·일시·장소·안건·소속·성명 등)은 사용자가 그 칸을 짚어 말하지 않으면 다시 보내지 않는다.',
    '- 표의 다른 칸에 이미 들어간 정보(회의명·일시·장소·목적·참석 대상)를 서술 칸에 "개요"로 되풀이하지 않는다. 서술 칸은 그 칸의 라벨이 묻는 내용만 쓴다.',
    '',
    '[분량 — 메시지의 [분량] 줄을 따른다. 서술 칸에만 해당]',
    '- 간단: 칸마다 □ 1~2개, □ 아래 ○ 1~2개. - 는 쓰지 않는다.',
    '- 보통: 칸마다 □ 2~3개, □ 아래 ○ 2~3개, 꼭 필요한 곳에만 -.',
    '- 자세히: 칸마다 □ 3~4개, □ 아래 ○ 3~4개, ○ 아래 - 로 근거·세부·담당·기한을 단다. 한 줄은 한 문장 분량(40~70자)으로 쓴다.',
    '- 분량은 받은 자료를 얼마나 풀어 쓰느냐이지, 없는 사실을 만들어도 된다는 뜻이 아니다. 자료가 모자라 그 분량을 채울 수 없으면 채울 수 있는 만큼만 쓰고 무엇이 더 필요한지 question으로 묻는다.',
    '- 안내문에 분량(예: 200자 내외)이 적힌 칸은 그 안내가 먼저다.',
    '',
    '[회의록 — 양식이 회의록일 때]',
    '- 먼저 받은 자료가 무엇인지 본다. (가) 회의 메모·녹취·결과 정리 = 실제 논의가 들어 있음 / (나) 개최 안내·요청 공문·계획 = 언제 어디서 무엇을 논의할지만 있고 실제 논의·결정이 없음.',
    '- (나)만 받았으면: 회의명·일시·장소·안건처럼 자료에 있는 칸은 바로 채우고, 회의 내용·회의 결과 칸은 쓰기 전에 question으로 묻는다. text "회의에서 실제로 나온 이야기(메모·녹취)가 있나요?", options 예: "메모를 붙여 넣을게요" / "안건 기준 초안으로 써 주세요" / "내용 칸은 비워 두세요".',
    '- "안건 기준 초안"을 고르면: 공문의 목적·안건·참석 대상에서 논의 항목을 뽑아 □(안건별 논의 주제) → ○(다룰 내용·검토 관점) 으로 쓰고, 실제 발언·결정·수치·일정이 들어갈 자리마다 [확인 필요]를 남긴다. 초안임을 채팅 답에 한 문장으로 알린다.',
    '- 회의 내용 칸: 안건별로 □ 안건·논의 주제 → ○ 논의된 내용·제시된 의견(누가 어떤 입장이었는지 자료에 있으면 소속 단위로) → - 근거·세부. 시간 순서가 아니라 안건 순서로 묶는다.',
    '- 회의 결과 칸: □ 결정 사항 → ○ 내용, □ 후속 조치 → ○ 할 일(담당·기한이 자료에 있으면 괄호로). 회의 내용을 되풀이하지 않고 "그래서 무엇을 하기로 했는가"만 쓴다.',
    '- 기타 칸: 회의비 집행·차기 회의 일정·첨부처럼 본 안건이 아닌 것만. 없으면 비워 둔다.',
    '- remaining에는 아직 못 채운 칸과 이유를 짧게. 채팅 답은 한두 문장.',
    '- PC에 있는 파일을 불러올 수 있느냐고 물으면: 직접 찾아 열지는 못하지만, 입력란 위 「자료 폴더」에서 폴더를 한 번 정해 두면 목록에서 눌러 넣을 수 있고(PC), 클립 단추·끌어다 놓기·캡처 붙여넣기(Ctrl+V)로도 넣을 수 있다고 안내한다.',
    '',
    '[본문 쓰기 — 메시지에 [본문 구조]가 있을 때: 계획서·보고서]',
    '- [본문 구조]의 B12 같은 번호가 문단입니다. [Ⅰ]은 장 제목 상자, [1.][가.][1)][가)][(1)]은 제목 단계, [□][○][-]는 개조식 단계, [본문]은 일반 문단.',
    '- 쓰기 op: {"under":"B12","items":[{"level":"□","text":"…"},…]} = 제목 B12 아래 본문을 통째로 새로 씀(표·그림은 남음). {"after":"B20","items":[…]} = B20 뒤에 이어 씀. {"chapter":"추진 계획","after":"B40"} = 새 장 상자(번호 자동). {"reformat":"all"} = 손으로 친 □○- 문단을 단계 형식으로 맞춤.',
    '- 문단 모양 정리 op: {"tidy":"B10-B30","gap":"small"} = 그 범위의 개조식(- ○ □)·번호 제목(1) 가) (1)) 문단에 내어쓰기(둘째 줄을 글머리 다음 글자에 맞춤)와 문단 사이 간격을 준다. gap: none|small(3pt)|normal(5pt)|wide(8pt). 글은 바꾸지 않는다. "문단 모양 잡아 줘·간격 띄워 줘·내어쓰기" 같은 부탁이면 이것을 쓰고, 범위는 [선택한 문단(블록)]이 있으면 그 범위, 없으면 사용자가 말한 제목 아래(다음 같은 단계 제목 전까지)로 잡는다.',
    '- items의 level은 위 단계 중 하나. 제목 단계(1. 가. 1) …)는 번호까지 text에 쓴다(예: "2. 추진 배경"). □ ○ - 단계는 기호 없이 내용만 쓴다(기호는 양식이 붙임).',
    '- under의 첫 item이 그 제목과 같은 단계면 제목 글을 그 글로 바꾼다(예: under B31(1. 절 제목) + 첫 item {"level":"1.","text":"1. 추진 배경"}). 장 제목 상자도 같음({"level":"Ⅰ","text":"서론"}).',
    '- 장(Ⅰ) 아래를 통째로 쓰는 under는 그 장 전체를 지우므로, 보통은 절(1.) 단위 under를 쓴다.',
    '- 계획서 문체: □는 핵심 한 줄, ○는 근거·내용, -는 세부. 모두 개조식 명사형 종결(…함, …임, …필요). 한 □ 아래 ○는 2~4개.',
    '- 한 번에 한 절(1. 단위)씩 쓴다. 다 쓰면 다음 절로 갈지 question으로 묻는다. 긴 md나 자료가 오면 먼저 장·절 구성(목차)을 제안하고 확인받는다.',
    '- 자료에 없는 수치·기관명·실적은 지어내지 말고 [확인 필요] 표시를 남기거나 묻는다.',
    '',
    '[부분 강조 — 사용자가 강조·굵게·밑줄·색을 부탁할 때]',
    '- 강조 op: {"emph":"B12","find":"핵심 문구","style":"bold"}. emph는 문단(B12·P5)이나 칸(T2.r0c1), 어디든이면 "all"(이때 find 필수). find가 없으면 그 문단·칸 전체.',
    '- style: bold(굵게), underline(밑줄), red(빨강), blue(파랑), shade(형광), italic, plain(보통: 예시 글씨의 기울임·색을 지우고 본문 글씨로). find 없이 P·T id만 주면 그 문단·칸 전체. 섞을 때는 "bold+underline".',
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
  // 서술 칸 분량(간단·보통·자세히) — 기기에 기억
  var LS_LEN = 'seoil.ai.len', LENS = ['간단', '보통', '자세히'];
  function lenNow() { var v = ls(LS_LEN); return LENS.indexOf(v) >= 0 ? v : '보통'; }
  function setLen(v) { ls(LS_LEN, v); drawLen(); }
  function drawLen() { if (!ui.len) return; Array.prototype.forEach.call(ui.len.querySelectorAll('button'), function (b) { b.classList.toggle('on', b.dataset.len === lenNow()); }); }
  var ui = {};

  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var fab = el('button', { id: 'seoil-ai-fab', title: 'AI 작성 도우미', onclick: toggle, text: 'AI 작성' });
    ui.title = el('b', { style: 'font-size:15px;white-space:nowrap', text: 'AI 작성' });
    ui.engine = el('span', { class: 'badge' });
    var taps = 0, tapT = 0;
    ui.title.addEventListener('click', function () {
      var now = Date.now(); taps = now - tapT < 800 ? taps + 1 : 1; tapT = now;
      if (taps >= 5) { taps = 0; ls(LS_DEV, isDev() ? null : '1'); say('sys', isDev() ? '개발자 모드를 켰습니다.' : '개발자 모드를 껐습니다.'); setOpen(true); }
    });
    ui.form = el('div', { style: 'font-size:12px;color:#5F6670' });
    ui.bar = el('i');
    ui.prog = el('div', { style: 'font-size:12px;color:#5F6670' });
    var hd = el('div', { class: 'hd' }, [
      el('div', { class: 'row' }, [ui.title, ui.engine, el('span', { style: 'flex:1' }),
        el('button', { class: 'ibtn', title: '대화를 지우고 처음부터', onclick: newChat, text: '새 대화' }),
        ui.setBtn = el('button', { class: 'ibtn', title: '내 정보·AI 코드·Claude 연결', onclick: function () { setOpen(!ui.setOn); }, text: '설정' }),
        el('button', { class: 'ibtn', title: '닫기', onclick: toggle, text: '닫기' })]),
      ui.form, ui.prog, el('div', { class: 'bar' }, [ui.bar]),
    ]);
    ui.set = el('div', { class: 'set', style: 'display:none' });
    ui.log = el('div', { class: 'log' });
    ui.att = el('div', { class: 'att' });
    ui.file = el('input', { type: 'file', multiple: 'multiple', accept: '.hwp,.hwpx,.pdf,.png,.jpg,.jpeg,.txt,.md,image/*', style: 'display:none', onchange: onFiles });
    ui.input = el('textarea', { rows: '2', placeholder: '메모·녹취·요청 공문을 넣거나, 무엇에 대한 문서인지 말해 주세요. 명단은 엑셀에서 복사해 붙여 넣으면 AI 없이 표에 들어갑니다.', onkeydown: function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } } });
    ui.send = el('button', { class: 'send', onclick: function () { send(); }, text: '보내기' });
    var clip = el('button', { class: 'clip', title: '자료 첨부 (메모·녹취 글, 사진, 요청 공문 hwp·pdf)', onclick: function () { ui.file.click(); } });
    clip.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5F6670" stroke-width="1.8"><path d="M21 11.5l-8.6 8.6a5 5 0 0 1-7-7l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8L10.2 17.9a1.7 1.7 0 0 1-2.4-2.4l8-8"/></svg>';
    ui.len = el('div', { class: 'len', title: '회의 내용·필요성 같은 서술 칸을 얼마나 길게 쓸지' }, [el('span', { text: '분량' })].concat(LENS.map(function (v) { var b = el('button', { type: 'button', text: v, onclick: function () { setLen(v); } }); b.dataset.len = v; return b; })));
    // 자료 폴더: 폴더를 한 번 정해 두면 목록에서 눌러 첨부한다(파일 고르기 창을 매번 거치지 않게). 폴더 고르기를 못 하는 기기(아이패드 등)에서는 숨김.
    if (typeof window.showDirectoryPicker === 'function') {
      ui.len.appendChild(el('span', { style: 'flex:1' }));
      ui.len.appendChild(el('button', { type: 'button', class: 'fbtn', title: '정해 둔 폴더의 파일을 목록에서 골라 첨부', onclick: function () { toggleFolder(); }, text: '자료 폴더' }));
    }
    ui.folder = el('div', { class: 'fold', style: 'display:none' });
    var ft = ui.ft = el('div', { class: 'ft' }, [ui.folder, ui.att, ui.len, el('div', { class: 'row', style: 'align-items:flex-end' }, [clip, ui.input, ui.send]), ui.file]);
    drawLen();
    ui.panel = el('div', { id: 'seoil-ai' }, [hd, ui.set, ui.log, ft]);
    ui.set.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    ['keydown', 'keyup', 'keypress'].forEach(function (t) { ui.panel.addEventListener(t, function (e) { e.stopPropagation(); }); });
    ui.panel.addEventListener('drop', function (e) { e.preventDefault(); e.stopPropagation(); addFiles(e.dataTransfer.files); });
    ui.panel.addEventListener('dragover', function (e) { e.preventDefault(); });
    // 캡처 도구·화면 캡처로 복사한 그림을 붙여넣으면 첨부로 받는다(2026-11-11). 글자 붙여넣기는 그대로 입력란으로.
    ui.panel.addEventListener('paste', function (e) {
      var cd = e.clipboardData, imgs = [];
      if (!cd) return;
      Array.prototype.forEach.call(cd.items || [], function (it) { if (it.kind === 'file' && /^image\//.test(it.type)) { var f = it.getAsFile(); if (f) imgs.push(f); } });
      if (!imgs.length) Array.prototype.forEach.call(cd.files || [], function (f) { if (/^image\//.test(f.type)) imgs.push(f); });
      if (!imgs.length) return;
      e.preventDefault(); e.stopPropagation();
      var d = new Date(), z = function (n) { return (n < 10 ? '0' : '') + n; }, stamp = z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds());
      addFiles(imgs.map(function (f, i) {
        var ext = (f.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
        var generic = !f.name || /^image\.\w+$/i.test(f.name);
        return generic ? new File([f], '캡처_' + stamp + (imgs.length > 1 ? '_' + (i + 1) : '') + '.' + ext, { type: f.type }) : f;
      }));
    });
    document.body.appendChild(ui.panel); document.body.appendChild(fab);
    refreshForm();
  }

  function ownKey() { return !!ls(LS_KEY); } // 개발자 모드에서 넣은 자기 키 → Claude API 직접
  function aiUrl() { return ls(LS_URL) || (ownKey() ? DEFAULT_URL : SCHOOL_URL); }
  function ready() { return isMock() || ownKey() || ((!!ls(LS_TOKEN) || !!ls(LS_CODE)) && !!aiUrl()); }
  var NOT_READY_CODE = '로그인하면 AI 작성을 쓸 수 있습니다. 위의 「설정」에서 학교 이메일로 가입·로그인해 주세요.';
  function notReady() { return (!(ls(LS_TOKEN) || ls(LS_CODE)) || ownKey()) ? NOT_READY_CODE : '학교 AI 서버가 아직 준비되지 않았습니다. 관리자에게 알려 주세요.'; }
  // ---------- 로그인(학교 AI 계정) ----------
  function srv(path) { return aiUrl().replace(/\/v1\/messages$/, path); }
  function authHeaders() {
    var h = { 'content-type': 'application/json' };
    if (ls(LS_TOKEN)) h.authorization = 'Bearer ' + ls(LS_TOKEN); else if (ls(LS_CODE)) h['x-seoil-code'] = ls(LS_CODE);
    return h;
  }
  function post(path, body) {
    return fetch(srv(path), { method: 'POST', headers: authHeaders(), body: JSON.stringify(body || {}) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status)); return j; }); });
  }
  var meCache = null;
  function fetchMe() {
    return fetch(srv('/v1/me'), { headers: authHeaders() })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error((j.error && j.error.message) || ('HTTP ' + r.status)); e.status = r.status; throw e; } return j; }); })
      .then(function (j) { meCache = j; drawEngine(); return j; });
  }
  function meLine(j) {
    if (!j) return '';
    if (j.status) return j.name + ' · ' + ({ pending: '승인 대기', active: '이번 달 ' + j.used + '% 사용', off: '사용 중지' }[j.status] || j.status);
    return j.name + ' · 오늘 ' + j.today + '/' + j.daily + '회';
  }
  function signedIn(res) {
    ls(LS_TOKEN, res.token); meCache = res.user;
    // 내 정보가 비어 있으면 가입 정보로 채운다
    var p = profile(), u = res.user || {};
    if (!p.name && u.name) { p.name = u.name; if (u.org && !p.org) p.org = u.org; if (u.dept && !p.dept) p.dept = u.dept; if (u.email && !p.email) p.email = u.email; ls(LS_PROFILE, JSON.stringify(p)); }
    drawSettings(); drawEngine();
  }
  function mask(k) { return k ? k.slice(0, 7) + '…' + k.slice(-4) : ''; }
  function drawEngine() {
    ui.engine.textContent = isMock() ? '시험 모드' : ownKey() ? '내 키'
      : (meCache && meCache.status === 'active') ? '학교 AI · ' + meCache.used + '%'
      : (meCache && meCache.status === 'pending') ? '승인 대기' : '학교 AI';
  }
  // 설정 화면: 대화 자리를 덮는 한 장. 위 「설정」을 다시 누르거나 「← 대화로」·Esc로 닫는다.
  function setOpen(on) {
    ui.setOn = !!on;
    ui.set.style.display = on ? 'flex' : 'none';
    ui.log.style.display = on ? 'none' : '';
    ui.ft.style.display = on ? 'none' : '';
    ui.setBtn.classList.toggle('on', !!on);
    ui.setBtn.textContent = on ? '← 대화' : '설정';
    ui.setBtn.title = on ? '하던 대화로 돌아가기' : '내 정보·로그인·Claude 연결';
    if (on) drawSettings(); else { drawEngine(); ui.log.scrollTop = ui.log.scrollHeight; ui.input.focus(); }
  }
  // 접히는 카드: 제목 · 한 줄 상태 · 펼치면 내용
  function card(title, sum, body, open) {
    var b = el('div', { class: 'body', style: open ? '' : 'display:none' }, body);
    var t = el('button', { class: 'link', text: open ? '접기' : '바꾸기' });
    t.addEventListener('click', function () { var o = b.style.display === 'none'; b.style.display = o ? '' : 'none'; t.textContent = o ? '접기' : '바꾸기'; });
    var c = el('div', { class: 'card' }, [el('div', { class: 'top' }, [el('b', { text: title }), sum, t]), b]);
    c.fold = function () { b.style.display = 'none'; t.textContent = '바꾸기'; };
    return c;
  }
  function profileSum() {
    var p = profile(), L = [p.name, p.dept, p.title].filter(Boolean);
    return L.length ? L.join(' · ') : '아직 없음';
  }
  function drawSettings() {
    drawEngine();
    ui.set.innerHTML = '';
    ui.set.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'send', style: 'height:32px;font-size:13px', text: '← 하던 대화로', onclick: function () { setOpen(false); } }),
      el('span', { style: 'flex:1' }),
      el('span', { class: 'note', text: '내 정보는 이 기기에만 저장됩니다' })]));

    // 1) 내 정보
    var p = profile(), inputs = {}, pSum = el('span', { class: 'sum', text: profileSum() });
    var pBody = [el('div', { class: 'note', text: '신청서의 학과·성명·직위 같은 칸을 묻지 않고 채웁니다.' })];
    PROFILE_FIELDS.forEach(function (f) {
      inputs[f[0]] = el('input', { type: 'text', placeholder: f[2], value: p[f[0]] || (f[0] === 'org' ? '서일대학교' : '') });
      pBody.push(el('label', null, [f[1], inputs[f[0]]]));
    });
    var pCard;
    pBody.push(el('div', { class: 'row' }, [el('button', { class: 'send', style: 'height:34px', text: '저장', onclick: function () {
      var o = {}; PROFILE_FIELDS.forEach(function (f) { var v = inputs[f[0]].value.trim(); if (v) o[f[0]] = v; });
      ls(LS_PROFILE, JSON.stringify(o)); pSum.textContent = '✓ ' + profileSum(); pCard.fold();
    } })]));
    pCard = card('내 정보', pSum, pBody, !profile().name);
    ui.set.appendChild(pCard);

    // 2) 학교 AI 로그인 (예전 사용 코드는 「코드로 쓰기」 안에)
    ui.set.appendChild(accountCard());

    // 3) 설치판: 내 Claude(데스크톱·Claude Code)가 서일 오피스를 다루게
    var D = window.seoilDesktop;
    if (D && D.connectClaude) ui.set.appendChild(claudeCard(D));
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
      el('button', { class: 'chip', text: '개발자 모드 끄기', onclick: function () { ls(LS_DEV, null); setOpen(false); } }),
    ]));
  }

  function accountCard() {
    var sum = el('span', { class: 'sum', text: ls(LS_TOKEN) ? (meCache ? meLine(meCache) : '확인 중…') : ls(LS_CODE) ? '사용 코드로 쓰는 중' : '로그인 안 함' });
    var msg = el('div', { class: 'note' });
    function err(e) { msg.style.color = '#B42318'; msg.textContent = (e && e.message) || String(e); }
    function note(t) { msg.style.color = ''; msg.textContent = t; }
    var body = [];
    if (ls(LS_TOKEN)) {
      var oldPw = el('input', { type: 'password', placeholder: '지금 비밀번호', autocomplete: 'current-password' });
      var newPw = el('input', { type: 'password', placeholder: '새 비밀번호 (8자 이상)', autocomplete: 'new-password' });
      var pwBox = el('div', { class: 'body', style: 'display:none' }, [oldPw, newPw, el('div', { class: 'row' }, [el('button', { class: 'send', style: 'height:32px', text: '바꾸기', onclick: function () {
        post('/v1/password', { old: oldPw.value, new: newPw.value }).then(function () { oldPw.value = newPw.value = ''; pwBox.style.display = 'none'; note('비밀번호를 바꿨습니다.'); }, err);
      } })])]);
      body.push(el('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' }, [
        el('button', { class: 'chip', text: '비밀번호 바꾸기', onclick: function () { pwBox.style.display = pwBox.style.display === 'none' ? '' : 'none'; } }),
        el('button', { class: 'chip', text: '로그아웃', onclick: function () { post('/v1/logout').catch(function () {}).then(function () { ls(LS_TOKEN, null); meCache = null; drawSettings(); }); } }),
      ]), pwBox, msg);
      fetchMe().then(function (j) {
        sum.textContent = meLine(j);
        if (j.status === 'pending') note('관리자가 가입을 승인하면 바로 쓸 수 있습니다.');
        else if (j.status === 'active') note(j.email + ' · 이번 달 사용량 ' + j.used + '% (매달 1일에 다시 채워집니다)');
      }, function (e) { if (e.status === 401) { ls(LS_TOKEN, null); meCache = null; sum.textContent = '로그인 안 함'; } err(e); });
      return card('학교 AI', sum, body, false);
    }
    // 로그인 / 가입
    var mode = 'login';
    var email = el('input', { type: 'email', placeholder: '이메일 (학교 메일)', autocomplete: 'username', autocapitalize: 'off', spellcheck: 'false' });
    var pw = el('input', { type: 'password', placeholder: '비밀번호 (8자 이상)', autocomplete: 'current-password' });
    var p = profile();
    var nm = el('input', { type: 'text', placeholder: '이름', value: p.name || '' });
    var org = el('input', { type: 'text', placeholder: '소속 (예: 서일대학교)', value: p.org || '' });
    var dept = el('input', { type: 'text', placeholder: '학과·부서', value: p.dept || '' });
    var extra = el('div', { class: 'body', style: 'display:none' }, [nm, org, dept]);
    var go = el('button', { class: 'send', style: 'height:34px', text: '로그인' });
    var sw = el('button', { class: 'link', text: '처음이면 가입하기' });
    function setMode(m) { mode = m; extra.style.display = m === 'signup' ? '' : 'none'; go.textContent = m === 'signup' ? '가입' : '로그인'; sw.textContent = m === 'signup' ? '이미 가입했으면 로그인' : '처음이면 가입하기'; pw.autocomplete = m === 'signup' ? 'new-password' : 'current-password'; note(''); }
    sw.addEventListener('click', function () { setMode(mode === 'login' ? 'signup' : 'login'); });
    go.addEventListener('click', function () {
      go.disabled = true; note(mode === 'signup' ? '가입하는 중…' : '로그인하는 중…');
      var req = mode === 'signup'
        ? post('/v1/signup', { email: email.value, password: pw.value, name: nm.value, org: org.value, dept: dept.value })
        : post('/v1/login', { email: email.value, password: pw.value });
      req.then(function (res) { ls(LS_CODE, null); signedIn(res); say('sys', res.user && res.user.status === 'pending' ? '가입했습니다. 관리자가 승인하면 AI 작성을 쓸 수 있습니다.' : '로그인했습니다.'); }, function (e) { go.disabled = false; err(e); });
    });
    pw.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) go.click(); });
    // 예전 방식: 관리자가 준 사용 코드
    var code = el('input', { type: 'text', placeholder: 'SEOIL-XXXX-XXXX', value: ls(LS_CODE), autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false' });
    var codeBox = el('div', { class: 'body', style: 'display:none' }, [code, el('div', { class: 'row' }, [el('button', { class: 'chip', text: '코드 저장', onclick: function () {
      var v = code.value.trim().toUpperCase(); ls(LS_CODE, v || null); code.value = v; drawEngine();
      if (v) fetchMe().then(function (j) { sum.textContent = meLine(j); note('코드 확인: ' + meLine(j)); }, err); else sum.textContent = '로그인 안 함';
    } })])]);
    body.push(el('div', { class: 'note', text: '학교 이메일로 가입하면 AI 작성을 쓸 수 있습니다. 한 달 사용량 안에서 마음껏 쓰고, 매달 1일에 다시 채워집니다.' }),
      email, pw, extra, el('div', { class: 'row', style: 'gap:10px' }, [go, sw]), msg,
      el('button', { class: 'link', style: 'align-self:flex-start;font-size:12px', text: '관리자에게 받은 사용 코드로 쓰기', onclick: function () { codeBox.style.display = codeBox.style.display === 'none' ? '' : 'none'; } }), codeBox);
    return card('학교 AI', sum, body, true);
  }

  function claudeCard(D) {
    var sum = el('span', { class: 'sum', text: '확인 중…' });
    var act = el('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' });
    var msg = el('div', { class: 'note' });
    var body = [el('div', { class: 'note', text: '내 Claude 데스크톱에 "서일 오피스로 이 양식 채워 줘"라고 하면, 이 창에서 채워지는 걸 보며 직접 고칠 수 있습니다.' }), act, msg];
    var c = card('내 Claude', sum, body, true);
    c.querySelector('.top .link').style.display = 'none'; // 접을 것이 없다
    function busy(b) { Array.prototype.forEach.call(act.querySelectorAll('button'), function (x) { x.disabled = b; }); }
    function run(fn) {
      busy(true); msg.textContent = '잠시만요…';
      fn().then(function (r) {
        if (r && r.cancelled) msg.textContent = '';
        else if (r && r.msg) msg.textContent = r.msg;
        else if (r && r.ok) msg.textContent = 'Claude 데스크톱을 트레이에서 완전히 끄고 다시 켜면 연결됩니다.'; // 0.2.0 설치판
        draw();
      }).catch(function (e) { msg.textContent = '실패: ' + (e && e.message || e); busy(false); });
    }
    function btn(cls, text, fn) { return el('button', { class: cls, style: cls === 'send' ? 'height:34px' : '', text: text, onclick: fn }); }
    function draw() {
      act.innerHTML = '';
      if (!D.claudeStatus) { // 예전 설치판(0.2.0): 상태를 모른다
        sum.textContent = '';
        act.appendChild(btn('send', '연결', function () { run(D.connectClaude); }));
        return;
      }
      D.claudeStatus().then(function (s) {
        sum.innerHTML = '';
        if (!s.installed) {
          sum.textContent = 'Claude 데스크톱 없음';
        } else if (s.connected) {
          sum.appendChild(el('span', { class: 'on-dot', text: '● ' })); sum.appendChild(document.createTextNode('연결됨'));
          act.appendChild(btn('chip', '연결 끊기', function () { run(D.disconnectClaude); }));
        } else {
          sum.appendChild(el('span', { class: 'off-dot', text: '○ ' })); sum.appendChild(document.createTextNode('연결 안 됨'));
          act.appendChild(btn('send', '연결', function () { run(D.connectClaude); }));
        }
        act.appendChild(btn('link', 'Claude Code에서 쓰기 — 명령 복사', function () {
          D.copyClaudeCode().then(function () { msg.textContent = '명령을 복사했습니다. 터미널에 붙여 넣어 한 번 실행하세요.'; });
        }));
      }).catch(function () { sum.textContent = ''; });
    }
    draw();
    return c;
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
    if (!ownKey()) return authHeaders();
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
    if (open) { refreshForm(); if (!S.msgs.length && !ui.log.childNodes.length) greet(); ui.input.focus(); if (!meCache && ls(LS_TOKEN) && !ownKey()) fetchMe().catch(function () {}); }
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
    if (!profile().name) row.appendChild(el('button', { class: 'chip', text: '내 정보 입력', onclick: function () { setOpen(true); } }));
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
  // ---------- 자료 폴더 (2026-11-12) ----------
  // 폴더 핸들은 이 기기 IndexedDB에만 둔다. 읽기 전용. AI가 폴더를 뒤지지 않는다 — 사람이 목록에서 고른 파일만 첨부된다.
  var FDB = 'seoil-ai-folder', FSTORE = 'kv', FKEY = 'dir', FEXT = /\.(hwp|hwpx|pdf|png|jpe?g|webp|txt|md)$/i, FMAX = 800, FDEPTH = 2;
  var F = { dir: null, files: null, open: false, q: '' };
  function fdb(op, val) {
    return new Promise(function (res) {
      try {
        var q = indexedDB.open(FDB, 1);
        q.onupgradeneeded = function () { q.result.createObjectStore(FSTORE); };
        q.onerror = function () { res(null); };
        q.onsuccess = function () {
          try {
            var tx = q.result.transaction(FSTORE, op === 'get' ? 'readonly' : 'readwrite'), st = tx.objectStore(FSTORE);
            var r = op === 'get' ? st.get(FKEY) : op === 'set' ? st.put(val, FKEY) : st.delete(FKEY);
            r.onsuccess = function () { res(op === 'get' ? r.result || null : true); }; r.onerror = function () { res(null); };
          } catch (e) { res(null); }
        };
      } catch (e) { res(null); }
    });
  }
  /** 저장해 둔 폴더를 읽을 수 있게(필요하면 브라우저가 한 번 묻는다). 사람의 누름 안에서 불러야 한다. */
  function folderReady(pick) {
    var get = F.dir ? Promise.resolve(F.dir) : fdb('get');
    return get.then(function (h) {
      if (h && !pick) {
        return Promise.resolve(h.queryPermission ? h.queryPermission({ mode: 'read' }) : 'granted').then(function (p) {
          return p === 'granted' ? p : (h.requestPermission ? h.requestPermission({ mode: 'read' }) : p);
        }).then(function (p) { if (p === 'granted') { F.dir = h; return h; } return null; }, function () { return null; });
      }
      if (!pick) return null;
      return window.showDirectoryPicker({ id: 'seoil-ai-folder', mode: 'read', startIn: 'documents' }).then(function (nh) {
        F.dir = nh; F.files = null; return fdb('set', nh).then(function () { return nh; });
      }, function () { return null; }); // 고르기 창에서 취소
    });
  }
  /** 폴더 안 파일 목록(하위 폴더 2단계까지, 최근 고친 순) */
  function folderList(dir) {
    var out = [];
    function walk(h, prefix, depth) {
      if (out.length >= FMAX) return Promise.resolve();
      var it = h.values(), jobs = [];
      function next() {
        return it.next().then(function (r) {
          if (r.done || out.length >= FMAX) return;
          var e = r.value;
          if (e.kind === 'file' && FEXT.test(e.name) && e.name.charAt(0) !== '~' && e.name.charAt(0) !== '.') out.push({ name: e.name, path: prefix, handle: e, time: 0 });
          else if (e.kind === 'directory' && depth < FDEPTH && e.name.charAt(0) !== '.' && e.name.charAt(0) !== '_') jobs.push(function () { return walk(e, prefix + e.name + '/', depth + 1); });
          return next();
        });
      }
      return next().then(function () { return jobs.reduce(function (p, j) { return p.then(j); }, Promise.resolve()); });
    }
    return walk(dir, '', 0).then(function () {
      // 고친 날짜는 파일을 열어야 알 수 있다 — 목록에 든 것만 읽는다(내용은 읽지 않음)
      return Promise.all(out.map(function (f) { return f.handle.getFile().then(function (file) { f.time = file.lastModified; }, function () {}); }));
    }).then(function () { out.sort(function (a, b) { return b.time - a.time; }); return out; });
  }
  function toggleFolder(force) {
    F.open = force !== undefined ? force : !F.open;
    if (!F.open) { ui.folder.style.display = 'none'; return; }
    ui.folder.style.display = ''; ui.folder.innerHTML = ''; ui.folder.appendChild(el('div', { class: 'fn', text: '폴더를 읽는 중…' }));
    folderReady(false).then(function (h) { return h || folderReady(true); }).then(function (h) {
      if (!h) { F.open = false; ui.folder.style.display = 'none'; return; }
      return (F.files ? Promise.resolve(F.files) : folderList(h)).then(function (list) { F.files = list; drawFolder(); });
    }).catch(function (e) { ui.folder.innerHTML = ''; ui.folder.appendChild(el('div', { class: 'fn', text: '폴더를 읽지 못했습니다: ' + (e && e.message || e) })); });
  }
  function fday(t) { if (!t) return ''; var d = new Date(t), n = new Date(); return d.toDateString() === n.toDateString() ? '오늘' : (d.getMonth() + 1) + '.' + d.getDate() + '.'; }
  function drawFolder() {
    ui.folder.innerHTML = '';
    var list = el('div', { class: 'fl' });
    var search = el('input', { type: 'text', placeholder: '파일 이름으로 찾기', value: F.q, oninput: function () { F.q = search.value; fill(); } });
    function fill() {
      list.innerHTML = '';
      var q = F.q.trim().toLowerCase(), hit = (F.files || []).filter(function (f) { return !q || (f.path + f.name).toLowerCase().indexOf(q) >= 0; }).slice(0, 40);
      if (!hit.length) { list.appendChild(el('div', { class: 'fn', text: q ? '맞는 파일이 없습니다.' : '이 폴더에 넣을 수 있는 파일(hwp·hwpx·pdf·그림·txt·md)이 없습니다.' })); return; }
      hit.forEach(function (f) {
        list.appendChild(el('button', { type: 'button', class: 'fi', title: f.path + f.name, onclick: function () {
          f.handle.getFile().then(function (file) { return addFiles([file]); }).then(function () { toggleFolder(false); ui.input.focus(); }, function (e) { say('err', f.name + ' 읽기 실패: ' + (e && e.message || e)); });
        } }, [el('span', { text: (f.path ? f.path : '') + f.name }), el('small', { text: fday(f.time) })]));
      });
    }
    ui.folder.appendChild(el('div', { class: 'fh' }, [el('b', { text: F.dir ? F.dir.name : '' , title: F.dir ? F.dir.name : '' }), el('span', { text: '· 최근 고친 순' }), el('span', { style: 'flex:1' }),
      el('button', { type: 'button', text: '새로 읽기', onclick: function () { F.files = null; toggleFolder(true); } }),
      el('button', { type: 'button', text: '폴더 바꾸기', onclick: function () { folderReady(true).then(function (h) { if (h) toggleFolder(true); }); } }),
      el('button', { type: 'button', text: '닫기', onclick: function () { toggleFolder(false); } })]));
    ui.folder.appendChild(search); ui.folder.appendChild(list); fill();
    setTimeout(function () { try { search.focus(); } catch (e) {} }, 0);
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
  var TIDY_ASK = /문단|모양|정리|간격|내어|들여|여백|형식|띄/;
  function docState(m, text) {
    // 강조 부탁이면 글자를 그대로 찾아야 하므로 본문·칸 글을 다 보여 준다
    var rw = S.mode === 'rewrite', d = doc(), body = '', full = rw || /강조|굵게|볼드|밑줄|형광|빨간|빨강|파란|색/.test(text || '');
    if (writable()) {
      var o = window.SeoilWrite.outline(d), lv = window.SeoilWrite.levels(d);
      body = '[본문 구조]\n' + window.SeoilWrite.outlineText(o, { full: full }) + '\n[이 양식의 단계] ' + Object.keys(lv).join(' ') + '\n\n';
    } else if (d && window.SeoilWrite && TIDY_ASK.test(text || '')) {
      // 단계 스타일이 없는 문서라도 문단 모양 정리(tidy)는 된다 → 본문 구조를 보여 준다
      try { body = '[본문 구조 — 이 문서는 단계 스타일이 없어 쓰기 op 는 안 되고 {"tidy":…} 만 됩니다]\n' + window.SeoilWrite.outlineText(window.SeoilWrite.outline(d), { full: true }) + '\n\n'; } catch (e) {}
    }
    // 편집 화면에서 블록을 잡아 두었으면 그 범위(드래그 후 「문단 모양 맞춰줘」)
    var selLine = '';
    try {
      var b = bridge(), r = b && b.selection && b.selection();
      if (r && r.block && window.SeoilWrite && window.SeoilWrite.rangeIds) {
        var ids = window.SeoilWrite.rangeIds(d, r.s1, r.p1, r.s2, r.p2);
        if (ids) selLine = '[선택한 문단(블록)] ' + ids + ' — 「이 부분·선택한·드래그한·여기」나 범위를 말하지 않은 부탁은 이 범위에만\n\n';
      }
    } catch (e) {}
    var map = window.SeoilFill.mapText(m, { all: full });
    return (rw ? '[모드] 다시 쓰기\n' : '') + body + selLine + '[칸 지도' + (rw ? ' — 이미 쓴 글 포함' : '') + ']\n' + (map || '(없음)') + '\n\n[문서 이름] ' + fileName() + '\n[내 정보] ' + profileText() + '\n[분량] ' + lenNow() + '\n[오늘] ' + new Date().toISOString().slice(0, 10);
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
    ui.log.querySelectorAll('.q button, .ml button').forEach(function (b) { b.disabled = true; });
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
      if (!isMock() && !ownKey() && ls(LS_TOKEN)) fetchMe().catch(function () {});
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
        else if (/^적용됨/.test(res) && longCellWritten(inp.ops)) moreLess();
      }
    });
  }
  /** 서술 칸(긴 글)을 쓴 op 가 있었나 — 있으면 「더 자세히 / 더 간단히」를 보여 준다 */
  function longCellWritten(ops) {
    return (ops || []).some(function (o) { return o && ((o.cell && typeof o.text === 'string' && (o.text.length > 80 || /\n/.test(o.text))) || o.under || (o.after && o.items)); });
  }
  function moreLess() {
    var i = LENS.indexOf(lenNow()), row = el('div', { class: 'row ml', style: 'flex-wrap:wrap;gap:6px' });
    if (i < LENS.length - 1) row.appendChild(el('button', { class: 'chip', text: '더 자세히', onclick: function () { setLen(LENS[i + 1]); send('방금 쓴 서술 칸(긴 글 칸)만 더 자세히 다시 써 주세요. 다른 칸은 그대로 둡니다. 자료에 없는 사실은 만들지 말고 [확인 필요]로 남겨 주세요.'); } }));
    if (i > 0) row.appendChild(el('button', { class: 'chip', text: '더 간단히', onclick: function () { setLen(LENS[i - 1]); send('방금 쓴 서술 칸(긴 글 칸)만 더 간단히 다시 써 주세요. 다른 칸은 그대로 둡니다.'); } }));
    if (row.childNodes.length) { ui.log.appendChild(row); ui.log.scrollTop = ui.log.scrollHeight; }
  }

  /** ops 실행: 스냅샷 → 쓰기 → 구조 검사(다르면 되돌림) → 결과 글(AI에게 돌려줄 tool_result) */
  function applyOps(ops, label) {
    var d = doc(); if (!d) return '문서 없음';
    var before = scan(), snap = null;
    try { snap = d.saveSnapshot(); } catch (e) {}
    try {
      // 그림 op({image, cell|after})는 따로: 글을 쓰면 칸·문단 번호가 바뀌므로 다른 op와 섞어 보내지 않는다
      var iops = (ops || []).filter(function (o) { return o.image; });
      if (iops.length && iops.length !== (ops || []).length) throw new Error('그림 op는 다른 op와 섞지 말고 따로 보내세요(글을 먼저 쓰고 read_document로 번호를 다시 확인한 뒤 그림)');
      if (iops.length) ops = [];
      var eops = (ops || []).filter(function (o) { return o.emph; });
      var wops = (ops || []).filter(function (o) { return !o.emph && (o.under || o.after || o.chapter || o.reformat || o.tidy); });
      var fops = (ops || []).filter(function (o) { return !o.emph && !(o.under || o.after || o.chapter || o.reformat || o.tidy); });
      var r = fops.length ? window.SeoilFill.apply(d, before, fops) : { done: [], log: [] };
      if (iops.length) r = window.SeoilFill.images(d, before, iops);
      if (wops.length) {
        var w = window.SeoilWrite.apply(d, wops);
        r.done = r.done.concat(w.done); r.log = r.log.concat(w.log);
      }
      if (eops.length) { // 강조는 글을 다 쓴 뒤에(문단 번호가 정해진 다음)
        var e = window.SeoilWrite.emphasize(d, eops);
        r.done = r.done.concat(e.done); r.log = r.log.concat(e.log);
      }
      // 표 지우기(작성 방법 상자 등)가 있으면, 지운 표(와 그 안의 표)를 뺀 원래 구조와 비교한다
      var gone = {}; (ops || []).forEach(function (o) { if (o.deleteTable) gone[o.deleteTable] = true; });
      var base = before;
      if (Object.keys(gone).length) {
        var keep = []; before.tables.forEach(function (t, i) {
          var dead = gone[t.id] || (t.parent && Object.keys(gone).some(function (g) { return t.parent.indexOf(g + '.') === 0; }));
          if (dead) gone[t.id] = true; else keep.push(before.fpParts[i]);
        });
        base = { fpParts: keep, tables: before.tables.filter(function (t) { return !gone[t.id]; }) };
      }
      var after = window.SeoilFill.scan(d), v = window.SeoilFill.verify(base, after);
      if (wops.length) { // 본문을 쓰면 표 순서가 밀릴 수 있다 → 원래 표가 하나도 줄지 않았는지만 본다
        v.bad = after.tables.length < base.tables.length ? ['표가 ' + (base.tables.length - after.tables.length) + '개 사라짐'] : [];
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
  // 「새 대화」: 설정이 열려 있으면 닫고, 지운 것이 눈에 보이게 잠깐 깜빡인다(같은 첫 인사가 다시 떠서 안 눌린 것처럼 보였음)
  function newChat() {
    if (ui.setOn) setOpen(false);
    reset();
    ui.log.animate([{ opacity: 0.15 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
    say('sys', '새 대화를 시작했습니다.');
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

  window.SeoilAI = { toggle: toggle, open: openPanel, reset: reset, send: send, addFiles: addFiles, refresh: refreshForm, rewrite: rewrite, reformatAll: reformatAll, applyOps: applyOps, state: S, system: SYSTEM, settings: function (on) { if (ui.set) setOpen(on); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
