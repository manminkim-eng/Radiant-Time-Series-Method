# RTS-MANMIN 건축물 부하계산서 · 열관류율 검토 시스템

**ENGINEER KIM MANMIN** | RTS-MANMIN Ver 3.0

---

## 🌐 Live Demo

| 앱 | URL |
|---|---|
| 🌡️ **RTS 부하계산서** | https://manminkim-eng.github.io/rts-manmin/RTS_부하계산서.html |
| 🧱 **열관류율 검토 WAP** | https://manminkim-eng.github.io/rts-manmin/ |

---

## 📱 PWA 설치 (앱으로 사용)

### PC (Chrome / Edge)
주소창 우측 **⊕ 설치** 아이콘 클릭 → 앱 설치

### 모바일 (Android Chrome)
브라우저 메뉴 → **"홈 화면에 추가"**

### iOS (Safari)
공유 버튼 → **"홈 화면에 추가"**

---

## 📂 파일 구성

```
/
├── index.html              ← 열관류율 종합 검토 시스템 (MANMIN-Ver3.0)
├── RTS_부하계산서.html      ← RTS 건축물 부하계산서 (ASHRAE 2009 RTS법)
├── .nojekyll               ← GitHub Pages 설정
└── icons/                  ← PWA 아이콘
    ├── icon-192x192.png
    ├── icon-512x512.png
    ├── apple-touch-icon.png
    └── favicon-32x32.png
```

---

## 🔧 기능 요약

### 열관류율 검토 WAP (`index.html`)
- 건축물 에너지절약설계기준 (국토교통부고시 제2025-738호) 기준값 자동 적용
- 부위별 재료 레이어 입력 → U = 1/ΣR 자동 계산
- 법적 기준 적합 판정 · A4 산출서 인쇄
- **📤 RTS 전송 버튼** → 열관류율 + 재료 데이터를 RTS 부하계산서로 전달

### RTS 부하계산서 (`RTS_부하계산서.html`)
- ASHRAE Fundamentals 2009 · Radiant Time Series Method
- 실별 외피(유리창·외벽·지붕) + 내부발열(인체·조명·기기) 상세 입력
- 24시간 냉방부하 · Peak 시각 · 난방부하 자동 계산
- 💾 프로젝트 저장(.rts) / 📂 불러오기 — 작업 이어하기 지원
- A4 전체 출력 (표지·목차·SHEET 0~8)

---

## 📐 계산 기준

- **RTS Method** : ASHRAE Fundamentals 2009, Ch.18
- **CTS/RTS 계수** : Zone 8 (중량 구조체) 기준
- **Sol-Air 온도** : ASHRAE 2009 Fourier 계산식
- **인체 발열** : Code A~I (SH/LH W/p, 26℃ 기준)
- **법적 기준** : 건축물 에너지절약설계기준 제2025-738호

---

© 2026 ENGINEER KIM MANMIN · All rights reserved
