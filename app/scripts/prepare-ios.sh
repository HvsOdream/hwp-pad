#!/usr/bin/env bash
# 서일 오피스 iOS 프로젝트 준비 (macOS 러너에서 실행). www/ 가 채워진 뒤 호출한다.
#  1) npx cap add ios (처음) / cap sync
#  2) Info.plist: 한글 문서 형식 등록(.hwp/.hwpx/.hml), 제자리 열기, 파일 공유, 아이패드 모든 방향
#  3) AppDelegate: 보안 범위 URL 접근 시작(파일 앱 "제자리 열기"로 받은 URL을 Filesystem 플러그인이 읽을 수 있게)
set -euo pipefail
cd "$(dirname "$0")/.."
test -f www/index.html

if [ ! -d ios ]; then npx cap add ios; fi
npx cap sync ios

PLIST=ios/App/App/Info.plist
PB="/usr/libexec/PlistBuddy -c"

set_plist() { $PB "Delete :$1" "$PLIST" 2>/dev/null || true; $PB "Add :$1 $2 $3" "$PLIST"; }
set_plist CFBundleDisplayName string "서일 오피스"
set_plist LSSupportsOpeningDocumentsInPlace bool true
set_plist UIFileSharingEnabled bool true
set_plist UIRequiresFullScreen bool false
set_plist ITSAppUsesNonExemptEncryption bool false

# 문서 형식 (가져온 UTI 선언 + 문서 타입)
$PB "Delete :UTImportedTypeDeclarations" "$PLIST" 2>/dev/null || true
$PB "Add :UTImportedTypeDeclarations array" "$PLIST"
i=0
add_uti() { # id, description, extensions(csv), mime, conformsTo
  $PB "Add :UTImportedTypeDeclarations:$i dict" "$PLIST"
  $PB "Add :UTImportedTypeDeclarations:$i:UTTypeIdentifier string $1" "$PLIST"
  $PB "Add :UTImportedTypeDeclarations:$i:UTTypeDescription string $2" "$PLIST"
  $PB "Add :UTImportedTypeDeclarations:$i:UTTypeConformsTo array" "$PLIST"
  $PB "Add :UTImportedTypeDeclarations:$i:UTTypeConformsTo:0 string $5" "$PLIST"
  $PB "Add :UTImportedTypeDeclarations:$i:UTTypeTagSpecification dict" "$PLIST"
  $PB "Add :UTImportedTypeDeclarations:$i:UTTypeTagSpecification:public.filename-extension array" "$PLIST"
  j=0; IFS=',' read -ra EXTS <<< "$3"; for e in "${EXTS[@]}"; do $PB "Add :UTImportedTypeDeclarations:$i:UTTypeTagSpecification:public.filename-extension:$j string $e" "$PLIST"; j=$((j+1)); done
  $PB "Add :UTImportedTypeDeclarations:$i:UTTypeTagSpecification:public.mime-type array" "$PLIST"
  $PB "Add :UTImportedTypeDeclarations:$i:UTTypeTagSpecification:public.mime-type:0 string $4" "$PLIST"
  i=$((i+1))
}
add_uti com.hancom.hwp "한글 문서 (HWP)" hwp application/x-hwp public.data
add_uti com.hancom.hwpx "한글 문서 (HWPX)" hwpx application/hwp+zip public.data
add_uti com.hancom.hml "한글 문서 (HML)" hml application/x-hwpml public.xml

$PB "Delete :CFBundleDocumentTypes" "$PLIST" 2>/dev/null || true
$PB "Add :CFBundleDocumentTypes array" "$PLIST"
$PB "Add :CFBundleDocumentTypes:0 dict" "$PLIST"
$PB "Add :CFBundleDocumentTypes:0:CFBundleTypeName string 한글 문서" "$PLIST"
$PB "Add :CFBundleDocumentTypes:0:CFBundleTypeRole string Editor" "$PLIST"
$PB "Add :CFBundleDocumentTypes:0:LSHandlerRank string Alternate" "$PLIST"
$PB "Add :CFBundleDocumentTypes:0:LSItemContentTypes array" "$PLIST"
k=0; for u in com.hancom.hwp com.hancom.hwpx com.hancom.hml; do $PB "Add :CFBundleDocumentTypes:0:LSItemContentTypes:$k string $u" "$PLIST"; k=$((k+1)); done

# 아이패드: 모든 방향
$PB "Delete :UISupportedInterfaceOrientations~ipad" "$PLIST" 2>/dev/null || true
$PB "Add :UISupportedInterfaceOrientations~ipad array" "$PLIST"
o=0; for v in UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight; do $PB "Add :UISupportedInterfaceOrientations~ipad:$o string $v" "$PLIST"; o=$((o+1)); done

# AppDelegate: 받은 파일 URL의 보안 범위 접근을 열어 둔다 (제자리 열기/덮어쓰기용). 한 번만.
AD=ios/App/App/AppDelegate.swift
if ! grep -q "startAccessingSecurityScopedResource" "$AD"; then
  python3 - "$AD" <<'PY'
import re,sys
p=sys.argv[1]; s=open(p).read()
s=s.replace("func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {",
"func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {\n        // [seoil] 파일 앱에서 넘어온 문서를 앱이 계속 읽고 쓸 수 있게 (제자리 열기)\n        _ = url.startAccessingSecurityScopedResource()",1)
open(p,'w').write(s)
PY
fi
grep -n "startAccessingSecurityScopedResource" "$AD"
plutil -lint "$PLIST"
echo "[prepare-ios] done"
