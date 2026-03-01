'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Eye,
  Heart,
  TrendingUp,
  BookOpen,
  Pencil,
  Sparkles,
  Grid,
  List,
  LayoutGrid,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { GlobalHeader } from '@/components/layout/header';
import { PageHeader } from '@/components/layout/header';
import { ProjectCard, StatCard, WebtoonCard, RankingCard } from '@/components/webtoon-cards';
import { Button, EmptyState, Divider, Card, Badge } from '@/components/ui-primitives';
import { useWebtoonStore } from '@/stores/webtoon-store';
import type { StudioProject } from '@/types';

type ViewMode = 'grid' | 'list';

// =========================================================
// Quick Action Button
// =========================================================
const QuickAction = ({
  icon: Icon,
  label,
  href,
  color,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
}) => (
  <Link
    href={href}
    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-600">
      {label}
    </span>
  </Link>
);

// =========================================================
// New Project Modal (간소화)
// =========================================================
const NewProjectModal = ({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string) => void;
}) => {
  const [title, setTitle] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-xl font-black text-gray-900 mb-2">새 프로젝트 만들기</h2>
        <p className="text-sm text-gray-500 mb-6">새로운 웹툰 에피소드를 시작하세요.</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              프로젝트 이름
            </label>
            <input
              type="text"
              id="new-project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 판타지 웹툰 1화"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (title.trim()) {
                  onCreate(title.trim());
                  onClose();
                }
              }}
              disabled={!title.trim()}
              className="flex-1"
            >
              만들기
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// =========================================================
// Dashboard Page
// =========================================================
export default function DashboardPage() {
  const {
    projects,
    webtoons,
    currentUser,
    addProject,
    deleteProject,
    toggleFavorite,
    getTrending,
    getFavorites,
  } = useWebtoonStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const trending = getTrending().slice(0, 5);
  const favorites = getFavorites();

  const handleCreateProject = (title: string) => {
    const newProject: StudioProject = {
      id: `proj-${Date.now()}`,
      title,
      lastEditedAt: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      canvasWidth: 800,
      canvasHeight: 1200,
      panels: [],
      status: 'draft',
    };
    addProject(newProject);
  };

  // Stats
  const totalViews = webtoons.reduce((acc, w) => acc + w.totalViews, 0);
  const totalLikes = webtoons.reduce((acc, w) => acc + w.totalLikes, 0);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? '좋은 아침이에요'
      : greetingHour < 18
      ? '좋은 오후에요'
      : '좋은 저녁이에요';

  return (
    <div className="min-h-screen bg-gray-50/50">
      <GlobalHeader />

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* ===== Left Column ===== */}
        <div className="space-y-8">

          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
            <div className="relative z-10">
              <p className="text-indigo-200 text-sm font-semibold mb-2">
                {greeting}, {currentUser?.name || '창작자'}님 👋
              </p>
              <h1 className="text-2xl md:text-3xl font-black mb-4 leading-tight">
                오늘도 멋진 작품을
                <br />
                만들어볼까요?
              </h1>
              <Link href="/studio">
                <Button
                  className="bg-white text-indigo-700 hover:bg-indigo-50 font-black rounded-xl"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  새 에피소드 작업하기
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
              활동 요약
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="총 조회수"
                value={`${(totalViews / 1000000).toFixed(0)}M`}
                icon={<Eye className="w-5 h-5" />}
                trend={12}
                color="indigo"
              />
              <StatCard
                label="총 좋아요"
                value={`${(totalLikes / 1000000).toFixed(1)}M`}
                icon={<Heart className="w-5 h-5" />}
                trend={8}
                color="violet"
              />
              <StatCard
                label="내 프로젝트"
                value={projects.length}
                icon={<Pencil className="w-5 h-5" />}
                color="amber"
              />
              <StatCard
                label="즐겨찾기"
                value={favorites.length}
                icon={<BookOpen className="w-5 h-5" />}
                color="green"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">
              빠른 실행
            </h2>
            <div className="grid grid-cols-4 gap-3">
              <QuickAction
                icon={Plus}
                label="새 프로젝트"
                href="#"
                color="bg-indigo-50 text-indigo-600"
              />
              <QuickAction
                icon={Sparkles}
                label="AI 생성"
                href="/studio"
                color="bg-violet-50 text-violet-600"
              />
              <QuickAction
                icon={BookOpen}
                label="내 작품"
                href="/explore"
                color="bg-amber-50 text-amber-600"
              />
              <QuickAction
                icon={TrendingUp}
                label="분석 보기"
                href="#"
                color="bg-emerald-50 text-emerald-600"
              />
            </div>
          </div>

          {/* Projects */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black text-gray-900">내 프로젝트</h2>
                <p className="text-xs text-gray-500 mt-0.5">최근 수정순</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <button
                    id="view-grid"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-400'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    id="view-list"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-400'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowNewProjectModal(true)}
                  id="new-project-btn"
                >
                  새 프로젝트
                </Button>
              </div>
            </div>

            {projects.length === 0 ? (
              <EmptyState
                icon={<Pencil className="w-6 h-6" />}
                title="아직 프로젝트가 없습니다"
                description="첫 번째 웹툰 에피소드를 만들어보세요!"
                action={
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowNewProjectModal(true)}
                  >
                    새 프로젝트 만들기
                  </Button>
                }
              />
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5'
                    : 'flex flex-col gap-3'
                }
              >
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {viewMode === 'grid' ? (
                      <ProjectCard
                        project={project}
                        onOpen={(p) => console.log('Open:', p.id)}
                        onDelete={deleteProject}
                        onShare={(p) => console.log('Share:', p.id)}
                      />
                    ) : (
                      <Card padding="sm" hover>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <Pencil className="w-6 h-6 text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              {project.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {project.lastEditedAt} 수정
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={project.status === 'published' ? 'new' : 'draft'}>
                              {project.status === 'published' ? '게시됨' : '초안'}
                            </Badge>
                            <Link href="/studio">
                              <Button variant="ghost" size="icon">
                                <ArrowUpRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== Right Sidebar ===== */}
        <div className="space-y-6">
          {/* Trending */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                실시간 인기 순위
              </h3>
              <Link
                href="/explore"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                전체보기
              </Link>
            </div>
            <div>
              {trending.map((webtoon, i) => (
                <RankingCard
                  key={webtoon.id}
                  webtoon={webtoon}
                  rank={i + 1}
                />
              ))}
            </div>
          </Card>

          {/* Favorites */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                즐겨찾기
              </h3>
              <span className="text-xs font-semibold text-gray-400">
                {favorites.length}개
              </span>
            </div>
            {favorites.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">
                즐겨찾기한 작품이 없습니다
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {favorites.slice(0, 6).map((w) => (
                  <WebtoonCard
                    key={w.id}
                    webtoon={w}
                    variant="compact"
                    onFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* AI Upgrade Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <Sparkles className="w-8 h-8 mb-3 relative z-10" />
            <h3 className="font-black text-base mb-1 relative z-10">AI Pro로 업그레이드</h3>
            <p className="text-violet-200 text-xs mb-4 relative z-10 leading-relaxed">
              무제한 AI 생성, 고급 편집 도구, 우선 지원을 받으세요.
            </p>
            <Button
              className="bg-white text-violet-700 hover:bg-violet-50 font-black w-full rounded-xl relative z-10"
              size="sm"
            >
              지금 업그레이드
            </Button>
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}
