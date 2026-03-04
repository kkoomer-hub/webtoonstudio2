"use client";

import React from "react";
import Image from "next/image";
import { Search } from "lucide-react";

export const SearchBar = () => {
  return (
    <div className="search-container">
      <Search className="w-4 h-4 text-soft" />
      <input
        type="text"
        placeholder="작품명, 작가명을 검색해 보세요"
        className="search-input"
      />
      <kbd className="search-kbd">K</kbd>
    </div>
  );
};

interface WebtoonCardProps {
  title: string;
  author: string;
  badge?: "up" | "new" | "completed";
  imageUrl?: string;
}

export const WebtoonCard: React.FC<WebtoonCardProps> = ({
  title,
  author,
  badge,
  imageUrl,
}) => {
  return (
    <div className="webtoon-card">
      {badge && (
        <span className={`webtoon-badge webtoon-badge--${badge}`}>
          {badge === "up" ? "UP" : badge === "new" ? "NEW" : "완결"}
        </span>
      )}
      <div className="bg-gray-200 aspect-[3/4] w-full relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized
            className="webtoon-card-image hover:scale-105 transition-transform duration-300 object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-soft bg-gradient-to-br from-gray-100 to-gray-200">
            Image
          </div>
        )}
      </div>
      <div className="webtoon-card-content">
        <h3 className="webtoon-card-title">{title}</h3>
        <p className="webtoon-card-author">{author}</p>
        <div className="reading-progress-bar">
          <div
            className="reading-progress-fill"
            style={{ width: "65%" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export const EpisodeItem = ({
  number,
  title,
  date,
}: {
  number: number;
  title: string;
  date: string;
}) => {
  return (
    <div className="episode-item">
      <div className="episode-thumb flex items-center justify-center text-[10px] text-soft bg-gray-100">
        EP.{number}
      </div>
      <div className="episode-info">
        <h4 className="episode-title">{title}</h4>
        <span className="episode-date">{date}</span>
      </div>
      <button className="btn btn-ghost btn-pill-sm">보기</button>
    </div>
  );
};

export const UserMenu = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-xs font-bold text-strong">Admin User</span>
        <span className="text-[10px] text-soft">Premium Plan</span>
      </div>
      <div className="user-menu-trigger">
        <div className="w-full h-full bg-gradient-to-tr from-primary to-purple-400" />
      </div>
    </div>
  );
};
