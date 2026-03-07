'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useWebtoonStore } from '@/stores/webtoon-store';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, Badge, Button, Tooltip } from '@/components/ui-primitives';
import {
  Search,
  Bell,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Pencil,
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Heart,
  Settings,
  LogOut,
  LogIn,
  Plus,
  Zap,
  Home,
  Wand2,
  CreditCard,
  Coins,
} from 'lucide-react';

// =========================================================
// GlobalHeader - 네비게이션 헤더
// =========================================================
const NAV_LINKS = [
  { href: '/', label: '🏠 홈', icon: Home },
  { href: '/explore', label: '📚 웹툰 보기', icon: TrendingUp },
  { href: '/create/story', label: '✨ 이야기 만들기', icon: Wand2 },
  { href: '/myworks', label: '📊 내 작품', icon: LayoutDashboard },
  { href: '/payment', label: '💎 요금제', icon: CreditCard },
];

export const GlobalHeader: React.FC = () => {
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const { currentUser, notifications, searchQuery, setSearchQuery, setCurrentUserFromAuth, fetchWebtoons } =
    useWebtoonStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Auth 상태 → Store 동기화 + 데이터 로드
  useEffect(() => {
    setCurrentUserFromAuth(authUser as Parameters<typeof setCurrentUserFromAuth>[0]);
    fetchWebtoons();
  }, [authUser, setCurrentUserFromAuth, fetchWebtoons]);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header
      id="global-header"
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100"
    >
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-gray-900 hidden sm:block">
            WebtoonStudio
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div
          className={cn(
            'flex-1 max-w-sm ml-auto relative',
            searchFocused && 'max-w-xs'
          )}
        >
          <div
            className={cn(
              'flex items-center h-9 px-3 rounded-xl border bg-gray-50 gap-2 transition-all duration-200',
              searchFocused
                ? 'border-indigo-300 bg-white ring-2 ring-indigo-100 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              placeholder="작품, 작가 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
              id="header-search"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-200 rounded text-[10px] text-gray-500 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Create Button */}
          <Link href="/create/story">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              <span className="hidden sm:inline">✨ 이야기 만들기</span>
            </Button>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <Tooltip label="알림">
              <button
                id="notif-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>
            </Tooltip>

            {notifOpen && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>

          {/* Credit Badge + User Menu */}
          {currentUser ? (
            <>
              <Link href="/payment">
                <Tooltip label="AI 크레딧">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 transition-all cursor-pointer">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-black text-amber-700">
                      {currentUser.credits?.toLocaleString() ?? 0}
                    </span>
                  </div>
                </Tooltip>
              </Link>
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <Avatar
                    src={currentUser.avatarUrl}
                    name={currentUser.name}
                    size="sm"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <UserMenu
                    user={currentUser}
                    onClose={() => setUserMenuOpen(false)}
                    onSignOut={signOut}
                  />
                )}
              </div>
            </>
          ) : !authLoading ? (
            <Link href="/login">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all">
                <LogIn className="w-4 h-4" />
                로그인
              </button>
            </Link>
          ) : null}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

// =========================================================
// NotificationPanel - 알림 패널
// =========================================================
interface NotificationPanelProps {
  notifications: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message?: string;
    timestamp: string;
    isRead: boolean;
  }[];
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClose,
}) => {
  const { markNotificationRead } = useWebtoonStore();

  const typeStyles = {
    info: 'bg-blue-50 text-blue-500',
    success: 'bg-emerald-50 text-emerald-500',
    warning: 'bg-amber-50 text-amber-500',
    error: 'bg-red-50 text-red-500',
  };

  return (
    <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">알림</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            알림이 없습니다
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={cn(
                'px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors',
                !notif.isRead && 'bg-indigo-50/30'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                    typeStyles[notif.type]
                  )}
                >
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  )}
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// =========================================================
// UserMenu - 사용자 드롭다운 메뉴
// =========================================================
interface UserMenuProps {
  user: { name: string; email: string; plan: string; credits?: number; avatarUrl?: string };
  onClose: () => void;
  onSignOut?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onClose, onSignOut }) => {
  const PLAN_LABELS: Record<string, string> = {
    free: 'Free 플랜',
    pro: 'Pro 플랜',
    enterprise: 'Enterprise',
  };

  const menuItems = [
    { icon: LayoutDashboard, label: '대시보드', href: '/dashboard' },
    { icon: BookOpen, label: '내 작품', href: '/myworks' },
    { icon: Heart, label: '즐겨찾기', href: '/favorites' },
    { icon: CreditCard, label: '크레딧 충전', href: '/payment' },
    { icon: Settings, label: '설정', href: '/settings' },
  ];

  return (
    <div className="absolute top-12 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <Avatar src={user.avatarUrl} name={user.name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="pro">{PLAN_LABELS[user.plan] || user.plan}</Badge>
        </div>
      </div>

      {/* Credit Balance */}
      <Link href="/payment" onClick={onClose}>
        <div className="mx-3 my-2 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 transition-all cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-amber-600 font-semibold">AI 크레딧</p>
              <p className="text-base font-black text-amber-800">
                {user.credits?.toLocaleString() ?? 0}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">
            충전
          </span>
        </div>
      </Link>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>
      <div className="py-1 border-t border-gray-100">
        <button
          onClick={() => { onClose(); onSignOut?.(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </div>
  );
};

// =========================================================
// PageHeader - 페이지 헤더 섹션
// =========================================================
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumb,
  className,
}) => {
  return (
    <div className={cn('flex items-end justify-between gap-4 flex-wrap', className)}>
      <div>
        {breadcrumb && (
          <nav className="flex items-center gap-1.5 mb-2">
            {breadcrumb.map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <span className="text-gray-300">/</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-xs text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

// =========================================================
// GenreFilter - 장르 필터 탭
// =========================================================
const GENRES = [
  '전체',
  '판타지',
  '로맨스',
  '액션',
  '스릴러',
  '코미디',
  'SF',
  '일상',
  '드라마',
];

interface GenreFilterProps {
  selected: string | null;
  onSelect: (genre: string | null) => void;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {GENRES.map((genre) => {
        const isActive = genre === '전체' ? !selected : selected === genre;
        return (
          <button
            key={genre}
            onClick={() => onSelect(genre === '전체' ? null : genre)}
            id={`genre-filter-${genre}`}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200',
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
};
