## Webtoon Design System

이 문서는 `src/app/global.css`와 `/components` 데모 페이지를 기준으로, 앞으로 프로젝트 전체에서 재사용할 디자인 시스템을 정의합니다.

---

## 1. 설계 철학

- **프리미엄 디자인, 직접 구현**: 최신 트렌드의 세련된 느낌을 참고하되, CSS와 컴포넌트는 모두 자체 구현한다.
- **중앙화된 토큰**: 색상, 타이포, 간격, 그림자는 모두 `global.css`의 CSS 변수로만 정의하고, 개별 컴포넌트에서는 토큰만 사용한다.
- **레이아웃/컴포넌트 분리**: 레이아웃(`page-*`, `hero-*`)과 내용 컴포넌트(`card-*`, `btn`, `tabs-*`)를 분리해서 조합 가능하게 만든다.
- **Tailwind와 공존**: 세밀한 spacing/정렬은 Tailwind 유틸리티를 쓰되, 토큰·레이아웃·컴포넌트의 정체성은 전부 `global.css` 클래스로 유지한다.

---

## 2. 전역 토큰 (`global.css`)

> 파일: `src/app/global.css` (`:root` 에 정의)

- **색상**
  - 배경: `--color-bg`, `--color-bg-soft`, `--color-surface`, `--color-surface-muted`
  - 경계: `--color-border-subtle`, `--color-border-strong`
  - 프라이머리: `--color-primary`, `--color-primary-soft`, `--color-primary-strong`, `--color-primary-on`
  - 상태색: `--color-success`, `--color-warning`, `--color-danger`
  - 텍스트: `--color-text-strong`, `--color-text`, `--color-text-muted`, `--color-text-soft`
  - 링크: `--color-link`, `--color-link-hover`

- **타이포그래피**
  - 폰트: `--font-sans`
  - 폰트 크기: `--font-size-xs` ~ `--font-size-3xl`
  - 줄높이: `--line-height-tight`, `--line-height-snug`, `--line-height-normal`

