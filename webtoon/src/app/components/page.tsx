'use client';

import React, { useState } from 'react';
import { SearchBar, WebtoonCard, EpisodeItem, UserMenu } from '@/components/common-ui';
import { GlobalHeader } from '@/components/layout/header';

type ShowcaseCardProps = {
  label: string;
  title: string;
  description: string;
  badge?: string;
};

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  label,
  title,
  description,
  badge,
}) => {
  return (
    <article className="card">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="card-label">{label}</p>
          <h3 className="card-title mt-1">{title}</h3>
        </div>
        {badge ? <span className="pill pill--accent">{badge}</span> : null}
      </header>
      <p className="card-body">{description}</p>
      <footer className="card-footer">
        <span>재사용 가능한 패턴</span>
        <span className="text-soft">/components 페이지</span>
      </footer>
    </article>
  );
};

type TabId = 'hot' | 'ai' | 'templates' | 'business';

const TAB_CONFIG: {
  id: TabId;
  label: string;
}[] = [
  { id: 'hot', label: 'HOT' },
  { id: 'ai', label: 'AI 기능' },
  { id: 'templates', label: '템플릿' },
  { id: 'business', label: '비즈니스' },
];

const TAB_CONTENT: Record<TabId, ShowcaseCardProps[]> = {
  hot: [
    {
      label: 'AI 도구',
      title: '대사 버블 자동 생성',
      description:
        '컷 이미지를 업로드하면 말풍선 위치와 크기를 추천해 주는 AI 도구 섹션.',
      badge: '추천',
    },
    {
      label: '템플릿',
      title: '썸네일 템플릿 콜렉션',
      description: '썸네일 스타일을 통일하기 위한 프리셋 콜렉션.',
    },
    {
      label: '워크플로우',
      title: '업로드 파이프라인 카드',
      description:
        '원고 업로드, 검수, 발행까지 한 번에 보여 주는 요약 카드 패턴.',
    },
  ],
  ai: [
    {
      label: 'AI 도구',
      title: '컷 리사이즈 & 리프레임',
      description:
        '세로/가로 비율에 맞춰 컷을 자동으로 리프레임하는 섹션 레이아웃.',
    },
    {
      label: 'AI 도구',
      title: '톤 & 채색 보정',
      description:
        '여러 컷을 한 번에 선택해 톤과 색감을 일괄 보정하는 기능 설명 카드.',
    },
    {
      label: 'AI 도구',
      title: '제목 카피 제안',
      description: '시놉시스를 기반으로 회차 제목 카피를 제안하는 카드.',
    },
  ],
  templates: [
    {
      label: '템플릿',
      title: '회차 카드 템플릿',
      description: '에피소드 리스트에서 반복해서 사용하는 카드 디자인.',
    },
    {
      label: '템플릿',
      title: '이벤트 배너 템플릿',
      description:
        '신규 연재, 시즌 완결, 굿즈 이벤트 등에 재사용 가능한 배너 영역.',
    },
    {
      label: '템플릿',
      title: '크로스 프로모션 블록',
      description:
        '다른 작품을 함께 홍보할 때 사용하는 가로형 추천 블록 구성.',
    },
  ],
  business: [
    {
      label: '비즈니스',
      title: '팀 협업 보드',
      description:
        '작가/편집/마케터가 함께 쓰는 대시보드 섹션 기본 레이아웃입니다.',
    },
    {
      label: '비즈니스',
      title: '요금제 카드',
      description:
        '프로, 스튜디오, 엔터프라이즈 등 요금제를 비교하는 카드 구성.',
    },
    {
      label: '비즈니스',
      title: '지표 하이라이트',
      description:
        '조회수, 구독 수, 전환율 등의 핵심 지표를 보여 주는 카드 그리드.',
    },
  ],
};

const COLOR_TOKENS = [
  { name: '--color-primary', role: '주요 액션 / 강조', token: 'var(--color-primary)' },
  {
    name: '--color-bg-soft',
    role: 'Hero 및 섹션 배경',
    token: 'var(--color-bg-soft)',
  },
  {
    name: '--color-surface-muted',
    role: '카드 / 패널 배경',
    token: 'var(--color-surface-muted)',
  },
  {
    name: '--color-text-strong',
    role: '타이틀 / 중요 텍스트',
    token: 'var(--color-text-strong)',
  },
  {
    name: '--color-text-muted',
    role: '보조 설명 텍스트',
    token: 'var(--color-text-muted)',
  },
  {
    name: '--color-text-soft',
    role: '보조 설명 텍스트',
    token: 'var(--color-text-soft)',
  },
];

