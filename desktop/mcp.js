// 서일 오피스 — 바깥 AI 연결 통로(MCP, stdio).
// Claude 데스크톱·Claude Code가 이 파일을 실행한다(설치판 실행 파일 + ELECTRON_RUN_AS_NODE=1).
// 여기서는 일을 하지 않고, 켜져 있는 서일 오피스 창(main.js의 로컬 통로)에 도구 호출을 넘기기만 한다.
// 서일 오피스가 꺼져 있으면 켜고 기다린다.
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const AGENT_FILE = process.env.SEOIL_AGENT_FILE ||
  path.join(process.env.APPDATA || path.join(require('os').homedir(), 'AppData', 'Roaming'), '서일 오피스', 'agent.json');
const APP_EXE = process.env.SEOIL_APP_EXE || process.execPath;

const OPS_HELP = [
  'ops는 서일 오피스 AI 패널과 같은 형식이다(get_guide에 전체 설명).',
  '칸: {"cell":"T2.r0c1","text":"…"} / 칸 안 일부: {"cell":"T2.r0c1","find":"OOO","replace":"김민철"} / 본문 자리표시: {"para":"P5","find":"…","replace":"…"}',
  '표에 줄 더하기: {"rows":"T3","start":1,"data":[["1","홍길동","교수"],…]}',
  '본문 쓰기(보고서·계획서): {"under":"B12","items":[{"level":"□","text":"…"},{"level":"○","text":"…"}]} / {"after":"B12","items":[…]} / 새 장: {"chapter":"제목","after":"B30"} / {"reformat":"all"}',
  '강조: {"emph":"B12"|"P5"|"T2.r0c1"|"all","find":"핵심 문구","style":"bold|underline|red|blue|shade|italic"}',
  '그림(다른 op와 섞지 말고 따로): {"image":"C:\\\\…\\\\사진.jpg","cell":"T3.r2c0"} 칸에 / {"image":"…","after":"B20"|"P5"|"end"} 그 문단 뒤에. image는 이 PC의 그림 파일 절대 경로(png·jpg·gif·bmp·webp), "width":mm 선택',
].join('\n');

const TOOLS = [
  { name: 'status', description: '서일 오피스에 열린 문서 이름, 본문 쓰기 가능 여부, 사람이 고친 칸 목록.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_guide', description: '양식 채우기·본문 쓰기 규칙과 ops 형식 전체 설명(처음 한 번 읽을 것). 설명에 나오는 fill_form은 edit_document를 말한다.', inputSchema: { type: 'object', properties: {} } },
  { name: 'list_documents', description: '폴더 안의 한글 문서(.hwp/.hwpx) 목록(하위 2단계까지).', inputSchema: { type: 'object', properties: { folder: { type: 'string', description: '절대 경로' } }, required: ['folder'] } },
  { name: 'open_document', description: 'PC의 한글 파일을 서일 오피스 창에 연다. 사람이 그 창에서 보고 있다. 열고 나면 read_document 결과를 돌려준다.', inputSchema: { type: 'object', properties: { path: { type: 'string', description: '.hwp/.hwpx 절대 경로' } }, required: ['path'] } },
  { name: 'new_document', description: '새 문서. kind=report(서일 보고서 양식: 표지·Ⅰ장·1.·□·○ 단계) 또는 blank(빈 A4).', inputSchema: { type: 'object', properties: { kind: { type: 'string', enum: ['report', 'blank'] } }, required: ['kind'] } },
  { name: 'rewrite_copy', description: '지금 열린 문서(예: 지난 회의록)를 오늘 날짜 이름의 사본으로 연다. 원본은 그대로 두고 사본을 고쳐 새 문서를 만들 때.', inputSchema: { type: 'object', properties: {} } },
  { name: 'read_document', description: '열린 문서의 칸 지도(T·P id와 지금 글), 본문 구조(B id, 단계), 사람이 고친 칸. 고치기 전과 사람이 손댔을 것 같을 때 읽는다.', inputSchema: { type: 'object', properties: {} } },
  { name: 'edit_document', description: '열린 문서를 고친다. 사람이 보는 앞에서 바로 반영되고, AI 패널에 「되돌리기」가 남는다. 사람이 고친 칸은 건너뛴다(force:true는 사람이 허락했을 때만).\n' + OPS_HELP,
    inputSchema: { type: 'object', properties: {
      ops: { type: 'array', items: { type: 'object' }, description: '고칠 내용' },
      note: { type: 'string', description: '사람에게 보일 한 줄 요약(예: "참석자 명단 채움")' },
      force: { type: 'boolean', description: '사람이 고친 칸도 덮어쓰기(사람이 허락했을 때만)' },
    }, required: ['ops'] } },
  { name: 'undo_last', description: '마지막 edit_document를 되돌린다.', inputSchema: { type: 'object', properties: {} } },
  { name: 'save_document', description: '저장. path를 비우면 연 파일에 그대로 저장. path를 주면 그 이름으로(.hwpx — .hwp 저장은 막혀 있음). 이미 있는 다른 파일을 덮어쓸 때는 서일 오피스 창에서 사람이 확인한다.', inputSchema: { type: 'object', properties: { path: { type: 'string' } } } },
];