- **레이디우스 & 섀도우**
  - Radius: `--radius-xs`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`
  - Shadow: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

- **간격 스케일**
  - `--space-1` ~ `--space-16` (4px 단위 증가)

> **규칙**: 새로운 색상/간격이 필요하면 먼저 `global.css`의 토큰을 추가한 뒤, 컴포넌트는 반드시 해당 토큰을 참조해서 사용한다.

---

## 3. 레이아웃 패턴

### 3.1 페이지 쉘

- `page-shell`: `body` 전체를 감싸는 루트 컨테이너 (보통 `layout.tsx`에서 사용)
- `page-main`: 메인 콘텐츠 영역. 각 페이지의 `main` 요소에 적용.

### 3.2 공통 섹션

- `page-section`: 수직 패딩(상하), 좌우 여백이 적용된 기본 섹션
- `page-section-inner`: 가운데 1120px max-width 컨테이너
- `page-section--muted`: Hero, 하이라이트 섹션에 쓰이는 그라디언트 배경

### 3.3 헤더 & 푸터

- `page-header`, `page-header-inner`, `page-header-nav`, `page-header-nav-link`, `page-header-actions`
  - 상단 고정 헤더의 기본 구조
- `page-footer`, `page-footer-inner`, `page-footer-meta`, `page-footer-links-grid`,
  `page-footer-column-title`, `page-footer-link`, `page-footer-bottom`, `page-footer-bottom-links`
  - 랜딩/서비스 공통 푸터에 재사용

> **사용 원칙**: 새로운 페이지를 만들 때는 우선 `page-section` / `page-section-inner` 조합으로 섹션을 만들고, 세부 정렬만 Tailwind로 조정한다.

---

## 4. 컴포넌트 패턴

### 4.1 버튼 (`.btn*`)

- 기본 클래스: `btn`
- 변형:
  - `btn-primary`: 그라디언트 프라이머리 CTA 버튼
  - `btn-ghost`: 투명 배경, 텍스트 버튼
  - `btn-outline`: 라인 버튼
  - `btn-pill-sm`: 작은 pill 형태 버튼 (다른 변형과 조합)

**예시**

- 주요 CTA: `className="btn btn-primary"`
- 서브 액션: `className="btn btn-ghost btn-pill-sm"`

### 4.2 Pill / Tag

- 기본: `pill`
- 강조: `pill pill--accent`
  - 탭 상단 라벨, Hero 메타 태그, 카드의 상태 표시 등에 재사용

### 4.3 카드 및 그리드

- 컨테이너:
  - `card-grid`: 3열 그리드 (반응형에서 2→1열로 축소)
  - `card`: 둥근 모서리 + 그림자 카드
- 서브 요소:
  - `card-label`: 상단 작은 라벨 (대문자)
  - `card-title`: 한 줄 제목
  - `card-body`: 설명 텍스트
  - `card-footer`: 카드 하단 메타 정보/링크 영역

> `/components` 페이지의 `ShowcaseCard` 컴포넌트가 기준 구현체이며,
> 실제 기능 카드, 요금제 카드, 템플릿 카드 등은 이 패턴을 확장해서 사용한다.

### 4.4 Hero 패턴

- 구조:
  - `hero`: 좌/우 2열 그리드, 모바일에서는 1열
  - 좌측 텍스트:
    - `hero-eyebrow`, `hero-title`, `hero-subtitle`, `hero-actions`, `hero-meta`
  - 우측 미디어:
    - `hero-media`, `hero-media-toolbar`, `hero-media-toolbar-dots`, `hero-media-toolbar-dot`,
      `hero-media-canvas`, `hero-media-card`, `hero-media-card-title`,
      `hero-media-sidebar`, `hero-media-tag`

> 홈, 기능 소개, 요금제 랜딩 등 “대형 Hero + 썸네일/프리뷰”가 필요한 모든 페이지에 재사용한다.

### 4.5 탭 패턴

- 컨테이너:
  - `tabs`: 상단 탭 + 하단 컨텐츠 래퍼
  - `tabs-list`: pill 형태의 탭 바
  - `tabs-trigger`: 각 탭 버튼, `data-state="active"` 시 활성 스타일
  - `tabs-panel`: 탭 내용 컨테이너

> 탭의 실제 상태 관리는 React/상태관리로 구현하되, 시각적 스타일은 이 클래스를 사용한다.

---

## 5. `/components` 페이지 구조

> 파일: `src/app/components/page.tsx`

- Hero: 디자인 시스템의 목적과 사용법 소개
- Tabs + Card Grid: 기능/템플릿/AI 등 카테고리별 컴포넌트 패턴 샘플
- Footer: 실제 서비스에 바로 이식 가능한 푸터 레이아웃

**역할**

- 디자이너/개발자가 공통 컴포넌트를 미리 확인하는 “플레이그라운드”
- 새로운 화면을 만들 때, 먼저 여기서 원하는 패턴을 골라서 복사/조합

---

## 6. 사용 규칙

1. **새 컴포넌트는 먼저 패턴 찾기**
   - 버튼/카드/레이아웃을 새로 만들기 전에 `/components`에서 가장 가까운 패턴을 선택한다.
2. **토큰 확장 우선**
   - 색상을 바꾸고 싶다면 컴포넌트에서 직접 hex를 쓰지 말고, `src/app/global.css` 토큰을 확장한다.
3. **Tailwind는 보조 수단**
   - spacing, flex 정렬, responsive utility 수준까지만 Tailwind를 사용한다.
   - 디자인 정체성(색, radius, 그림자)은 `global.css`에만 정의한다.
4. **변경 시 문서 업데이트**
   - `global.css`나 `/components`에 의미 있는 변경이 생기면,
     이 파일(`design-system.md`)의 해당 섹션도 함께 갱신한다.

---

## 7. 앞으로의 확장 아이디어

- 상태별 버튼(로딩, 비활성, 위험)을 `btn` 계열로 정리
- 토글, 배지, 배너, 스텝 표시, 프로그레스 바 등 웹툰 워크플로우에 특화된 컴포넌트 추가
- 다크 모드 대응을 위한 토큰 세트 분리 (`.dark` 컨텍스트와 연동)
