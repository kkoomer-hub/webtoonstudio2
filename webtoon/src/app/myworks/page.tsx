'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlobalHeader } from '@/components/layout/header';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { BookOpen, Calendar, Clock, Sparkles, Music4 } from 'lucide-react';
import { Card, Badge, Button, EmptyState } from '@/components/ui-primitives';

interface StorySession {
  id: string;
  title: string | null;
  protagonist: string;
  music_url: string | null;
  cover_image_url: string | null;
  edited_image_url?: string | null;
  completed_at: string;
}

export default function MyWorksPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWorks() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('story_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch works:', error);
      } else if (data) {
        setSessions(data);
      }
      setIsLoading(false);
    }
    fetchWorks();
  }, [user]);

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

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <GlobalHeader />

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-indigo-600" />
              내 작품 갤러리
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              내가 AI와 함께 만든 이야기들을 다시 감상해 보세요.
            </p>
          </div>
        </div>

        {!user ? (
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title="로그인이 필요합니다"
            description="작품 갤러리를 보려면 먼저 로그인해 주세요."
            action={
              <Link href="/login">
                <Button variant="primary">로그인하기</Button>
              </Link>
            }
          />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-6 h-6" />}
            title="아직 만들어진 작품이 없습니다"
            description="첫 번째 AI 웹툰 에피소드를 만들어보세요!"
            action={
              <Link href="/create/story">
                <Button variant="primary">이야기 만들기</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/projects/${session.id}`} className="block h-full">
                  <Card hover className="h-full flex flex-col cursor-pointer transition-shadow hover:shadow-xl hover:shadow-indigo-100/50">
                    <div className="aspect-[3/4] rounded-t-[1.35rem] bg-gray-50 overflow-hidden relative">
                      {session.cover_image_url ? (
                        <img
                          src={session.cover_image_url}
                          alt={session.title || '웹툰 표지'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 font-medium">
                          NO IMAGE
                        </div>
                      )}
                      {session.music_url && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full p-2 text-white shadow-lg">
                          <Music4 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2 truncate">
                          {session.title || `${session.protagonist}의 이야기`}
                        </h3>
                        <div className="flex flex-col gap-1.5 mt-2">
                          <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            주인공: {session.protagonist}
                          </p>
                          {session.completed_at && (
                            <p className="text-xs text-gray-400 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.completed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
