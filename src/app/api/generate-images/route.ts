import { NextRequest, NextResponse } from 'next/server';
import {
  generatePanelImages,
  regenerateSinglePanel,
  type PanelImageResult,
  type StoryMeta,
} from '@/lib/image-service';
import { uploadBase64Image } from '@/lib/supabase/storage';
import { deductCredits } from '@/lib/credits';

// =========================================================
// Types
// =========================================================
export interface ImageGenerationRequest {
  prompts: string[];
  panelIndex?: number;
  referenceImage?: string;    // 참조할 이전 패널 이미지 (Supabase URL or base64)
  characterSheet?: string;
  storyInput?: {
    protagonist: string;
    location: string;
  };
}

export interface ImageGenerationResponse {
  images: PanelImageResult[];
}

// =========================================================
// Helper: base64 → Supabase URL, 실패 시 에러 반환
// =========================================================
async function uploadResult(result: PanelImageResult, timestamp: number): Promise<PanelImageResult> {
  if (!result.imageUrl || result.error) return result;

  // 이미 Supabase URL이면 다시 업로드하지 않음
  if (!result.imageUrl.startsWith('data:')) return result;

  const publicUrl = await uploadBase64Image(
    result.imageUrl,
    'webtoon-images',
    `panels/${timestamp}_${result.panelIndex}.png`
  );

  if (publicUrl) {
    // 성공: Supabase URL로 교체
    return { ...result, imageUrl: publicUrl };
  } else {
    // 실패: Base64를 클라이언트에 보내지 않음 (용량 폭발 방지)
    console.error(`[generate-images] Supabase upload failed for panel ${result.panelIndex}`);
    return { ...result, imageUrl: '', error: '이미지 서버 업로드 실패. Supabase Storage 정책을 확인하세요.' };
  }
}

// =========================================================
// POST /api/generate-images
// =========================================================
export async function POST(request: NextRequest) {
  try {
    const body: ImageGenerationRequest = await request.json();
    const { prompts, panelIndex, storyInput, referenceImage, characterSheet } = body;

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json({ error: '프롬프트가 없습니다.' }, { status: 400 });
    }

    // 크레딧 차감 (전체 생성: 5, 개별 재생성: 2)
    const action = (panelIndex !== undefined && panelIndex >= 0) ? 'generate-images-single' : 'generate-images';
    const creditResult = await deductCredits(action);
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error, remainingCredits: creditResult.remainingCredits },
        { status: creditResult.error?.includes('로그인') ? 401 : 402 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const meta: StoryMeta | undefined = storyInput
      ? { protagonist: storyInput.protagonist, location: storyInput.location }
      : undefined;

    const timestamp = Date.now();

    // ── 개별 패널 재생성 ────────────────────────────
    if (panelIndex !== undefined && panelIndex >= 0 && panelIndex < prompts.length) {
      // referenceImage가 Supabase URL이면 base64 변환 없이 사용
      let refBase64: string | undefined;
      if (referenceImage) {
        if (referenceImage.startsWith('data:')) {
          const commaIdx = referenceImage.indexOf(',');
          refBase64 = commaIdx >= 0 ? referenceImage.slice(commaIdx + 1) : referenceImage;
        } else {
          // Supabase URL → 서버에서 다운로드해 base64 변환
          try {
            const imgRes = await fetch(referenceImage);
            const buf = await imgRes.arrayBuffer();
            refBase64 = Buffer.from(buf).toString('base64');
          } catch {
            console.warn('[generate-images] Failed to fetch reference image from URL');
          }
        }
      }

      const rawResult = await regenerateSinglePanel(
        prompts[panelIndex], apiKey, panelIndex, meta, refBase64, characterSheet
      );
      const finalResult = await uploadResult(rawResult, timestamp);
      return NextResponse.json({ images: [finalResult] } satisfies ImageGenerationResponse);
    }

    // ── 전체 순차 생성 (1→분석→2→3→4) ──────────────
    const results = await generatePanelImages(prompts, apiKey, meta);

    // 각 결과를 순차적으로 Supabase에 업로드
    const uploadedResults: PanelImageResult[] = [];
    for (const res of results) {
      uploadedResults.push(await uploadResult(res, timestamp));
    }

    return NextResponse.json({ images: uploadedResults } satisfies ImageGenerationResponse);
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

