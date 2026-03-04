import { NextRequest, NextResponse } from 'next/server';
import {
  generatePanelImages,
  regenerateSinglePanel,
  type PanelImageResult,
  type StoryMeta,
} from '@/lib/image-service';

// =========================================================
// Types
// =========================================================
export interface ImageGenerationRequest {
  prompts: string[];
  panelIndex?: number;
  referenceImage?: string;    // 참조할 이전 패널 이미지 (base64 data URI)
  characterSheet?: string;    // 캐릭터 외모 분석 결과
  storyInput?: {
    protagonist: string;
    location: string;
  };
}

export interface ImageGenerationResponse {
  images: PanelImageResult[];
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const meta: StoryMeta | undefined = storyInput
      ? { protagonist: storyInput.protagonist, location: storyInput.location }
      : undefined;

    // ── 개별 패널 재생성 ────────────────────────────
    if (panelIndex !== undefined && panelIndex >= 0 && panelIndex < prompts.length) {
      let refBase64: string | undefined;
      if (referenceImage) {
        const commaIdx = referenceImage.indexOf(',');
        refBase64 = commaIdx >= 0 ? referenceImage.slice(commaIdx + 1) : referenceImage;
      }

      const result = await regenerateSinglePanel(
        prompts[panelIndex],
        apiKey,
        panelIndex,
        meta,
        refBase64,
        characterSheet
      );

      return NextResponse.json({
        images: [{ ...result, panelIndex }],
      } satisfies ImageGenerationResponse);
    }

    // ── 전체 순차 생성 (1→분석→2→3→4) ──────────────
    const results = await generatePanelImages(prompts, apiKey, meta);

    return NextResponse.json({ images: results } satisfies ImageGenerationResponse);
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
