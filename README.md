# StudyPulse

**만능 타이머** — 시험 제한 시간 연습(NCS 스타일), 뽀모도로형 공부 타이머, 통계·백업을 한 번에 다루는 웹 앱입니다.  
백엔드 없이 **브라우저만**으로 동작하며, 학습 기록은 **IndexedDB**에 저장됩니다.

---

## 주요 기능

### NCS 모의 (`features/ncs`)

- 영역별 **프리셋**(의사소통·수리·문제해결·자원관리) 또는 **커스텀**(문항 수·제한 시간)
- **카운트다운** 타이머, 남은 문항당 여유 시간 표시
- 마지막 1분 **경고**(색상·소리·진동, 설정에서 on/off)
- 문항 **체크리스트** + **순서대로 완료** 버튼
- 체크할 때마다 **문항별 풀이 소요 시간**(직전 기록 시점 기준) 계산·표시
- **일시정지 / 재개** — 타이머만 멈추고, 일시정지 구간은 문항 시간·남은 시간에 반영되지 않음
- **종료 후 기록** 또는 시간 종료 시 IndexedDB에 세션 저장 (`problemDurationsSec` 포함)

### 공부 타이머 (`features/study`)

- 뽀모도로·심화·단기 집중 프리셋 및 커스텀
- 집중 ↔ 휴식 **자동 반복**, 과목·태그 입력
- **일시정지 / 재개** — 휴식 중 멈춘 시간은 해당 구간 기록에서 제외(시작 시각 보정)
- **종료 및 기록** 시 현재 구간만 세션으로 저장

### 통계 (`features/stats`)

- 오늘/주간 집중 시간, 스트릭, 주간 라인 차트, 과목 파이, NCS 영역별 평균 속도, 요일×시간 히트맵
- **JSON 백업 보내기 / 가져오기**
- 알림음·진동 설정(Zustand `persist` → localStorage)

---

## 기술 스택

| 구분 | 사용 |
|------|------|
| UI | React 19, TypeScript, Vite 8 |
| 스타일 | Tailwind CSS v4 (`@tailwindcss/vite`) |
| 상태 | Zustand (탭 전환, 설정 persist) |
| 차트 | Recharts |
| 효과 | react-confetti |
| 로컬 DB | [idb](https://github.com/jakearchibald/idb) (IndexedDB 래퍼) |

---

## 프로젝트 구조 (코드 맵)

```
src/
├── app/
│   └── App.tsx              # 탭에 따라 NCS / 공부 / 통계 화면 전환
├── components/
│   ├── layout/
│   │   └── AppShell.tsx     # 헤더, 탭 네비게이션, 레이아웃
│   └── ui/
│       ├── Button.tsx       # primary / ghost / danger
│       └── Card.tsx         # 공통 카드 컨테이너
├── features/
│   ├── ncs/
│   │   ├── NcsModePage.tsx  # NCS 세션 상태·타이머·저장 로직
│   │   ├── ncsPresets.ts    # 영역별 기본 프리셋
│   │   └── components/
│   │       ├── NcsTimerHud.tsx
│   │       └── ProblemChecklist.tsx
│   ├── study/
│   │   ├── StudyModePage.tsx
│   │   └── studyPresets.ts
│   └── stats/
│       ├── StatsPage.tsx
│       └── components/
│           ├── BackupControls.tsx
│           └── HourHeatmap.tsx
├── stores/
│   ├── appTabStore.ts       # 현재 탭: ncs | study | stats
│   └── settingsStore.ts     # 소리·진동 (persist + partialize)
├── lib/
│   ├── storage/
│   │   └── db.ts            # IndexedDB 스키마, CRUD, 백업 import/export
│   ├── analytics/
│   │   └── stats.ts         # 세션 배열 → 대시보드용 집계
│   ├── audio/
│   │   └── alerts.ts        # Web Audio 비프, vibrate
│   ├── format/
│   │   └── time.ts          # MM:SS, 짧은 초 표기
│   ├── cn.ts                # className 조합
│   └── id.ts                # 세션 id 생성
├── types/
│   ├── session.ts           # NcsSessionRecord, StudySessionRecord, BackupPayload
│   ├── ncs.ts, study.ts
│   └── index.ts
├── index.css                # Tailwind + 전역 배경
└── main.tsx
```

**데이터 흐름 요약**

1. 타이머/체크 이벤트 → `features/*/...Page.tsx`에서 상태 관리  
2. 세션 종료 시 `lib/storage/db.ts`의 `addSession()`으로 IndexedDB `sessions` 스토어에 append  
3. 통계 화면에서 `getAllSessions()` 후 `lib/analytics/stats.ts`로 가공해 Recharts에 전달  

---

## 실행 방법

```bash
npm install
npm run dev          # 개발 서버 (기본 http://localhost:5173)
npm run build      # 타입체크 + production 빌드 → dist/
npm run preview    # 빌드 결과 미리보기
npm run lint       # ESLint
```

- Node.js 권장: **20 LTS** 이상 (Vite 8 기준)

---

## 데이터·프라이버시

- **설정**(알림음, 진동): `localStorage` (`studypulse-settings-v1`)
- **학습 세션**: **IndexedDB** (`studypulse` DB, `sessions` 오브젝트 스토어)
- 서버로 전송하지 않음. 다른 기기·브라우저와 기록은 **공유되지 않음**
- 백업은 통계 탭에서 JSON으로보내기/가져오기

---

## 배포 (Vercel)

이 저장소는 GitHub **`kjj403/study-pulse`** 와 연결되어 있으면, `main` 브랜치에 **push**할 때마다 Vercel이 자동 빌드·배포합니다.

1. [Vercel](https://vercel.com)에서 GitHub로 로그인  
2. **Import** → 본 저장소 선택  
3. **Build Command**: `npm run build`  
4. **Output Directory**: `dist`  
5. **Deploy**

커스텀 도메인은 Vercel 프로젝트 **Settings → Domains**에서 추가하면 됩니다.

---

## 라이선스

별도 라이선스 파일이 없다면 저장소 소유자 정책에 따릅니다. 필요 시 MIT 등 추가 가능합니다.
