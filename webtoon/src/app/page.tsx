'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Play,
  Zap,
  Users,
  Globe,
  ChevronRight,
  Star,
  BookOpen,
  Pencil,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { GlobalHeader } from '@/components/layout/header';
import { WebtoonCard } from '@/components/webtoon-cards';
import { Button, Badge, Tag } from '@/components/ui-primitives';
import { useWebtoonStore } from '@/stores/webtoon-store';

// =========================================================
// Feature Data
// =========================================================
const FEATURES = [
  {
    id: 'ai',
    icon: Sparkles,
    label: 'AI 이야기 만들기',
    color: 'indigo',
    title: '✨ AI가 이야기를 만들어줘요!',
    description:
      '주인공, 장소, 사건을 입력하면 AI가 재미있는 4컷 웹툰 이야기를 만들어줘요. 혼자서도 쉽게 만들 수 있어요!',
    gradient: 'from-indigo-500/10 to-purple-500/10',
    iconBg: 'bg-indigo-50 text-indigo-600',
  },
  {
    id: 'collab',
    icon: Users,
    label: '친구랑 같이',
    color: 'violet',
    title: '👫 친구와 함께 만들어요',
    description:
      '친구들과 함께 웹툰을 만들 수 있어요. 서로 의견을 나누면서 더 재미있는 이야기를 완성해봐요!',
    gradient: 'from-violet-500/10 to-pink-500/10',
    iconBg: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'publish',
    icon: Globe,
    label: '공유하기',
    color: 'green',
    title: '🌍 내 웹툰 공유하기',
    description:
      '완성된 웹툰을 친구들에게 바로 공유할 수 있어요. 내가 만든 작품을 모두에게 보여줘요!',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'analytics',
    icon: TrendingUp,
    label: '내 작품 보기',
    color: 'amber',
    title: '📊 내 작품 현황 보기',
    description:
      '얼마나 많은 친구들이 내 웹툰을 봤는지 알 수 있어요. 더 재미있는 웹툰을 만들기 위한 힌트를 얻어요!',
    gradient: 'from-amber-500/10 to-orange-500/10',
    iconBg: 'bg-amber-50 text-amber-600',
  },
];

const STATS = [
  { label: '어린이 작가', value: '12,000+' },
  { label: '완성된 웹툰', value: '50,000+' },
  { label: '이야기 읽기', value: '800,000+' },
  { label: '전국 학교', value: '450개' },
];

