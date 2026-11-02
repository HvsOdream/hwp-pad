# 서일 오피스 (hwp-pad)

**서일 오피스** — 어디서나 쓰는 HWP 편집기. 이음오피스(pblsketch/openoffice)의 HWP 편집기(rhwp-studio v0.8.7 + 이음 패치: 한컴 단축키·모양 복사·메모)를
GitHub Pages에 PWA로 올린 것. 아이패드 사파리에서 "홈 화면에 추가", PC 크롬·엣지에서 "앱 설치"하면 앱처럼 쓴다.
이름(2026-11-02 확정): **「서일 오피스」** — 서일대학교 교직원 보급용(AIDX혁신센터 파일럿 → 학교 AX 사업). 10-29에 잠시 「한뜻 오피스」(KIPRIS 9·42류 클린)로 갔다가 학교 이름으로 변경. 거쳐 간 후보: 한결(9류 선출원에 막힘)·온글·한길·한뼘·디딤·줄곧. '한글'은 한컴 상표 문제로 피함. 레포·주소는 hwp-pad 유지.

주소: https://hvsodream.github.io/hwp-pad/

## 레포 구성

- `.github/workflows/deploy.yml` — 빌드·배포. 매니페스트·아이콘·.nojekyll·`debug.js`는 빌드 중 만들어진다.
- `patches/*.mjs` — rhwp-studio 소스에 얹는 hwp-pad 자체 패치. 1차 빌드로 소스를 받은 뒤 적용하고 다시 빌드한다.
  - `ios-input.mjs` (2026-10-29): iOS 입력 경로 보정. rhwp는 iOS에서 숨은 contenteditable DIV의 input 이벤트로 글자를 받고
    "첫 입력 위치(_iosAnchor)부터 DIV 내용 전체로 치환"하는데, 그 앵커를 Enter·Backspace·화살표·클릭 뒤에 초기화하지 않아
    Enter 직후 다음 글자가 문단 분리를 도로 합쳤다(업스트림 버그, 원본 사이트도 동일). 문자키가 아닌 키와 클릭에서 앵커를 끊는다.
  - `branding.mjs` (2026-10-29): 탭 제목·index.html <title>을 「서일 오피스」로. 아이콘은 워크플로가 나눔고딕으로 「서일」을 그림.
  - `save-path.mjs` (2026-10-29): 저장 경로 정리 — PC는 열기/저장 대화상자 폴더 기억 + 「저장 폴더 지정…」 메뉴, 아이패드는 공유 시트로 저장.
  - `shortcut-code.mjs` (2026-10-29): 단축키 매칭을 물리키(code)로도. 맥/아이패드에서 Option+Shift+A는 key가 'Å'로 와서
    `key`만 적힌 정의(줄간격 A/Z, 글자 크기 E/R, Alt+N/L/T)가 안 맞았다. 자간·장평(J/K/N/W)은 원래 code가 있어 됐음.
- `hancom-web.mjs` (2026-11-02): 한글 단축키 마감. 이음 hancom-keys가 Electron 메인 프로세스에 맡겼던 Ctrl+E/C/X(셀 블록·표)·Ctrl+Shift+S(블록 합계)를
    브라우저에서 `window.__ieumHancomKey`로 되묻고, Alt+O/S/V/P·Ctrl+J·Ctrl+Shift+W/Q·Ctrl+Shift+Insert/Delete 추가, Alt+V 보기 연속키는 맥만.
    명령 `hwppad:fullscreen`(Ctrl+G,Z) 등록 — 워크플로가 이음 CHORDS.g에 z를 심는다. 전체 대조표: `docs/단축키_대조표.md`.
- `keylock.js` (2026-11-02, 워크플로가 생성): **단축키 모드** — PC 크롬·엣지에서 Ctrl+N,T(표)·Ctrl+T·Ctrl+W 같은 조합을 브라우저가 먼저 가로채는 문제.
    Ctrl+G,Z(한글 '전체 화면') 또는 우하단 「⌨ 단축키 모드」 버튼 → JS 전체화면 + `navigator.keyboard.lock()`으로 페이지가 그 키를 먼저 받는다. 해제는 Esc 길게 또는 Ctrl+G,Z. (F11은 한글대로 개체 선택.)
    「자동」 체크 시 다음 방문부터 첫 클릭에서 자동 진입(전체화면은 사용자 동작 없이 못 연다). 사파리·아이패드는 브라우저 단축키가 Cmd라 충돌이 없어 버튼이 안 뜬다.
    근본 해결은 3단계 Tauri 데스크톱 앱(WebView2 `AreBrowserAcceleratorKeysEnabled=false`).
- 진단: 주소 뒤에 `?debug`를 붙이면 키 이벤트·에러가 화면 아래 로그창에 뜨고 「복사」로 가져올 수 있다.

## 처음 세팅 (폰에서도 됨, 5분)

