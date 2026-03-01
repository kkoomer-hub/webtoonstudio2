-- =========================================================
-- 001_initial_schema.sql
-- 웹툰 플랫폼 초기 스키마
-- =========================================================

-- UUID 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. users — 사용자
-- =========================================================
CREATE TABLE IF NOT EXISTS public.users (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text NOT NULL,
  email      text UNIQUE NOT NULL,
  avatar_url text,
  plan       text NOT NULL DEFAULT 'free'
               CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- 2. authors — 웹툰 작가
-- =========================================================
CREATE TABLE IF NOT EXISTS public.authors (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text NOT NULL,
  avatar_url text,
  bio        text
);

-- =========================================================
-- 3. webtoons — 웹툰 작품
-- =========================================================
CREATE TABLE IF NOT EXISTS public.webtoons (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         text NOT NULL,
  author_id     uuid REFERENCES public.authors(id) ON DELETE SET NULL,
  cover_url     text,
  genre         text NOT NULL DEFAULT '일상',
  tags          text[] DEFAULT '{}',
  synopsis      text DEFAULT '',
  rating        numeric(2,1) DEFAULT 0.0,
  total_views   bigint DEFAULT 0,
  total_likes   bigint DEFAULT 0,
  episode_count int DEFAULT 0,
  status        text NOT NULL DEFAULT 'ongoing'
                  CHECK (status IN ('ongoing', 'completed', 'hiatus')),
  badge         text CHECK (badge IN ('up', 'new', 'completed', 'hot', NULL)),
  is_adult      boolean DEFAULT false,
  published_at  timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- =========================================================
-- 4. episodes — 에피소드
-- =========================================================
CREATE TABLE IF NOT EXISTS public.episodes (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  webtoon_id    uuid NOT NULL REFERENCES public.webtoons(id) ON DELETE CASCADE,
  number        int NOT NULL,
  title         text NOT NULL,
  thumbnail_url text,
  views         bigint DEFAULT 0,
  likes         bigint DEFAULT 0,
  is_free       boolean DEFAULT true,
  status        text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('published', 'draft', 'scheduled')),
  published_at  timestamptz DEFAULT now(),
  UNIQUE (webtoon_id, number)
);

-- =========================================================
-- 5. favorites — 즐겨찾기 (다대다)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  user_id    uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  webtoon_id uuid NOT NULL REFERENCES public.webtoons(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, webtoon_id)
);

-- =========================================================
-- 6. studio_projects — 스튜디오 프로젝트
-- =========================================================
CREATE TABLE IF NOT EXISTS public.studio_projects (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title         text NOT NULL DEFAULT '새 프로젝트',
  webtoon_id    uuid REFERENCES public.webtoons(id) ON DELETE SET NULL,
  thumbnail_url text,
  canvas_width  int DEFAULT 800,
  canvas_height int DEFAULT 1200,
  panels        jsonb DEFAULT '[]'::jsonb,
  status        text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published')),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- =========================================================
-- 7. story_sessions — AI 스토리 생성 세션
-- =========================================================
CREATE TABLE IF NOT EXISTS public.story_sessions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES public.users(id) ON DELETE CASCADE,
  protagonist     text NOT NULL,
  location        text NOT NULL,
  time_background text NOT NULL,
  incident        text NOT NULL,
  created_at      timestamptz DEFAULT now()
);

-- =========================================================
-- 8. story_panels — 생성된 4컷 패널
-- =========================================================
CREATE TABLE IF NOT EXISTS public.story_panels (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      uuid NOT NULL REFERENCES public.story_sessions(id) ON DELETE CASCADE,
  panel_number    int NOT NULL CHECK (panel_number BETWEEN 1 AND 4),
  story_text      text NOT NULL DEFAULT '',
  image_prompt    text DEFAULT '',
  image_url       text,
  speech_bubbles  jsonb DEFAULT '[]'::jsonb,
  UNIQUE (session_id, panel_number)
);

-- =========================================================
-- 9. generated_music — 생성된 음악
-- =========================================================
CREATE TABLE IF NOT EXISTS public.generated_music (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  uuid REFERENCES public.story_sessions(id) ON DELETE CASCADE,
  genre       text NOT NULL DEFAULT 'k-pop',
  title       text NOT NULL DEFAULT '',
  lyrics      text DEFAULT '',
  task_id     text,
  audio_url   text,
  cover_url   text,
  status      text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'completed', 'error')),
  created_at  timestamptz DEFAULT now()
);

-- =========================================================
-- Indexes
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_webtoons_genre      ON public.webtoons (genre);
CREATE INDEX IF NOT EXISTS idx_webtoons_status     ON public.webtoons (status);
CREATE INDEX IF NOT EXISTS idx_webtoons_author     ON public.webtoons (author_id);
CREATE INDEX IF NOT EXISTS idx_episodes_webtoon    ON public.episodes (webtoon_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user      ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_studio_projects_user ON public.studio_projects (user_id);
CREATE INDEX IF NOT EXISTS idx_story_sessions_user ON public.story_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_story_panels_session ON public.story_panels (session_id);
CREATE INDEX IF NOT EXISTS idx_generated_music_session ON public.generated_music (session_id);

-- =========================================================
-- RLS (Row Level Security) 활성화
-- =========================================================
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_panels     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_music  ENABLE ROW LEVEL SECURITY;

-- webtoons, authors, episodes는 공개 읽기
ALTER TABLE public.authors  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webtoons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RLS Policies
-- =========================================================

-- users: 본인만 읽기/쓰기
CREATE POLICY "users_select_own"  ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own"  ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own"  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- authors: 모두 읽기
CREATE POLICY "authors_select_all" ON public.authors FOR SELECT USING (true);

-- webtoons: 모두 읽기
CREATE POLICY "webtoons_select_all" ON public.webtoons FOR SELECT USING (true);

-- episodes: 모두 읽기
CREATE POLICY "episodes_select_all" ON public.episodes FOR SELECT USING (true);

-- favorites: 본인만
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- studio_projects: 본인만
CREATE POLICY "studio_select_own" ON public.studio_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "studio_insert_own" ON public.studio_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "studio_update_own" ON public.studio_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "studio_delete_own" ON public.studio_projects FOR DELETE USING (auth.uid() = user_id);

-- story_sessions: 본인만
CREATE POLICY "story_sessions_select_own" ON public.story_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "story_sessions_insert_own" ON public.story_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "story_sessions_delete_own" ON public.story_sessions FOR DELETE USING (auth.uid() = user_id);

-- story_panels: 본인 세션의 패널만
CREATE POLICY "story_panels_select_own" ON public.story_panels FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.story_sessions s
    WHERE s.id = story_panels.session_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "story_panels_insert_own" ON public.story_panels FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.story_sessions s
    WHERE s.id = story_panels.session_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "story_panels_update_own" ON public.story_panels FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.story_sessions s
    WHERE s.id = story_panels.session_id AND s.user_id = auth.uid()
  ));

-- generated_music: 본인 세션의 음악만
CREATE POLICY "music_select_own" ON public.generated_music FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.story_sessions s
    WHERE s.id = generated_music.session_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "music_insert_own" ON public.generated_music FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.story_sessions s
    WHERE s.id = generated_music.session_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "music_update_own" ON public.generated_music FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.story_sessions s
    WHERE s.id = generated_music.session_id AND s.user_id = auth.uid()
  ));
