// =========================================================
// Image Generation Service v3 — 캐릭터 시트 기반 일관성 유지
//
// 흐름:
//   ① 1컷 생성 (기본 프롬프트)
//   ② Gemini 텍스트 모델로 1컷 이미지에서 캐릭터 외모 상세 분석
//   ③ 2~4컷을 순차 생성 (캐릭터 분석 결과 + 1컷 이미지 참조)
// =========================================================

export interface PanelImageResult {
  panelIndex: number;
  imageUrl: string;
  error?: string;
}

export interface StoryMeta {
  protagonist: string;
  location: string;
}

// =========================================================
// Step ②: 1컷 이미지에서 캐릭터 외모를 상세 분석
// =========================================================
async function analyzeCharacterFromImage(
  imageBase64: string,
  apiKey: string,
  meta: StoryMeta
): Promise<string> {
  const prompt = `You are a character design analyst for a webtoon series.

Analyze the character in this image and provide an EXTREMELY DETAILED visual description.
This description will be used to reproduce the EXACT SAME character in subsequent panels.

Provide the following in English, be VERY specific:

1. **FACE**: Shape, eye color, eye size/style, eyebrow shape, nose, mouth, facial expression style
2. **HAIR**: Exact color (e.g. "dark chestnut brown"), length, style (ponytail/bob/straight/curly), bangs style, any accessories (ribbons, clips - specify color)
3. **BODY**: Body proportions (chibi ratio like 2:1 head-to-body or 3:1), approximate age appearance
4. **OUTFIT**: Every piece of clothing in detail - colors, patterns, style. Top, bottom, shoes, accessories
5. **ART STYLE**: Line thickness, coloring style (cell-shaded/watercolor/flat), level of detail, color palette mood

Format as a single dense paragraph. Do NOT include story context, only visual description.
The character name is "${meta.protagonist}".`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/png', data: imageBase64 } },
            { text: prompt },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
      }),
    }
  );

  if (!res.ok) {
    console.error('[analyzeCharacter] API error:', res.status);
    return ''; // 분석 실패 시 빈 문자열 반환
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text.trim();
}

// =========================================================
// 단일 패널 이미지 생성
// =========================================================
// 패널별 고유 서사 방향 (기승전결)
const PANEL_NARRATIVE: Record<number, { role: string; mood: string; direction: string }> = {
  1: {
    role: '기(起) — 도입',
    mood: 'calm, peaceful, establishing',
    direction: 'Show the character in a RELAXED STANDING POSE, smiling, in their everyday environment. Wide shot showing the full setting.',
  },
  2: {
    role: '승(承) — 사건 발생',
    mood: 'surprised, shocked, dramatic',
    direction: 'Show the character REACTING with SURPRISE — eyes wide, mouth open, stepping back. Include the threat/event in the scene. Dynamic angle, medium shot.',
  },
  3: {
    role: '전(轉) — 위기/전개',
    mood: 'tense, determined, action',
    direction: 'Show the character in ACTION — running, fighting, struggling. Dynamic pose with motion lines. Close-up or action shot with dramatic perspective.',
  },
  4: {
    role: '결(結) — 해결',
    mood: 'happy, victorious, relieved',
    direction: 'Show the character CELEBRATING — jumping, arms raised, big smile. Other characters cheering. Bright, warm lighting. Wide celebratory shot.',
  },
};

