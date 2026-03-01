'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Webtoon, StudioProject } from '@/types';
import { Badge, Avatar, ProgressBar, Card } from '@/components/ui-primitives';
import {
  Heart,
  Eye,
  BookOpen,
  Clock,
  Star,
  MoreHorizontal,
  Pencil,
  Trash2,
  Share2,
} from 'lucide-react';

// =========================================================
// WebtoonCard - 웹툰 목록 카드
// =========================================================
interface WebtoonCardProps {
  webtoon: Webtoon;
  variant?: 'grid' | 'list' | 'compact';
  onFavorite?: (id: string) => void;
  onClick?: (webtoon: Webtoon) => void;
  showProgress?: boolean;
  readProgress?: number;
}

export const WebtoonCard: React.FC<WebtoonCardProps> = ({
  webtoon,
  variant = 'grid',
  onFavorite,
  onClick,
  showProgress = false,
  readProgress = 0,
}) => {
  const badgeLabels: Record<string, string> = {
    up: 'UP',
    new: 'NEW',
    completed: '완결',
    hot: '🔥HOT',
  };

  if (variant === 'list') {
    return (
      <div
        onClick={() => onClick?.(webtoon)}
        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
      >
        <div className="w-14 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 relative shadow-sm">
          {webtoon.coverUrl ? (
            <img
              src={webtoon.coverUrl}
              alt={webtoon.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-indigo-300">
              <BookOpen className="w-6 h-6" />
            </div>
          )}
          {webtoon.badge && (
            <div className="absolute top-1 left-1">
              <Badge variant={webtoon.badge} className="text-[8px] px-1">
                {webtoon.badge === 'completed' ? '완결' : webtoon.badge.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {webtoon.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{webtoon.author.name}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {(webtoon.totalViews / 1000000).toFixed(1)}M
            </span>
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" />
              {webtoon.rating}
            </span>
          </div>
          {showProgress && (
            <ProgressBar
              value={readProgress}
              size="sm"
              color="indigo"
              className="mt-2"
            />
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(webtoon.id);
          }}
          className="text-gray-300 hover:text-red-500 transition-colors p-1"
        >
          <Heart
            className={cn('w-4 h-4', webtoon.isFavorite && 'fill-red-500 text-red-500')}
          />
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        onClick={() => onClick?.(webtoon)}
        className="relative cursor-pointer group"
      >
        <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
          {webtoon.coverUrl ? (
            <img
              src={webtoon.coverUrl}
              alt={webtoon.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-indigo-200">
              <BookOpen className="w-10 h-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {webtoon.badge && (
          <div className="absolute top-2 right-2">
            <Badge variant={webtoon.badge}>
              {badgeLabels[webtoon.badge] || webtoon.badge}
            </Badge>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(webtoon.id);
          }}
          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-full p-1.5"
        >
          <Heart
            className={cn(
              'w-3.5 h-3.5',
              webtoon.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'
            )}
          />
        </button>
        <div className="mt-2 px-0.5">
          <h3 className="text-sm font-bold text-gray-900 truncate leading-tight">
            {webtoon.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{webtoon.author.name}</p>
          {showProgress && (
            <ProgressBar
              value={readProgress}
              size="sm"
              color="indigo"
              className="mt-1.5"
            />
          )}
        </div>
      </div>
    );
  }

  // Default: grid
  return (
    <div
      onClick={() => onClick?.(webtoon)}
      className="group cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 shadow-sm group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
        {webtoon.coverUrl ? (
          <img
            src={webtoon.coverUrl}
            alt={webtoon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-indigo-300">
            <BookOpen className="w-12 h-12" />
            <span className="text-xs font-medium">커버 없음</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {webtoon.badge && (
          <div className="absolute top-3 right-3">
            <Badge variant={webtoon.badge}>
              {badgeLabels[webtoon.badge] || webtoon.badge}
            </Badge>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(webtoon.id);
          }}
          className={cn(
            'absolute top-3 left-3 rounded-full p-1.5 backdrop-blur-sm transition-all duration-200',
            webtoon.isFavorite
              ? 'bg-red-500/90 opacity-100'
              : 'bg-white/70 opacity-0 group-hover:opacity-100'
          )}
        >
          <Heart
            className={cn(
              'w-3.5 h-3.5',
              webtoon.isFavorite ? 'fill-white text-white' : 'text-gray-600'
            )}
          />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {(webtoon.totalViews / 1000000).toFixed(1)}M
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {webtoon.rating}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2.5 px-0.5 flex flex-col gap-0.5">
        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {webtoon.title}
        </h3>
        <p className="text-xs text-gray-500">{webtoon.author.name}</p>
        {showProgress && (
          <ProgressBar
            value={readProgress}
            size="sm"
            color="indigo"
            className="mt-1"
          />
        )}
      </div>
    </div>
  );
};

// =========================================================
// ProjectCard - 스튜디오 프로젝트 카드
// =========================================================
interface ProjectCardProps {
  project: StudioProject;
  onOpen?: (project: StudioProject) => void;
  onDelete?: (projectId: string) => void;
  onShare?: (project: StudioProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpen,
  onDelete,
  onShare,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      hover
      padding="none"
      className="overflow-hidden group"
      onClick={() => onOpen?.(project)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-indigo-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Pencil className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xs font-medium text-indigo-300">
              {project.canvasWidth} × {project.canvasHeight}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs font-semibold">
            편집하러 가기 →
          </span>
        </div>
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={project.status === 'published' ? 'new' : 'draft'}>
            {project.status === 'published' ? '게시됨' : '초안'}
          </Badge>
        </div>
        {/* Menu Button */}
        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="w-8 h-8 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
            {menuOpen && (
              <div className="absolute top-10 right-0 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.(project);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Share2 className="w-4 h-4" /> 공유
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(project.id);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" /> 삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-900 truncate">{project.title}</h3>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(project.lastEditedAt)} 수정
        </p>
      </div>
    </Card>
  );
};

// =========================================================
// RankingCard - 순위 카드
// =========================================================
interface RankingCardProps {
  webtoon: Webtoon;
  rank: number;
  onClick?: (webtoon: Webtoon) => void;
}

export const RankingCard: React.FC<RankingCardProps> = ({
  webtoon,
  rank,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick?.(webtoon)}
      className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 -mx-3 px-3 rounded-xl transition-colors group"
    >
      <span
        className={cn(
          'text-xl font-black w-8 text-center flex-shrink-0',
          rank === 1 && 'text-amber-500',
          rank === 2 && 'text-slate-400',
          rank === 3 && 'text-orange-400',
          rank > 3 && 'text-gray-300'
        )}
      >
        {rank}
      </span>
      <div className="w-12 h-16 rounded-xl overflow-hidden bg-indigo-50 flex-shrink-0">
        {webtoon.coverUrl ? (
          <img
            src={webtoon.coverUrl}
            alt={webtoon.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-200">
            <BookOpen className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
          {webtoon.title}
        </h4>
        <p className="text-xs text-gray-500 truncate">{webtoon.author.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{webtoon.genre}</span>
          <span className="text-xs text-amber-500 flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400" />
            {webtoon.rating}
          </span>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// StatCard - 통계 카드
// =========================================================
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: 'indigo' | 'violet' | 'green' | 'amber';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'indigo',
  className,
}) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600',
    violet: 'bg-violet-50 text-violet-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <Card padding="md" className={cn('', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
          {trend !== undefined && (
            <p
              className={cn(
                'text-xs font-semibold mt-1',
                trend >= 0 ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% 전주 대비
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            colorStyles[color]
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

// =========================================================
// AuthorBadge - 작가 정보 컴포넌트
// =========================================================
interface AuthorBadgeProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const AuthorBadge: React.FC<AuthorBadgeProps> = ({
  name,
  avatarUrl,
  size = 'sm',
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Avatar
        src={avatarUrl}
        name={name}
        size={size === 'sm' ? 'xs' : 'sm'}
      />
      <span
        className={cn(
          'font-semibold text-gray-700',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        {name}
      </span>
    </div>
  );
};
