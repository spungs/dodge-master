# 🔒 Dodge Master - 보안 개선사항

## 개요
이 문서는 Dodge Master 게임에 적용된 긴급 보안 조치 사항을 설명합니다.

---

## 🛡️ 적용된 보안 조치

### 1. Supabase Row Level Security (RLS) 정책 설정

#### 파일: `supabase-security.sql`

**적용 방법:**
1. Supabase Dashboard 접속 (https://supabase.com/dashboard)
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 선택
4. `supabase-security.sql` 파일의 내용을 복사하여 붙여넣기
5. **RUN** 버튼 클릭하여 실행

**주요 정책:**

- ✅ **읽기 권한**: 모든 사용자가 랭킹 조회 가능
- ✅ **쓰기 권한**: 검증된 데이터만 삽입 가능
  - 플레이어 이름: 1-20자, 특수문자 제한
  - 생존 시간: 0-600초 (10분) 범위
  - 국가 코드: 2자리 코드만 허용
- ❌ **수정 금지**: 등록된 기록은 수정 불가
- ❌ **삭제 금지**: 일반 사용자는 삭제 불가

**속도 제한:**
- 같은 플레이어 이름으로 1분에 5회 이상 등록 시 차단
- 스팸 방지 및 악의적인 등록 차단

---

### 2. 클라이언트 측 입력 검증 강화

#### 파일: `game.js`

**추가된 보안 함수:**

#### 2.1. HTML 이스케이프 (XSS 방어)
```javascript
escapeHtml(text)
```
- 모든 사용자 입력에서 HTML 특수문자 제거
- `<`, `>`, `&`, `"`, `'` 등을 안전한 문자로 변환
- XSS(Cross-Site Scripting) 공격 방지

#### 2.2. 플레이어 이름 검증
```javascript
validatePlayerName(name)
```
- 길이 검증: 1-20자
- 허용 문자: 영문, 숫자, 한글, 공백, `_`, `-`
- 특수문자 및 스크립트 태그 차단

#### 2.3. 생존 시간 검증
```javascript
validateSurvivalTime(time)
```
- 음수 방지
- 최대 시간: 600초 (10분)
- 소수점 3자리로 제한
- 비정상적으로 높은 점수 차단

#### 2.4. 국가 코드 검증
```javascript
validateCountryCode(code)
```
- 2자리 코드만 허용
- `countries` 배열에 존재하는 코드만 허용
- 잘못된 코드 차단

---

### 3. 게임 점수 조작 감지

#### 3.1. 게임 세션 추적
```javascript
createGameSession()
validateGameSession(reportedTime)
```

**작동 원리:**
1. 게임 시작 시 세션 ID와 타임스탬프 생성
2. 게임 종료 시 실제 경과 시간과 보고된 시간 비교
3. 5초 이상 차이나면 조작으로 간주하고 차단

**차단 대상:**
- 개발자 도구로 `gameTime` 변수 조작
- 타이머 속도 조작
- 메모리 에디터 사용

#### 3.2. 검증 흐름

```
게임 시작 → createGameSession() 호출
    ↓
플레이어가 게임 플레이
    ↓
게임 오버 → 점수 제출
    ↓
validateGameSession() 체크
    ↓
실제 시간 vs 보고 시간 비교
    ↓
[차이 < 5초] → 저장 허용
[차이 ≥ 5초] → 차단 및 경고
```

---

### 4. 에러 처리 개선

#### 다국어 에러 메시지
- 한국어/영어로 명확한 에러 메시지 제공
- RLS 정책 위반 시 사용자 친화적인 안내

#### 에러 코드별 처리
- `42501`: RLS 정책 위반
- Rate limit 초과: 속도 제한 안내
- 검증 실패: 구체적인 오류 내용 표시

---

## 📋 테스트 체크리스트

적용 후 다음 사항을 테스트하세요:

### Supabase RLS 테스트
- [ ] Supabase SQL Editor에서 `supabase-security.sql` 실행
- [ ] Authentication > Policies 메뉴에서 정책 생성 확인
- [ ] 정상적인 점수 등록 테스트
- [ ] 잘못된 데이터 등록 시도 (차단 확인)
  - [ ] 빈 이름
  - [ ] 21자 이상 이름
  - [ ] 음수 점수
  - [ ] 600초 초과 점수
  - [ ] 특수문자 포함 이름 (예: `<script>alert(1)</script>`)

### 클라이언트 검증 테스트
- [ ] 정상 플레이 → 점수 등록 성공
- [ ] 개발자 도구로 `gameTime` 조작 → 차단 확인
- [ ] 특수문자 이름 입력 → 에러 메시지 확인
- [ ] 빈 이름 입력 → 에러 메시지 확인
- [ ] 국가 선택 안함 → 에러 메시지 확인

### 세션 검증 테스트
- [ ] 정상 플레이 (0-60초) → 저장 성공
- [ ] 개발자 콘솔에서 `finalGameTime = 1000` 입력 후 저장 시도 → 차단 확인

---

## 🚨 추가 권장 사항

### 1. Supabase 환경변수 설정 (중요도: 높음)
현재 API 키가 코드에 노출되어 있습니다. 다음 방법으로 개선 가능:

```javascript
// .env 파일 생성 (gitignore에 추가)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

// game.js에서 사용
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

**참고:** 현재는 익명 키(anon key)이므로 RLS 정책이 적용되면 큰 문제는 없습니다.

### 2. HTTPS 강제 적용
HTTP 연결을 HTTPS로 리다이렉트하여 중간자 공격 방지

### 3. Content Security Policy (CSP) 헤더 추가
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'">
```

### 4. 관리자 대시보드 구축
- 의심스러운 기록 모니터링
- `suspicious_records` 뷰 활용
- 이상치 탐지 및 삭제 기능

---

## 📊 보안 개선 전후 비교

| 항목 | 개선 전 | 개선 후 |
|------|---------|---------|
| API 키 보호 | ❌ 노출됨 | ✅ RLS로 보호 |
| 점수 조작 | ❌ 가능 | ✅ 세션 검증으로 차단 |
| XSS 공격 | ❌ 취약 | ✅ 입력 검증으로 방어 |
| 부정 등록 | ❌ 무제한 | ✅ 속도 제한 적용 |
| 에러 처리 | ⚠️ 불명확 | ✅ 명확한 메시지 |

---

## 🔗 참고 자료

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

---

## 📞 문제 발생 시

문제가 발생하면 다음을 확인하세요:

1. **Supabase RLS가 활성화되었는지 확인**
   - Supabase Dashboard > Database > Tables > rankings
   - "RLS enabled" 체크 확인

2. **브라우저 콘솔 확인**
   - F12 → Console 탭
   - 에러 메시지 확인

3. **Supabase 로그 확인**
   - Supabase Dashboard > Logs
   - API 요청 실패 원인 확인

---

**마지막 업데이트:** 2025-11-07
**작성자:** Security Team
