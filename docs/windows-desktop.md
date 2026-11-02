# 서일 오피스 — 윈도우 설치판

테스트는 아이패드 앱보다 윈도우 설치판이 편하다(2026-11-02).

- **받기**: https://github.com/HvsOdream/hwp-pad/releases 에서 가장 최근 `SeoilOffice-Setup-*.exe`
- **설치**: 실행 → 서명 안 된 파일이라 SmartScreen 경고가 나오면 「추가 정보 → 실행」. 바탕화면·시작 메뉴에 「서일 오피스」.
- **업데이트**: 설치판은 껍데기라, 편집기·AI 패널은 실행할 때마다 배포된 웹 최신판을 불러온다. 껍데기(`desktop/`)를 고칠 때만 새 설치 파일이 필요.
- **좋은 점**: 브라우저가 Ctrl+N/T/W를 가로채지 않아 한글 단축키가 단축키 모드 없이 동작. 탐색기에서 .hwp/.hwpx 「연결 프로그램 → 서일 오피스」로 열면 Ctrl+S가 그 파일에 제자리 저장.
- **AI 키**: 패널 제목 「AI 작성 도우미」를 빠르게 5번 누르면 개발자 모드 → 설정에서 키 넣기·빼기·시험. 테스터 PC마다 한 번.
- **개발용 키**: F12 개발자 도구, Ctrl+Shift+F5 캐시 무시 새로고침.

구성: `desktop/main.js`(창·파일 열기·제자리 쓰기 IPC), `desktop/preload.js`(웹에 `window.seoilDesktop`만 노출), `.github/workflows/windows-desktop.yml`(windows 러너에서 NSIS 설치 파일 → Releases).
