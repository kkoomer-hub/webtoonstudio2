'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { GlobalHeader } from './header';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  children,
  title,
  lastUpdated,
}) => {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <GlobalHeader />
      
      <main className="pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              홈으로 돌아가기
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-gray-400 font-medium">
                마지막 업데이트: {lastUpdated}
              </p>
            </motion.div>
          </div>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-8 md:p-12 prose prose-indigo max-w-none">
              <div className="space-y-8 text-gray-600 leading-relaxed font-medium">
                {children}
              </div>
            </div>
            
            {/* Footer Summary */}
            <div className="bg-indigo-50/50 p-8 border-t border-indigo-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">도움이 필요하신가요?</h4>
                  <p className="text-xs text-gray-500">
                    정책 내용에 대해 궁금한 점이 있다면 언제든지 <span className="text-indigo-600 font-bold cursor-pointer">고객센터</span>로 문의해 주세요.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legal Links Footer */}
          <div className="mt-12 flex justify-center gap-6 text-xs font-bold text-gray-400">
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">개인정보처리방침</Link>
            <Link href="/cookies" className="hover:text-indigo-600 transition-colors">쿠키 정책</Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-4 bg-white text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-black text-sm text-gray-900">WebtoonStudio</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 WebtoonStudio Corp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
