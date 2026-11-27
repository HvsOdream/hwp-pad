// 서일 오피스 — AI 중계 서버 (Cloudflare Worker)
//
// 학교 키는 이 서버에만 있다. 앱은 키 없이 「AI 사용 코드」만 들고 온다.
//   POST /v1/signup     가입(이메일·비밀번호·이름·소속) — 관리자 승인 대기, AUTO 도메인이면 바로 사용
//   POST /v1/login      로그인 → 세션 토큰(앱은 authorization: Bearer 로 보낸다)
//   POST /v1/logout     세션 끝내기
//   POST /v1/password   비밀번호 바꾸기(관리자가 준 임시 비밀번호 → 내 것)
//   POST /v1/messages   앱의 AI 요청(Anthropic Messages 형식 그대로). 세션 또는 머리글 x-seoil-code(예전 코드)
//   GET  /v1/me         내 이름·상태·이번 달 사용률(%)
//   GET  /v1/relay      내 AI 연결 주소(로그인 필요) · POST /v1/relay/reset 주소 새로 만들기
//   POST /mcp           내 AI 연결(로그인 방식, 2026-11-25) — 모두 같은 주소. Claude가 OAuth로 학교 계정 로그인을 받아 온다
//   /.well-known/oauth-protected-resource · /.well-known/oauth-authorization-server · /oauth/register · /oauth/authorize · /oauth/token
//   POST /u/:key/mcp    (예전) 연결 주소 — 사용자의 Claude·GPT가 커넥터로 붙는 MCP(Streamable HTTP). 도구 호출은 켜져 있는 설치판으로 넘긴다
//   GET  /u/:key/app    설치판이 붙는 통로(WebSocket)
//   GET  /admin         관리 화면(코드 만들기·끄기·사용량) — ADMIN_TOKEN으로 들어감
//   /admin/api/...      관리 화면이 부르는 API
//
// 백엔드 교체: BACKEND=anthropic(기본) | openai(교내 sLLM — vLLM·Ollama 같은 OpenAI 호환 서버)
// 앱은 늘 Anthropic 형식으로 말하고, openai일 때는 이 서버가 형식을 바꿔 준다. 앱은 고칠 것이 없다.
//
// 바인딩·변수(wrangler.toml / 시크릿)
//   KV            KV 이름공간 (코드·사용량)
//   OAUTH         Durable Object(OAuthStore) — 로그인 연결의 클라이언트·인가 코드·토큰(KV는 지역 간 반영이 늦어 코드 교환에 못 쓴다)
//   RELAY         Durable Object(Relay) — 연결 주소 하나마다 하나. 설치판 WebSocket을 쥐고 도구 호출을 넘긴다
//   ANTHROPIC_API_KEY (시크릿)  ADMIN_TOKEN (시크릿)
//   MODEL         기본 모델. 앱이 보낸 모델이 MODELS에 없으면 이것으로 바꾼다
//   MODELS        허용 모델(쉼표)
//   MAX_TOKENS    한 번 답의 최대 토큰(앱이 더 달라 해도 여기까지)
//   DEFAULT_DAILY 하루 요청 수 안전 상한(남용 방지용, 사용자에겐 % 로 보이지 않음)
//   DEFAULT_BUDGET 사용자 한 명의 한 달 사용량(입력 환산 토큰: 입력 1 · 출력 5 · 캐시 읽기 0.1)
//   MONTH_CAP     이 달 전체 토큰 상한(0이면 없음) — 비용 안전장치
//   ORIGINS       허용 출처(쉼표)
//   SLLM_URL, SLLM_KEY, SLLM_MODEL   BACKEND=openai일 때

import toolDefs from '../../desktop/tools.js';

const KST = 9 * 3600 * 1000;
const today = () => new Date(Date.now() + KST).toISOString().slice(0, 10);
const month = () => today().slice(0, 7);

function cors(req, env) {
  const origin = req.headers.get('origin') || '';
  const list = String(env.ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ok = !list.length || list.includes(origin) || list.includes('*');
  return {
    'access-control-allow-origin': ok ? origin || '*' : list[0] || '',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-seoil-code, authorization, anthropic-version, x-api-key, anthropic-dangerous-direct-browser-access',
    'access-control-max-age': '86400',
    vary: 'origin',
  };
}
function json(obj, status, h) { return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'content-type': 'application/json; charset=utf-8' }, h || {}) }); }
// Anthropic 오류 모양으로 돌려준다(앱은 error.message를 그대로 보여 줌)
function fail(msg, status, h, type) { return json({ type: 'error', error: { type: type || 'seoil_error', message: msg } }, status || 400, h); }

async function getJ(env, k, d) { const v = await env.KV.get(k); return v ? JSON.parse(v) : d; }
async function putJ(env, k, v, ttl) { await env.KV.put(k, JSON.stringify(v), ttl ? { expirationTtl: ttl } : undefined); }

// 사용량 단위: 입력 환산 토큰(비용 비율 — 출력은 입력의 5배, 캐시 읽기는 1/10)
function units(o) { return Math.round((o.in || 0) + (o.out || 0) * 5 - (o.cr || 0) * 0.9); }
async function usage(env, code) {
  const [d, m] = await Promise.all([getJ(env, `use:${code}:${today()}`, { req: 0, in: 0, out: 0 }), getJ(env, `mon:${code}:${month()}`, { req: 0, in: 0, out: 0 })]);
  return { today: d, month: m };
}
async function addUsage(env, code, u) {
  const add = (o) => ({ req: o.req + 1, in: o.in + (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0), out: o.out + (u.output_tokens || 0), cr: (o.cr || 0) + (u.cache_read_input_tokens || 0) });
  const kd = `use:${code}:${today()}`, km = `mon:${code}:${month()}`, kt = `tot:${month()}`;
  const [d, m, t] = await Promise.all([getJ(env, kd, { req: 0, in: 0, out: 0 }), getJ(env, km, { req: 0, in: 0, out: 0 }), getJ(env, kt, { req: 0, in: 0, out: 0 })]);
  await Promise.all([putJ(env, kd, add(d), 3 * 86400), putJ(env, km, add(m), 400 * 86400), putJ(env, kt, add(t), 400 * 86400)]);
}

