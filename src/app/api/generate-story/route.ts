import { NextRequest, NextResponse } from 'next/server';
import { deductCredits } from '@/lib/credits';

// =========================================================
// Types
// =========================================================
export interface StoryPanel {
  panel: number;
  story: string;
  image_prompt: string;
}

export interface StoryGenerationRequest {
  protagonist: string;
  location: string;
  timeBackground: string;
  incident: string;
}

export interface StoryGenerationResponse {
  webtoon: StoryPanel[];
}

// =========================================================
// Gemini API Route Handler
// =========================================================
export async function POST(request: NextRequest) {
  try {
    const body: StoryGenerationRequest = await request.json();
    const { protagonist, location, timeBackground, incident } = body;

    // Validate inputs
    if (!protagonist || !location || !timeBackground || !incident) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 크레딧 차감 (3 크레딧)
    const creditResult = await deductCredits('generate-story');
    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error, remainingCredits: creditResult.remainingCredits },
        { status: creditResult.error?.includes('로그인') ? 401 : 402 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Demo mode: return mock data if no API key
      return NextResponse.json(generateMockStory(body));
    }

    // Build the prompt for Gemini
    const prompt = buildGeminiPrompt({ protagonist, location, timeBackground, incident });

    // Call Gemini API (gemini-2.5-flash)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.85,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json', // 순수 JSON 응답 강제
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text().catch(() => '');
      console.error('Gemini API error:', geminiRes.status, geminiRes.statusText, errBody);
      return NextResponse.json(
        { error: `Gemini API 오류: ${geminiRes.status} ${geminiRes.statusText} — ${errBody.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();

    // Extract text from Gemini response
    const rawText: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!rawText) {
      return NextResponse.json(
        { error: 'Gemini API에서 빈 응답을 받았습니다.' },
        { status: 500 }
      );
    }

    // Parse JSON from response (Gemini might wrap it in ```json blocks or plain text)
    let parsed: StoryGenerationResponse;
    try {
      // 1. 마크다운 코드펜스 제거
      let cleaned = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      // 2. { ... } 블록 추출
      if (!cleaned.startsWith('{')) {
        const objMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objMatch) cleaned = objMatch[0];
      }

      // 3. 파싱 시도
      const candidate = JSON.parse(cleaned);

      // 4. webtoon 필드가 없으면 배열 자체인 경우 처리
      if (Array.isArray(candidate)) {
        parsed = { webtoon: candidate };
      } else {
        parsed = candidate;
      }
    } catch (parseErr) {
      console.error('[generate-story] JSON parse failed.\nRaw text (first 500):', rawText.slice(0, 500));
      return NextResponse.json(
        { error: 'AI 응답을 파싱하는데 실패했습니다. 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // Validate structure
    if (!parsed.webtoon || !Array.isArray(parsed.webtoon) || parsed.webtoon.length < 4) {
      return NextResponse.json(
        { error: 'AI가 올바른 형식의 스토리를 생성하지 못했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

// =========================================================
// Helper: Build Gemini Prompt
// =========================================================
function buildGeminiPrompt(input: StoryGenerationRequest): string {
  return `당신은 초등학생을 위한 한국 웹툰 스토리 작가입니다. 아래 재료들을 이용해서 4컷 웹툰 이야기를 만들어주세요.

**이야기 재료:**
- 주인공: ${input.protagonist}
- 장소: ${input.location}
- 시간/배경: ${input.timeBackground}
- 사건/주제: ${input.incident}

**꼭 지켜야 할 것:**
1. 초등학생(8~12세)이 쉽게 이해할 수 있는 쉬운 말로 써주세요.
2. 4컷 구조(1컷:시작 → 2컷:사건 발생 → 3컷:위기 → 4컷:해결)로 작성하세요.
3. 각 컷의 한글 이야기는 2~3문장으로, 밝고 재미있게 써주세요.
4. 어려운 한자어나 어른스러운 표현은 쓰지 마세요. 초등학교 교과서 수준으로!
5. 각 컷의 image_prompt는 영어로, 귀엽고 밝은 한국 웹툰 스타일로 써주세요.
6. 반드시 아래 JSON 형태로만 응답하세요. 다른 텍스트나 마크다운 없이 JSON만 출력하세요.

{
  "webtoon": [
    {
      "panel": 1,
      "story": "[시작] 이야기가 시작되는 장면 - 쉬운 말로 2~3문장",
      "image_prompt": "cute Korean webtoon style, panel 1 establishing shot, bright cheerful colors, kawaii art style"
    },
    {
      "panel": 2,
      "story": "[사건 발생] 무언가 일이 생기는 장면 - 쉬운 말로 2~3문장",
      "image_prompt": "cute Korean webtoon style, panel 2 action moment, expressive characters, bright colors"
    },
    {
      "panel": 3,
      "story": "[위기] 가장 힘든 순간 - 쉬운 말로 2~3문장",
      "image_prompt": "cute Korean webtoon style, panel 3 dramatic tense moment, determined expression, dynamic"
    },
    {
      "panel": 4,
      "story": "[해결] 문제가 해결되는 행복한 장면 - 쉬운 말로 2~3문장",
      "image_prompt": "cute Korean webtoon style, panel 4 happy resolution, warm colors, smiling characters, celebration"
    }
  ]
}`;
}

// =========================================================
// Helper: Mock Story (API Key 없을 때 데모용)
// =========================================================
function generateMockStory(input: StoryGenerationRequest): StoryGenerationResponse {
  const panels: StoryPanel[] = [
    {
      panel: 1,
      story: `[시작] ${input.protagonist}은(는) ${input.location}에서 즐거운 ${input.timeBackground}을 보내고 있었어요. 오늘도 평범한 날인 줄 알았는데, 무언가 신기한 일이 일어나려고 하고 있었어요!`,
      image_prompt: `cute Korean webtoon style, panel 1 establishing shot: cheerful child character in ${input.location} during ${input.timeBackground}, bright colors, kawaii art style, wide shot, happy atmosphere`,
    },
    {
      panel: 2,
      story: `[사건 발생] 바로 그때! ${input.incident}이 시작되었어요. ${input.protagonist}은(는) 깜짝 놀랐지만 용감하게 앞으로 나섰어요. 친구들도 하나둘 도와주러 왔어요!`,
      image_prompt: `cute Korean webtoon style, panel 2 action scene: child character with surprised brave expression, dynamic pose, speed lines, big round expressive eyes, bright vibrant colors`,
    },
    {
      panel: 3,
      story: `[위기] 이런, 생각보다 훨씬 어려운 상황이 되었어요! 어떻게 해야 할지 몰랐지만 ${input.protagonist}은(는) 포기하지 않았어요. "할 수 있어!" 마음속으로 외쳤답니다.`,
      image_prompt: `cute Korean webtoon style, panel 3 dramatic moment: child character with determined worried expression, cute sweat drops, hopeful tense atmosphere, kawaii style`,
    },
    {
      panel: 4,
      story: `[해결] 결국 해냈어요! ${input.protagonist}은(는) 활짝 웃으며 기뻐했어요. 모두가 함께 행복하게 마무리되었고, 오늘의 일은 평생 잊지 못할 소중한 추억이 되었답니다!`,
      image_prompt: `cute Korean webtoon style, panel 4 happy resolution: child character smiling joyfully, golden warm lighting, ${input.location} background, celebration mood, all friends happy, kawaii style`,
    },
  ];

  return { webtoon: panels };
}
