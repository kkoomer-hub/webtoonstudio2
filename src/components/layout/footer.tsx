'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield } from 'lucide-react';

export const GlobalFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg text-gray-900">WebtoonStudio</span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            AI 기반 웹툰 제작 플랫폼. 모든 창작자의 꿈을 현실로 만듭니다.
          </p>
          <div className="flex gap-2 mt-4">
            {['TW', 'IG', 'YT'].map((s) => (
              <div
                key={s}
                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {[
          { title: '서비스', items: [
            { label: '스튜디오', href: '/studio' },
            { label: '탐색', href: '/explore' },
            { label: '대시보드', href: '/dashboard' },
            { label: '요금제', href: '/pricing' }
          ] },
          { title: '리소스', items: [
            { label: '튜토리얼', href: '/tutorials' },
            { label: '에셋 라이브러리', href: '/assets' },
            { label: 'API 문서', href: '/docs' },
            { label: '커뮤니티', href: '/community' }
          ] },
          { title: '회사', items: [
            { label: '소개', href: '/about' },
            { label: '채용', href: '/jobs' },
            { label: '뉴스룸', href: '/news' },
            { label: '고객센터', href: '/support' }
          ] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-indigo-600 cursor-pointer transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-[10px] md:text-xs text-gray-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span>© 2026 WebtoonStudio Corp. All rights reserved.</span>
          <div className="flex items-center gap-1 text-gray-300">
            <Shield className="w-3 h-3" />
            <span>어린이 안심 서비스</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">개인정보처리방침</Link>
          <Link href="/cookies" className="hover:text-gray-600 transition-colors">쿠키 정책</Link>
        </div>
      </div>
    </footer>
  );
};
