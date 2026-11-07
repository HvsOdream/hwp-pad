# 서일 오피스 — 포함 구성요소와 라이선스 (2026-11-07 조사)

제품(웹 PWA·윈도우 설치판·iOS 앱)에 들어가는 남의 코드·글꼴·데이터와, 그 라이선스가 우리에게
요구하는 것, 지금 충족 여부. 판매 전 「미충족」을 모두 지워야 한다.

조사 기준: hwp-pad main, 이음오피스 `pblsketch/openoffice` 93a1395(2026-11-07), rhwp `edwardkim/rhwp` devel e4ffabe,
배포 번들 site-build c7746a4(2026-11-05).

## 1. 결론 요약

| 구성요소 | 라이선스 | 상업 판매 | 우리 의무 | 상태 |
|---|---|---|---|---|
| rhwp 엔진(wasm)·rhwp-studio UI | MIT (Edward Kim) | 가능 | 저작권·MIT 고지 포함 | **충족** (번들에 `LICENSE-rhwp.txt`, `THIRD-PARTY-LICENSES-rhwp.md` 있음) |
| rhwp Rust 크레이트·JS 의존성 | MIT/Apache/BSD 등 (THIRD_PARTY_LICENSES.md 548줄) | 가능 | 고지 포함 | **충족** (위 파일) |
| 이음오피스 HWP 앱(스튜디오 빌드 스크립트·이음 패치·vendor rhwp-core) | Apache-2.0 (GenOffice/Mainfunc 원저작, IeumOffice 수정) | 가능 | ① Apache LICENSE 전문 ② **NOTICE 파일 전문** ③ 우리가 바꾼 파일에 변경 표시 ④ 「IeumOffice/GenOffice」 이름·로고 사용 금지 | **미충족** — 번들에 Apache LICENSE·NOTICE 없음. 우리 `patches/*.mjs`가 이음 소스를 수정하므로 변경 고지 필요 |
| 한컴 HWP 포맷 공개 문서 | 한컴 조건 | 가능 | 고지문 「본 제품은 한글과컴퓨터의 한글 문서 파일(.hwp) 공개 문서를 참고하여 개발하였습니다.」 포함 | **미충족** — 이음 NOTICE에만 있고 우리 앱에 없음 |
| 한자 사전(libhangul `hanja.txt`) | BSD-3 (Choe Hwanjin) | 가능 | 고지 포함 | **충족** (`hanja/LICENSE-libhangul-hanja.txt` 번들) |
| 번들 글꼴 38종(나눔·Noto·Pretendard·고운·D2·카페24·해피니스·RHWP Public Batang·Latin Modern Math 등) | SIL OFL 1.1 (LMM은 GUST/LPPL) | 가능 | 각 글꼴의 저작권 고지·라이선스 전문 동봉, 글꼴 단독 판매 금지, Reserved Font Name 준수 | **부분** — `site/fonts/`에 woff2와 FONTS.md·OFL txt는 복사하지만 rhwp가 "제품 패키지에 함께 배포"하라는 `assets/fonts/licenses/`(README·font-notices.json·PDF)는 안 복사함 |
| **런타임 CDN 웹폰트**(jsdelivr, 문서가 요구하는 글꼴 이름에 따라 내려받음) | 혼재 — 나눔·Noto·KoPub·눈누 무료체는 OK. **Segoe UI(MS), Helvetica Now·Helvetica Neue(Monotype), Futura BT, Century Schoolbook BT는 상용 글꼴**을 제3자가 npm에 올린 것 | **위험** | 우리가 배포하지는 않지만 우리 제품이 사용자 기기에 내려받아 쓰게 함 | **미충족** — 우리 빌드가 이음 기본값(외부 웹폰트 끔)을 `false`로 바꿔 켰음 |
| Electron 33 + Chromium/Node | MIT + 각종 | 가능 | electron-builder가 `LICENSE.electron.txt`·`LICENSES.chromium.html` 자동 포함 | **충족** |
| Capacitor(iOS) | MIT | 가능 | 고지 | 확인 필요(앱 설정 화면에 고지 없음) |
| Cloudflare Worker AI 프록시 → Anthropic API | Anthropic 상용 약관 | 재판매형 서비스는 약관·사용정책 준수 조건 | 관공서 데이터가 해외 API로 가는 문제는 라이선스가 아니라 **조달·보안** 문제 | 별도 |
| 우리 코드(`web/seoil-*.js`, `desktop/`, `app/`, `patches/`, `proxy/`) | **라이선스 파일 없음** | — | 레포가 공개라 "all rights reserved"인 채 남의 Apache/MIT 코드를 섞어 배포 중 | **결정 필요** |
| 「서일」 아이콘(나눔고딕 볼드로 생성) | OFL | 가능 | — | 충족 |
| 기본 양식(`web/forms/`) | 학교 문서 | 학교 내부용 | 외부 판매판에는 고객 기관 양식으로 교체 | 제품화 시 |

