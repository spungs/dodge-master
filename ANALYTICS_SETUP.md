# 📊 Google Analytics 4 설정 가이드

## 개요
이 문서는 Dodge Master에 Google Analytics 4 (GA4)를 설정하는 방법을 안내합니다.

---

## 🚀 1단계: Google Analytics 계정 생성

### 1.1 Google Analytics 가입
1. https://analytics.google.com 접속
2. Google 계정으로 로그인
3. "측정 시작" 버튼 클릭

### 1.2 계정 생성
1. **계정 이름**: "Dodge Master" 또는 원하는 이름
2. **계정 데이터 공유 설정**: 기본값 유지
3. "다음" 클릭

### 1.3 속성 만들기
1. **속성 이름**: "Dodge Master Game"
2. **보고 시간대**: "대한민국" (UTC+9)
3. **통화**: "KRW (₩)" 또는 "USD ($)"
4. "다음" 클릭

### 1.4 비즈니스 정보
1. **업종**: "게임"
2. **비즈니스 규모**: 해당 사항 선택
3. **비즈니스 목표**:
   - ✅ "온라인 판매 수익 창출"
   - ✅ "사용자 참여도 측정"
4. "만들기" 클릭

### 1.5 이용약관 동의
1. 국가 선택: "대한민국"
2. 이용약관 동의 체크
3. "동의함" 클릭

---

## 🔧 2단계: 데이터 스트림 설정

### 2.1 웹 데이터 스트림 추가
1. "웹" 플랫폼 선택
2. **웹사이트 URL**: `https://spungs-dodge-master.com`
   - 또는 실제 배포 URL
3. **스트림 이름**: "Dodge Master Web"
4. "스트림 만들기" 클릭

### 2.2 측정 ID 복사
설정 완료 후 표시되는 **측정 ID**를 복사하세요.
- 형식: `G-XXXXXXXXXX` (예: `G-ABC123DEF4`)
- 이 ID를 코드에 사용합니다

---

## 💻 3단계: 코드에 측정 ID 적용

### 3.1 index.html 수정
`index.html` 파일에서 다음 부분을 찾으세요:

```html
<!-- Google Analytics 4 -->
<!-- TODO: Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX', {
        'cookie_flags': 'SameSite=None;Secure',
        'send_page_view': true
    });
</script>
```

**`G-XXXXXXXXXX`를 실제 측정 ID로 교체:**

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-ABC123DEF4', {
        'cookie_flags': 'SameSite=None;Secure',
        'send_page_view': true
    });
</script>
```

### 3.2 변경사항 저장 및 배포
```bash
git add index.html
git commit -m "Add Google Analytics 4 tracking"
git push
```

---

## 📈 4단계: 이벤트 트래킹 확인

### 추적되는 이벤트 목록
Dodge Master는 다음 이벤트를 자동으로 추적합니다:

| 이벤트명 | 설명 | 매개변수 |
|---------|------|---------|
| `game_start` | 게임 시작 | event_category: 'game' |
| `game_over` | 게임 종료 | survival_time, isNewRecord |
| `ranking_save` | 랭킹 저장 | value (밀리초) |
| `share` | 소셜 공유 | method (twitter/facebook/copy_link) |
| `tutorial_complete` | 튜토리얼 완료 | dismissed (true/false) |
| `language_change` | 언어 변경 | label (en/ko) |

### 실시간 테스트
1. **Google Analytics 대시보드** 접속
2. 좌측 메뉴 → **보고서** → **실시간**
3. 게임 사이트 열기 (새 탭)
4. 게임 플레이 → 실시간 보고서에 나타나는지 확인

**확인 사항:**
- ✅ 페이지뷰 증가
- ✅ 사용자 수 표시
- ✅ 이벤트 카운트 증가

---

## 🔍 5단계: 맞춤 대시보드 설정

### 5.1 주요 지표 보고서
1. **보고서** → **참여도** → **이벤트**
2. 다음 이벤트들이 표시되는지 확인:
   - game_start
   - game_over
   - ranking_save
   - share
   - tutorial_complete

### 5.2 전환 설정 (선택사항)
중요한 이벤트를 "전환"으로 표시:

1. **관리** → **이벤트**
2. `ranking_save` 이벤트 찾기
3. "전환으로 표시" 토글 활성화

**전환으로 표시할 이벤트:**
- ✅ `ranking_save` (가장 중요)
- ✅ `tutorial_complete`
- ✅ `share`

---

## 📊 6단계: 유용한 보고서 설정

### 6.1 평균 생존 시간 분석
**사용자 속성 → 맞춤 정의 → 맞춤 측정항목**

1. "맞춤 측정항목 만들기" 클릭
2. **측정항목 이름**: Average Survival Time
3. **범위**: 이벤트
4. **이벤트 매개변수**: survival_time
5. **측정 단위**: 시간 (밀리초)

### 6.2 소셜 공유 추적
**참여도 → 이벤트**

1. `share` 이벤트 클릭
2. **method** 매개변수로 필터링
   - twitter
   - facebook
   - copy_link

### 6.3 신규 vs 재방문 사용자
**수명 주기 → 참여도 → 개요**

- 신규 사용자: 첫 방문자
- 재방문 사용자: 2회 이상 방문자
- 튜토리얼 완료율 확인

---

## 🎯 7단계: 목표 설정 및 KPI

### 주요 지표 (KPI)
| 지표 | 목표값 | 현재값 |
|------|--------|--------|
| 일일 활성 사용자 (DAU) | 100명 | - |
| 평균 세션 시간 | 5분 | - |
| 평균 생존 시간 | 10초 | - |
| 랭킹 저장률 | 30% | - |
| 소셜 공유율 | 10% | - |
| 튜토리얼 완료율 | 80% | - |

### 주간 리뷰 체크리스트
- [ ] 주간 방문자 수 확인
- [ ] 가장 인기 있는 유입 경로 확인
- [ ] 평균 생존 시간 추이 확인
- [ ] 이탈률 분석
- [ ] 소셜 공유 전환율 확인

---

## 🔧 8단계: 고급 설정 (선택사항)

### 8.1 사용자 ID 추적
익명 사용자를 식별하기 위한 ID 생성:

```javascript
// game.js에 추가 (선택사항)
function getUserId() {
    let userId = localStorage.getItem('dodge_user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('dodge_user_id', userId);
    }
    return userId;
}

