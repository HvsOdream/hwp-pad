# patches/ — 이음오피스·rhwp 소스에 가하는 변경 (Apache-2.0 §4(b) 변경 고지)

서일 오피스는 이음오피스(`pblsketch/openoffice`, Apache-2.0)의 HWP 편집기 빌드 스크립트가
받아 두는 rhwp-studio(`edwardkim/rhwp`, MIT) 소스에, 이음 패치가 적용된 뒤 아래 스크립트를
한 번씩 더 적용해서 번들을 만든다(`.github/workflows/deploy.yml`의 「Apply hwp-pad patches」 단계).
각 파일 머리의 주석이 바꾸는 위치와 이유를 적는다. 바꾼 파일에는 `[hwp-pad]` 표시가 들어간다.

| 스크립트 | 바꾸는 곳 | 무엇을 |
|---|---|---|
| `ai-bridge.mjs` | rhwp-studio `src/engine` | `window.rhwpStudio.ai`(열린 문서·변경 알림·파일명) 노출 — AI 패널 연결 |
| `branding.mjs` | `src/ui`, `index.html` | 탭 제목 「rhwp-studio」→「서일 오피스」 |
| `char-shape-caret.mjs` | `src/engine` | 블록 없이 글자 모양(Alt+L) 열고 캐럿 서식으로 적용 |
| `dirty-state.mjs` | `src/main.ts` | `window.rhwpStudio.isDirty()` — 홈 「저장하고 닫기」가 저장 완료를 알 수 있게 |
| `context-tidy.mjs` | `src/engine` | 우클릭 「문단 모양 맞추기」(seoil-write tidy 를 블록·커서 문단에, 스냅샷 되돌리기) + `rhwpStudio.ai.selection()` 으로 AI 에 블록 범위 전달 |
| `format-stamp.mjs` | `src/engine` | 모양 복사(Alt+C)를 도장처럼: 기억 유지, 블록 없이 다른 문단에서 Alt+C 로 문단 모양 찍기, Esc 로 끝 |
| `hancom-web.mjs` | `src/engine` | 한글 2024 단축키 중 브라우저에서 비는 것 보완 |
| `ios-input.mjs` | `src/engine` | iOS contenteditable 입력 앵커 초기화 |
| `master-page-hit.mjs` | `src/engine` | 바탕쪽 그림·도형이 본문 클릭을 가로채지 않게 (엔진 9005 `masterPage`) |
| `native-bridge.mjs` | `src/engine` | `window.rhwpStudio.openBytes()` — 바이트로 문서 열기(iOS·MCP) |
| `page-auto.mjs` | `src/core` | 쪽 배치 기본값 「한 쪽」→「자동」(줄이면 여러 쪽을 옆으로, 한 번만 기존 설정 이전) |
| `nested-cell-line.mjs` | `src/engine`, `src/core` | 표 안의 표 칸에서 Home/End·Shift+End 가 맞는 줄로 (엔진 9003 `getLineInfoByPath`) |
| `para-dialog-keys.mjs` | `src/ui` | 문단 모양 대화상자에서 Alt+M/L/R/C/T/N 으로 정렬 방식 |
| `para-dialog-pattern.mjs` | `src/engine` | 문단 모양 대화상자 무늬 0/-1 동일 취급(테두리 생기던 버그) |
| `picture-paste-cell.mjs` | `src/engine` | 복사한 그림을 표 칸 안에 붙여넣기 |
| `save-path.mjs` | `src/engine` | 저장 폴더 기억(File System Access)·iOS 공유 시트 |
| `shortcut-code.mjs` | `src/command` | 단축키를 물리키(code)로도 매칭 |

이 외에 deploy.yml이 이음 `apps/hwp/scripts/build-studio.mjs` 두 줄을 sed로 바꾼다
(외부 웹폰트 켜기, 번들 글꼴 포함). 제품판에서는 외부 웹폰트를 다시 끌 예정(`THIRD_PARTY.md` 2-3).

이음오피스·GenOffice·rhwp의 이름과 로고는 원저작물을 가리킬 때만 쓴다.
