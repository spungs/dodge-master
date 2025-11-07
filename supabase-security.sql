-- ============================================
-- Dodge Master - Supabase 보안 정책 설정
-- ============================================
-- 이 파일을 Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. Row Level Security (RLS) 활성화
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- 2. 읽기 권한: 모든 사용자가 랭킹을 볼 수 있음
CREATE POLICY "Allow public read access"
ON rankings
FOR SELECT
USING (true);

-- 3. 삽입 권한: 기본적인 검증과 함께 삽입 허용
CREATE POLICY "Allow insert with validation"
ON rankings
FOR INSERT
WITH CHECK (
  -- 플레이어 이름 검증
  player_name IS NOT NULL
  AND LENGTH(TRIM(player_name)) >= 1
  AND LENGTH(player_name) <= 20
  AND player_name ~ '^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s_-]+$' -- 특수문자 제한

  -- 생존 시간 검증 (0초 ~ 600초, 즉 10분)
  AND survival_time >= 0
  AND survival_time <= 600

  -- 국가 코드 검증
  AND country_code IS NOT NULL
  AND LENGTH(country_code) = 2
);

-- 4. 업데이트 금지: 한 번 등록된 기록은 수정 불가
CREATE POLICY "Deny all updates"
ON rankings
FOR UPDATE
USING (false);

-- 5. 삭제 금지: 일반 사용자는 삭제 불가 (관리자만 가능)
CREATE POLICY "Deny public delete"
ON rankings
FOR DELETE
USING (false);

-- 6. 속도 제한을 위한 함수 (선택사항)
-- 같은 사용자가 너무 빠르게 등록하는 것을 방지
CREATE OR REPLACE FUNCTION check_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- 같은 IP에서 최근 1분 내 5회 이상 등록 시 차단
  -- 실제 IP 추적을 위해서는 Edge Function이 필요합니다
  SELECT COUNT(*) INTO recent_count
  FROM rankings
  WHERE player_name = NEW.player_name
    AND created_at > NOW() - INTERVAL '1 minute';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting again.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (선택사항)
DROP TRIGGER IF EXISTS rate_limit_trigger ON rankings;
CREATE TRIGGER rate_limit_trigger
  BEFORE INSERT ON rankings
  FOR EACH ROW
  EXECUTE FUNCTION check_rate_limit();

-- 7. 이상치 탐지를 위한 뷰 생성 (관리자용)
CREATE OR REPLACE VIEW suspicious_records AS
SELECT
  id,
  player_name,
  survival_time,
  country_code,
  created_at,
  CASE
    WHEN survival_time > 300 THEN 'Very high score (5+ minutes)'
    WHEN survival_time > 180 THEN 'High score (3+ minutes)'
    ELSE 'Normal'
  END as risk_level
FROM rankings
WHERE survival_time > 120 -- 2분 이상인 기록
ORDER BY survival_time DESC;

-- 8. rankings 테이블이 없는 경우를 위한 테이블 생성 스크립트 (참고용)
-- 이미 테이블이 있다면 실행하지 마세요
/*
CREATE TABLE IF NOT EXISTS rankings (
  id BIGSERIAL PRIMARY KEY,
  player_name TEXT NOT NULL,
  survival_time NUMERIC(10, 3) NOT NULL,
  country_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rankings_survival_time ON rankings(survival_time DESC);
CREATE INDEX idx_rankings_created_at ON rankings(created_at DESC);
CREATE INDEX idx_rankings_country_code ON rankings(country_code);
*/

-- ============================================
-- 실행 후 확인사항
-- ============================================
-- 1. Supabase Dashboard > Authentication > Policies에서 정책 확인
-- 2. 테스트로 랭킹 삽입 시도
-- 3. 잘못된 데이터(음수 점수, 긴 이름 등) 삽입 시도하여 차단 확인
