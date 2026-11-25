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

const { TOOLS, INSTRUCTIONS } = require('./tools.js').local;

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
      serverInfo: { name: 'seoil-office', version: require('./tools.js').VERSION },
      instructions: INSTRUCTIONS,
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
