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
1. 전체 길이는 1분 30초에서 2분에 적합하도록 매우 풍부하게 작성하세요.
2. [Verse 1] (4~6줄), [Pre-Chorus] (2줄), [Chorus] (4~6줄), [Verse 2] (4~6줄), [Chorus] (반복), [Bridge] (4줄), [Chorus] (반복), [Outro] (2~4줄) 형식을 반드시 지키세요.
3. 초등학생 아이들이 신나게 따라 부를 수 있고, 리듬감이 느껴지는 의성어와 의태어를 섞어주세요.
4. 웹툰의 줄거리가 한 편의 서사처럼 느껴지도록 기승전결을 담아주세요.
5. 반드시 아래 JSON 형태로만 응답하세요. 다른 텍스트나 마크다운 없이 JSON만 출력하세요.

{
  "lyrics": "[가사 전체 내용 - 각 섹션을 포함하여 충분한 분량으로 작성]"
}

**작성 예시 (분량 참고):**
[Verse 1]
반짝이는 아침 햇살, 친구들과 모여라
우리들의 비밀 기지, 신기한 일이 생길 거야
어제보다 즐거운 오늘, 모두 함께 떠나보자
심장이 두근두근, 발걸음은 가볍게!

[Pre-Chorus]
준비 됐나요? 하나 둘 셋 하면
꿈의 나라로 슈웅 날아올라요

[Chorus]
랄랄라 노래하며 우리 함께 가요
세상 끝까지 용기 내어 달려봐요
손을 잡으면 힘이 솟아나요 우린 무적 (무적!)
최고의 웹툰 주인공은 바로 우리!

... (이와 같은 충분한 분량으로)
`;

    const validateLyrics = (text: string) => {
      const requiredSections = ['[Verse', '[Chorus', '[Outro]'];
      const hasSections = requiredSections.every(section => text.includes(section));
      const looksComplete = text.trim().endsWith(']') || text.trim().endsWith('!') || text.trim().endsWith('.') || text.trim().endsWith('~');
      return hasSections && looksComplete;
    };

    let lyrics = '';
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 4096, // 토큰 수 상향
              responseMimeType: 'application/json', // JSON 모드 강제
            },
          }),
        }
      );

      if (!geminiRes.ok) {
        throw new Error('Gemini API call failed');
      }

      const data = await geminiRes.json();
      
      // JSON 모드일 경우 구조화된 데이터에서 추출
      try {
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        const parsed = JSON.parse(rawText);
        lyrics = parsed.lyrics ?? '';
      } catch (e) {
        // 폴백: JSON 파싱 실패 시 원본 텍스트 사용 시도
        lyrics = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      }


      if (validateLyrics(lyrics)) {
        break;
      }
      
      console.warn(`[Retry ${retryCount + 1}] Lyrics incomplete or missing sections. Retrying...`);
      retryCount++;
    }

    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error('Lyrics generation error:', error);
    return NextResponse.json({ error: '가사 생성 실패' }, { status: 500 });
  }
}
