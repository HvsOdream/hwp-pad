# engine-patches/ — rhwp 엔진(Rust)에 가하는 우리 패치

`.github/workflows/engine.yml`이 이음오피스의 `tools/build-rhwp-core.mjs`로 rhwp wasm을 다시 빌드할 때,
여기 있는 `*.patch`(git format-patch 형식)를 이음 패치(`vendor/rhwp-core/patches/0001~`) **뒤에** 적용한다.
파일명 순서대로 적용되므로 `9001-…`, `9002-…`처럼 번호를 매긴다(이음 번호와 겹치지 않게 9000대).

규칙
- 이음 패치가 건드린 줄은 피한다(충돌하면 engine.yml 이 실패한다).
- 패치가 넣는 주석에 `[hwp-pad]`를 남긴다(적용 확인용).
- 각 패치 머리(commit message)에 재현 파일(`tests/fixtures/`)·한글 기준·수정 전후를 적는다.
- upstream(edwardkim/rhwp)에 이슈/PR 번호가 생기면 함께 적고, upstream 에 들어가면 패치를 지운다.
- 이음이 vendor 를 올리면(`rhwp.commit` 변경) engine.yml 을 다시 돌려 패치가 아직 붙는지 본다.

빌드 결과는 GitHub Release `engine`의 자산이고, deploy.yml 이 바탕이 같을 때만 그것으로 vendor 를 덮어쓴다.
패치가 하나도 없으면 이음 vendor 와 같은 소스의 재빌드다.