// ---------- 백엔드 ----------
async function callAnthropic(env, body) {
  const r = await fetch(env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  return { status: r.status, data: await r.json().catch(() => ({ type: 'error', error: { message: 'AI 서버 응답을 읽지 못함' } })) };
}

// Anthropic Messages → OpenAI Chat Completions (교내 sLLM용)
function toOpenAI(body, model) {
  const msgs = [];
  const sys = Array.isArray(body.system) ? body.system.map((b) => b.text || '').join('\n') : body.system || '';
  if (sys) msgs.push({ role: 'system', content: sys });
  for (const m of body.messages || []) {
    const blocks = typeof m.content === 'string' ? [{ type: 'text', text: m.content }] : m.content || [];
    if (m.role === 'assistant') {
      const text = blocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
      const calls = blocks.filter((b) => b.type === 'tool_use').map((b) => ({ id: b.id, type: 'function', function: { name: b.name, arguments: JSON.stringify(b.input || {}) } }));
      msgs.push(Object.assign({ role: 'assistant', content: text || null }, calls.length ? { tool_calls: calls } : {}));
    } else {
      for (const b of blocks.filter((x) => x.type === 'tool_result')) {
        const c = typeof b.content === 'string' ? b.content : (b.content || []).map((x) => x.text || '').join('\n');
        msgs.push({ role: 'tool', tool_call_id: b.tool_use_id, content: c });
      }
      const parts = [];
      for (const b of blocks) {
        if (b.type === 'text') parts.push({ type: 'text', text: b.text });
        else if (b.type === 'image' && b.source && b.source.type === 'base64') parts.push({ type: 'image_url', image_url: { url: `data:${b.source.media_type};base64,${b.source.data}` } });
        else if (b.type === 'document') parts.push({ type: 'text', text: '[첨부 문서는 교내 AI에서 아직 읽지 못함]' });
      }
      if (parts.length) msgs.push({ role: 'user', content: parts.every((p) => p.type === 'text') ? parts.map((p) => p.text).join('\n') : parts });
    }
  }
  const out = { model, messages: msgs, max_tokens: body.max_tokens };
  if (body.tools && body.tools.length) {
    out.tools = body.tools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description || '', parameters: t.input_schema || { type: 'object' } } }));
    out.tool_choice = 'auto';
  }
  return out;
}
// OpenAI 응답 → Anthropic 응답
function fromOpenAI(d, model) {
  const ch = (d.choices || [])[0] || {}, msg = ch.message || {}, content = [];
  if (msg.content) content.push({ type: 'text', text: msg.content });
  for (const c of msg.tool_calls || []) {
    let input = {}; try { input = JSON.parse(c.function.arguments || '{}'); } catch (e) { input = {}; }
    content.push({ type: 'tool_use', id: c.id || 'call_' + Math.random().toString(36).slice(2), name: c.function.name, input });
  }
  return {
    id: d.id || 'msg_sllm', type: 'message', role: 'assistant', model, content,
    stop_reason: (msg.tool_calls || []).length ? 'tool_use' : ch.finish_reason === 'length' ? 'max_tokens' : 'end_turn',
    usage: { input_tokens: (d.usage || {}).prompt_tokens || 0, output_tokens: (d.usage || {}).completion_tokens || 0 },
  };
}
async function callOpenAI(env, body) {
  const model = env.SLLM_MODEL || body.model;
  const r = await fetch(String(env.SLLM_URL).replace(/\/$/, '') + '/v1/chat/completions', {
    method: 'POST',
    headers: Object.assign({ 'content-type': 'application/json' }, env.SLLM_KEY ? { authorization: 'Bearer ' + env.SLLM_KEY } : {}),
    body: JSON.stringify(toOpenAI(body, model)),
  });
  const d = await r.json().catch(() => null);
  if (!r.ok || !d) return { status: r.status || 502, data: { type: 'error', error: { message: '교내 AI 서버 오류' + (d && d.error ? ': ' + (d.error.message || d.error) : '') } } };
  return { status: 200, data: fromOpenAI(d, model) };
}

// ---------- 계정 ----------
const enc = new TextEncoder();
const hex = (b) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');
async function hashPw(pw, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 }, key, 256));
}
const normEmail = (e) => String(e || '').trim().toLowerCase();
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 120;
function token() { return 'so_' + hex(crypto.getRandomValues(new Uint8Array(24))); }
async function autoDomains(env) { return (await getJ(env, 'cfg:auto', { domains: [] })).domains || []; }
function budgetOf(env, user) { return Number(user && user.budget != null ? user.budget : env.DEFAULT_BUDGET || 3000000); }
function publicUser(env, user, u) {
  const b = budgetOf(env, user), used = units(u.month);
  return { email: user.email, name: user.name, org: user.org, dept: user.dept, status: user.status,
    used: b ? Math.min(100, Math.round(used * 100 / b)) : 0, budget: b, today: u.today.req };
}
async function signup(req, env, h) {
  const b = await req.json().catch(() => ({}));
  const email = normEmail(b.email), pw = String(b.password || ''), name = String(b.name || '').trim().slice(0, 40);
  if (!validEmail(email)) return fail('이메일 주소를 확인해 주세요.', 400, h);
  if (pw.length < 8) return fail('비밀번호는 8자 이상으로 해 주세요.', 400, h);
  if (!name) return fail('이름을 넣어 주세요.', 400, h);
  if (await env.KV.get(`user:${email}`)) return fail('이미 가입한 이메일입니다. 로그인해 주세요.', 409, h);
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  const auto = (await autoDomains(env)).includes(email.split('@')[1]);
  const user = { email, name, org: String(b.org || '').trim().slice(0, 60), dept: String(b.dept || '').trim().slice(0, 60),
    salt, pw: await hashPw(pw, salt), status: auto ? 'active' : 'pending', created: new Date().toISOString() };
  await putJ(env, `user:${email}`, user);
  const t = token(); await putJ(env, `sess:${t}`, { email }, 180 * 86400);
  return json({ ok: true, token: t, user: publicUser(env, user, await usage(env, 'u:' + email)) }, 200, h);
}
// 비밀번호 확인: 친 그대로 먼저 보고, 안 맞으면 앞뒤 공백을 뗀 것으로 한 번 더(아이패드 자동 완성이 끝에 공백을 붙이는 일이 있다)
// 비밀번호(salt·pw)는 바로 반영되는 저장소(OAuthStore)에도 적는다 — KV는 바꾼 값이 최대 1분쯤 늦게 읽혀서,
// 임시 비밀번호를 받자마자 로그인하면 예전 값과 맞춰 보고 "맞지 않습니다"가 나왔다(2026-11-27).
async function setPw(env, user, plain) {
  user.salt = hex(crypto.getRandomValues(new Uint8Array(16))); user.pw = await hashPw(String(plain), user.salt);
  await ostore(env, { op: 'put', k: 'pw:' + user.email, v: { salt: user.salt, pw: user.pw } });
}
async function freshPw(env, user) {
  try { const r = (await ostore(env, { op: 'get', k: 'pw:' + user.email })).v; if (r && r.salt && r.pw) { user.salt = r.salt; user.pw = r.pw; } } catch (e) {}
  return user;
}
async function pwOk(user, raw) {
  const pw = String(raw || '');
  if ((await hashPw(pw, user.salt)) === user.pw) return true;
  const t = pw.trim();
  return t !== pw && (await hashPw(t, user.salt)) === user.pw;
}
async function login(req, env, h) {
  const b = await req.json().catch(() => ({}));
  const email = normEmail(b.email), user = await getJ(env, `user:${email}`, null);
  if (user) await freshPw(env, user);
  if (!user || !(await pwOk(user, b.password))) return fail('이메일이나 비밀번호가 맞지 않습니다.', 401, h, 'authentication_error');
  const t = token(); await putJ(env, `sess:${t}`, { email }, 180 * 86400);
  return json({ ok: true, token: t, user: publicUser(env, user, await usage(env, 'u:' + email)) }, 200, h);
}
async function password(req, env, h) {
  const w = await who(req, env, h);
  if (w.err) return w.err;
  if (!w.user) return fail('로그인해 주세요.', 401, h, 'authentication_error');
  const b = await req.json().catch(() => ({}));
  await freshPw(env, w.user);
  if (!(await pwOk(w.user, b.old))) return fail('지금 비밀번호가 맞지 않습니다.', 401, h);
  if (String(b.new || '').length < 8) return fail('새 비밀번호는 8자 이상으로 해 주세요.', 400, h);
  await setPw(env, w.user, b.new);
  await putJ(env, `user:${w.user.email}`, w.user);
  return json({ ok: true }, 200, h);
}
async function logout(req, env, h) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (t.startsWith('so_')) await env.KV.delete(`sess:${t}`);
  return json({ ok: true }, 200, h);
}
// 요청한 사람: 세션(로그인) 또는 예전 사용 코드. { key: 사용량 키, user?, code?, err? }
async function who(req, env, h) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (t.startsWith('so_')) {
    const s = await getJ(env, `sess:${t}`, null), user = s && (await getJ(env, `user:${s.email}`, null));
    if (!user) return { err: fail('로그인이 끝났습니다. 다시 로그인해 주세요.', 401, h, 'authentication_error') };
    return { key: 'u:' + user.email, user };
  }
  const code = (req.headers.get('x-seoil-code') || '').trim().toUpperCase();
  if (!code) return { err: fail('로그인해 주세요. AI 작성 › 설정에서 가입·로그인할 수 있습니다.', 401, h, 'authentication_error') };
  const info = await getJ(env, `code:${code}`, null);
  if (!info || info.off) return { err: fail('AI 사용 코드가 맞지 않거나 사용이 중지되었습니다. 관리자에게 물어 주세요.', 401, h, 'authentication_error') };
  return { key: code, code: info };
}

