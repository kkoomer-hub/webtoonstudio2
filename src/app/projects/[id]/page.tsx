'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { GlobalHeader } from '@/components/layout/header';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Play, Pause, Music4 } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---
interface StorySession {
  id: string;
  title: string | null;
  protagonist: string;
  location: string;
  music_url: string | null;
  music_title: string | null;
  created_at: string;
  edited_image_url?: string | null;
}

interface StoryPanel {
  panel_number: number;
  story_text: string;
  image_url: string | null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const sessionId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [session, setSession] = useState<StorySession | null>(null);
  const [panels, setPanels] = useState<StoryPanel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchProject() {
      if (!sessionId) return;
      const supabase = createClient();

      // 세션 조회
      const { data: sessionData, error: sessionErr } = await supabase
        .from('story_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionErr || !sessionData) {
        console.error('Session fetch error:', sessionErr);
        setIsLoading(false);
        return;
      }
      setSession(sessionData);

      // 패널 조회
      const { data: panelsData, error: panelsErr } = await supabase
        .from('story_panels')
        .select('*')
        .eq('session_id', sessionId)
        .order('panel_number');

      if (!panelsErr && panelsData) {
        setPanels(panelsData);
      }
      setIsLoading(false);
    }
    fetchProject();
  }, [sessionId]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
        <GlobalHeader />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
        <GlobalHeader />
        <div className="flex-1 flex flex-col justify-center items-center">
          <p className="text-gray-500 font-medium mb-4">프로젝트를 찾을 수 없습니다.</p>
          <button onClick={() => router.push('/projects')} className="text-indigo-600 font-bold hover:underline">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const hasPanels = panels.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#Fdfdff]">
      <GlobalHeader />
      
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 lg:p-12">
        {/* 네비게이션 */}
        <button 
          onClick={() => router.push('/myworks')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 내 작품 갤러리로
        </button>

        {/* 헤더 (제목 및 오디오) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 truncate max-w-2xl">
              {session.title || '제목 없는 웹툰'}
            </h1>
            <p className="text-gray-500 font-medium flex items-center gap-3 text-sm">
              <span>주인공: <strong className="text-gray-700">{session.protagonist}</strong></span>
              <span>배경: <strong className="text-gray-700">{session.location}</strong></span>
              <span>• {new Date(session.created_at).toLocaleDateString()}</span>
            </p>
          </div>

          {session.music_url && (
            <div className="shrink-0 bg-white border border-indigo-100 rounded-2xl p-4 flex items-center gap-4 shadow-xl shadow-indigo-900/5">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Music4 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-[150px]">
                <p className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-1">Theme Song</p>
                <p className="font-bold text-gray-900 text-sm truncate max-w-[200px]">
                  {session.music_title || '생성된 주제가'}
                </p>
              </div>
              <button 
                onClick={toggleAudio}
                className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              <audio 
                ref={audioRef} 
                src={session.music_url} 
                onEnded={() => setIsPlaying(false)}
                className="hidden" 
              />
            </div>
          )}
        </div>

        {/* ── [신규] 말풍선 편집 완성본 표시 ── */}
        {session.edited_image_url && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/10 border border-indigo-100 p-4 md:p-8">
              <div className="flex items-center gap-2 mb-6 text-indigo-600">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">Webtoon Final Cut</span>
              </div>
              <Image 
                src={session.edited_image_url} 
                alt="말풍선이 포함된 완성 웹툰" 
                width={1200}
                height={800}
                unoptimized
                className="w-full h-auto rounded-3xl"
              />
            </div>
            <div className="mt-8 border-t border-gray-100 pt-12">
               <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                 스토리 상세 보기
               </h2>
            </div>
          </motion.div>
        )}

        {/* 컷 만화 뷰어 */}
        {hasPanels ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {panels.map((p) => (
              <motion.div 
                key={p.panel_number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: p.panel_number * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col"
              >
                <div className="bg-gray-50 aspect-square flex items-center justify-center relative p-8">
                  {p.image_url ? (
                    <Image 
                      src={p.image_url} 
                      alt={`패널 ${p.panel_number} 이미지`} 
                      fill
                      unoptimized
                      className="object-cover rounded-xl shadow-sm border border-gray-200"
                    />
                  ) : (
                    <div className="text-gray-300 font-medium">이미지가 없습니다.</div>
                  )}
                  {/* 패널 번호 배지 */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white text-gray-900 font-black rounded-full flex items-center justify-center shadow-md">
                    {p.panel_number}
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {p.story_text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 text-gray-500 font-medium">
            비어있는 프로젝트입니다.
          </div>
        )}
      </main>
    </div>
  );
}
