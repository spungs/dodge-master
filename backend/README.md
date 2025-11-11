# Dodge Master Backend API

월별 랭킹 시스템을 위한 Node.js + Express + SQLite 백엔드 서버

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, Rate Limiting

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (nodemon)
npm run dev

# 프로덕션 서버 실행
npm start

# 테스트 실행
npm test
```

## API 엔드포인트

### Health Check
```
GET /api/health
Response: { status: "ok", timestamp: "2025-11-12T..." }
```

### 랭킹 등록
```
POST /api/rankings
Body: {
  player_name: "string" (1-20자, 영문/숫자/한글/_/- 허용),
  survival_time: number (0-600초),
  country_code: "string" (2자 국가코드, 예: KR, US, JP),
  month: "string" (선택, YYYY-MM 형식, 기본값: 현재 월)
}
Response: {
  success: true,
  data: { id: number }
}
```

### 월별 랭킹 조회
```
GET /api/rankings/:month?limit=100
Parameters:
  - month: YYYY-MM 형식 (예: 2025-11)
  - limit: 최대 조회 개수 (기본값: 100, 최대: 1000)
Response: {
  success: true,
  data: [
    {
      id: number,
      player_name: string,
      survival_time: number,
      country_code: string,
      month: string,
      created_at: string
    },
    ...
  ]
}
```

### 월별 최고 기록 조회
```
GET /api/rankings/best/:month
Parameters:
  - month: YYYY-MM 형식
Response: {
  success: true,
  data: {
    id: number,
    player_name: string,
    survival_time: number,
    country_code: string,
    month: string,
    created_at: string
  } | null
}
```

## 월별 랭킹 시스템

- 각 월(YYYY-MM)별로 랭킹이 자동으로 분리됩니다
- 매월 1일 00:00에 새로운 월이 시작됩니다 (자동)
- **이전 달 데이터는 서버 시작 시 자동으로 삭제됩니다**
- 현재 월의 랭킹만 유지되며, 매달 초기화됩니다

## 환경 변수

`.env.example` 파일을 `.env`로 복사하여 사용:

```bash
PORT=3000
DATABASE_PATH=./rankings.db
CORS_ORIGIN=*
```

## 보안

- **Input Validation**: 모든 입력값 검증 (XSS, SQL Injection 방지)
- **Rate Limiting**: IP당 15분에 100 요청 제한
- **Helmet**: HTTP 헤더 보안 강화
- **CORS**: 설정 가능한 출처 제한

## 데이터베이스 스키마

```sql
CREATE TABLE rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  survival_time REAL NOT NULL,
  country_code TEXT NOT NULL,
  month TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_month ON rankings(month);
CREATE INDEX idx_survival_time ON rankings(survival_time DESC);
```

## 개발

TDD 방식으로 개발되었습니다:
1. 테스트 작성 (Red)
2. 최소 구현 (Green)
3. 리팩토링 (Refactor)

테스트 커버리지: 92%+

## 배포

Railway, Render, DigitalOcean 등 Node.js 호스팅 서비스 사용 권장

```bash
# 프로덕션 환경 변수 설정
PORT=3000
DATABASE_PATH=/data/rankings.db
CORS_ORIGIN=https://spungs-dodge-master.com
```
