'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  TrendingUp,
  Heart,
  Star,
  BookOpen,
} from 'lucide-react';
import { GlobalHeader, PageHeader, GenreFilter } from '@/components/layout/header';
import { GlobalFooter } from '@/components/layout/footer';
import { WebtoonCard } from '@/components/webtoon-cards';
import { Button, Input, Tag, Spinner, EmptyState } from '@/components/ui-primitives';
import { useWebtoonStore } from '@/stores/webtoon-store';
import type { GenreType } from '@/types';

type SortType = 'trending' | 'rating' | 'views' | 'latest';

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'trending', label: '인기순' },
  { value: 'rating', label: '평점순' },
  { value: 'views', label: '조회수순' },
  { value: 'latest', label: '최신순' },
];

export default function ExplorePage() {
  const { webtoons, toggleFavorite, searchQuery, setSearchQuery, selectedGenre, setSelectedGenre } =
    useWebtoonStore();
  const [sort, setSort] = useState<SortType>('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let result = [...webtoons];

    // Search
    if (searchQuery) {
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Genre
    if (selectedGenre) {
      result = result.filter((w) => w.genre === selectedGenre);
    }

    // Sort
    switch (sort) {
      case 'trending':
        result.sort((a, b) => b.totalViews - a.totalViews);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'views':
        result.sort((a, b) => b.totalViews - a.totalViews);
        break;
      case 'latest':
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
    }

    return result;
  }, [webtoons, searchQuery, selectedGenre, sort]);

  return (
    <div className="min-h-screen bg-gray-50/40">
      <GlobalHeader />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-12 px-4">
        <div className="max-w-[1280px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            웹툰 탐색 🔍
          </h1>
          <p className="text-indigo-200 font-medium mb-6">
            장르, 평점, 최신작 등 다양한 기준으로 작품을 찾아보세요.
          </p>
          {/* Search */}
          <div className="flex items-center gap-2 bg-white rounded-2xl p-2 max-w-xl shadow-xl shadow-indigo-900/20">
            <Search className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
            <input
              type="text"
              id="explore-search"
              placeholder="작품명, 작가명, 태그 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400"
            />
            <Button variant="primary" size="sm" className="rounded-xl">
              검색
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
        {/* Filters Bar */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <GenreFilter
              selected={selectedGenre}
              onSelect={setSelectedGenre}
            />
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 outline-none focus:border-indigo-400 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {/* View Mode */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  id="explore-grid"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  id="explore-list"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active filters */}
          {(searchQuery || selectedGenre) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500">필터:</span>
              {searchQuery && (
                <Tag color="indigo" onRemove={() => setSearchQuery('')}>
                  검색: &quot;{searchQuery}&quot;
                </Tag>
              )}
              {selectedGenre && (
                <Tag color="violet" onRemove={() => setSelectedGenre(null)}>
                  장르: {selectedGenre}
                </Tag>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre(null);
                }}
                className="text-xs font-semibold text-red-400 hover:text-red-600"
              >
                전체 초기화
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm font-bold text-gray-900">
            {filteredAndSorted.length}개의 작품
          </span>
          {selectedGenre && (
            <span className="text-sm text-gray-500">· {selectedGenre} 장르</span>
          )}
        </div>

        {/* Results */}
        {filteredAndSorted.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title="검색 결과가 없습니다"
            description="다른 키워드나 장르로 검색해보세요."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre(null);
                }}
              >
                필터 초기화
              </Button>
            }
            className="py-24"
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredAndSorted.map((webtoon, i) => (
              <motion.div
                key={webtoon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <WebtoonCard
                  webtoon={webtoon}
                  variant="compact"
                  onFavorite={toggleFavorite}
                  showProgress
                  readProgress={Math.floor(Math.random() * 80)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {filteredAndSorted.map((webtoon, i) => (
              <motion.div
                key={webtoon.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <WebtoonCard
                  webtoon={webtoon}
                  variant="list"
                  onFavorite={toggleFavorite}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <GlobalFooter />
    </div>
  );
}
