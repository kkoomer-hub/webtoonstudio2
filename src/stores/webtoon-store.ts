import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type {
  Webtoon,
  Episode,
  StudioProject,
  User,
  NotificationItem,
  SidebarTab,
  ModalType,
} from '@/types';

// =========================================================
// Webtoon Store — Supabase 연동 버전
// =========================================================
interface WebtoonState {
  // Data
  webtoons: Webtoon[];
  episodes: Episode[];
  projects: StudioProject[];
  currentUser: User | null;
  notifications: NotificationItem[];

  // UI State
  activeTab: SidebarTab;
  activeModal: ModalType;
  searchQuery: string;
  selectedGenre: string | null;
  isLoading: boolean;
  sidebarOpen: boolean;

  // Actions - Data (Supabase)
  fetchWebtoons: () => Promise<void>;
  fetchProjects: (userId: string) => Promise<void>;
  toggleFavorite: (webtoonId: string) => void;
  addProject: (project: StudioProject) => void;
  deleteProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<StudioProject>) => void;
  markNotificationRead: (notificationId: string) => void;
  setCurrentUserFromAuth: (authUser: { id: string; email?: string; user_metadata?: Record<string, string> } | null) => void;

  // Actions - UI
  setActiveTab: (tab: SidebarTab) => void;
  setActiveModal: (modal: ModalType) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGenre: (genre: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setCurrentUser: (user: User | null) => void;

  // Computed helpers
  getFavorites: () => Webtoon[];
  getTrending: () => Webtoon[];
  getFilteredWebtoons: () => Webtoon[];
}

export const useWebtoonStore = create<WebtoonState>()(
  devtools(
    (set, get) => ({
      // Initial state
      webtoons: [],
      episodes: [],
      projects: [],
      currentUser: null,
      notifications: [],

      // UI initial state
      activeTab: 'explore',
      activeModal: null,
      searchQuery: '',
      selectedGenre: null,
      isLoading: false,
      sidebarOpen: true,

      // ── Supabase: 웹툰 목록 불러오기 ─────────────────
      fetchWebtoons: async () => {
        set({ isLoading: true });
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('webtoons')
            .select('*, authors(*)')
            .order('updated_at', { ascending: false });

          if (error) throw error;

          const webtoons: Webtoon[] = (data ?? []).map((w) => ({
            id: w.id,
            title: w.title,
            author: {
              id: w.authors?.id ?? '',
              name: w.authors?.name ?? '알 수 없음',
              avatarUrl: w.authors?.avatar_url,
              bio: w.authors?.bio,
            },
            coverUrl: w.cover_url,
            genre: w.genre,
            tags: w.tags ?? [],
            synopsis: w.synopsis ?? '',
            rating: Number(w.rating) || 0,
            totalViews: Number(w.total_views) || 0,
            totalLikes: Number(w.total_likes) || 0,
            episodeCount: w.episode_count ?? 0,
            status: w.status,
            badge: w.badge,
            publishedAt: w.published_at,
            updatedAt: w.updated_at,
            isAdult: w.is_adult ?? false,
            isFavorite: false, // 별도 favorites 테이블에서 판별
          }));

          set({ webtoons, isLoading: false });
        } catch (err) {
          console.error('[fetchWebtoons]', err);
          set({ isLoading: false });
        }
      },

      // ── Supabase: 프로젝트 목록 불러오기 ─────────────
      fetchProjects: async (userId: string) => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('studio_projects')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

          if (error) throw error;

          const projects: StudioProject[] = (data ?? []).map((p) => ({
            id: p.id,
            title: p.title,
            webtoonId: p.webtoon_id,
            thumbnailUrl: p.thumbnail_url,
            lastEditedAt: p.updated_at,
            createdAt: p.created_at,
            canvasWidth: p.canvas_width ?? 800,
            canvasHeight: p.canvas_height ?? 1200,
            panels: p.panels ?? [],
            status: p.status,
          }));

          set({ projects });
        } catch (err) {
          console.error('[fetchProjects]', err);
        }
      },

      // ── Auth → User 매핑 ────────────────────────────
      setCurrentUserFromAuth: (authUser) => {
        if (!authUser) {
          set({ currentUser: null });
          return;
        }
        set({
          currentUser: {
            id: authUser.id,
            name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? authUser.email?.split('@')[0] ?? '사용자',
            email: authUser.email ?? '',
            avatarUrl: authUser.user_metadata?.avatar_url,
            plan: 'free',
            joinedAt: new Date().toISOString(),
          },
        });
      },

      // Actions - Data
      toggleFavorite: (webtoonId) =>
        set((state) => ({
          webtoons: state.webtoons.map((w) =>
            w.id === webtoonId ? { ...w, isFavorite: !w.isFavorite } : w
          ),
        })),

      addProject: (project) =>
        set((state) => ({
          projects: [project, ...state.projects],
        })),

      deleteProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        })),

      updateProject: (projectId, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, ...updates } : p
          ),
        })),

      markNotificationRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        })),

      // Actions - UI
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveModal: (modal) => set({ activeModal: modal }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedGenre: (genre) => set({ selectedGenre: genre }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setCurrentUser: (user) => set({ currentUser: user }),

      // Computed helpers
      getFavorites: () => get().webtoons.filter((w) => w.isFavorite),
      getTrending: () =>
        [...get().webtoons].sort((a, b) => b.totalViews - a.totalViews),
      getFilteredWebtoons: () => {
        const { webtoons, searchQuery, selectedGenre } = get();
        return webtoons.filter((w) => {
          const matchesSearch =
            !searchQuery ||
            w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.author.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesGenre =
            !selectedGenre || w.genre === selectedGenre;
          return matchesSearch && matchesGenre;
        });
      },
    })
  )
);