const ColorSwatchRow: React.FC = () => {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-5">
      {COLOR_TOKENS.map((color) => (
        <div key={color.name} className="flex flex-col gap-2">
          <div
            className="h-16 rounded-xl border border-border shadow-sm"
            style={{ background: color.token }}
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-soft">{color.name}</p>
            <p className="text-xs text-muted">{color.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ButtonShowcase: React.FC = () => {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button className="btn btn-primary">Primary CTA</button>
      <button className="btn btn-outline">Outline</button>
      <button className="btn btn-ghost">Ghost</button>
      <button className="btn btn-ghost btn-pill-sm">Ghost / Small</button>
    </div>
  );
};

export default function ComponentsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('hot');

  const currentCards = TAB_CONTENT[activeTab];

  return (
    <main className="page-main">
      <GlobalHeader />
      <section className="page-section page-section--muted">
        <div className="page-section-inner hero">
          <div>
            <span className="hero-eyebrow">DESIGN SYSTEM</span>
            <h1 className="hero-title">
              웹툰 서비스를 위한
              <br />
              컴포넌트 플레이그라운드
            </h1>
            <p className="hero-subtitle">
              이 페이지는 공통 UI 컴포넌트와 패턴을 미리 확인하고 재사용하기 위한
              데모입니다. 실제 서비스 화면에서는 여기에서 정의한 패턴만
              가져다 쓰는 것을 목표로 합니다.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary h-12 px-8 text-base transition-all hover:scale-105 active:scale-95">
                주요 컴포넌트 살펴보기
              </button>
              <button className="btn btn-ghost border border-border-subtle bg-white/50 backdrop-blur-sm h-12 px-6">
                문서 가이드 보기
              </button>
            </div>
            <div className="hero-meta mt-6 flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/60 rounded-md border border-white/40 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                중앙화된 스타일 토큰
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/60 rounded-md border border-white/40 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                반복 사용 섹션
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/60 rounded-md border border-white/40 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                웹툰 전용 데이터 구조
              </span>
            </div>
          </div>

          <div className="hero-media animate-float backdrop-blur-md bg-white/30 border border-white/50 shadow-2xl">
            <div className="hero-media-toolbar border-b border-black/5 pb-3">
              <div className="hero-media-toolbar-dots">
                <span className="hero-media-toolbar-dot !bg-red-400/60" />
                <span className="hero-media-toolbar-dot !bg-yellow-400/60" />
                <span className="hero-media-toolbar-dot !bg-green-400/60" />
              </div>
              <span className="flex-1 text-center font-mono text-[10px] tracking-tight opacity-50">src/app/components/page.tsx</span>
            </div>

            <div className="hero-media-canvas !bg-transparent !p-0 gap-6">
              <div className="hero-media-card glass-panel--dark !p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold tracking-widest uppercase">Live Component</span>
                    <p className="hero-media-card-title mt-4 text-2xl leading-tight tracking-tight">
                      Hero + Card Grid
                      <br />
                      디자인 패턴
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="hero-media-sidebar flex flex-col justify-between py-2">
                <p className="hero-media-tag font-bold tracking-[0.2em] text-primary">PREVIEW</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: '랜딩', icon: '🏠', title: '웹툰 홈 Hero' },
                    { label: '기능', icon: '⚡', title: '핵심 기능 카드' },
                    { label: 'CTA', icon: '🚀', title: '시작 유도 섹션' },
                  ].map((item) => (
                    <div key={item.title} className="glass-panel !p-3 !gap-1.5 flex flex-col border-white/60 hover:bg-white transition-colors cursor-default">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{item.icon}</span>
                        <p className="text-[9px] uppercase tracking-widest font-bold text-soft">{item.label}</p>
                      </div>
                      <p className="text-[11px] font-bold text-strong">{item.title}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="page-section-inner">
          <header className="flex flex-col gap-2">
            <h2 className="heading-xl">기본 레이아웃 섹션</h2>
            <p className="subtitle">
              Hero 아래에 오는 기능 섹션, 탭 섹션, 카드 그리드를 공통 패턴으로
              정의합니다.
            </p>
          </header>

          <div className="tabs mt-8">
            <div className="tabs-list">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  className="tabs-trigger"
                  data-state={activeTab === tab.id ? 'active' : undefined}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tabs-panel">
              <div className="card-grid">
                {currentCards.map((card) => (
                  <ShowcaseCard key={card.title} {...card} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--muted">
        <div className="page-section-inner">
          <header className="flex flex-col gap-2">
            <h2 className="heading-xl">토큰 & 버튼 미리보기</h2>
            <p className="subtitle">
              색상, 타이포, 버튼 스타일을 한 번에 확인하고 재사용할 수 있도록
              정리한 섹션입니다. 새로운 화면을 만들기 전에 이 조합을 먼저
              참고하세요.
            </p>
          </header>

          <ColorSwatchRow />
          <ButtonShowcase />
        </div>
      </section>

      <section className="page-section">
        <div className="page-section-inner">
          <header className="flex flex-col gap-2">
            <h2 className="heading-xl">웹툰 특화 컴포넌트</h2>
            <p className="subtitle">
              웹툰 서비스의 핵심 경험을 위한 전용 디자인 요소들입니다.
            </p>
          </header>

          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div>
              <p className="font-semibold mb-4 text-sm uppercase tracking-wider text-soft">
                웹툰 카드 & 리스트
              </p>
              <div className="grid grid-cols-2 gap-4">
                <WebtoonCard
                  title="어느 날 공주가 되어버렸다"
                  author="플루토스"
                  badge="up"
                />
                <WebtoonCard
                  title="데뷔 못 하면 죽는 병 걸림"
                  author="백덕수"
                  badge="new"
                />
              </div>
            </div>

            <div>
              <p className="font-semibold mb-4 text-sm uppercase tracking-wider text-soft">
                회차 리스트 패턴
              </p>
              <div className="episode-list">
                <EpisodeItem
                  number={124}
                  title="124화 - 뜻밖의 재회"
                  date="2024.02.11"
                />
                <EpisodeItem
                  number={123}
                  title="123화 - 결전의 서막"
                  date="2024.02.04"
                />
                <EpisodeItem
                  number={122}
                  title="122화 - 폭풍 전야"
                  date="2024.01.28"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--muted">
        <div className="page-section-inner">
          <header className="flex flex-col gap-2">
            <h2 className="heading-xl">유틸리티 컴포넌트</h2>
            <p className="subtitle">
              어느 페이지에서나 범용적으로 사용할 수 있는 공통 요소들입니다.
            </p>
          </header>

          <div className="mt-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full">
              <p className="font-semibold mb-4 text-sm uppercase tracking-wider text-soft">
                글로벌 검색바
              </p>
              <SearchBar />
            </div>

            <div className="flex-1 w-full">
              <p className="font-semibold mb-4 text-sm uppercase tracking-wider text-soft">
                사용자 메뉴 & 프로필
              </p>
              <UserMenu />
            </div>
          </div>
        </div>
      </section>

      <footer className="page-footer">
        <div className="page-footer-inner">
          <div className="page-footer-meta">
            <h2 className="heading-md">Design System Playground</h2>
            <p className="subtitle">
              이 영역은 실제 서비스 푸터 스타일을 미리 조립해 보는 공간입니다.
              브랜드와 카피만 교체해서 사용할 수 있도록 설계되었습니다.
            </p>
          </div>

          <div className="page-footer-links-grid">
            <div>
              <p className="page-footer-column-title">제품</p>
              <a className="page-footer-link">웹툰 에디터</a>
              <a className="page-footer-link">에셋 라이브러리</a>
              <a className="page-footer-link">배포 도구</a>
            </div>
            <div>
              <p className="page-footer-column-title">리소스</p>
              <a className="page-footer-link">디자인 가이드</a>
              <a className="page-footer-link">단축키 모음</a>
              <a className="page-footer-link">자주 묻는 질문</a>
            </div>
            <div>
              <p className="page-footer-column-title">팀</p>
              <a className="page-footer-link">팀 소개</a>
              <a className="page-footer-link">채용 정보</a>
            </div>
          </div>
        </div>

        <div className="page-footer-bottom">
          <span>© {new Date().getFullYear()} Webtoon Studio. All rights reserved.</span>
          <div className="page-footer-bottom-links">
            <span>개인정보 처리방침</span>
            <span>이용약관</span>
            <span>쿠키 정책</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

