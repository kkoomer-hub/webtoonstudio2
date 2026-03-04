import { NextRequest, NextResponse } from 'next/server';

// =========================================================
// Types
// =========================================================
export type Genre = 'k-pop' | 'ballad' | 'hip-hop' | 'rock';

export interface GenerateMusicRequest {
  genre: Genre;
  lyrics: string;
  title: string;
}

export interface MusicTask {
  type: 'kie' | 'demo';
  taskId?: string;
  demoUrl?: string;
  title: string;
}

export interface MusicStatusResponse {
  status: 'pending' | 'completed' | 'error';
  audioUrl?: string;
  coverUrl?: string;
  title?: string;
  error?: string;
}

// 장르별 Suno 스타일 태그
const GENRE_TAGS: Record<Genre, string> = {
  'k-pop':   'K-pop, energetic, catchy, synthesizer, korean pop, upbeat',
  'ballad':  'Korean ballad, emotional, piano, slow, heartfelt, touching',
  'hip-hop': 'hip-hop, beats, rap, urban, Korean hip hop, groove',
  'rock':    'rock, electric guitar, drums, powerful, energetic, band',
};

const KIE_BASE = 'https://api.kie.ai/api/v1';

// =========================================================
// POST /api/generate-music — 음악 생성 요청
// =========================================================
export async function POST(request: NextRequest) {
  try {
    const body: GenerateMusicRequest = await request.json();
    const { genre, lyrics, title } = body;

    const rawApiKey = process.env.KIE_SUNO_API_KEY;
    const apiKey = rawApiKey ? rawApiKey.replace(/['"]/g, '').trim() : '';

    // ── API 키 없으면 데모 모드 ───────────────────────────
    if (!apiKey) {
      const demoUrls: Record<Genre, string> = {
        'k-pop':   'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'ballad':  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        'hip-hop': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        'rock':    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      };
      return NextResponse.json({ type: 'demo', demoUrl: demoUrls[genre], title } satisfies MusicTask);
    }

    // ── KIE Suno API 호출 (customMode: true) ──────────────
    // customMode: true → 가사(prompt) + 스타일 태그(tags) 분리 전달
    // customMode: false → 통합 프롬프트 500자 제한 (우리 경우 너무 짧음)
    const tags = GENRE_TAGS[genre]; // 스타일 태그 (장르 정보)

    // 가사 분량을 약 1분 30초~2분에 맞춰 조절 (Suno V3.5는 긴 가사 수용 가능)
    const lyricsForSong = lyrics
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .join('\n')
      .slice(0, 1000);

    // KIE API는 callBackUrl 필수 — 자체 엔드포인트를 절대 URL로 전달
    const origin = request.headers.get('origin') ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const callBackUrl = `${origin}/api/music-callback`;

    console.log('[generate-music] Sending to KIE:', {
      tags, title: title.slice(0, 80), lyricsLen: lyricsForSong.length
    });

    const res = await fetch(`${KIE_BASE}/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: lyricsForSong,   // 가사 (customMode에서 가사로 사용)
        tags,                    // 장르/스타일 태그
        title: title.slice(0, 80),
        customMode: true,        // 가사와 태그를 직접 지정하는 모드
        instrumental: false,
        model: 'V3_5',
        duration: 120,           // 최대 120초 (KIE V3.5 권장 분량)
        callBackUrl,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.code !== 200) {
      throw new Error(data.msg || `KIE API 오류 (${res.status})`);
    }

    const taskId: string = data.data?.taskId;
    if (!taskId) throw new Error('taskId를 받지 못했습니다');

    return NextResponse.json({ type: 'kie', taskId, title } satisfies MusicTask);
  } catch (err) {
    console.error('[generate-music] POST error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '음악 생성 오류' },
      { status: 500 }
    );
  }
}

// =========================================================
// GET /api/generate-music?taskId=xxx — 생성 상태 폴링
// =========================================================
export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get('taskId');
  if (!taskId) return NextResponse.json({ error: 'taskId 없음' }, { status: 400 });

  try {
    const rawApiKey = process.env.KIE_SUNO_API_KEY;
    const apiKey = rawApiKey ? rawApiKey.replace(/['"]/g, '').trim() : '';
    if (!apiKey) return NextResponse.json({ status: 'error', error: 'API 키 없음' });

    // ✅ 올바른 엔드포인트: /generate/record-info
    const res = await fetch(
      `${KIE_BASE}/generate/record-info?taskId=${taskId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    const data = await res.json();
    console.log('[music-poll] KIE response:', JSON.stringify(data).slice(0, 300));

    if (!res.ok || data.code !== 200) {
      throw new Error(data.msg || `폴링 오류 (${res.status})`);
    }

    const taskData = data.data;
    const status: string = taskData?.status ?? 'PENDING';
    const errorMessage: string = taskData?.errorMessage ?? '';

    switch (status) {
      // ── 완료 ────────────────────────────────────────────
      case 'SUCCESS':
      case 'FIRST_SUCCESS': {
        // sunoData 배열에서 첫 번째 트랙의 audioUrl 추출
        const sunoData: {
          audioUrl?: string;
          sourceAudioUrl?: string;
          imageUrl?: string;
          title?: string;
        }[] = taskData?.response?.sunoData ?? [];

        const track = sunoData[0];
        const audioUrl = track?.audioUrl || track?.sourceAudioUrl;

        if (!audioUrl) {
          // URL 아직 없으면 pending 유지 (FIRST_SUCCESS지만 URL 미포함 경우)
          return NextResponse.json({ status: 'pending' } satisfies MusicStatusResponse);
        }

        return NextResponse.json({
          status: 'completed',
          audioUrl,
          coverUrl: track?.imageUrl,
          title: track?.title,
        } satisfies MusicStatusResponse);
      }

      // ── 진행 중 ────────────────────────────────────────
      case 'PENDING':
      case 'TEXT_SUCCESS':
        return NextResponse.json({ status: 'pending' } satisfies MusicStatusResponse);

      // ── 오류 ────────────────────────────────────────────
      case 'CREATE_TASK_FAILED':
        return NextResponse.json({
          status: 'error',
          error: `작업 생성 실패${errorMessage ? ': ' + errorMessage : ''}`,
        } satisfies MusicStatusResponse);

      case 'GENERATE_AUDIO_FAILED':
        return NextResponse.json({
          status: 'error',
          error: `오디오 생성 실패${errorMessage ? ': ' + errorMessage : ''}`,
        } satisfies MusicStatusResponse);

      case 'SENSITIVE_WORD_ERROR':
        return NextResponse.json({
          status: 'error',
          error: '가사에 금지 단어가 포함되어 있습니다. 가사를 수정해주세요.',
        } satisfies MusicStatusResponse);

      case 'CALLBACK_EXCEPTION':
        // 콜백 오류는 폴링으로 계속 확인
        return NextResponse.json({ status: 'pending' } satisfies MusicStatusResponse);

      default:
        console.warn('[music-poll] Unknown status:', status, errorMessage);
        return NextResponse.json({ status: 'pending' } satisfies MusicStatusResponse);
    }
  } catch (err) {
    console.error('[generate-music] GET error:', err);
    return NextResponse.json(
      { status: 'error', error: err instanceof Error ? err.message : '폴링 오류' },
      { status: 500 }
    );
  }
}