// ---------- 앱 요청 ----------
async function messages(req, env, h) {
  const w = await who(req, env, h);
  if (w.err) return w.err;
  if (w.user && w.user.status === 'pending') return fail('가입 승인을 기다리는 중입니다. 관리자가 승인하면 바로 쓸 수 있습니다.', 403, h, 'permission_error');
  if (w.user && w.user.status !== 'active') return fail('사용이 중지된 계정입니다. 관리자에게 물어 주세요.', 403, h, 'permission_error');
  const code = w.key, info = w.code || {};
  const u = await usage(env, code);
  const daily = w.user ? Number(w.user.daily || env.USER_DAILY || 300) : Number(info.daily || env.DEFAULT_DAILY || 50);
  if (u.today.req >= daily) return fail(`오늘은 AI를 너무 많이 불렀습니다(하루 ${daily}번). 내일 다시 쓸 수 있습니다.`, 429, h, 'rate_limit_error');
  if (w.user) { const b = budgetOf(env, w.user); if (b && units(u.month) >= b) return fail('이번 달 AI 사용량을 다 썼습니다. 다음 달 1일에 다시 채워집니다(관리자가 늘릴 수 있음).', 429, h, 'rate_limit_error'); }
  const cap = Number(env.MONTH_CAP || 0);
  if (cap) { const t = await getJ(env, `tot:${month()}`, { in: 0, out: 0 }); if (t.in + t.out >= cap) return fail('이번 달 학교 AI 사용량이 다 찼습니다. 관리자에게 알려 주세요.', 429, h, 'rate_limit_error'); }

  let body; try { body = await req.json(); } catch (e) { return fail('요청 형식 오류', 400, h); }
  const models = String(env.MODELS || env.MODEL || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!models.includes(body.model)) body.model = env.MODEL;
  body.max_tokens = Math.min(Number(body.max_tokens) || 1024, Number(env.MAX_TOKENS || 8000));
  delete body.stream;

  const backend = (env.BACKEND || 'anthropic').toLowerCase();
  const r = backend === 'openai' ? await callOpenAI(env, body) : await callAnthropic(env, body);
  if (r.status === 200 && r.data && r.data.usage) await addUsage(env, code, r.data.usage);
  return json(r.data, r.status, h);
}
async function me(req, env, h) {
  const w = await who(req, env, h);
  if (w.err) return w.err;
  const u = await usage(env, w.key);
  if (w.user) return json(Object.assign(publicUser(env, w.user, u), { backend: env.BACKEND || 'anthropic' }), 200, h);
  return json({ name: w.code.name, daily: Number(w.code.daily || env.DEFAULT_DAILY || 50), today: u.today.req, backend: env.BACKEND || 'anthropic' }, 200, h);
}

// ---------- 관리 ----------
function newCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', b = crypto.getRandomValues(new Uint8Array(8));
  const s = Array.from(b, (x) => A[x % A.length]).join('');
  return `SEOIL-${s.slice(0, 4)}-${s.slice(4)}`;
}
async function admin(req, env, h, path) {
  const tok = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || tok !== env.ADMIN_TOKEN) return fail('관리 토큰이 맞지 않습니다.', 401, h);
  if (path === '/admin/api/codes' && req.method === 'GET') {
    const list = await env.KV.list({ prefix: 'code:' }), rows = [];
    for (const k of list.keys) {
      const code = k.name.slice(5), info = await getJ(env, k.name, {}), u = await usage(env, code);
      rows.push({ code, name: info.name, daily: Number(info.daily || env.DEFAULT_DAILY || 50), off: !!info.off, created: info.created, today: u.today, month: u.month });
    }
    rows.sort((a, b) => String(a.created).localeCompare(String(b.created)));
    return json({ rows, total: await getJ(env, `tot:${month()}`, { req: 0, in: 0, out: 0 }), monthCap: Number(env.MONTH_CAP || 0), model: env.MODEL, backend: env.BACKEND || 'anthropic' }, 200, h);
  }
  if (path === '/admin/api/codes' && req.method === 'POST') {
    const b = await req.json().catch(() => ({}));
    if (b.code) { // 고치기: 이름·상한·끄기
      const k = `code:${String(b.code).toUpperCase()}`, info = await getJ(env, k, null);
      if (!info) return fail('없는 코드', 404, h);
      if (b.delete) { await env.KV.delete(k); return json({ ok: true }, 200, h); }
      if (b.name != null) info.name = String(b.name).slice(0, 40);
      if (b.daily != null) info.daily = Math.max(0, Number(b.daily) || 0);
      if (b.off != null) info.off = !!b.off;
      await putJ(env, k, info);
      return json({ ok: true, code: b.code, info }, 200, h);
    }
    const code = newCode(), info = { name: String(b.name || '이름 없음').slice(0, 40), daily: Number(b.daily || env.DEFAULT_DAILY || 50), created: new Date().toISOString() };
    await putJ(env, `code:${code}`, info);
    return json({ ok: true, code, info }, 200, h);
  }
  if (path === '/admin/api/users' && req.method === 'GET') {
    const list = await env.KV.list({ prefix: 'user:' }), rows = [];
    for (const k of list.keys) {
      const user = await getJ(env, k.name, null); if (!user) continue;
      const u = await usage(env, 'u:' + user.email);
      rows.push(Object.assign(publicUser(env, user, u), { created: user.created, units: units(u.month), req: u.month.req }));
    }
    const rank = { pending: 0, active: 1, off: 2 };
    rows.sort((a, b) => (rank[a.status] - rank[b.status]) || String(b.created).localeCompare(String(a.created)));
    return json({ rows, auto: await autoDomains(env), defaultBudget: Number(env.DEFAULT_BUDGET || 3000000) }, 200, h);
  }
  if (path === '/admin/api/users' && req.method === 'POST') {
    const b = await req.json().catch(() => ({}));
    if (b.auto) { // 바로 쓰게 할 이메일 도메인 목록
      const domains = String(b.auto.join ? b.auto.join(',') : b.auto).split(/[\s,]+/).map((x) => x.trim().toLowerCase().replace(/^@/, '')).filter(Boolean);
      await putJ(env, 'cfg:auto', { domains }); return json({ ok: true, auto: domains }, 200, h);
    }
    const k = `user:${normEmail(b.email)}`, user = await getJ(env, k, null);
    if (!user) return fail('없는 사용자', 404, h);
    if (b.delete) { await env.KV.delete(k); await ostore(env, { op: 'del', k: 'pw:' + user.email }).catch(() => {}); return json({ ok: true }, 200, h); }
    if (b.status && ['pending', 'active', 'off'].includes(b.status)) user.status = b.status;
    if (b.budget != null) user.budget = Math.max(0, Number(b.budget) || 0);
    let temp;
    if (b.resetPassword) { temp = hex(crypto.getRandomValues(new Uint8Array(5))); await setPw(env, user, temp); }
    await putJ(env, k, user);
    return json({ ok: true, temp }, 200, h);
  }
  return fail('없는 주소', 404, h);
}

