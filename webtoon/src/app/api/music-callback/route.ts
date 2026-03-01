import { NextRequest, NextResponse } from 'next/server';

/**
 * KIE Suno API 콜백 수신 엔드포인트
 * KIE가 음악 생성 완료 시 이 URL로 POST 요청을 보냄.
 * 현재는 폴링 방식을 사용하므로 콜백은 무시하고 200만 반환.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    console.log('[music-callback] KIE callback received:', JSON.stringify(body).slice(0, 200));
  } catch {
    // 파싱 실패 무시
  }
  // 폴링으로 상태를 확인하므로 단순히 200 OK 반환
  return NextResponse.json({ received: true });
}
