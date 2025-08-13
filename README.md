# GoalWebsite - 개인 목표 관리 웹사이트

## 📋 프로젝트 개요
React 기반의 개인 목표 관리 및 생산성 향상을 위한 웹 애플리케이션입니다. 주간/월간 목표 설정, 운동 기록, 가계부, 글쓰기 공간 등 다양한 기능을 제공합니다.

## 🚀 주요 기능

### 1. Home (홈)
- 전체 목표 달성률 및 진행 상황 대시보드
- 각 섹션별 요약 정보 표시

### 2. Weekly (주간 목표)
- **주간 목표 관리**: 주별로 목표 설정 및 관리
- **인터랙티브 달력**: 오른쪽 월간 달력에서 날짜 클릭 시 해당 주의 목표로 이동
- **목표 표시**: 달력에서 목표가 있는 주는 • 표시로 구분
- **주간 네비게이션**: 이전 주/다음 주 버튼으로 주간 이동
- **오늘 할 일**: 당일 할 일 목록 관리
- **주간 일정**: 특정 날짜별 일정 관리
- **드래그 앤 드롭**: 목표 및 할 일 순서 변경 가능

### 3. Monthly (월간 목표)
- 월별 장기 목표 설정 및 관리
- 월간 진행률 추적

### 4. Think Big (장기 목표)
- 장기적인 비전 및 목표 설정
- 큰 그림의 목표 관리

### 5. Analysis (분석)
- 목표 달성률 통계 및 분석
- 진행 상황 시각화

### 6. Motivation (동기부여)
- 동기부여 콘텐츠 관리
- 영감을 주는 글귀나 이미지 저장

### 7. Writing Space (글쓰기 공간)
- 개인 노트 및 글쓰기 공간
- 아이디어 정리 및 기록

### 8. Workout (운동 기록)
- 운동 계획 및 기록 관리
- 운동 진행 상황 추적

### 9. Budget (가계부)
- 개인 재정 관리
- 수입/지출 기록 및 분석

## 🛠️ 기술 스택
- **Frontend**: React.js
- **Styling**: CSS3 (커스텀 CSS 변수 사용)
- **Storage**: 
  - GitHub API (클라우드 저장)
  - LocalStorage (로컬 백업)
- **Deployment**: Vercel

## 📁 프로젝트 구조
```
GoalWebsite-main/
├── public/
├── src/
│   ├── components/
│   │   ├── Home.js
│   │   ├── Weekly.js          # 주간 목표 (달력 클릭 기능 포함)
│   │   ├── Monthly.js
│   │   ├── ThinkBig.js
│   │   ├── Analysis.js
│   │   ├── Motivation.js
│   │   ├── Study.js           # Writing Space
│   │   ├── Workout.js
│   │   └── Budget.js
│   ├── utils/
│   │   ├── githubStorage.js   # GitHub API 연동
│   │   └── deviceDetection.js
│   ├── App.js                 # 메인 앱 컴포넌트
│   ├── App.css               # 전체 스타일링
│   └── index.js
├── package.json
└── README.md
```

## 🎨 디자인 특징
- **다크/라이트 테마**: CSS 변수를 통한 테마 시스템
- **반응형 디자인**: 모바일/데스크톱 대응
- **그라데이션 UI**: 현대적인 그라데이션 디자인
- **인터랙티브 요소**: 호버 효과, 애니메이션

## 💾 데이터 저장
- **Primary**: GitHub API를 통한 클라우드 저장
- **Backup**: 브라우저 LocalStorage
- **Export/Import**: JSON 형태로 데이터 백업/복원 가능

## 🔧 개발 환경 설정
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 빌드
npm run build
```

## 📝 주요 데이터 구조

### Weekly Goals (주간 목표)
```javascript
weeklyGoals: {
  [year]: {
    [weekNumber]: [
      {
        id: timestamp,
        title: "목표 제목",
        subGoals: [
          { id: timestamp, title: "세부 목표", completed: boolean }
        ],
        completed: boolean,
        createdAt: "ISO 날짜"
      }
    ]
  }
}
```

### Events (일정)
```javascript
events: [
  {
    id: timestamp,
    title: "일정 제목",
    date: "YYYY-MM-DD",
    time: "HH:MM",
    description: "설명"
  }
]
```

## 🎯 핵심 기능 상세

### 달력 클릭 기능 (Weekly 페이지)
- 오른쪽 월간 달력에서 임의의 날짜 클릭
- 해당 날짜가 속한 주의 목표로 자동 이동
- 목표가 있는 주는 • 표시로 시각적 구분
- 선택된 주는 하이라이트 표시

### 주간 네비게이션
- 기본값: 이번 주 (weekOffset = 0)
- 이전 주/다음 주 버튼으로 주간 이동
- 각 주별로 독립적인 목표 관리

### 드래그 앤 드롭
- 목표 순서 변경
- 세부 목표 순서 변경
- 오늘 할 일 순서 변경

## 🔄 GitHub 연동
- 자동 클라우드 저장
- 실시간 데이터 동기화
- 백업 및 복원 기능

## 📱 반응형 지원
- 모바일에서는 네비게이션 텍스트 단축 (예: "주간", "월간")
- 터치 친화적 UI
- 작은 화면 최적화

## 🎨 테마 시스템
CSS 변수를 통한 일관된 디자인:
- `--primary-color`: 메인 컬러
- `--secondary-color`: 보조 컬러
- `--bg-color`: 배경색
- `--card-bg`: 카드 배경색
- `--text-color`: 텍스트 색상
- `--border-color`: 테두리 색상

## 🚀 배포
- Vercel을 통한 자동 배포
- GitHub 연동으로 푸시 시 자동 빌드

---

## 📞 개발자 정보
- GitHub: untiwin21
- 개발 환경: React.js + GitHub API + Vercel
