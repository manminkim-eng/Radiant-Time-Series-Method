# RTS-MANMIN 건축물 부하계산서 Ver 3.0 — PWA 패키지

> ASHRAE 2009 RTS법 기반 건축물 냉난방 부하계산 전문 도구  
> by **ENGINEER KIM MANMIN** · 만민건축사사무소 · Iksan, Jeollabuk-do

---

## 📦 파일 구성

```
pwa-rts-manmin/
├── index.html          ← 메인 계산서 (PWA 태그 포함)
├── shortcut.html       ← 바로가기 & 설치 안내 페이지
├── manifest.json       ← PWA 매니페스트
├── sw.js               ← Service Worker (오프라인 캐싱)
├── README.md           ← 이 파일
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png   ← Android 홈 화면 아이콘
    ├── icon-384x384.png
    ├── icon-512x512.png   ← Splash Screen 아이콘
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    └── apple-touch-icon.png  ← iOS Safari 홈 화면 아이콘
```

---

## 🚀 GitHub Pages 배포 방법

1. `manminkim-eng.github.io` 저장소에 이 파일들을 **루트 또는 서브폴더**에 업로드
2. GitHub Settings → Pages → Source: `main` 브랜치 선택
3. HTTPS로 자동 서빙 → PWA 완전 활성화

### 서브폴더 배포 시 (`/rts/`)

`manifest.json`의 `start_url`과 `scope`를 수정:
```json
"start_url": "/rts/index.html",
"scope": "/rts/"
```

`sw.js`의 `STATIC_ASSETS` 경로도 `/rts/` 프리픽스 추가.

---

## 📱 PWA 설치 방법

| 플랫폼 | 방법 |
|--------|------|
| **Android Chrome** | 주소창 오른쪽 ⋮ → **앱 설치** 또는 하단 배너 탭 |
| **iPhone Safari** | 하단 공유(□↑) → **홈 화면에 추가** |
| **PC Chrome** | 주소창 우측 설치 아이콘 클릭 |
| **PC Edge** | ··· → 앱 → 이 사이트를 앱으로 설치 |

---

## ⚡ PWA 기능

- ✅ **오프라인 지원** — Service Worker 캐시로 인터넷 없이 사용
- ✅ **홈 화면 설치** — 네이티브 앱처럼 독립 실행
- ✅ **앱 바로가기** — 각 탭으로 직접 진입
- ✅ **자동 업데이트** — 새 버전 배포 시 자동 캐시 갱신
- ✅ **Landscape 최적화** — 가로 모드 기본 설정
- ✅ **테마 컬러** — 브라우저 UI에 MANMIN 네이비/시안 적용

---

## 🔧 커스터마이징

### 프로젝트명 기본값 변경
`index.html` 하단 `init()` 함수:
```javascript
if(pn && !pn.value) pn.value = '새 프로젝트명';
if(pd && !pd.value) pd.value = '설계자명';
```

### 캐시 버전 업데이트
`sw.js` 상단:
```javascript
const CACHE_NAME = 'rts-manmin-v3.0.1'; // 버전 번호 증가
```

---

© 2025 만민건축사사무소 · ENGINEER KIM MANMIN