// GA 설정 시 사용자 ID 전송
gtag('config', 'G-XXXXXXXXXX', {
    'user_id': getUserId()
});
```

### 8.2 IP 익명화 (GDPR 준수)
이미 기본 설정에 포함되어 있음:
```javascript
gtag('config', 'G-XXXXXXXXXX', {
    'anonymize_ip': true  // 기본값: true (GA4)
});
```

### 8.3 Google Optimize 연동 (A/B 테스트)
1. Google Optimize 계정 생성
2. 컨테이너 ID 복사
3. GA4와 연결

---

## 🐛 9단계: 문제 해결

### GA가 작동하지 않는 경우

#### 1. 개발자 도구 확인
```javascript
// 브라우저 콘솔에서 실행
console.log(typeof gtag); // 'function'이어야 함
console.log(window.dataLayer); // 배열이 표시되어야 함
```

#### 2. 광고 차단기 확인
- AdBlock, uBlock Origin 등이 GA를 차단할 수 있음
- 테스트 시 광고 차단기 비활성화

#### 3. 실시간 보고서 지연
- GA4는 최대 **24시간** 지연 가능
- 실시간 보고서는 **몇 분** 내 표시

#### 4. 측정 ID 확인
```bash
# 올바른 형식인지 확인
G-XXXXXXXXXX  ✅ (GA4)
UA-XXXXXXXXX-X  ❌ (구 버전)
```

### 일반적인 오류

**오류 1: "gtag is not defined"**
```html
<!-- async 속성이 있는지 확인 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**오류 2: 이벤트가 기록되지 않음**
```javascript
// 이벤트 이름 확인 (대소문자 구분)
trackEvent('game_start', {...});  // ✅
trackEvent('Game_Start', {...});  // ❌
```

---

## 📱 10단계: 모바일 앱 분석 (미래 확장)

PWA로 변환 시 추가 설정:

```javascript
// service-worker.js에 추가
gtag('event', 'pwa_install', {
    event_category: 'engagement',
    event_label: 'installed'
});
```

---

## 📚 추가 자료

### 공식 문서
- [GA4 시작 가이드](https://support.google.com/analytics/answer/9304153)
- [이벤트 측정 가이드](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [gtag.js 참조](https://developers.google.com/tag-platform/gtagjs/reference)

### 유용한 도구
- [Google Analytics Debugger (Chrome 확장)](https://chrome.google.com/webstore/detail/google-analytics-debugger/)
- [GA4 Event Builder](https://ga-dev-tools.web.app/ga4/event-builder/)

---

## ✅ 설정 완료 체크리스트

### 필수
- [ ] Google Analytics 계정 생성
- [ ] 웹 데이터 스트림 추가
- [ ] 측정 ID 코드에 적용
- [ ] 실시간 보고서에서 테스트
- [ ] 이벤트 추적 확인

### 권장
- [ ] 전환 이벤트 설정
- [ ] 맞춤 대시보드 생성
- [ ] 주간 리뷰 일정 설정
- [ ] 팀원에게 액세스 권한 부여

### 선택사항
- [ ] 사용자 ID 추적
- [ ] Google Optimize 연동
- [ ] BigQuery 내보내기 설정

---

**마지막 업데이트:** 2025-11-07
**담당자:** Development Team

---

## 🎉 완료!

Google Analytics가 성공적으로 설정되었습니다!

**다음 단계:**
1. 일주일 후 첫 번째 보고서 확인
2. 사용자 행동 패턴 분석
3. 데이터 기반 게임 개선
4. 마케팅 전략 수립

**문의사항:**
- GA 대시보드: https://analytics.google.com
- 지원 센터: https://support.google.com/analytics
