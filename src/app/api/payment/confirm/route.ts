import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount } = body as {
      paymentKey: string;
      orderId: string;
      amount: number;
    };

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. DB에서 주문 정보 조회 (금액 조작 방지)
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json(
        { error: "주문 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 금액 비교 (클라이언트 조작 방지)
    if (payment.amount !== amount) {
      await supabase
        .from("payments")
        .update({ status: "FAILED" })
        .eq("order_id", orderId);

      return NextResponse.json(
        { error: "결제 금액이 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // 이미 처리된 결제인지 확인
    if (payment.status === "DONE") {
      return NextResponse.json(
        { error: "이미 처리된 결제입니다." },
        { status: 400 }
      );
    }

    // 2. 토스페이먼츠 결제 승인 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "결제 설정 오류입니다." },
        { status: 500 }
      );
    }

    const encryptedSecretKey =
      "Basic " + Buffer.from(secretKey + ":").toString("base64");

    const tossResponse = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    const tossResult = await tossResponse.json();

    if (!tossResponse.ok) {
      // 결제 승인 실패
      await supabase
        .from("payments")
        .update({
          status: "FAILED",
          payment_key: paymentKey,
          toss_response: tossResult,
        })
        .eq("order_id", orderId);

      return NextResponse.json(
        {
          code: tossResult.code || "UNKNOWN_ERROR",
          message: tossResult.message || "결제 승인에 실패했습니다.",
        },
        { status: tossResponse.status }
      );
    }

    // 3. 결제 성공 처리
    const now = new Date().toISOString();

    // payments 업데이트
    await supabase
      .from("payments")
      .update({
        status: "DONE",
        payment_key: paymentKey,
        toss_response: tossResult,
        approved_at: now,
      })
      .eq("order_id", orderId);

    // 사용자 크레딧 증가
    if (payment.user_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("credits")
        .eq("id", payment.user_id)
        .single();

      const currentCredits = userData?.credits ?? 0;
      const newBalance = currentCredits + payment.credits;

      await supabase
        .from("users")
        .update({ credits: newBalance })
        .eq("id", payment.user_id);

      // 크레딧 트랜잭션 기록
      await supabase.from("credit_transactions").insert({
        user_id: payment.user_id,
        amount: payment.credits,
        type: "charge",
        description: payment.order_name,
        payment_id: payment.id,
        balance_after: newBalance,
      });
    }

    return NextResponse.json({
      success: true,
      credits: payment.credits,
      orderId,
      paymentKey,
      amount,
    });
  } catch (err) {
    console.error("Payment confirm error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
