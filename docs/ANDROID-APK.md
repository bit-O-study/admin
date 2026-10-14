# BOadmin Android APK

- [APK 다운로드](https://github.com/bit-O-study/admin/raw/refs/heads/main/releases/apk/boadmin-1.0.0-debug.apk)
- 실행하면 `https://heltch-admin.vercel.app` 를 바로 연다(WebView). 화면은 웹 배포로 바뀌므로 화면 수정에는 APK 를 다시 만들 필요가 없다.
- SHA-256: `68bfe0398983aa8fc0b49da6c733de864c0cd165a1eb868f3bbad0a55c5507f5`
- 패키지 `kr.bito.boadmin`, Android 8 이상, target SDK 36, 개발용(debug) 서명 — 직접 설치용.

## 구성 (2026-10-14)

- 메모 앱(moa, MeetingMinutes/android)과 같은 WebView 껍데기. 로그인 쿠키 유지, 다른 사이트 링크는 외부 브라우저로 연다, HTTP·파일 접근·혼합 콘텐츠 불허.
- 앱이 상태바·내비게이션 바만큼 화면을 비우므로, 웹은 앱 안(UA 에 `; wv)`)에서 안전 영역 여백을 0 으로 둔다(`html[data-shell=app]`, globals.css `--safe-bottom`).
- 휴대폰 화면: 상단 막대 + 하단 탭(대시보드·회원·고객센터·메뉴), 메뉴는 전체 메뉴 시트(`features/admin/components/mobile-nav.tsx`).
- 아이콘: 남색→인디고→핑크 + 대시보드 타일 넷(노란 점 하나) 적응형 아이콘.

## 빌드

JDK 21, Android SDK 36. `android/local.properties` 에 `sdk.dir` 작성.

```powershell
cd android
$env:JAVA_HOME="C:\Users\NB0075\.jdks\jdk-21.0.12.1+1"; $env:ANDROID_HOME="C:\Users\NB0075\android-sdk"
./gradlew.bat assembleDebug --no-daemon
```

버전을 올릴 때는 `android/app/build.gradle` 의 versionCode·versionName 을 올리고, 같은 PC(같은 debug 서명)에서 빌드해야 기존 앱 위에 업데이트된다.

## 검증

- assembleDebug, apksigner verify, aapt(이름 BOadmin·버전 1.0.0·아이콘) 확인. 테스트 197개·next build 통과.
- 하단 탭·메뉴 시트는 WebView UA 로 휴대폰 크기 화면에서 확인(하단 탭 57px, 이중 여백 없음). 실제 휴대폰 설치는 미검증.
