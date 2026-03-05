'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Play, Pause, Volume2, VolumeX,
  ChevronLeft, Loader2, Sparkles, CheckCircle2, Save, BookOpen,
} from 'lucide-react';
import { GlobalHeader } from '@/components/layout/header';
import { useStoryStore } from '@/stores/story-store';
import { useAuth } from '@/hooks/use-auth';
import type { Genre, GenerateMusicRequest, MusicTask, MusicStatusResponse } from '@/app/api/generate-music/route';

// =========================================================
// 장르 옵션
// =========================================================
const GENRES: { value: Genre; label: string; icon: string; desc: string }[] = [
  { value: 'k-pop',  label: 'K-Pop',   icon: '🎤', desc: '신나고 귀여운 케이팝 스타일' },
  { value: 'ballad', label: 'Ballad',  icon: '🎹', desc: '감동적이고 아름다운 발라드' },
  { value: 'hip-hop',label: 'Hip-Hop', icon: '🎧', desc: '신나는 힙합 비트' },
  { value: 'rock',   label: 'Rock',    icon: '🎸', desc: '강렬한 록 사운드' },
];

type MusicStatus = 'idle' | 'loading' | 'polling' | 'done' | 'error';

// =========================================================
// 파형 시각화 (Web Audio API + Canvas)
// =========================================================
const WaveformVisualizer: React.FC<{ audioRef: React.RefObject<HTMLAudioElement | null>; isPlaying: boolean }> = ({
  audioRef,
  isPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    // AudioContext 초기화 (1회)
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      const analyser = ctxRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const source = ctxRef.current.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctxRef.current.destination);
      sourceRef.current = source;
    }

    if (!isPlaying) {
      cancelAnimationFrame(animFrameRef.current);
      drawIdle(canvas);
      return;
    }

    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }

    const analyser = analyserRef.current!;
    const bufLen = analyser.frequencyBinCount;
    const dataArr = new Uint8Array(bufLen);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArr);

      const { width, height } = canvas;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, width, height);

      const barW = (width / bufLen) * 2.5;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const barH = (dataArr[i] / 255) * height;
        const hue = (i / bufLen) * 240 + 200; // 파랑~보라
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.85)`;
        ctx.beginPath();
        ctx.roundRect(x, height - barH, barW - 1, barH, 3);
        ctx.fill();
        x += barW + 1;
      }
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, audioRef]);

  const drawIdle = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    const bars = 60;
    const barW = (width / bars) - 1;
    for (let i = 0; i < bars; i++) {
      const h = Math.sin(i * 0.3) * 10 + 12;
      ctx.fillStyle = `hsla(${220 + i * 2}, 60%, 70%, 0.4)`;
      ctx.beginPath();
      ctx.roundRect(i * (barW + 1), height / 2 - h / 2, barW, h, 2);
      ctx.fill();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={80}
      className="w-full h-20 rounded-xl"
    />
  );
};

// =========================================================
// 오디오 플레이어
// =========================================================
const AudioPlayer: React.FC<{ audioUrl: string; title: string }> = ({ audioUrl, title }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      await a.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = v;
    setCurrentTime(v);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setMuted(v === 0);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-5 text-white space-y-4">
      {/* 제목 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Music className="w-5 h-5 text-indigo-300" />
        </div>
        <div>
          <p className="text-xs text-indigo-300 font-medium">지금 재생 중</p>
          <p className="font-black text-sm">{title}</p>
        </div>
      </div>

      {/* HTML5 Audio */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
        crossOrigin="anonymous"
      />

      {/* 파형 시각화 */}
      <WaveformVisualizer audioRef={audioRef} isPlaying={isPlaying} />

      {/* 진행 바 */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 rounded-full accent-indigo-400 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-indigo-300">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center justify-between">
        {/* 재생/일시정지 */}
        <button
          id="play-pause-btn"
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-white text-indigo-700 flex items-center justify-center
            hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-indigo-900/50"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        {/* 볼륨 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMuted(!muted);
              if (audioRef.current) audioRef.current.muted = !muted;
            }}
          >
            {muted ? <VolumeX className="w-4 h-4 text-indigo-300" /> : <Volume2 className="w-4 h-4 text-indigo-300" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={handleVolume}
            className="w-24 h-1.5 rounded-full accent-indigo-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

// =========================================================
// 4컷 이미지 미니 프리뷰
// — 에디터에서 저장한 합성 이미지(edited-webtoon)를 우선 표시
// — 없으면 원본 4컷 그리드 폴백
// =========================================================
const WebtoonPreview: React.FC = () => {
  const { panelImages } = useStoryStore();
  const [editedUrl, setEditedUrl] = useState<string | null>(null);

  useEffect(() => {
    import('idb-keyval').then(({ get }) => {
      get('edited-webtoon').then((saved) => {
        if (saved) setEditedUrl(saved as string);
      }).catch((e) => console.warn('idb-keyval read error:', e));
    });
  }, []);

  // ── 편집 완성본이 있으면 단일 이미지로 표시 ──
  if (editedUrl) {
    return (
      <div className="space-y-2">
        <div className="rounded-2xl overflow-hidden border border-indigo-400/30 shadow-xl shadow-indigo-900/40">
          <Image
            src={editedUrl}
            alt="말풍선이 추가된 완성 웹툰"
            width={800}
            height={1200}
            unoptimized
            className="w-full h-auto object-contain"
          />
        </div>
        <p className="text-center text-xs text-yellow-400/80 flex items-center justify-center gap-1">
          ✏️ 말풍선 편집이 적용된 최종 웹툰
        </p>
      </div>
    );
  }

  // ── 편집본 없으면 원본 4컷 그리드 ──
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden border border-gray-100/10 shadow-lg">
      {[0, 1, 2, 3].map((i) => {
        const img = panelImages[i];
        return (
          <div key={i} className="relative aspect-square bg-white/5">
            {img?.status === 'done' && img.imageUrl ? (
              <Image 
                src={img.imageUrl} 
                alt={`${i + 1}컷`} 
                fill 
                unoptimized 
                className="object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold">
                {i + 1}컷
              </div>
            )}
            <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] font-black flex items-center justify-center">
              {i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
};


// =========================================================
// 메인 페이지
// =========================================================
export default function MusicPage() {
  const router = useRouter();
  const { input, panels, saveCompletedWork } = useStoryStore();
  const { user } = useAuth();

  const [genre, setGenre] = useState<Genre>('k-pop');
  const [lyrics, setLyrics] = useState('');
  const [musicStatus, setMusicStatus] = useState<MusicStatus>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [musicTitle, setMusicTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isLyricsGenerating, setIsLyricsGenerating] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── 가사 생성 AI 호출 ──
  const handleGenerateLyrics = useCallback(async () => {
    if (!panels || panels.length === 0) return;
    setIsLyricsGenerating(true);
    try {
      const storySummary = panels.map((p, i) => `${i + 1}컷: ${p.story}`).join('\n');
      const res = await fetch('/api/generate-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protagonist: input.protagonist,
          location: input.location,
          incident: input.incident,
          story: storySummary,
        }),
      });
      const data = await res.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
      }
    } catch (error) {
      console.error('Lyrics generation failed:', error);
      // Fallback: 기존처럼 컷 나열
      const storyText = panels.map((p, i) => `[${i + 1}컷]\n${p.story}`).join('\n\n');
      setLyrics(storyText);
    } finally {
      setIsLyricsGenerating(false);
    }
  }, [panels, input]);

  // 페이지 진입 시 가사 자동 생성
  useEffect(() => {
    if (!panels || panels.length === 0) {
      router.replace('/create/story');
      return;
    }
    
    // 이미 가사가 있으면 (사용자 수정 등) 자동 생성 건너뜀
    if (!lyrics) {
      handleGenerateLyrics();
    }
    setMusicTitle(`${input.protagonist}의 웹툰 주제가`);
  }, [panels, input, router, handleGenerateLyrics, lyrics]);

  // 폴링 정리
  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  // ── 음악 생성 ────────────────────────────────────────────
  const handleGenerate = async () => {
    setMusicStatus('loading');
    setAudioUrl(null);
    setErrorMsg('');
    setIsDemoMode(false); // 이전 데모 상태 초기화

    try {
      const body: GenerateMusicRequest = { genre, lyrics, title: musicTitle };
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const task: MusicTask & { error?: string } = await res.json();
      if (task.error) throw new Error(task.error);

      // 데모 모드 — 즉시 URL 설정
      if (task.type === 'demo') {
        setIsDemoMode(true);
        setAudioUrl(task.demoUrl!);
        setMusicTitle(musicTitle || '웹툰 주제가 (데모)');
        setMusicStatus('done');
        return;
      }

      // Suno 폴링 시작
      setMusicStatus('polling');
      setIsDemoMode(false);
      startPolling(task.taskId!);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '음악 생성 오류');
      setMusicStatus('error');
    }
  };

  const startPolling = useCallback((taskId: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate-music?taskId=${taskId}`);
        const status: MusicStatusResponse = await res.json();

        if (status.status === 'completed' && status.audioUrl) {
          clearInterval(pollingRef.current!);
          setAudioUrl(status.audioUrl);
          if (status.title) setMusicTitle(status.title);
          setMusicStatus('done');
        } else if (status.status === 'error') {
          clearInterval(pollingRef.current!);
          setErrorMsg(status.error || '생성 실패');
          setMusicStatus('error');
        }
        // 'pending' → 계속 폴링
      } catch {
        clearInterval(pollingRef.current!);
        setMusicStatus('error');
        setErrorMsg('폴링 중 오류 발생');
      }
    }, 5000); // 5초마다 폴링
  }, []);

  if (!panels || panels.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950">
      <GlobalHeader />

      {/* 헤더 */}
      <section className="px-4 pt-10 pb-8 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {['① 이야기', '② 확인', '③ 그림', '④ 주제가'].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="w-4 h-0.5 bg-white/20" />}
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  i === 3 ? 'bg-yellow-400 text-yellow-900' : 'bg-white/10 text-white/50'
                }`}>{s}</div>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-xl shadow-yellow-900/40">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              🎵 웹툰 주제가 만들기
            </h1>
          </div>
          <p className="text-white/60 text-sm">
            AI가 웹툰에 딱 맞는 주제가를 작곡해드려요!
          </p>
        </motion.div>
      </section>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-4 pb-16">

        {/* 연결 고리 — 그림 → 주제가 */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <button
            onClick={() => router.push('/create/story/images')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 text-xs font-bold hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> 3. 웹툰 그림
          </button>
          <div className="flex gap-1">
            {[0,1,2,3,4].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-yellow-400"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold border border-yellow-400/30">
            <Music className="w-3.5 h-3.5" /> 4. 주제가
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* ── 왼쪽: 웹툰 큰 프리뷰 ── */}
          <div className="space-y-3">
            <h2 className="text-white/80 text-sm font-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-xs">🎨</span>
              완성된 4컷 웹툰
            </h2>
            <WebtoonPreview />
            <p className="text-white/40 text-xs text-center">
              이 웹툰에 어울리는 주제가가 만들어집니다 🎵
            </p>
          </div>

          {/* ── 오른쪽: 음악 생성 패널 ── */}
          <div className="space-y-5">
            <h2 className="text-white/80 text-sm font-black flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-yellow-400/20 flex items-center justify-center text-xs">🎵</span>
              주제가 설정
            </h2>

            {/* 장르 선택 — 왕쳕한 pill 버튼 1줄 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60">음악 장르</label>
              <div className="flex gap-2 flex-wrap">
                {GENRES.map((g) => (
                  <button
                    key={g.value}
                    id={`genre-${g.value}`}
                    onClick={() => setGenre(g.value)}
                    className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-bold border transition-all ${
                      genre === g.value
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/25 hover:text-white/70'
                    }`}
                  >
                    <span>{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div className="space-y-1.5">
              <label htmlFor="music-title" className="text-xs font-bold text-white/60">주제가 제목</label>
              <input
                id="music-title"
                type="text"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-10 text-sm text-white placeholder:text-white/30 outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/30"
                placeholder="주제가 제목을 입력하세요"
              />
            </div>

            {/* 가사 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="lyrics" className="text-xs font-bold text-white/60">
                  가사 / 이야기 내용
                </label>
                <button 
                  onClick={handleGenerateLyrics}
                  disabled={isLyricsGenerating}
                  className="text-[10px] font-black text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-lg border border-yellow-400/20 hover:bg-yellow-400/20 transition-all flex items-center gap-1"
                >
                  {isLyricsGenerating ? (
                    <><Loader2 className="w-2.5 h-2.5 animate-spin" /> 개사 중...</>
                  ) : (
                    <><Sparkles className="w-2.5 h-2.5" /> AI로 가사 다시 쓰기</>
                  )}
                </button>
              </div>
              <div className="relative group">
                <textarea
                  id="lyrics"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-yellow-400/50 resize-none leading-relaxed"
                  placeholder="음악에 담을 이야기나 가사를 입력하세요..."
                />
                {isLyricsGenerating && (
                  <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* 생성 버튼 */}
            <button
              id="generate-music-btn"
              onClick={handleGenerate}
              disabled={musicStatus === 'loading' || musicStatus === 'polling' || !lyrics.trim()}
              className={`w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all
                ${musicStatus === 'loading' || musicStatus === 'polling'
                  ? 'bg-yellow-400/20 text-yellow-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 hover:from-yellow-300 hover:to-orange-300 active:scale-95 shadow-xl shadow-yellow-900/40'
                }`}
            >
              {musicStatus === 'loading' && <><Loader2 className="w-5 h-5 animate-spin" /> 작곡 요청 중...</>}
              {musicStatus === 'polling' && <><Loader2 className="w-5 h-5 animate-spin" /> AI가 작곡하는 중... (최대 2분)</>}
              {(musicStatus === 'idle' || musicStatus === 'done' || musicStatus === 'error') && (
                <><Sparkles className="w-5 h-5" /> 🎵 주제가 작곡하기!</>
              )}
            </button>

            {/* 에러 */}
            <AnimatePresence>
              {musicStatus === 'error' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  ⚠️ {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 데모 안내 — KIE_SUNO_API_KEY 미설정 시에만 표시 */}
            {isDemoMode && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs leading-relaxed">
                💡 <strong className="text-white/70">데모 모드</strong>: 실제 KIE Suno AI 음악을 생성하려면{' '}
                <code className="bg-white/10 px-1 rounded">KIE_SUNO_API_KEY</code>를{' '}
                <code className="bg-white/10 px-1 rounded">.env.local</code>에 설정하세요.
                현재는 샘플 음악이 재생됩니다.
              </div>
            )}

            {/* ── 오디오 플레이어 + 가사 확인 ── */}
            <AnimatePresence>
              {musicStatus === 'done' && audioUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    주제가 완성! 지금 바로 들어보세요 🎧
                  </div>
                  <AudioPlayer audioUrl={audioUrl} title={musicTitle} />

                  {/* ── 작품 저장 버튼 ── */}
                  <div className="pt-2">
                    {saveStatus === 'saved' && savedId ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" /> 갤러리에 저장되었습니다!
                        </div>
                        <Link
                          href={`/projects/${savedId}`}
                          className="w-full h-11 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                        >
                          <BookOpen className="w-4 h-4" /> 갤러리에서 보기
                        </Link>
                      </div>
                    ) : (
                      <button
                        id="save-webtoon-btn"
                        disabled={saveStatus === 'saving' || !user}
                        onClick={async () => {
                          if (!user) return;
                          setSaveStatus('saving');

                          // 말풍선 편집 이미지가 있는지 확인 (IndexedDB에서 가져옴)
                          let editedUrl: string | undefined = undefined;
                          try {
                            const { get } = await import('idb-keyval');
                            const saved = await get('edited-webtoon');
                            if (saved) editedUrl = saved as string;
                          } catch (e) {
                            console.warn('idb-keyval read error for save:', e);
                          }

                          try {
                            const id = await saveCompletedWork({
                              userId: user.id,
                              musicUrl: audioUrl ?? undefined,
                              musicTitle,
                              musicGenre: genre,
                              editedWebtoonUrl: editedUrl,
                            });
                            if (id) { setSavedId(id); setSaveStatus('saved'); }
                            else setSaveStatus('error');
                          } catch { setSaveStatus('error'); }
                        }}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 hover:from-green-300 hover:to-emerald-400 disabled:opacity-50 shadow-lg shadow-green-900/30 transition-all"
                      >
                        {saveStatus === 'saving' ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
                        ) : saveStatus === 'error' ? (
                          '⚠️ 저장 실패 — 다시 시도'
                        ) : (
                          <><Save className="w-4 h-4" /> 🎉 작품 갤러리에 저장하기</>
                        )}
                      </button>
                    )}
                    {!user && <p className="text-center text-white/40 text-xs mt-2">저장하려면 로그인이 필요합니다</p>}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
