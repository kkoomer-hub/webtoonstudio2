'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Coins, CreditCard } from 'lucide-react';

interface CreditWarningProps {
  currentCredits: number;
  requiredCredits: number;
  actionName: string;
  variant?: 'light' | 'dark';
}

export const CreditWarningBanner: React.FC<CreditWarningProps> = ({
  currentCredits,
  requiredCredits,
  actionName,
  variant = 'light',
}) => {
  if (currentCredits >= requiredCredits) return null;

  const isDark = variant === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 flex items-start gap-3 ${
        isDark
          ? 'bg-red-500/10 border border-red-500/20'
          : 'bg-amber-50 border border-amber-200'
      }`}
    >
      <AlertTriangle
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          isDark ? 'text-red-400' : 'text-amber-500'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-bold ${
            isDark ? 'text-red-300' : 'text-amber-800'
          }`}
        >
          크레딧이 부족합니다
        </p>
        <p
          className={`text-xs mt-1 ${
            isDark ? 'text-red-300/70' : 'text-amber-600'
          }`}
        >
          <span className="font-bold">{actionName}</span>에{' '}
          <span className="font-black">{requiredCredits} 크레딧</span>이
          필요하지만 현재{' '}
          <span className="font-black">{currentCredits} 크레딧</span>만
          남아있습니다.
        </p>
        <Link
          href="/payment"
          className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isDark
              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-400/30'
              : 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          크레딧 충전하기
        </Link>
      </div>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${
          isDark
            ? 'bg-white/5 text-red-300'
            : 'bg-amber-100 text-amber-700'
        }`}
      >
        <CreditCard className="w-3 h-3" />
        {currentCredits}/{requiredCredits}
      </div>
    </motion.div>
  );
};
