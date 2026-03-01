'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStoryStore } from '@/stores/story-store';
import { GlobalHeader } from '@/components/layout/header';
import type { StoryPanel } from '@/app/api/generate-story/route';

// =========================================================
// 패널 번호 → 이모지/라벨
// =========================================================
const PANEL_INFO = [
  { emoji: '🌱', label: '시작', num: 1 },
  { emoji: '🌊', label: '사건 발생', num: 2 },
  { emoji: '🔥', label: '위기', num: 3 },
  { emoji: '🌈', label: '해결', num: 4 },
];

// =========================================================
// 세로형 스토리 카드
// =========================================================
const PanelRow: React.FC<{ panel: StoryPanel; index: number }> = ({ panel, index }) => {
  const info = PANEL_INFO[index];
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      className="flex gap-5 items-start"
    >
      {/* 왼쪽: 번호 배지 */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-indigo-200">
          {info.emoji}
        </div>
        <span className="text-[10px] font-bold text-gray-400">{info.num}컷</span>
        {index < 3 && (
          <div className="w-0.5 h-8 bg-indigo-100 rounded-full mt-1" />
        )}
      </div>

      {/* 오른쪽: 이야기 박스 */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 mb-2">
        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">
          {info.label}
        </p>
        <p className="text-base text-gray-800 leading-loose font-medium">
          {panel.story}
        </p>
      </div>
    </motion.div>
  );
};

// =========================================================
// Page
// =========================================================
export default function StoryResultPage() {
  const router = useRouter();
  const { input, panels } = useStoryStore();

  // 이야기가 없으면 입력 페이지로 이동
  useEffect(() => {
    if (!panels || panels.length === 0) {
      router.replace('/create/story');
    }
  }, [panels, router]);

  if (!panels || panels.length === 0) return null;

  return (
    <div className="min-h-screen bg-indigo-50/50">
      <GlobalHeader />

      {/* 상단 */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-indigo-100 px-4 py-10 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-black px-4 py-1.5 rounded-full border border-indigo-100 mb-4">
          ✏️ 이야기 확인 중
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
          {input.protagonist}의 4컷 이야기 🎭
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          이야기를 읽어보고 마음에 들면 아래 버튼을 눌러주세요
        </p>
      </motion.header>

      {/* 이야기 목록 — 세로 일렬 */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-2">
          {panels.map((panel, i) => (
            <PanelRow key={panel.panel} panel={panel} index={i} />
          ))}
        </div>

        {/* 하단 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            id="go-to-images-btn"
            onClick={() => router.push('/create/story/images')}
            className="h-14 px-10 rounded-2xl bg-indigo-600 text-white text-base font-black
              flex items-center justify-center gap-2
              hover:bg-indigo-700 active:scale-95 transition-all
              shadow-xl shadow-indigo-300"
          >
            🎨 이 이야기로 그림 만들기!
          </button>

          <button
            id="redo-story-btn"
            onClick={() => router.push('/create/story')}
            className="h-14 px-8 rounded-2xl border-2 border-gray-200 text-gray-600 text-base font-bold
              flex items-center justify-center gap-2
              hover:border-indigo-300 hover:text-indigo-700 hover:bg-white
              active:scale-95 transition-all"
          >
            🔄 이야기 다시 만들기
          </button>
        </motion.div>
      </main>
    </div>
  );
}