1. github.com → New repository → 이름 `hwp-pad`, Public, README 없이 생성
2. 레포 → Add file → Create new file → 파일 이름 칸에 `.github/workflows/deploy.yml` (슬래시 그대로 입력)
   → 이 폴더의 `deploy.yml` 내용 붙여넣기 → Commit
3. Settings → Pages → Build and deployment → Source: **GitHub Actions**
   (워크플로의 configure-pages가 자동으로 켜 주기도 함. Actions 탭에 빨간 X가 뜨면 이 설정부터 확인)
4. Actions 탭에서 "Deploy hwp-pad to GitHub Pages"가 초록이 되면 주소 열기 (첫 빌드 5~8분)

## 빌드가 하는 일

- `pblsketch/openoffice` main을 받아 `npm ci --ignore-scripts` (Electron 다운로드 생략)
- `npm run studio -w @genoffice/hwp -- --force` → `scripts/build-studio.mjs`가 rhwp v0.8.7(핀 커밋 1a76570)을 sparse-clone,
  `rhwp-patches.mjs`의 패치 26개 적용, `studio-plugin/{hancom-keys,format-copy,agent-plugin,dialog-theme}.mjs`를 번들에 넣어
  `apps/hwp/public/studio`에 base `./` 상대경로로 출력
- 그 결과물에 `manifest.webmanifest`, 아이콘(180/192/512/maskable), iOS 메타(`apple-mobile-web-app-*`, `viewport-fit=cover`) 삽입
- 매주 월요일 새벽 자동 재빌드(openoffice 최신 반영). 수동: Actions → Run workflow → `openoffice_ref`에 태그/커밋 지정 가능

## 아직 안 되는 것 (2단계)

- **저장 경로**: (1차 해결 2026-10-29, `save-path.mjs`) PC 크롬·엣지는 원래 File System Access로 제자리 덮어쓰기(Ctrl+S)·대화상자 저장이 됐고,
  여기에 열기/저장 대화상자가 같은 '문서 폴더'를 기억하게(picker id) + 파일 메뉴 「저장 폴더 지정…」(showDirectoryPicker, IndexedDB 보관)으로 시작 폴더 지정.
  아이패드·사파리는 다운로드 대신 **공유 시트**가 열려 "파일에 저장"으로 Dropbox 폴더를 고름(취소하면 취소, 공유가 막히면 다운로드 폴백).
  남은 것: 아이패드에서 같은 파일 덮어쓰기(iOS는 파일 핸들이 없어 매번 공유 시트), 이음의 저장 전 바이트 보정
  (`src/main/save-fixes.ts`, `section-tails.ts`, `tab-widths.ts` — 순수 TS)을 브라우저 쪽으로 이식
- **오프라인**: 이음 빌드는 업스트림 서비스워커 플러그인을 뺐다(custom scheme 때문). PWA 오프라인은 SW를 다시 넣어야 함
- **폰트**: (해결 2026-10-29) 이음 빌드는 CDN 웹폰트를 끄고 OS 글꼴에만 기대서 아이패드(함초롬·맑은 고딕 없음)에서
  줄바꿈 등 에러 → 워크플로가 빌드 직전 `build-studio.mjs`를 sed로 뒤집어 CDN 웹폰트 켜고 `assets/fonts` 38종을 `site/fonts/`에 번들.
  배포본에는 무료 글꼴만(함초롬·나눔·Noto·Pretendard·D2Coding). 윈도우 글꼴(맑은 고딕·바탕 등)은 MS 소유라 공개 레포에 못 올림.
  함초롬은 아직 CDN → 오프라인 대비로 2단계에서 `fonts/`에 같이 번들
- **글꼴 추가(BYO 폰트)**: 학교 배포용. 메뉴 "글꼴 추가" → .ttf/.otf 파일 선택 → `FontFace` 즉시 등록 + IndexedDB 저장(재방문 시 자동 로드)
  → 파일의 family name으로 문서 글꼴과 자동 매칭, 안 맞으면 "이 글꼴을 '맑은 고딕'으로 쓰기" 지정. 글꼴은 기기 밖으로 안 나감(라이선스 문제 없음).
  아이패드는 Files 앱에서 선택(AirDrop/Dropbox). 이음 패치처럼 스튜디오 플러그인으로 얹음
- **단축키**: (해결) 아이패드 외장 키보드에서 Ctrl·Alt 계열 모두 동작 확인(2026-10-29). 줄바꿈·Backspace도 `ios-input.mjs`로 해결
- 3단계: Capacitor로 앱 포팅 (hwpApi를 네이티브 파일 접근으로 교체)

## 참고

- 이음오피스: https://github.com/pblsketch/openoffice (apps/hwp, vendor/rhwp-core, scripts/build-studio.mjs)
- rhwp: https://github.com/edwardkim/rhwp (완전판 데모: https://edwardkim.github.io/rhwp/)