function send(o) { process.stdout.write(JSON.stringify(o) + '\n'); }
function log(...a) { process.stderr.write('[seoil-mcp] ' + a.join(' ') + '\n'); }

function readAgent() { try { return JSON.parse(fs.readFileSync(AGENT_FILE, 'utf8')); } catch (e) { return null; } }
function post(a, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body));
    const req = http.request({ host: '127.0.0.1', port: a.port, path: '/tool', method: 'POST', timeout: 180000,
      headers: { 'content-type': 'application/json', 'content-length': data.length, authorization: 'Bearer ' + a.token } }, (res) => {
      let b = ''; res.setEncoding('utf8'); res.on('data', (c) => (b += c));
      res.on('end', () => { try { const j = JSON.parse(b); res.statusCode === 200 ? resolve(j) : reject(new Error(j.error || 'HTTP ' + res.statusCode)); } catch (e) { reject(new Error('응답 오류')); } });
    });
    req.on('error', reject); req.on('timeout', () => req.destroy(new Error('서일 오피스가 응답하지 않습니다')));
    req.end(data);
  });
}
let launching = null;
async function ensureApp() {
  let a = readAgent();
  if (a) { try { await post(a, { name: 'ping' }); return a; } catch (e) { /* 꺼짐 → 켠다 */ } }
  if (!launching) {
    launching = (async () => {
      log('서일 오피스를 켭니다:', APP_EXE);
      const env = Object.assign({}, process.env); delete env.ELECTRON_RUN_AS_NODE;
      spawn(APP_EXE, [], { detached: true, stdio: 'ignore', env }).unref();
      for (let i = 0; i < 120; i++) {
        await new Promise((r) => setTimeout(r, 500));
        const b = readAgent();
        if (b) { try { await post(b, { name: 'ping' }); return b; } catch (e) {} }
      }
      throw new Error('서일 오피스를 켜지 못했습니다. 직접 켠 뒤 다시 시도해 주세요.');
    })().finally(() => { launching = null; });
  }
  return launching;
}

async function onMessage(m) {
  const { id, method, params } = m;
  if (method === 'initialize') {
    return send({ jsonrpc: '2.0', id, result: {
      protocolVersion: (params && params.protocolVersion) || '2025-06-18',
      capabilities: { tools: {} },
      serverInfo: { name: 'seoil-office', version: '0.3.0' },
      instructions: '서일 오피스(한글 hwp 편집기)를 사람이 보는 앞에서 다룬다. 순서: get_guide(처음 한 번) → open_document/new_document → read_document → edit_document(조금씩, note에 한 줄 요약) → 사람이 확인하면 save_document. 사람이 고친 칸은 존중하고, 덮어쓰기 전에 물어본다. 저장은 사람이 원할 때만. 받은 양식 원본에 덮어쓰지 말고 새 이름(path)으로 저장하거나, 지난 문서를 고쳐 쓸 때는 rewrite_copy로 사본을 만든다.',
    } });
  }
  if (method === 'notifications/initialized' || (method && method.startsWith('notifications/'))) return;
  if (method === 'ping') return send({ jsonrpc: '2.0', id, result: {} });
  if (method === 'tools/list') return send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
  if (method === 'tools/call') {
    try {
      const a = await ensureApp();
      const r = await post(a, { name: params.name, args: params.arguments || {} });
      return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: String(r.text) }], isError: !!r.isError } });
    } catch (e) {
      return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: '오류: ' + (e && e.message || e) }], isError: true } });
    }
  }
  if (id !== undefined) send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found: ' + method } });
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => {
  buf += c; let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line) continue;
    let m; try { m = JSON.parse(line); } catch (e) { log('bad json'); continue; }
    onMessage(m).catch((e) => log(e && e.stack || e));
  }
});
process.stdin.on('end', () => process.exit(0));