## 2. 꼭 해야 할 것 (순서대로)

1. **번들에 고지 파일 추가** — 배포 사이트 루트에 `LICENSE-ieumoffice.txt`(Apache-2.0 전문), `NOTICE-ieumoffice.txt`(이음 NOTICE 원문 + 한컴 고지문), 그리고 `assets/fonts/licenses/` 전체를 `fonts/licenses/`로 복사. deploy.yml 한 단계면 된다.
2. **앱 안에 「오픈소스 라이선스」 화면** — 설정 → 정보에 위 파일들을 보여주는 링크. 관공서 보안 점검과 GS인증에서 묻는 항목이다.
3. **외부 웹폰트 정책** — 제품판은 `__RHWP_DISABLE_EXTERNAL_WEBFONTS__`를 다시 `true`로 하고, 필요한 무료 글꼴(KoPub·눈누 무료체 등)만 라이선스 확인 후 **우리가 직접 번들**한다. 상용 글꼴은 사용자 기기에 설치된 것만 쓴다(한글과 같은 동작). 아이패드 글꼴 부족 문제는 OFL 글꼴 번들로 푼다.
4. **변경 표시** — `patches/*.mjs`가 이음·rhwp 소스를 어떻게 바꾸는지 `patches/README.md`에 한 줄씩(Apache 4(b)).
5. **우리 코드 라이선스 결정** — 아래 3절.
6. **상표** — 「한글」「HWP」「HWPX」는 한컴 등록상표. 제품명·마케팅에 쓰지 않는다(파일 형식을 가리킬 때만). 레포명 `hwp-pad`, 옛 이름 「HWP Pad」는 제품명으로 쓰지 않는다. 「이음오피스」「GenOffice」 이름·로고도 쓰지 않는다(Apache §6).

## 3. 우리 코드 라이선스 — 선택지

Apache(이음)와 MIT(rhwp)는 우리 코드를 비공개·상용으로 두는 것을 허용한다. 레포가 공개라는 것과
라이선스는 별개다.

- **A. 비공개(All rights reserved)** + 레포를 private으로 전환. 판매용이면 가장 단순. 공개 저장소에 올릴
  것(엔진 패치·재현 양식 등 upstream에 기여할 부분)만 별도 공개 레포로 분리.
- **B. 우리 코드도 Apache-2.0** 으로 공개. 학교 사업(혁신지원사업 성과물)·학술 기여에 유리하고 upstream과
  같은 조건이라 합치기 쉽다. 대신 경쟁자가 그대로 쓸 수 있다 — 관공서 납품의 경쟁력은 코드가 아니라
  운영·인증·지원이라고 보면 괜찮다.
- **C. 듀얼** — 코어는 Apache-2.0 공개, 기관용 기능(계정·양식 배포·관리자 콘솔)은 비공개.

## 4. 참고 — rhwp가 글꼴에 요구하는 것 (assets/fonts/licenses/README.md 요지)

- canonical 글꼴은 전부 OFL 1.1(Latin Modern Math만 GUST+LPPL). 글꼴 단독 판매 금지.
- `font-notices.json`이 파일별 SHA-256·원본 저작권·라이선스 전문을 연결한다. 패키지에 동봉.
- 한컴·한양·MS 상용 글꼴 이름을 내부 family 이름으로 쓰지 않는다. 문서가 요구하면 대체 규칙으로 공급.
- 카페24·해피니스 산스는 공식 ZIP PDF를 그대로 동봉.
