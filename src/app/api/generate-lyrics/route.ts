import { NextRequest, NextResponse } from 'next/server';

export interface LyricsGenerationRequest {
  protagonist: string;
  location: string;
  incident: string;
  story: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LyricsGenerationRequest = await request.json();
    const { protagonist, location, incident, story } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ 
        lyrics: `[Verse]\n${protagonist}은(는) ${location}로 떠났네\n${incident}이(가) 일어난 그날 밤\n우리 모두 함께 노래해요\n\n[Chorus]\n오 ${protagonist} 용기를 내요\n${location}의 별들을 보며\n너의 꿈을 펼쳐봐\n꿈을 펼쳐봐` 
      });
    }

    const prompt = `당신은 웹툰 주제가 작곡가입니다. 아래 제공된 4컷 웹툰의 전체 줄거리를 바탕으로, 초등학생이 좋아할 만한 밝고 신나는 웹툰 주제가 가사를 작성해주세요.

**웹툰 정보:**
- 주인공: ${protagonist}
- 장소: ${location}
- 주요 사건: ${incident}
- 상세 줄거리:
${story}

**가사 작성 가이드:**
1. 전체 길이는 1분 내외의 노래에 적합하도록 짧고 강렬하게 작성하세요.
2. [Verse], [Chorus] 등의 형식을 포함하세요.
3. 초등학생 아이들이 따라 부르기 쉬운 단어와 리듬감을 사용하세요.
4. 웹툰의 핵심 주제와 주인공의 감정이 잘 드러나야 합니다.
5. 반드시 가사 텍스트만 응답하세요.

**작성 예시:**
[Verse 1]
푸른 하늘 아래 우리 친구 철수
학교 운동장에서 공을 차네
...`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      throw new Error('Gemini API call failed');
    }

    const data = await geminiRes.json();
    const lyrics = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error('Lyrics generation error:', error);
    return NextResponse.json({ error: '가사 생성 실패' }, { status: 500 });
  }
}
