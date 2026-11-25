// 서일 오피스 — 내 AI 연결 주소(원격 커넥터)용 통로 (2026-11-25).
// 설치판이 중계 서버(proxy/의 Relay)에 WebSocket으로 붙어 있다가, 사용자의 Claude·GPT가 연결 주소로 보낸 도구 호출을 받아
// main.js의 runTool로 실행하고 답을 돌려준다. PC마다 Claude 설정 파일을 고치던 예전 방식(mcp.js)을 대신한다.
// 바깥에서 이 PC로 들어오는 문은 열지 않는다 — 설치판이 밖으로 건 연결 하나뿐이고, 주소(key)는 로그인한 사용자 것이다.
'use strict';
const WebSocket = require('ws');

const MAX_TEXT = 300000; // 답이 너무 길면 줄인다(통로 한 번에 실을 수 있는 크기 안쪽)

function createRelay({ base, runTool, onState }) {
  let key = null, ws = null, retry = null, beat = null, lastPong = 0, delay = 2000, state = 'off';
  // state: off(안 씀) · connecting · online · gone(주소가 바뀜 — 웹이 새 주소를 받아 다시 건다)
  function set(s) { if (state !== s) { state = s; try { onState && onState(s); } catch (e) {} } }
  function clear() { clearTimeout(retry); retry = null; clearInterval(beat); beat = null; }
  function close() { clear(); if (ws) { const w = ws; ws = null; try { w.removeAllListeners(); w.on('error', () => {}); w.terminate(); } catch (e) {} } }
  function again() { clear(); if (!key) return; retry = setTimeout(connect, delay); delay = Math.min(delay * 2, 60000); }

  function connect() {
    close();
    if (!key) return set('off');
    set('connecting');
    const url = base.replace(/^http/, 'ws').replace(/\/+$/, '') + '/u/' + key + '/app';
    const w = ws = new WebSocket(url, { handshakeTimeout: 15000 });
    w.on('open', () => {
      if (ws !== w) return;
      delay = 2000; lastPong = Date.now(); set('online');
      beat = setInterval(() => {
        if (Date.now() - lastPong > 75000) { try { w.terminate(); } catch (e) {} return; }
        try { w.send('ping'); } catch (e) {}
      }, 30000);
    });
    w.on('message', async (data, isBinary) => {
      if (ws !== w) return;
      const s = isBinary ? '' : data.toString('utf8');
      if (s === 'pong') { lastPong = Date.now(); return; }
      let m; try { m = JSON.parse(s); } catch (e) { return; }
      if (!m || !m.id || !m.name) return;
      let out;
      try {
        const r = await runTool(m.name, m.args || {});
        out = r && typeof r === 'object' && 'text' in r ? { text: String(r.text), isError: !!r.isError } : { text: String(r) };
      } catch (e) { out = { text: '오류: ' + (e && e.message || e), isError: true }; }
      if (out.text.length > MAX_TEXT) out.text = out.text.slice(0, MAX_TEXT) + '\n…(너무 길어 여기서 줄였습니다)';
      try { w.send(JSON.stringify(Object.assign({ id: m.id }, out))); } catch (e) {}
    });
    w.on('unexpected-response', (_req, res) => {
      if (ws !== w) return;
      const gone = res.statusCode === 410 || res.statusCode === 404;
      close();
      if (gone) { key = null; set('gone'); } else { set('connecting'); again(); }
    });
    w.on('close', () => { if (ws !== w) return; ws = null; clear(); set(key ? 'connecting' : 'off'); again(); });
    w.on('error', () => { /* close가 뒤따른다 */ });
  }

  return {
    start(k) { if (k && k === key && (state === 'online' || state === 'connecting')) return; key = k || null; delay = 2000; connect(); },
    stop() { key = null; close(); set('off'); },
    active() { if (ws && state === 'online') { try { ws.send(JSON.stringify({ t: 'active' })); } catch (e) {} } },
    state: () => state,
    key: () => key,
  };
}

module.exports = { createRelay };