async function generateSinglePanel(
  prompt: string,
  apiKey: string,
  panelIndex: number,
  meta: StoryMeta,
  characterSheet: string,
  referenceImageBase64?: string
): Promise<PanelImageResult> {
  const panelNumber = panelIndex + 1;
  const narrative = PANEL_NARRATIVE[panelNumber] ?? PANEL_NARRATIVE[1];

  const characterDesc = characterSheet
    ? `[EXACT CHARACTER DESIGN - COPY PRECISELY]\n${characterSheet}`
    : `[CHARACTER] cute kawaii chibi character named "${meta.protagonist}", bright colorful design`;

  const fullPrompt = `Draw a single illustration for a Korean webtoon comic. Panel ${panelNumber} of 4.

### BANNED ELEMENTS (NEVER INCLUDE) ###
- NO speech bubbles, NO dialogue boxes, NO text of any kind
- NO captions, NO titles, NO labels, NO watermarks, NO signatures
- NO panel frames, NO borders, NO header bars, NO margins
- NO white space around edges — art must touch ALL four edges of the canvas

### #1 PRIORITY — CHARACTER MUST BE IDENTICAL ###
${characterDesc}

NEVER CHANGE the character's:
- Age or body size (keep EXACT same proportions)
- Face shape, eye style, or skin tone
- Hair color, length, or style
- Outfit, clothing colors, or accessories
- Art style or line thickness
Do NOT add facial hair, wrinkles, scars, or any new features.

### #2 — SCENE ###
Story: ${prompt}
Mood: ${narrative.mood}
Pose/framing: ${narrative.direction}

Change ONLY: pose, facial expression, camera angle, background details.

### #3 — FORMAT ###
- Square 1:1, full-bleed illustration ONLY
- Setting: ${meta.location}
- Children-safe (ages 8-12), Korean webtoon style
- The illustration must fill the ENTIRE canvas edge-to-edge with NO empty space
- Do NOT draw any text, letters, words, or symbols in the image

### FINAL REMINDER ###
Character = IDENTICAL to panel 1. Canvas = FULL BLEED, zero margins. Text = ABSOLUTELY NONE.`;

  const parts: Array<Record<string, unknown>> = [];

  if (referenceImageBase64) {
    parts.push({
      inlineData: { mimeType: 'image/png', data: referenceImageBase64 },
    });
    parts.push({
      text: `REFERENCE IMAGE: This is the character from panel 1. You MUST draw this EXACT SAME character — same face, same hair, same outfit, same body proportions, same age. Do NOT modify the character design in any way. Only draw them in a new pose for panel ${panelNumber} (mood: ${narrative.mood}).`,
    });
  }

  parts.push({ text: fullPrompt });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 0.45,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 150)}`);
  }

  const data = await res.json();
  const imgPart = data?.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData
  );

  if (!imgPart?.inlineData?.data) {
    throw new Error('이미지 데이터가 응답에 없습니다.');
  }

  const { data: b64, mimeType } = imgPart.inlineData;
  return {
    panelIndex,
    imageUrl: `data:${mimeType ?? 'image/png'};base64,${b64}`,
  };
}

// =========================================================
// base64 추출 헬퍼
// =========================================================
function extractBase64(dataUri: string): string {
  const idx = dataUri.indexOf(',');
  return idx >= 0 ? dataUri.slice(idx + 1) : dataUri;
}

// =========================================================
// Main: 순차 생성 (1 → 분석 → 2 → 3 → 4)
// =========================================================
export async function generatePanelImages(
  prompts: string[],
  apiKey: string,
  meta?: StoryMeta,
  onPanelComplete?: (result: PanelImageResult) => void
): Promise<PanelImageResult[]> {
  const results: PanelImageResult[] = [];
  const safeMeta: StoryMeta = meta ?? { protagonist: '주인공', location: '배경' };

  let panel1Base64 = '';
  let characterSheet = '';

  for (let idx = 0; idx < prompts.length; idx++) {
    try {
      const result = await generateSinglePanel(
        prompts[idx],
        apiKey,
        idx,
        safeMeta,
        characterSheet,
        idx > 0 ? panel1Base64 : undefined // 2컷부터 1컷 이미지 참조
      );

      results.push(result);
      onPanelComplete?.(result);

      // ── 1컷 생성 직후: 캐릭터 분석 수행 ──
      if (idx === 0 && result.imageUrl && !result.error) {
        panel1Base64 = extractBase64(result.imageUrl);

        // Gemini 텍스트 모델로 캐릭터 외모 상세 분석
        console.log('[ImageService] 1컷 완성 → 캐릭터 분석 중...');
        characterSheet = await analyzeCharacterFromImage(panel1Base64, apiKey, safeMeta);
        console.log('[ImageService] 캐릭터 분석 완료:', characterSheet.slice(0, 100) + '...');
      }
    } catch (err) {
      const errorResult: PanelImageResult = {
        panelIndex: idx,
        imageUrl: '',
        error: err instanceof Error ? err.message : '알 수 없는 오류',
      };
      results.push(errorResult);
      onPanelComplete?.(errorResult);
    }
  }

  return results;
}

// =========================================================
// 단일 패널 재생성 (참조 이미지 + 캐릭터 시트 전달)
// =========================================================
export async function regenerateSinglePanel(
  prompt: string,
  apiKey: string,
  panelIndex: number,
  meta?: StoryMeta,
  referenceBase64?: string,
  characterSheet?: string
): Promise<PanelImageResult> {
  const safeMeta: StoryMeta = meta ?? { protagonist: '주인공', location: '배경' };

  try {
    return await generateSinglePanel(
      prompt,
      apiKey,
      panelIndex,
      safeMeta,
      characterSheet ?? '',
      referenceBase64
    );
  } catch (err) {
    return {
      panelIndex,
      imageUrl: '',
      error: err instanceof Error ? err.message : '알 수 없는 오류',
    };
  }
}
