import { createClient } from "@/lib/supabase/server";

/**
 * AI 기능별 크레딧 비용 정의
 */
export const CREDIT_COSTS = {
  "generate-story": 3,
  "generate-images": 5,
  "generate-images-single": 2,
  "generate-lyrics": 2,
  "generate-music": 5,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

interface DeductResult {
  success: boolean;
  error?: string;
  userId?: string;
  remainingCredits?: number;
}

/**
 * 크레딧 차감 유틸리티
 * 1. 사용자 인증 확인
 * 2. 잔액 확인
 * 3. 크레딧 차감
 * 4. 트랜잭션 기록
 */
export async function deductCredits(action: CreditAction): Promise<DeductResult> {
  const cost = CREDIT_COSTS[action];

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 현재 크레딧 조회
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (fetchError || !userData) {
      console.error("[deductCredits] User fetch error:", fetchError);
      return { success: false, error: "사용자 정보를 가져올 수 없습니다." };
    }

    const currentCredits = userData.credits ?? 0;

    if (currentCredits < cost) {
      return {
        success: false,
        error: `크레딧이 부족합니다. (필요: ${cost}, 잔액: ${currentCredits})`,
        userId: user.id,
        remainingCredits: currentCredits,
      };
    }

    // 크레딧 차감
    const newBalance = currentCredits - cost;
    const { error: updateError } = await supabase
      .from("users")
      .update({ credits: newBalance })
      .eq("id", user.id);

    if (updateError) {
      console.error("[deductCredits] Update error:", updateError);
      return { success: false, error: "크레딧 차감에 실패했습니다." };
    }

    // 트랜잭션 기록
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -cost,
      type: "usage",
      description: `AI ${action} 사용`,
      balance_after: newBalance,
    });

    return {
      success: true,
      userId: user.id,
      remainingCredits: newBalance,
    };
  } catch (err) {
    console.error("[deductCredits] Error:", err);
    return { success: false, error: "크레딧 처리 중 오류가 발생했습니다." };
  }
}