// =========================================================
// Main Landing Page
// =========================================================
export default function HomePage() {
  const { webtoons, toggleFavorite, getTrending } = useWebtoonStore();
  const [activeFeature, setActiveFeature] = useState('ai');

  const trending = getTrending().slice(0, 5);
  const currentFeature = FEATURES.find((f) => f.id === activeFeature) || FEATURES[0];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <GlobalHeader />

      {/* ===== Hero Section ===== */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[140px] opacity-60" />
          <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] bg-purple-100 rounded-full blur-[140px] opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-40" />
        </div>

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              ✨ AI 웹툰 만들기 — 어린이를 위한 창작 놀이터
            </div>

            {/* H1 */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-gray-900 mb-8">
              나만의{' '}
              <span className="relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-500">
                  웹툰 이야기를
                </span>
                <Sparkles className="absolute -top-6 -right-6 w-8 h-8 text-yellow-400 fill-yellow-400" />
              </span>
              {' '}AI랑 만들어요! 🎨
            </h1>

            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
              어려운 그림 실력이 없어도 괜찮아요! AI가 도와줄게요.
              <br className="hidden md:block" />
              주인공, 장소, 사건만 알려주면 멋진 웹툰 이야기가 완성돼요!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/create/story">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 text-base font-black rounded-2xl h-14 px-8"
                >
                  🎨 웹툰 이야기 만들기!
                </Button>
              </Link>
              <Link href="/explore">
                <button className="h-14 px-8 flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all group">
                  <BookOpen className="w-5 h-5" />
                  다른 웹툰 구경하기
                </button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                어린이들이 좋아해요!
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>무료로 이용 가능</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>쉽고 재미있어요 😊</span>
            </div>
          </motion.div>

          {/* Hero Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
            className="relative mt-20 w-full max-w-5xl"
          >
            <div className="rounded-[32px] border-[10px] border-white shadow-[0_50px_120px_rgba(91,108,255,0.15)] overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 aspect-[16/9] relative">
              {/* Studio Preview Mock */}
              <div className="absolute inset-0 flex">
                {/* Sidebar */}
                <div className="w-14 bg-gray-900 flex flex-col items-center py-4 gap-3">
                  {[Pencil, BookOpen, Sparkles, Zap].map((Icon, i) => (
                    <div
                      key={i}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        i === 0
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-500 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  ))}
                </div>
                {/* Canvas Area */}
                <div className="flex-1 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-4 grid grid-cols-2 gap-3">
                    {[
                      'from-indigo-200 to-blue-200',
                      'from-purple-200 to-pink-200',
                      'from-amber-200 to-orange-200',
                      'from-green-200 to-teal-200',
                    ].map((grad, i) => (
                      <div
                        key={i}
                        className={`bg-gradient-to-br ${grad} rounded-xl flex items-center justify-center shadow-inner`}
                      >
                        <BookOpen className="w-8 h-8 text-white/70" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right Panel */}
                <div className="w-44 bg-white border-l border-gray-200 p-3 flex flex-col gap-2 overflow-hidden">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    AI 생성
                  </div>
                  {['몽환적 스타일', '필름 필터', '애니 스타일'].map((s, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
                        i === 0
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                  <div className="mt-auto p-2 rounded-lg bg-indigo-600 text-white text-[10px] font-bold text-center">
                    ✨ 생성하기
                  </div>
                </div>
              </div>
              {/* Floating AI badge */}
              <div className="absolute top-6 right-52 bg-white rounded-xl shadow-xl px-3 py-2 flex items-center gap-2 border border-indigo-100">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-gray-700">AI 분석 완료</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Stats Section ===== */}
      <section className="py-16 bg-gray-50/80 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Feature Section ===== */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="new" className="mb-4">✨ 뭘 할 수 있어요?</Badge>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
              이런 걸 할 수 있어요!
            </h2>
            <p className="text-gray-500 text-lg font-medium max-w-xl mx-auto">
              처음이라도 괜찮아요. AI가 친절하게 도와줄게요! 😊
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {FEATURES.map((f) => (
              <button
                key={f.id}
                id={`feature-tab-${f.id}`}
                onClick={() => setActiveFeature(f.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                  activeFeature === f.id
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <f.icon className="w-4 h-4" />
                {f.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`grid md:grid-cols-2 gap-12 items-center bg-gradient-to-br ${currentFeature.gradient} rounded-[40px] p-10 md:p-16 border border-gray-100`}
            >
              <div>
                <div
                  className={`inline-flex w-14 h-14 rounded-2xl items-center justify-center ${currentFeature.iconBg} mb-6`}
                >
                  <currentFeature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4">
                  {currentFeature.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed font-medium">
                  {currentFeature.description}
                </p>
                <Link href="/studio" className="inline-flex items-center gap-2 mt-6 text-indigo-600 font-bold hover:gap-3 transition-all">
                  더 알아보기 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="aspect-[4/3] bg-white rounded-3xl shadow-xl flex items-center justify-center border border-white/80">
                <div className="flex flex-col items-center gap-4 text-gray-300">
                  <currentFeature.icon className="w-24 h-24" />
                  <span className="text-sm font-semibold">{currentFeature.label} 미리보기</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ===== Trending Webtoons ===== */}
      <section className="py-28 px-4 bg-gray-50/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                📚 지금 인기 있는 웹툰
              </h2>
              <p className="text-gray-500 font-medium mt-1">
                친구들이 많이 읽은 웹툰이에요!
              </p>
            </div>
            <Link
              href="/explore"
              className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:gap-3 transition-all"
            >
              전체보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {trending.map((webtoon) => (
              <WebtoonCard
                key={webtoon.id}
                webtoon={webtoon}
                variant="compact"
                onFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-28 px-4 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            지금 바로
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              웹툰 만들러 가요! 🚀
            </span>
          </h2>
          <p className="text-gray-400 text-lg font-medium mb-10 max-w-lg mx-auto">
            무료로 마음껏 사용할 수 있어요!
            나만의 웹툰 이야기를 AI와 함께 만들어봐요.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/create/story">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-indigo-50 font-black rounded-2xl h-14 px-10 text-base shadow-2xl"
              >
                🎨 이야기 만들기 시작!
              </Button>
            </Link>
            <Link href="/explore">
              <button className="h-14 px-8 rounded-2xl border border-white/10 text-white font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
                <BookOpen className="w-5 h-5" /> 다른 웹툰 보기
              </button>
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-8 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> 어린이가 안전하게 이용할 수 있어요 😊
          </p>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-white border-t border-gray-100 py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg text-gray-900">WebtoonStudio</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              AI 기반 웹툰 제작 플랫폼. 모든 창작자의 꿈을 현실로 만듭니다.
            </p>
            <div className="flex gap-2 mt-4">
              {['TW', 'IG', 'YT'].map((s) => (
                <div
                  key={s}
                  className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {[
            { title: '서비스', items: ['스튜디오', '탐색', '대시보드', '요금제'] },
            { title: '리소스', items: ['튜토리얼', '에셋 라이브러리', 'API 문서', '커뮤니티'] },
            { title: '회사', items: ['소개', '채용', '뉴스룸', '고객센터'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-gray-500 hover:text-indigo-600 cursor-pointer transition-colors font-medium"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>© 2026 WebtoonStudio Corp. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-gray-600 cursor-pointer">이용약관</span>
            <span className="hover:text-gray-600 cursor-pointer">개인정보처리방침</span>
            <span className="hover:text-gray-600 cursor-pointer">쿠키 정책</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
