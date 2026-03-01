// =========================================================
// 웹툰 플랫폼 공통 타입 정의
// =========================================================

export type BadgeType = "up" | "new" | "completed" | "hot";
export type GenreType =
  | "판타지"
  | "로맨스"
  | "액션"
  | "스릴러"
  | "코미디"
  | "SF"
  | "일상"
  | "드라마";

export interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Episode {
  id: string;
  webtoonId: string;
  number: number;
  title: string;
  thumbnailUrl?: string;
  publishedAt: string;
  views: number;
  likes: number;
  isFree: boolean;
  status: "published" | "draft" | "scheduled";
}

export interface Webtoon {
  id: string;
  title: string;
  author: Author;
  coverUrl?: string;
  genre: GenreType;
  tags: string[];
  synopsis: string;
  rating: number;
  totalViews: number;
  totalLikes: number;
  episodeCount: number;
  status: "ongoing" | "completed" | "hiatus";
  badge?: BadgeType;
  publishedAt: string;
  updatedAt: string;
  isAdult: boolean;
  isFavorite?: boolean;
}

export interface StudioProject {
  id: string;
  title: string;
  webtoonId?: string;
  thumbnailUrl?: string;
  lastEditedAt: string;
  createdAt: string;
  canvasWidth: number;
  canvasHeight: number;
  panels: Panel[];
  status: "draft" | "published";
}

export interface Panel {
  id: string;
  order: number;
  imageUrl?: string;
  width: number;
  height: number;
  speechBubbles: SpeechBubble[];
}

export interface SpeechBubble {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: "normal" | "shout" | "whisper" | "thought";
}

export interface NotificationItem {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  timestamp: string;
  isRead: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: "free" | "pro" | "enterprise";
  joinedAt: string;
}

// UI 관련 타입
export type SidebarTab = "explore" | "trending" | "favorites" | "myworks";
export type StudioTab = "canvas" | "assets" | "ai" | "text" | "panels";
export type ModalType =
  | "new_project"
  | "publish"
  | "share"
  | "delete_confirm"
  | null;
