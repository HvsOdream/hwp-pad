# 서일 오피스 AI 중계 서버

학교 Claude 키는 이 서버(Cloudflare Worker)에만 둔다. 앱은 관리자가 나눠 준 「AI 사용 코드」만 보낸다.

- 앱: `POST /v1/messages` (머리글 `x-seoil-code`), `GET /v1/me`
- 관리 화면: `/admin` — 코드 만들기·끄기, 하루 상한, 오늘·이번 달 사용량
- 하루 상한(코드별 요청 수), 이번 달 전체 토큰 상한(`MONTH_CAP`)
- 배포: `.github/workflows/proxy.yml` (Secrets는 그 파일 머리말 참고)

## 교내 sLLM으로 바꾸기

`wrangler.toml`의 `BACKEND = "openai"`, `SLLM_URL`, `SLLM_MODEL`(필요하면 시크릿 `SLLM_KEY`).
vLLM·Ollama처럼 OpenAI 호환 `/v1/chat/completions`를 내는 서버면 된다. 앱은 고칠 것이 없다 —
이 서버가 Anthropic 형식 ↔ OpenAI 형식을 바꿔 준다(도구 호출 포함). 서버가 바깥에서 닿아야 하므로
연구실 PC라면 Cloudflare Tunnel 같은 길을 연다.