// ---------- 내 AI 연결 주소(원격 커넥터) — 2026-11-25 ----------
// 예전에는 설치판이 PC마다 Claude 데스크톱 설정 파일에 통로를 써넣었다. Claude 버전·설치 방식에 따라 그 파일을 읽지 않아
// "연결됨"인데 도구가 안 보이는 일이 생겼다. 듀얼플래너처럼 주소 하나를 계정의 커넥터로 등록하는 방식으로 바꾼다.
//   사용자의 Claude → POST /u/:key/mcp → (Relay) → WebSocket → 켜져 있는 설치판 → 결과가 같은 길로 돌아온다.
// 주소(key)는 로그인한 사용자마다 하나. 어느 PC든 로그인한 설치판이 같은 주소에 붙는다. 주소를 아는 쪽이 문서를 다룰 수 있으므로 비밀번호처럼 다룬다.
const MCP_CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS', 'access-control-allow-headers': 'content-type,authorization,mcp-session-id,mcp-protocol-version', 'access-control-expose-headers': 'mcp-session-id' };
const KEY_RE = /^[A-Za-z0-9_-]{32,64}$/;
function relayKeyNew() { return hex(crypto.getRandomValues(new Uint8Array(24))); }
function relayUrl(req, key) { return new URL(req.url).origin + '/u/' + key + '/mcp'; }
async function relayUser(req, env, h) {
  const w = await who(req, env, h);
  if (w.err) return w;
  if (!w.user) return { err: fail('로그인해 주세요. AI 작성 › 설정에서 가입·로그인할 수 있습니다.', 401, h, 'authentication_error') };
  if (w.user.status !== 'active' && w.user.status !== 'pending') return { err: fail('사용이 중지된 계정입니다. 관리자에게 물어 주세요.', 403, h, 'permission_error') };
  return w;
}
async function relayGet(req, env, h) {
  const w = await relayUser(req, env, h);
  if (w.err) return w.err;
  const key = await relayKeyOf(env, w.user.email);
  return json({ ok: true, key, url: new URL(req.url).origin + '/mcp', legacyUrl: relayUrl(req, key), online: await relayOnline(env, key) }, 200, h);
}
async function relayReset(req, env, h) {
  const w = await relayUser(req, env, h);
  if (w.err) return w.err;
  const old = await env.KV.get(`relayof:${w.user.email}`);
  if (old) { await env.KV.delete(`relay:${old}`); try { await stub(env, old).fetch('https://relay/drop'); } catch (e) {} }
  const key = relayKeyNew();
  await putJ(env, `relay:${key}`, { email: w.user.email, created: new Date().toISOString() }); await env.KV.put(`relayof:${w.user.email}`, key);
  return json({ ok: true, key, url: relayUrl(req, key), online: false }, 200, h);
}
function stub(env, key) { return env.RELAY.get(env.RELAY.idFromName(key)); }
async function relayOnline(env, key) { try { return !!(await (await stub(env, key).fetch('https://relay/status')).json()).online; } catch (e) { return false; } }

