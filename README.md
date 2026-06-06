# ⛳ 골프 최저가 부킹 앱

> 골프몬 · 골팡 · 조인부킹 실시간 연동 | 송파 기준 주말/공휴일 최저가 검색

---

## 📌 주요 기능

| 기능 | 설명 |
|------|------|
| 🔴 실시간 조회 | 30초 자동 새로고침, 수동 새로고침 |
| 💰 최저가 정렬 | 가격 · 거리 · 평점 · 잔여타임 정렬 |
| 📍 지역 필터 | 춘천 · 포천 · 용인 · 안성 · 충주 · 여주 · 이천 |
| 📅 날짜 선택 | 향후 30일 주말/공휴일 자동 추출 |
| 🔗 플랫폼 연동 | 골프몬 / 골팡 / 조인부킹 동시 비교 |
| 📏 거리 필터 | 송파 기준 최대 거리 슬라이더 (30~100km) |
| 🏌️ 티타임 그리드 | 골프장별 가용 티타임 · 잔여 · 가격 상세 |

---

## 🛠️ 기술 스택

- **Frontend**: React 18 (JSX, Hooks)
- **스타일**: Inline CSS (다크 그린 테마)
- **상태관리**: useState, useEffect, useCallback
- **데이터**: 실제 API 연동 구조 (현재 Mock 데이터)

---

## 🔌 실제 API 연동 가이드

### 골프몬 API
```js
// https://golfmon.co.kr 파트너 API 연동
const res = await fetch("https://api.golfmon.co.kr/v1/teetimes", {
  headers: { Authorization: `Bearer ${GOLFMON_API_KEY}` },
  params: { date, region, distance }
});
```

### 골팡 API
```js
// https://golfang.com 크롤링 or 파트너 API
const res = await fetch("https://api.golfang.com/courses/search", {
  params: { playDate: date, areaCode: region }
});
```

### 조인부킹
```js
// https://joinbooking.com 파트너 연동
const res = await fetch("https://api.joinbooking.com/teetimes", {
  params: { date, lat: 37.5145, lng: 127.1059, radius: maxDistance }
});
```

---

## 🚀 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/your-id/golf-booking-finder.git
cd golf-booking-finder

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

---

## 📁 프로젝트 구조

```
golf-booking-finder/
├── src/
│   ├── App.jsx               # 메인 앱 컴포넌트
│   ├── data/
│   │   └── courses.js        # 골프장 데이터
│   ├── hooks/
│   │   └── useGolfSearch.js  # 검색 커스텀 훅
│   └── api/
│       ├── golfmon.js        # 골프몬 API 클라이언트
│       ├── golfang.js        # 골팡 API 클라이언트
│       └── joinbooking.js    # 조인부킹 API 클라이언트
├── public/
├── README.md
└── package.json
```

---

## 🗺️ 대상 골프장 지역

- **춘천** (72~78km): 천마산CC, 레이크사이드CC
- **포천** (58~62km): 라비돌리조트, 아도니스CC
- **용인** (35~38km): 힐크레스트CC, 성남CC
- **안성** (65km): 베네스트CC
- **충주** (95km): 스카이힐CC
- **여주** (68~71km): 스타힐스, 골프랜드
- **이천** (52~55km): 블랙스톤, 미래에셋CC

---

## 📊 요금 표시 기준

- 모든 금액 **한국 원화(₩)** 표시
- 그린피 + 카트 + 캐디 여부 명시
- 최저가 기준 정렬 (부가세 포함)

---

## 📌 향후 개발 계획

- [ ] 카카오맵 연동 (경로 안내)
- [ ] 카카오톡 알림 (원하는 타임 오픈 시)
- [ ] Google Calendar 예약 자동 등록
- [ ] 가격 추이 차트 (날짜별 히스토리)
- [ ] 동반자 모집 기능

---

## 📝 라이선스

MIT License © 2026

---

> Made with ⛳ for Korean golfers near Songpa, Seoul

---

## 🔑 API 키 GitHub Secrets 등록 방법

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret 이름 | 값 |
|---|---|
| `VITE_GOLFMON_API_KEY` | 골프몬 파트너 API 키 |
| `VITE_GOLFANG_API_KEY` | 골팡 파트너 API 키 |
| `VITE_JOINBOOKING_API_KEY` | 조인부킹 API 키 |

등록 후 `main` 브랜치에 push하면 GitHub Actions가 자동 빌드·배포합니다.

---

## 🌐 배포 URL

```
https://[your-github-id].github.io/golf-booking-finder/
```

---

## 📱 API 발급 연락처

| 플랫폼 | 파트너 신청 | 예상 소요 |
|--------|------------|----------|
| 골프몬 | partner.golfmon.co.kr | 영업일 3~5일 |
| 골팡 | partner@golfang.com | 영업일 3~7일 |
| 조인부킹 | joinbooking.com/developers | 영업일 2~3일 |

> API 발급 전에는 Mock 데이터로 동작합니다 (.env의 MOCK 설정)
