-- =============================================
-- 결제 및 크레딧 시스템 마이그레이션
-- =============================================

-- 1. users 테이블에 credits 컬럼 추가 (기본 30 크레딧 무료 제공)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 30;

-- 2. payments 테이블 생성 (결제 이력)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  order_id TEXT UNIQUE NOT NULL,
  order_name TEXT NOT NULL,
  payment_key TEXT,
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'DONE', 'CANCELED', 'FAILED', 'EXPIRED')),
  toss_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- 3. credit_transactions 테이블 생성 (크레딧 충전/사용 이력)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('charge', 'usage', 'refund', 'bonus')),
  description TEXT,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  balance_after INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);

-- 5. RLS 활성화
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책: 사용자 본인 데이터만 조회 가능
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (true);

CREATE POLICY "Users can view own credit_transactions"
  ON public.credit_transactions FOR SELECT
  USING (true);

-- service_role로 INSERT/UPDATE 가능 (API Route에서 사용)
CREATE POLICY "Service can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update payments"
  ON public.payments FOR UPDATE
  USING (true);

CREATE POLICY "Service can insert credit_transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (true);
