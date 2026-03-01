import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { StoryPanel } from '@/app/api/generate-story/route';
import type { PanelImageResult } from '@/lib/image-service';

// =========================================================
// Types
// =========================================================
export interface StoryInput {
  protagonist: string;
  location: string;
  timeBackground: string;
  incident: string;
}

export interface PanelImageState {
  status: 'idle' | 'loading' | 'done' | 'error';
  imageUrl: string;
  error?: string;
}

interface StoryState {
  // 입력 폼 데이터
  input: StoryInput;
  // 생성된 이야기 패널
  panels: StoryPanel[];
  // 생성된 이미지 (패널 인덱스별)
  panelImages: PanelImageState[];
  // DB 세션 ID (저장 후 반환)
  sessionId: string | null;

  // Actions
  setInput: (input: StoryInput) => void;
  setPanels: (panels: StoryPanel[]) => void;
  setPanelImages: (images: PanelImageState[]) => void;
  updatePanelImage: (index: number, state: PanelImageState) => void;
  applyImageResults: (results: PanelImageResult[]) => void;
  reset: () => void;
  resetImages: () => void;

  // Supabase 연동
  saveSessionToDB: (userId: string) => Promise<string | null>;
  savePanelsToDB: (sessionId: string) => Promise<void>;
  loadSessionFromDB: (sessionId: string) => Promise<void>;
  saveCompletedWork: (opts: {
    userId: string;
    musicUrl?: string;
    musicTitle?: string;
    musicGenre?: string;
  }) => Promise<string | null>; // 저장된 sessionId 반환
}

const emptyInput: StoryInput = {
  protagonist: '',
  location: '',
  timeBackground: '',
  incident: '',
};

const emptyPanelImages = (): PanelImageState[] =>
  Array(4).fill(null).map(() => ({ status: 'idle', imageUrl: '' }));

// =========================================================
// Store — sessionStorage에 persist (탭 닫으면 초기화)
// DB 저장은 명시적으로 호출해야 함
// =========================================================
export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      input: emptyInput,
      panels: [],
      panelImages: emptyPanelImages(),
      sessionId: null,

      setInput: (input) => set({ input }),
      setPanels: (panels) => set({ panels }),
      setPanelImages: (panelImages) => set({ panelImages }),

      updatePanelImage: (index, state) =>
        set((prev) => {
          const next = [...prev.panelImages];
          next[index] = state;
          return { panelImages: next };
        }),

      applyImageResults: (results) =>
        set((prev) => {
          const next = [...prev.panelImages];
          for (const r of results) {
            next[r.panelIndex] = r.imageUrl
              ? { status: 'done', imageUrl: r.imageUrl }
              : { status: 'error', imageUrl: '', error: r.error };
          }
          return { panelImages: next };
        }),

      reset: () =>
        set({ input: emptyInput, panels: [], panelImages: emptyPanelImages(), sessionId: null }),

      resetImages: () => set({ panelImages: emptyPanelImages() }),

      // ── Supabase: 세션 저장 ──────────────────────────
      saveSessionToDB: async (userId: string) => {
        const { input } = get();
        const supabase = createClient();

        const { data, error } = await supabase
          .from('story_sessions')
          .insert({
            user_id: userId,
            protagonist: input.protagonist,
            location: input.location,
            time_background: input.timeBackground,
            incident: input.incident,
          })
          .select('id')
          .single();

        if (error) {
          console.error('[saveSessionToDB]', error);
          return null;
        }

        const sessionId = data.id;
        set({ sessionId });
        return sessionId;
      },

      // ── Supabase: 패널 저장 ──────────────────────────
      savePanelsToDB: async (sessionId: string) => {
        const { panels, panelImages } = get();
        const supabase = createClient();

        const rows = panels.map((p, i) => ({
          session_id: sessionId,
          panel_number: p.panel,
          story_text: p.story,
          image_prompt: p.image_prompt,
          image_url: panelImages[i]?.status === 'done' ? panelImages[i].imageUrl : null,
        }));

        const { error } = await supabase
          .from('story_panels')
          .upsert(rows, { onConflict: 'session_id,panel_number' });

        if (error) {
          console.error('[savePanelsToDB]', error);
        }
      },

      // ── Supabase: 세션 불러오기 ──────────────────────
      loadSessionFromDB: async (sessionId: string) => {
        const supabase = createClient();

        const { data: session } = await supabase
          .from('story_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (!session) return;

        const { data: dbPanels } = await supabase
          .from('story_panels')
          .select('*')
          .eq('session_id', sessionId)
          .order('panel_number');

        set({
          sessionId,
          input: {
            protagonist: session.protagonist,
            location: session.location,
            timeBackground: session.time_background,
            incident: session.incident,
          },
          panels: (dbPanels ?? []).map((p) => ({
            panel: p.panel_number,
            story: p.story_text,
            image_prompt: p.image_prompt ?? '',
          })),
          panelImages: (dbPanels ?? []).map((p) => ({
            status: p.image_url ? 'done' : 'idle',
            imageUrl: p.image_url ?? '',
          })),
        });
      },

      // ── Supabase: 완성 작품 전체 저장 ────────────────
      saveCompletedWork: async ({ userId, musicUrl, musicTitle, musicGenre }) => {
        const { input, panels, panelImages } = get();
        const supabase = createClient();

        // 1) 세션 upsert (제목 자동 생성)
        const title = `${input.protagonist}의 웹툰`;
        const { data: session, error: sessErr } = await supabase
          .from('story_sessions')
          .insert({
            user_id: userId,
            protagonist: input.protagonist,
            location: input.location,
            time_background: input.timeBackground,
            incident: input.incident,
            title,
            music_url: musicUrl ?? null,
            music_title: musicTitle ?? null,
            music_genre: musicGenre ?? null,
            cover_image_url: panelImages[0]?.imageUrl ?? null,
            completed_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (sessErr || !session) {
          console.error('[saveCompletedWork] session error:', sessErr);
          return null;
        }

        const sessionId = session.id;
        set({ sessionId });

        // 2) 패널 + 이미지 저장 (Payload 제한을 피해 개별 Insert 수행)
        for (let i = 0; i < panels.length; i++) {
          const p = panels[i];
          const row = {
            session_id: sessionId,
            panel_number: p.panel,
            story_text: p.story,
            image_prompt: p.image_prompt,
            image_url: panelImages[i]?.status === 'done' ? panelImages[i].imageUrl : null,
          };
          
          const { error: panelErr } = await supabase
            .from('story_panels')
            .upsert(row, { onConflict: 'session_id,panel_number' });

          if (panelErr) {
            console.error(`[saveCompletedWork] panel ${p.panel} error:`, panelErr);
          }
        }

        return sessionId;
      },
    }),
    {
      name: 'story-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        input: state.input,
        panels: state.panels,
        sessionId: state.sessionId,
      }),
    }
  )
);
