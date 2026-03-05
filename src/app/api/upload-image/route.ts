import { NextRequest, NextResponse } from 'next/server';
import { uploadBase64Image } from '@/lib/supabase/storage';

export async function POST(request: NextRequest) {
  try {
    const { image, path, bucket = 'webtoon-images' } = await request.json();

    if (!image) {
      return NextResponse.json({ error: '이미지 데이터가 없습니다.' }, { status: 400 });
    }

    const publicUrl = await uploadBase64Image(image, bucket, path || `uploads/${Date.now()}.png`);

    if (!publicUrl) {
      return NextResponse.json({ error: '업로드에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
