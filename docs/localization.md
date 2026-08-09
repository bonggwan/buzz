# i18n 문자열 추출 가이드

이 문서는 Buzz 프로젝트의 소스 코드에서 번역 가능한 문자열을 추출하는 방법과 규칙을 설명합니다.

## 개요

Buzz 프로젝트의 i18n(다국어) 지원을 위해 소스 코드에서 번역 가능한 UI 문자열을 추출하는 자동화 스크립트를 제공합니다. 추출된 문자열은 JSON 형식으로 저장되며, 번역 작업의 기초 자료로 사용됩니다.

- **추출 스크립트**: `extract-i18n-buzz.js`
- **출력 디렉토리**: `/Users/pro/work/multiai/i18n/buzz/`
- **파일 네이밍**: `<git_commit_hash>.json` (예: `5bf7867.json`)

## 추출 대상

추출 스크립트는 다음 디렉토리의 소스를 스캔합니다:

| 디렉토리 | 설명 |
|----------|------|
| `crates/` | Rust 소스 코드 (백엔드, CLI, 에이전트 등) |
| `web/` | 웹 클라이언트 (React/TypeScript) |
| `mobile/` | 모바일 앱 (Flutter/Dart) |
| `migrations/` | SQL 마이그레이션 파일 |
| `scripts/` | 빌드/배포 스크립트 (Python, Shell 등) |

## 키 네이밍 규칙

추출된 각 문자열의 키는 다음 형식으로 생성됩니다:

```
소스루트폴더.서브폴더.하위폴더.파일명.확장자.소스라인.(적용할_문자열을_최대한_그대로_언더바로_ 변환한_문자열)
```

### 키 구성 요소

1. **소스루트폴더**: 최상위 디렉토리명 (`crates`, `web`, `mobile`, `migrations`, `scripts`)
2. **서브폴더 경로**: 중첩된 폴더 구조를 점으로 구분하여 표현
3. **파일명**: 확장자를 제외한 파일명
4. **소스라인**: 문자열이 발견된 줄 번호
5. **문자열 키**: 공백과 특수문자를 언더바(`_`)로 변환한 실제 텍스트

### 키 예시

| 실제 문자열 | 생성된 키 |
|-------------|-----------|
| `"Save"` (crates/buzz-cli/src/main.rs:42) | `crates.buzz_cli.main.42.Save` |
| `"Welcome back!"` (web/src/components/Header.tsx:15) | `web.components.Header.15.Welcome_back` |
| `"연결 중..."` (mobile/lib/widgets/Status.dart:28) | `mobile.widgets.Status.28.연결_중` |
| `"Error: {0}"` (scripts/deploy.py:105) | `scripts.deploy.105.Error___0` |

## 추출 규칙

### 포함 기준

- **한글, 일본어, 중국어**: 공백 포함 여부와 관계없이 항상 포함
- **영어**: 2단어 이상의 구(phrase)이거나 UI 키워드 목록에 등록된 단일 단어만 포함
- **문자열 위치**: 큰따옴표, 작은따옴표, 템플릿 리터럴(백틱), JSX 텍스트, JSX 속성 값(aria-label, placeholder 등)

### 제외 기준

- **주석**: `//`, `/* */`, `--` 로 시작하는 라인
- **이미 i18n 처리된 코드**: `t()`, `useTranslation`, `i18n.t`, `FormattedMessage`, `<Trans>` 등 i18n 함수/컴포넌트가 사용된 라인
- **import/export 구문**: 모듈 로딩 관련 코드
- **Tailwind CSS 클래스**: `flex`, `grid`, `text-lg`, `bg-blue-500` 등
- **기술 패턴**: URL, 이메일, 해시값, UUID, SVG path 데이터
- **설정 파일**: `*config.*`, `*.spec.*`, `*.test.*` 등
- **변경되지 않는 데이터**: 코드 라인, 변수명, 상수 등 UI 텍스트가 아닌 내용

## UI 키워드 목록

단일 영어 단어는 다음 목록에 포함된 경우에만 추출됩니다. 주요 UI 키워드 예시:

**액션**: `Save`, `Cancel`, `Submit`, `Create`, `Update`, `Delete`, `Edit`, `Send`, `Remove`, `Add`

**내비게이션**: `Next`, `Previous`, `Back`, `Continue`, `Finish`, `Close`, `Open`, `New`

**표시**: `Show`, `Hide`, `View`, `Expand`, `Collapse`, `Search`, `Filter`, `Sort`

**상태**: `Online`, `Offline`, `Active`, `Inactive`, `Pending`, `Enabled`, `Disabled`

**에러/알림**: `Error`, `Warning`, `Success`, `Info`, `Notice`, `Alert`, `Failed`

**계정/설정**: `Profile`, `Settings`, `Account`, `Privacy`, `Security`, `Notifications`

**채널/메시지**: `Channels`, `Messages`, `Threads`, `Chat`, `Post`, `Comment`, `Reply`

**데이터**: `Users`, `Members`, `Contacts`, `Files`, `Media`, `Favorites`, `Bookmarks`

전체 키워드 목록은 스크립트 내 `UI_WORDS` 상수를 참조하세요.

## 출력 파일 형식

```json
[
  {
    "key": "crates.buzz_cli.main.42.Save",
    "value": "Save"
  },
  {
    "key": "web.components.Header.15.Welcome_back",
    "value": "Welcome back!"
  }
]
```

## 추출 결과 통계

스크립트 실행 완료 후 다음과 같은 통계가 출력됩니다:

```
=== ✅ 추출 완료 ===
파일: /Users/pro/work/multiai/i18n/buzz/5bf7867.json
총 문자열: 3439개
🇰🇷 한글: XXX개
🇯🇵 일본어: XXX개
🇨🇳 중국어: XXX개
🇺🇸 영어: XXX개
```

## 스크립트 실행 방법

```bash
# Buzz 프로젝트 루트에서 실행
cd /Users/pro/work/multiai/buzz
node extract-i18n-buzz.js
```

### 실행 전제 조건

- Node.js 18 이상
- `/Users/pro/work/multiai/i18n/buzz/` 디렉토리 자동 생성됨

## 주의사항

1. **중복 제거**: 동일한 키는 하나만 유지되며, 중복된 문자열도 다른 위치에서 발견되면 별도 키로 등록됩니다.
2. **키 충돌**: 서로 다른 위치에서 동일한 텍스트가 발견되면 첫 번째로 발견된 파일의 키가 사용됩니다.
3. **변수 처리**: `{variable}` 형태의 변수가 포함된 템플릿 리터럴은 추출에서 제외됩니다 (i18n 처리 방식과 충돌 방지).
4. **특수문자**: 공백과 특수문자는 모두 언더바(`_`)로 변환되어 키로 사용되므로, 번역 시 가독성을 위해 원본 문자열을 참조하세요.

## 체크리스트

- [ ] 추출 스크립트 실행
- [ ] 출력 파일(`<hash>.json`) 생성 확인
- [ ] 추출된 문자열 수 및 언어별 통계 확인
- [ ] 중복/오탐 여부 샘플 검토
- [ ] 번역 파일에 통합 (코드스 참조: `/Users/pro/work/multiai/i18n/codex/`)

## 참고

- 코드스 샘플 파일: `/Users/pro/work/multiai/i18n/codex/94937de.json`
- 추출 스크립트: `/Users/pro/work/multiai/buzz/extract-i18n-buzz.js`