const GONE = '이 연결 주소는 더 이상 쓰이지 않습니다(주소를 새로 만들었거나 계정이 없어졌습니다). 아무것도 하지 못했습니다. 서일 오피스 › 「Claude로 작성하기」에서 연결 주소를 다시 복사해 커넥터 주소를 바꿔 달라고 사용자에게 알려 주세요.';
const OFFLINE = '서일 오피스 설치판이 켜져 있지 않거나 로그인돼 있지 않아 아무것도 하지 못했습니다. 화면 조작으로 대신하지 말고, 사용자에게 PC에서 서일 오피스(윈도우 설치판)를 켜 달라고 말한 뒤 다시 시도하세요.';
async function mcp(req, env, key) {
  if (req.method === 'GET') return new Response('Method Not Allowed', { status: 405, headers: MCP_CORS });
  if (req.method === 'DELETE') return new Response(null, { status: 204, headers: MCP_CORS });
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: MCP_CORS });
  let msg; try { msg = await req.json(); } catch (e) { return json({ jsonrpc: '2.0', error: { code: -32700, message: 'parse error' }, id: null }, 400, MCP_CORS); }
  const batch = Array.isArray(msg) ? msg : [msg], out = [], D = toolDefs.remote;
  let known; const isKnown = async () => (known === undefined ? (known = !!(await env.KV.get(`relay:${key}`))) : known);
  for (const m of batch) {
    if (!m || m.id === undefined) continue; // notifications
    const reply = (r) => out.push({ jsonrpc: '2.0', id: m.id, result: r });
    const text = (t, isError) => reply({ content: [{ type: 'text', text: String(t) }], isError: !!isError });
    try {
      if (m.method === 'initialize') reply({ protocolVersion: (m.params && m.params.protocolVersion) || '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'seoil-office', version: toolDefs.VERSION }, instructions: D.INSTRUCTIONS });
      else if (m.method === 'ping') reply({});
      else if (m.method === 'tools/list') reply({ tools: D.TOOLS });
      else if (m.method === 'tools/call') {
        const name = m.params && m.params.name, args = (m.params && m.params.arguments) || {};
        if (!D.TOOLS.some((t) => t.name === name)) { out.push({ jsonrpc: '2.0', id: m.id, error: { code: -32602, message: 'unknown tool' } }); continue; }
        if (!(await isKnown())) { text(GONE, true); continue; }
        const r = await stub(env, key).fetch('https://relay/call', { method: 'POST', body: JSON.stringify({ name, args }) });
        const j = await r.json();
        if (j.offline) text(OFFLINE, true); else text(j.text, j.isError);
      } else out.push({ jsonrpc: '2.0', id: m.id, error: { code: -32601, message: 'method not found' } });
    } catch (e) { out.push({ jsonrpc: '2.0', id: m.id, error: { code: -32000, message: String(e && e.message || e) } }); }
  }
  if (!out.length) return new Response(null, { status: 202, headers: MCP_CORS });
  return json(Array.isArray(msg) ? out : out[0], 200, Object.assign({ 'mcp-session-id': key.slice(0, 8) }, MCP_CORS));
}
async function appSocket(req, env, key) {
  if ((req.headers.get('upgrade') || '').toLowerCase() !== 'websocket') return new Response('WebSocket only', { status: 426 });
  if (!(await env.KV.get(`relay:${key}`))) return new Response('gone', { status: 410 });
  return stub(env, key).fetch(new Request('https://relay/app', req));
}

// ---------- 내 AI 연결: 로그인 방식(OAuth 2.1) — 2026-11-25 ----------
// 주소에 열쇠를 넣는 방식(/u/:key/mcp)은 사람마다 비밀 주소를 복사해 옮겨야 하고, 주소가 새면 문서가 열린다.
// 여기서는 모두 같은 주소(/mcp)를 쓰고, Claude가 처음 연결할 때 이 서버의 로그인 창(학교 계정)을 띄운다.
//   Claude → POST /mcp (토큰 없음) → 401 + 메타데이터 위치 → /oauth/register(DCR) → /oauth/authorize(로그인) → /oauth/token → Bearer 토큰으로 /mcp
// Claude 문서 기준: 401이어야 로그인이 시작되고, resource는 사용자가 넣는 주소와 글자 그대로 같아야 하며, PKCE S256, 토큰 끝점은 form-urlencoded,
// 공개 클라이언트(token_endpoint_auth_method none), refresh 토큰은 쓸 때마다 바꾼다. 콜백은 https://claude.ai/api/mcp/auth_callback(+ claude.com), Claude Code는 loopback.
const ACCESS_TTL = 7 * 86400, REFRESH_TTL = 180 * 86400, CODE_TTL = 300;
const ostore = (env, body) => env.OAUTH.get(env.OAUTH.idFromName('v1')).fetch('https://oauth/', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json());
const rnd = (p) => p + hex(crypto.getRandomValues(new Uint8Array(32)));
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const OA_CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type,authorization,mcp-protocol-version' };
const oaJson = (o, st, extra) => json(o, st || 200, Object.assign({ 'cache-control': 'no-store' }, OA_CORS, extra || {}));
const oaErr = (error, desc, st) => oaJson({ error, error_description: desc }, st || 400);
function isLoopback(u) { try { const x = new URL(u); return x.protocol === 'http:' && (x.hostname === 'localhost' || x.hostname === '127.0.0.1' || x.hostname === '[::1]'); } catch (e) { return false; } }
function okRedirect(u) { try { const x = new URL(u); return (x.protocol === 'https:' || isLoopback(u)) && !x.hash; } catch (e) { return false; } }
// 등록된 주소와 글자 그대로 같아야 한다. loopback(Claude Code)만 포트를 빼고 맞춘다
function redirectMatches(list, u) {
  if (!Array.isArray(list)) return false;
  if (list.includes(u)) return true;
  if (!isLoopback(u)) return false;
  const a = new URL(u);
  return list.some((r) => { if (!isLoopback(r)) return false; const b = new URL(r); return b.hostname === a.hostname && b.pathname === a.pathname; });
}
function wellKnown(req, path) {
  const origin = new URL(req.url).origin;
  if (path.startsWith('/.well-known/oauth-protected-resource'))
    return oaJson({ resource: origin + '/mcp', authorization_servers: [origin], bearer_methods_supported: ['header'], resource_name: '서일 오피스' }, 200, { 'cache-control': 'public, max-age=300' });
  return oaJson({
    issuer: origin, authorization_endpoint: origin + '/oauth/authorize', token_endpoint: origin + '/oauth/token', registration_endpoint: origin + '/oauth/register',
    response_types_supported: ['code'], grant_types_supported: ['authorization_code', 'refresh_token'], code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'], scopes_supported: ['seoil'],
  }, 200, { 'cache-control': 'public, max-age=300' });
}
async function oaRegister(req, env) {
  let b; try { b = await req.json(); } catch (e) { return oaErr('invalid_client_metadata', 'JSON이 아닙니다'); }
  const uris = Array.isArray(b.redirect_uris) ? b.redirect_uris.map(String).slice(0, 10) : [];
  if (!uris.length || !uris.every(okRedirect)) return oaErr('invalid_redirect_uri', 'redirect_uris는 https 또는 loopback 주소여야 합니다');
  const client = { client_id: rnd('socl_').slice(0, 45), client_name: String(b.client_name || '').slice(0, 80), redirect_uris: uris,
    grant_types: ['authorization_code', 'refresh_token'], response_types: ['code'], token_endpoint_auth_method: 'none', client_id_issued_at: Math.floor(Date.now() / 1000) };
  await ostore(env, { op: 'put', k: 'cl:' + client.client_id, v: client, ttl: 400 * 86400 });
  return oaJson(client, 201);
}
function loginPage(q, client, msg) {
  let host = ''; try { host = new URL(q.redirect_uri).host; } catch (e) {}
  const hidden = ['response_type', 'client_id', 'redirect_uri', 'state', 'code_challenge', 'code_challenge_method', 'scope', 'resource'].map((k) => `<input type="hidden" name="${k}" value="${esc(q[k] || '')}">`).join('');
  return new Response(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>서일 오피스 — 내 AI 연결</title>
<style>*{box-sizing:border-box}body{margin:0;background:#F4F5F7;color:#1C1F23;font:15px/1.6 -apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:20px}
main{width:100%;max-width:400px;background:#fff;border:1px solid #E3E6EA;border-radius:16px;padding:28px 26px}h1{font-size:20px;margin:0 0 6px}p{margin:0 0 14px;color:#3D434B;font-size:14px}
.app{background:#F3F6FE;border:1px solid #C9D4F8;border-radius:10px;padding:10px 12px;font-size:13px;margin-bottom:16px}.app b{color:#1C1F23}
label{display:block;font-size:13px;color:#5F6670;margin:10px 0 4px}input[type=email],input[type=password]{width:100%;font:inherit;padding:10px 12px;border:1px solid #D5D9DF;border-radius:10px}
button{width:100%;margin-top:18px;font:inherit;font-weight:600;padding:11px;border:0;border-radius:10px;background:#2F5BEA;color:#fff;cursor:pointer}
.err{background:#FDECEC;border:1px solid #F3B9B9;color:#8A1C1C;border-radius:10px;padding:9px 12px;font-size:13px;margin-bottom:12px}small{display:block;margin-top:14px;color:#6B727C;font-size:12px;line-height:1.6}</style></head>
<body><main><h1>서일 오피스 — 내 AI 연결</h1><p>서일 오피스 계정(학교 이메일)으로 로그인하면 연결됩니다.</p>
<div class="app"><b>${esc(client.client_name || 'AI 앱')}</b>이(가) 내 PC의 서일 오피스에 열린 한글 문서를 읽고·고치고·저장할 수 있게 됩니다.<br>돌아갈 곳: <b>${esc(host)}</b></div>
${msg ? `<div class="err">${esc(msg)}</div>` : ''}
<form method="post" action="/oauth/authorize">${hidden}
<label for="e">이메일</label><input id="e" type="email" name="email" autocomplete="username" required autofocus>
<label for="p">비밀번호</label><input id="p" type="password" name="password" autocomplete="current-password" required>
<button type="submit">로그인하고 연결</button></form>
<small>계정이 없으면 서일 오피스 앱 › 설정에서 먼저 가입하세요. 연결을 끊으려면 AI 앱의 커넥터 목록에서 「서일 오피스」를 지우면 됩니다.</small></main></body></html>`,
    { status: msg ? 400 : 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer' } });
}
const plainPage = (t, st) => new Response(`<!doctype html><meta charset="utf-8"><title>서일 오피스</title><body style="font:15px/1.6 sans-serif;padding:40px;max-width:520px;margin:auto"><h3>연결할 수 없습니다</h3><p>${esc(t)}</p>`, { status: st || 400, headers: { 'content-type': 'text/html; charset=utf-8' } });
async function oaAuthorize(req, env) {
  const url = new URL(req.url);
  let q = Object.fromEntries(url.searchParams), form = null;
  if (req.method === 'POST') { form = Object.fromEntries((await req.formData()).entries()); q = form; }
  // 클라이언트와 돌아갈 주소가 확인되기 전에는 그 주소로 보내지 않는다(남의 주소로 코드를 흘리지 않게)
  const client = (await ostore(env, { op: 'get', k: 'cl:' + String(q.client_id || '') })).v;
  if (!client) return plainPage('알 수 없는 앱입니다. AI 앱에서 커넥터를 지우고 다시 추가해 주세요.');
  if (!redirectMatches(client.redirect_uris, String(q.redirect_uri || ''))) return plainPage('돌아갈 주소가 등록된 것과 다릅니다.');
  const back = (params) => { const u = new URL(q.redirect_uri); Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') u.searchParams.set(k, v); }); return new Response(null, { status: 302, headers: { location: u.toString(), 'cache-control': 'no-store' } }); };
  if (q.response_type !== 'code') return back({ error: 'unsupported_response_type', state: q.state });
  if (!q.code_challenge || (q.code_challenge_method || 'plain') !== 'S256') return back({ error: 'invalid_request', error_description: 'PKCE S256 required', state: q.state });
  if (!form) return loginPage(q, client);
  const email = normEmail(form.email);
  const fails = (await ostore(env, { op: 'get', k: 'fail:' + email })).v || 0;
  if (fails >= 8) return loginPage(q, client, '로그인을 여러 번 틀렸습니다. 10분 뒤에 다시 해 주세요.');
  const user = await getJ(env, `user:${email}`, null);
  if (user) await freshPw(env, user);
  if (!user || !(await pwOk(user, form.password))) {
    await ostore(env, { op: 'put', k: 'fail:' + email, v: fails + 1, ttl: 600 });
    return loginPage(q, client, '이메일이나 비밀번호가 맞지 않습니다.');
  }
  if (user.status !== 'active' && user.status !== 'pending') return loginPage(q, client, '사용이 중지된 계정입니다. 관리자에게 물어 주세요.');
  const code = rnd('soc_');
  await ostore(env, { op: 'put', k: 'cd:' + code, v: { email, client_id: client.client_id, redirect_uri: q.redirect_uri, cc: q.code_challenge }, ttl: CODE_TTL });
  return back({ code, state: q.state });
}
async function issueTokens(env, email, client_id) {
  const at = rnd('soa_'), rt = rnd('sor_');
  await ostore(env, { op: 'put', k: 'at:' + at, v: { email, client_id }, ttl: ACCESS_TTL });
  await ostore(env, { op: 'put', k: 'rt:' + rt, v: { email, client_id }, ttl: REFRESH_TTL });
  return oaJson({ access_token: at, token_type: 'Bearer', expires_in: ACCESS_TTL, refresh_token: rt, scope: 'seoil' });
}
async function oaToken(req, env) {
  let f; try { f = Object.fromEntries((await req.formData()).entries()); } catch (e) { return oaErr('invalid_request', 'application/x-www-form-urlencoded 로 보내 주세요'); }
  if (f.grant_type === 'authorization_code') {
    const c = (await ostore(env, { op: 'take', k: 'cd:' + String(f.code || '') })).v; // 한 번만 쓸 수 있다
    if (!c) return oaErr('invalid_grant', '코드가 없거나 이미 썼거나 시간이 지났습니다');
    if (f.client_id && f.client_id !== c.client_id) return oaErr('invalid_grant', 'client_id가 다릅니다');
    if (f.redirect_uri && f.redirect_uri !== c.redirect_uri) return oaErr('invalid_grant', 'redirect_uri가 다릅니다');
    const v = String(f.code_verifier || '');
    if (!v || b64url(await crypto.subtle.digest('SHA-256', enc.encode(v))) !== c.cc) return oaErr('invalid_grant', 'code_verifier가 맞지 않습니다');
    return issueTokens(env, c.email, c.client_id);
  }
  if (f.grant_type === 'refresh_token') {
    const r = (await ostore(env, { op: 'take', k: 'rt:' + String(f.refresh_token || '') })).v; // 쓸 때마다 새것으로 바꾼다
    if (!r) return oaErr('invalid_grant', 'refresh 토큰이 없거나 시간이 지났습니다');
    if (f.client_id && f.client_id !== r.client_id) return oaErr('invalid_grant', 'client_id가 다릅니다');
    return issueTokens(env, r.email, r.client_id);
  }
  return oaErr('unsupported_grant_type', 'authorization_code 또는 refresh_token');
}
async function relayKeyOf(env, email) {
  let key = await env.KV.get(`relayof:${email}`);
  if (!key) { key = relayKeyNew(); await putJ(env, `relay:${key}`, { email, created: new Date().toISOString() }); await env.KV.put(`relayof:${email}`, key); }
  return key;
}
async function mcpOAuth(req, env) {
  const origin = new URL(req.url).origin;
  const need = (extra) => json({ error: 'unauthorized', error_description: '로그인이 필요합니다' }, 401,
    Object.assign({ 'www-authenticate': `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp"` + (extra || '') }, MCP_CORS, { 'access-control-expose-headers': 'mcp-session-id, www-authenticate' }));
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!t.startsWith('soa_')) return need();
  const a = (await ostore(env, { op: 'get', k: 'at:' + t })).v;
  if (!a) return need(', error="invalid_token"');
  const user = await getJ(env, `user:${a.email}`, null);
  if (!user || (user.status !== 'active' && user.status !== 'pending')) return need(', error="invalid_token"');
  return mcp(req, env, await relayKeyOf(env, a.email));
}
// 로그인 연결의 클라이언트·인가 코드·토큰 저장소. 인가 코드는 로그인 직후 다른 지역(Anthropic 서버)에서 바로 읽어야 해서 KV(반영이 늦을 수 있음) 대신 여기에 둔다.
export class OAuthStore {
  constructor(state) { this.s = state.storage; }
  async fetch(req) {
    const { op, k, v, ttl } = await req.json(), now = Date.now();
    if (op === 'put') {
      await this.s.put(k, { v, exp: ttl ? now + ttl * 1000 : 0 });
      if ((await this.s.getAlarm()) == null) await this.s.setAlarm(now + 6 * 3600 * 1000);
      return Response.json({ ok: true });
    }
    if (op === 'get' || op === 'take') {
      const r = await this.s.get(k);
      if (r && op === 'take') await this.s.delete(k);
      return Response.json({ v: r && (!r.exp || r.exp > now) ? r.v : null });
    }
    if (op === 'del') { await this.s.delete(k); return Response.json({ ok: true }); }
    return new Response('bad op', { status: 400 });
  }
  async alarm() { // 시간이 지난 것 치우기
    const now = Date.now(); let cursor, left = false;
    for (let i = 0; i < 20; i++) {
      const page = await this.s.list({ limit: 500, startAfter: cursor });
      if (!page.size) break;
      const dead = [];
      for (const [k, r] of page) { cursor = k; if (r && r.exp && r.exp <= now) dead.push(k); }
      for (let j = 0; j < dead.length; j += 128) await this.s.delete(dead.slice(j, j + 128));
      if (page.size < 500) break;
      left = true;
    }
    if (left || (await this.s.list({ limit: 1 })).size) await this.s.setAlarm(now + 6 * 3600 * 1000);
  }
}

// 연결 주소 하나마다 하나. 설치판 WebSocket을 쥐고(여러 PC가 붙으면 마지막에 쓴 창으로), 도구 호출을 넘기고 답을 기다린다.
// WebSocket은 잠들 수 있는(hibernation) 방식 — 쉬는 동안 비용이 들지 않는다. 도구 호출을 기다리는 동안에는 깨어 있다.
const CALL_TIMEOUT = 170000;
export class Relay {
  constructor(state) {
    this.state = state; this.pending = new Map();
    state.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }
  socket() { // 가장 최근에 사람이 쓴 창
    let best = null, bt = -1;
    for (const ws of this.state.getWebSockets()) { const a = ws.deserializeAttachment() || {}; if ((a.t || 0) > bt) { bt = a.t || 0; best = ws; } }
    return best;
  }
  async fetch(req) {
    const path = new URL(req.url).pathname;
    if (path === '/app') {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);
      pair[1].serializeAttachment({ t: Date.now() });
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (path === '/status') return Response.json({ online: this.state.getWebSockets().length > 0 });
    if (path === '/drop') { for (const ws of this.state.getWebSockets()) { try { ws.close(4001, 'reset'); } catch (e) {} } return Response.json({ ok: true }); }
    if (path === '/call') {
      const ws = this.socket();
      if (!ws) return Response.json({ offline: true });
      const b = await req.json(), id = crypto.randomUUID();
      const p = new Promise((resolve) => {
        const timer = setTimeout(() => { this.pending.delete(id); resolve({ text: '서일 오피스가 제때 답하지 않았습니다. 창이 떠 있는지 사용자에게 확인해 주세요.', isError: true }); }, CALL_TIMEOUT);
        this.pending.set(id, { resolve, timer, ws });
      });
      try { ws.send(JSON.stringify({ id, name: b.name, args: b.args || {} })); } catch (e) { const q = this.pending.get(id); if (q) { clearTimeout(q.timer); this.pending.delete(id); } return Response.json({ offline: true }); }
      return Response.json(await p);
    }
    return new Response('not found', { status: 404 });
  }
  webSocketMessage(ws, data) {
    let m; try { m = JSON.parse(typeof data === 'string' ? data : new TextDecoder().decode(data)); } catch (e) { return; }
    if (m && m.t === 'active') { ws.serializeAttachment({ t: Date.now() }); return; }
    const q = m && m.id && this.pending.get(m.id);
    if (!q) return;
    clearTimeout(q.timer); this.pending.delete(m.id);
    q.resolve({ text: m.text == null ? '' : String(m.text), isError: !!m.isError });
  }
  drop(ws) { // 답을 기다리던 호출이 있으면 바로 알려 준다
    for (const [id, q] of this.pending) if (q.ws === ws) { clearTimeout(q.timer); this.pending.delete(id); q.resolve({ text: '서일 오피스와의 연결이 끊겼습니다. 설치판이 켜져 있는지 사용자에게 확인하고 다시 시도하세요.', isError: true }); }
  }
  webSocketClose(ws) { this.drop(ws); }
  webSocketError(ws) { this.drop(ws); }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), h = cors(req, env), path = url.pathname.replace(/\/+$/, '') || '/';
    // 로그인 방식(OAuth) 내 AI 연결
    if (path === '/mcp' || path.startsWith('/.well-known/oauth-') || path === '/.well-known/openid-configuration' || path.startsWith('/oauth/')) {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: path === '/mcp' ? MCP_CORS : OA_CORS });
      try {
        if (path === '/mcp') return await mcpOAuth(req, env);
        if (path.startsWith('/.well-known/')) return wellKnown(req, path);
        if (path === '/oauth/register' && req.method === 'POST') return await oaRegister(req, env);
        if (path === '/oauth/authorize' && (req.method === 'GET' || req.method === 'POST')) return await oaAuthorize(req, env);
        if (path === '/oauth/token' && req.method === 'POST') return await oaToken(req, env);
        return oaErr('not_found', '없는 주소', 404);
      } catch (e) { return oaErr('server_error', String(e && e.message || e), 500); }
    }
    const um = path.match(/^\/u\/([^/]+)\/(mcp|app)$/);
    if (um) {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: MCP_CORS });
      if (!KEY_RE.test(um[1])) return new Response('not found', { status: 404, headers: MCP_CORS });
      try { return um[2] === 'mcp' ? await mcp(req, env, um[1]) : await appSocket(req, env, um[1]); }
      catch (e) { return json({ jsonrpc: '2.0', error: { code: -32000, message: String(e && e.message || e) }, id: null }, 500, MCP_CORS); }
    }
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    try {
      if (path === '/v1/messages' && req.method === 'POST') return await messages(req, env, h);
      if (path === '/v1/me' && req.method === 'GET') return await me(req, env, h);
      if (path === '/v1/signup' && req.method === 'POST') return await signup(req, env, h);
      if (path === '/v1/login' && req.method === 'POST') return await login(req, env, h);
      if (path === '/v1/logout' && req.method === 'POST') return await logout(req, env, h);
      if (path === '/v1/password' && req.method === 'POST') return await password(req, env, h);
      if (path === '/v1/relay' && req.method === 'GET') return await relayGet(req, env, h);
      if (path === '/v1/relay/reset' && req.method === 'POST') return await relayReset(req, env, h);
      if (path === '/admin' && req.method === 'GET') return new Response(ADMIN_HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });
      if (path.startsWith('/admin/api/')) return await admin(req, env, h, path);
      if (path === '/') return json({ service: '서일 오피스 AI 중계', ok: true }, 200, h);
      return fail('없는 주소', 404, h);
    } catch (e) {
      return fail('중계 서버 오류: ' + (e && e.message || e), 500, h, 'api_error');
    }
  },
};

