# 서일 오피스 iOS 앱 (TestFlight) — 세팅 절차

2026-11-02 준비. 코드는 다 들어 있고, **Apple 쪽 계정·키 6개만 레포 Secrets에 넣으면** `iOS TestFlight` 워크플로가 돌아간다.
맥 없이 GitHub Actions macOS 러너가 빌드·서명·업로드까지 한다. 같은 틀을 블룸렌즈에도 복사해 쓴다.

## 구성
- `app/` — Capacitor 껍데기. 웹 번들은 Pages 빌드가 남긴 `site` 아티팩트를 그대로 `www/`로 쓴다(따로 빌드 안 함).
- `app/native/native.js` — 앱 안에서만 붙는 브릿지: 파일 앱에서 .hwp/.hwpx/.hml "서일 오피스로 열기" → 편집기로, **Ctrl+S는 원본 제자리 덮어쓰기**(rhwp 파일 핸들 인터페이스를 Filesystem 플러그인으로 구현).
- `patches/native-bridge.mjs` — 편집기에 `window.rhwpStudio.openBytes(bytes, name, handle)` 창구를 뚫는다.
- `app/scripts/prepare-ios.sh` — `cap add ios` 뒤 Info.plist(문서 형식·제자리 열기·파일 공유·아이패드 방향)와 AppDelegate(보안 범위 URL) 손질.
- `app/fastlane/Fastfile` — `match`(인증서·프로파일을 `HvsOdream/ios-certs` 비공개 레포에 암호화 보관, 없으면 생성) → `build_app` → `upload_to_testflight`.
- `.github/workflows/ios-testflight.yml` — 수동 실행(workflow_dispatch) 또는 Pages 배포 성공 뒤 자동. Secrets가 없으면 자동 실행은 조용히 건너뛴다.

앱 ID: `com.hvsodream.seoiloffice` · 앱 이름: 서일 오피스 · 최소 iOS: Capacitor 6 기본(13+) · 아이패드·아이폰 공용.

## 해야 할 일 (사람 — 약 20분 + Apple 승인 대기)

### 1. Apple Developer Program 가입 (개인)
1. https://developer.apple.com/programs/enroll/ → Apple ID(2단계 인증 켜져 있어야 함)로 개인 등록. 연 129,000원.
2. 승인 메일까지 보통 몇 시간~2일. 승인 후 https://developer.apple.com/account 에서 **Team ID**(10자리) 확인 → `APPLE_TEAM_ID`.

### 2. App Store Connect API 키
1. https://appstoreconnect.apple.com → 사용자 및 액세스 → **통합(Integrations)** → App Store Connect API → 키 생성. 이름 `github-actions`, 권한 **App Manager** (Admin도 됨).
2. 화면의 **Issuer ID** → `ASC_ISSUER_ID`, 키의 **Key ID** → `ASC_KEY_ID`.
3. **.p8 파일 다운로드**(한 번만 받을 수 있음). base64로 → `ASC_KEY_P8_BASE64`
   - Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("AuthKey_XXXX.p8"))`
   - 맥/리눅스: `base64 -i AuthKey_XXXX.p8 | tr -d '\n'`

### 3. 인증서 보관 레포 + 토큰 (match용)
1. GitHub에서 **비공개** 레포 `HvsOdream/ios-certs` 생성(빈 레포, README 없이).
2. https://github.com/settings/tokens?type=beta → Fine-grained token: 이름 `ios-certs-match`, 만료 1년, Repository access = `ios-certs`만, 권한 **Contents: Read and write**.
3. `MATCH_GIT_BASIC_AUTHORIZATION` = `base64("HvsOdream:<토큰>")`
   - PowerShell: `[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("HvsOdream:github_pat_..."))`
4. `MATCH_PASSWORD` = 아무 긴 비밀번호(인증서 암호화용, 잊지 말 것 — 블룸렌즈도 같은 값 재사용).

### 4. 레포 Secrets 등록
`https://github.com/HvsOdream/hwp-pad/settings/secrets/actions` → New repository secret 6개:

| 이름 | 값 |
|---|---|
| `ASC_KEY_ID` | 2-2 |
| `ASC_ISSUER_ID` | 2-2 |
| `ASC_KEY_P8_BASE64` | 2-3 |
| `APPLE_TEAM_ID` | 1-2 |
| `MATCH_PASSWORD` | 3-4 |
| `MATCH_GIT_BASIC_AUTHORIZATION` | 3-3 |

(값들을 채팅으로 주셔도 됩니다 — 제가 `gh secret set`으로 넣을 수 있습니다. 다만 .p8은 한 번만 받을 수 있으니 파일은 따로 보관하세요.)

### 4-1. App ID·앱 레코드 (수동, 1회)
`create_app_online`은 API 키 조합에서 파라미터 오류가 나서 웹에서 직접 만들었다(2026-11-02):
- developer.apple.com → Identifiers → + → App IDs → App → Description `Seoil Office`, Explicit `com.hvsodream.seoiloffice` → Register
- appstoreconnect.apple.com → 앱 → + → 신규 앱: iOS · 이름 `서일 오피스` · 한국어 · 번들 ID 선택 · SKU `seoil-office` · 전체 액세스 → 생성
블룸렌즈도 같은 두 단계를 먼저 한다.

### 5. 첫 실행
1. Actions → **iOS TestFlight** → Run workflow (version 0.1.0). 첫 빌드 15~25분(CocoaPods·인증서 생성 포함).
2. 성공하면 App Store Connect → 앱 → TestFlight 탭에 빌드가 "처리 중" → 10~30분 뒤 사용 가능.
3. **내부 테스터**: TestFlight 탭 → 내부 테스팅 그룹 만들기 → 본인 Apple ID 추가 → 아이패드에 TestFlight 앱 설치 → 초대 수락. 심사 없음, 즉시.
   (외부 테스터·학과 교수들은 "외부 테스팅" — 첫 빌드만 간단한 베타 심사 1~2일.)

### 6. 이후
- Pages 배포가 성공할 때마다 자동으로 새 TestFlight 빌드가 올라간다(빌드 번호 = Actions run 번호). 끄려면 워크플로의 `workflow_run` 블록 삭제.
- 블룸렌즈: `app/` 폴더·워크플로·Fastfile을 복사하고 `APP_ID`/`APP_NAME`/`sku`/`www` 출처만 바꾸면 된다. 인증서 레포·MATCH_PASSWORD·API 키는 공유.

## 첫 실행에서 걸릴 만한 것 (예상)
- `create_app_online`이 "SKU 중복"/"이름 사용 중"이면 Fastfile의 `sku`·`app_name` 변경.
- `match`가 인증서 생성 중 "Maximum number of certificates" 오류 → 개발자 포털에서 기존 Distribution 인증서 폐기 후 재실행(새 계정이면 안 생김).
- 파일 앱에서 "서일 오피스로 열기" 뒤 저장 시 권한 오류 → AppDelegate 보안 범위 접근 보강(`prepare-ios.sh`의 패치 확인).
- 외장 키보드 Ctrl 단축키는 앱(WKWebView)에선 브라우저 선점이 없어 **단축키 모드 없이** 전부 동작해야 한다. 안 되는 키가 있으면 `?debug` 대신 Safari 원격 콘솔이 필요하니 메모해서 알려줄 것.
