import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const CREDIT_PLANS = {
  starter: { credits: 50, amount: 5000, name: "스타터 플랜" },
  basic: { credits: 150, amount: 12000, name: "베이직 플랜" },
  pro: { credits: 500, amount: 35000, name: "프로 플랜" },
  premium: { credits: 1200, amount: 70000, name: "프리미엄 플랜" },
} as const;

type PlanKey = keyof typeof CREDIT_PLANS;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId } = body as { planId: PlanKey };

    if (!planId || !CREDIT_PLANS[planId]) {
      return NextResponse.json(
        { error: "유효하지 않은 플랜입니다." },
        { status: 400 }
      );
    }

    const plan = CREDIT_PLANS[planId];
    const orderId = `order_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("payments").insert({
      user_id: user?.id ?? null,
      order_id: orderId,
      order_name: `AI 크레딧 충전 - ${plan.name}`,
      amount: plan.amount,
      credits: plan.credits,
      status: "PENDING",
    });

    if (error) {
      console.error("Payment prepare error:", error);
      return NextResponse.json(
        { error: "주문 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId,
      amount: plan.amount,
      orderName: `AI 크레딧 충전 - ${plan.name}`,
      credits: plan.credits,
    });
  } catch (err) {
    console.error("Payment prepare error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