const ADMIN_HTML = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>서일 오피스 AI 관리</title>
<style>
:root{--bg:#F6F7F9;--card:#fff;--ink:#1D2026;--sub:#5F6670;--line:#E3E6EA;--acc:#1F4E8C;--warn:#B4570E}
@media (prefers-color-scheme:dark){:root{--bg:#15171B;--card:#1E2126;--ink:#E8EAED;--sub:#9AA0A6;--line:#30343A;--acc:#7FA8E0;--warn:#E0A060}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 -apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}
main{max-width:920px;margin:0 auto;padding:24px 16px}h1{font-size:20px;margin:0 0 4px}.sub{color:var(--sub);font-size:13px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px;margin-top:16px}
input,button{font:inherit;padding:7px 10px;border-radius:7px;border:1px solid var(--line);background:var(--card);color:var(--ink)}
button{cursor:pointer}button.p{background:var(--acc);border-color:var(--acc);color:#fff}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--line)}th{color:var(--sub);font-weight:600}
td.n{text-align:right;font-variant-numeric:tabular-nums}.code{font-family:ui-monospace,Consolas,monospace;font-size:12px}
.off{opacity:.45}.new{background:color-mix(in srgb,var(--acc) 12%,transparent);padding:10px;border-radius:8px;margin-top:10px}
.scroll{overflow-x:auto}
</style></head><body><main>
<h1>서일 오피스 AI 관리</h1><div class="sub" id="meta">관리 토큰을 넣으면 코드와 사용량이 보입니다.</div>
<div class="card row" id="login"><input id="tok" type="password" placeholder="관리 토큰" style="flex:1;min-width:200px"><button class="p" id="go">들어가기</button></div>
<div id="app" hidden>
<div class="card"><div class="row" style="justify-content:space-between"><b>사용자 (로그인)</b><span class="sub" id="ucount"></span></div>
<div class="row" style="margin-top:8px"><span class="sub">바로 쓰게 할 이메일 도메인</span><input id="auto" placeholder="seoil.ac.kr, 다른대학.ac.kr" style="flex:1;min-width:200px"><button id="autoSave">저장</button></div>
<div class="sub" style="margin-top:4px">이 도메인 이메일로 가입하면 승인 없이 바로 씁니다. 그 밖의 가입은 아래에서 「승인」을 눌러야 씁니다. 한 달 사용량 기본값 <span id="defb"></span>(입력 환산 토큰).</div>
<div id="tempPw"></div>
<div class="scroll"><table><thead><tr><th>상태</th><th>이름</th><th>이메일</th><th>소속</th><th>이번 달</th><th>한 달 사용량</th><th></th></tr></thead><tbody id="urows"></tbody></table></div></div>
<div class="card"><b>새 사용 코드</b> <span class="sub">(로그인 없이 쓰는 예전 방식)</span><div class="row" style="margin-top:8px"><input id="nm" placeholder="이름 (예: 홍길동 교수)" style="flex:1;min-width:160px"><input id="dl" type="number" placeholder="하루 횟수" style="width:110px"><button class="p" id="mk">만들기</button></div><div id="made"></div></div>
<div class="card"><div class="row" style="justify-content:space-between"><b>사용 코드</b><span class="sub" id="tot"></span></div>
<div class="scroll"><table><thead><tr><th>이름</th><th>코드</th><th>오늘</th><th>하루 상한</th><th>이번 달 요청</th><th>이번 달 토큰</th><th></th></tr></thead><tbody id="rows"></tbody></table></div></div>
</div></main>
<script>
var T='';try{T=sessionStorage.getItem('seoil.admin')||''}catch(e){}
function api(m,b){return fetch('/admin/api/codes',{method:m,headers:{'content-type':'application/json',authorization:'Bearer '+T},body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error&&j.error.message||r.status);return j})})}
function k(n){return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(n)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function load(){api('GET').then(function(j){
 document.getElementById('login').hidden=true;document.getElementById('app').hidden=false;
 document.getElementById('meta').textContent='모델 '+j.model+' · 백엔드 '+j.backend;
 var t=j.total;document.getElementById('tot').textContent='이번 달 전체 '+t.req+'회 · '+k(t.in+t.out)+' 토큰'+(j.monthCap?' / 상한 '+k(j.monthCap):'');
 document.getElementById('rows').innerHTML=j.rows.map(function(r){return '<tr class="'+(r.off?'off':'')+'"><td>'+esc(r.name)+'</td><td class="code">'+r.code+'</td><td class="n">'+r.today.req+'</td><td class="n"><input data-d="'+r.code+'" type="number" value="'+r.daily+'" style="width:70px"></td><td class="n">'+r.month.req+'</td><td class="n">'+k(r.month.in+r.month.out)+'</td><td><button data-o="'+r.code+'" data-v="'+(r.off?0:1)+'">'+(r.off?'다시 켜기':'끄기')+'</button></td></tr>'}).join('')||'<tr><td colspan="7" class="sub">아직 코드가 없습니다.</td></tr>';
}).catch(function(e){document.getElementById('meta').textContent='들어가지 못함: '+e.message;document.getElementById('login').hidden=false})}
document.getElementById('go').onclick=function(){T=document.getElementById('tok').value.trim();try{sessionStorage.setItem('seoil.admin',T)}catch(e){}load()};
document.getElementById('mk').onclick=function(){var n=document.getElementById('nm').value.trim();if(!n)return;api('POST',{name:n,daily:Number(document.getElementById('dl').value)||undefined}).then(function(j){document.getElementById('made').innerHTML='<div class="new">'+esc(j.info.name)+' 님 코드: <b class="code">'+j.code+'</b> — 이 코드를 그분께 전해 주세요.</div>';document.getElementById('nm').value='';load()}).catch(function(e){document.getElementById('made').textContent='만들지 못함: '+e.message})};
document.getElementById('rows').addEventListener('click',function(e){var b=e.target.closest('button[data-o]');if(b)api('POST',{code:b.dataset.o,off:b.dataset.v==='1'}).then(load)});
document.getElementById('rows').addEventListener('change',function(e){var i=e.target.closest('input[data-d]');if(i)api('POST',{code:i.dataset.d,daily:Number(i.value)}).then(load)});
var ST={pending:'승인 대기',active:'사용 중',off:'중지'};
function uapi(m,b){return fetch('/admin/api/users',{method:m,headers:{'content-type':'application/json',authorization:'Bearer '+T},body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error&&j.error.message||r.status);return j})})}
function uload(){uapi('GET').then(function(j){
 document.getElementById('auto').value=(j.auto||[]).join(', ');document.getElementById('defb').textContent=k(j.defaultBudget);
 var pend=j.rows.filter(function(r){return r.status==='pending'}).length;
 document.getElementById('ucount').textContent=j.rows.length+'명'+(pend?' · 승인 대기 '+pend+'명':'');
 document.getElementById('urows').innerHTML=j.rows.map(function(r){
  var act=r.status==='pending'?'<button class="p" data-s="active" data-e="'+esc(r.email)+'">승인</button> <button data-s="off" data-e="'+esc(r.email)+'">거절</button>'
   :r.status==='active'?'<button data-s="off" data-e="'+esc(r.email)+'">중지</button>':'<button data-s="active" data-e="'+esc(r.email)+'">다시 켜기</button>';
  return '<tr class="'+(r.status==='off'?'off':'')+'"><td>'+ST[r.status]+'</td><td>'+esc(r.name)+'</td><td class="code">'+esc(r.email)+'</td><td>'+esc([r.org,r.dept].filter(Boolean).join(' '))+'</td><td class="n">'+r.used+'% <span class="sub">('+r.req+'회)</span></td><td class="n"><input data-b="'+esc(r.email)+'" type="number" value="'+r.budget+'" style="width:100px"></td><td>'+act+' <button data-pw="'+esc(r.email)+'" title="임시 비밀번호 만들기">비번</button></td></tr>'}).join('')||'<tr><td colspan="7" class="sub">아직 가입한 사람이 없습니다.</td></tr>';
}).catch(function(e){document.getElementById('ucount').textContent='불러오지 못함: '+e.message})}
document.getElementById('autoSave').onclick=function(){uapi('POST',{auto:document.getElementById('auto').value}).then(uload)};
document.getElementById('urows').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
 if(b.dataset.s)uapi('POST',{email:b.dataset.e,status:b.dataset.s}).then(uload);
 if(b.dataset.pw)uapi('POST',{email:b.dataset.pw,resetPassword:true}).then(function(j){document.getElementById('tempPw').innerHTML='<div class="new">'+esc(b.dataset.pw)+' 임시 비밀번호: <b class="code">'+esc(j.temp)+'</b> — 전해 주고, 로그인 뒤 바꾸게 해 주세요.</div>'})});
document.getElementById('urows').addEventListener('change',function(e){var i=e.target.closest('input[data-b]');if(i)uapi('POST',{email:i.dataset.b,budget:Number(i.value)}).then(uload)});
var load0=load;load=function(){load0();uload()};
if(T)load();
</script></body></html>`;
