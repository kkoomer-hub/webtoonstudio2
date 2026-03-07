'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCcw, Loader2 } from 'lucide-react';
import { GlobalHeader } from '@/components/layout/header';

function FailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'UNKNOWN_ERROR';
  const message = searchParams.get('message') || '결제 처리 중 오류가 발생했습니다.';

  const ERROR_MESSAGES: Record<string, string> = {
    PAY_PROCESS_CANCELED: '결제가 취소되었습니다.',
    PAY_PROCESS_ABORTED: '결제가 중단되었습니다.',
    REJECT_CARD_COMPANY: '카드사에서 결제를 거절했습니다.',
    NOT_FOUND_PAYMENT_SESSION: '결제 세션이 만료되었습니다.',
    UNAUTHORIZED_KEY: '인증 오류가 발생했습니다.',
    FORBIDDEN_REQUEST: '잘못된 결제 요청입니다.',
  };

  const displayMessage = ERROR_MESSAGES[code] || message;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24"
    >
      {/* 실패 아이콘 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-2xl shadow-red-200 mb-8"
      >
        <XCircle className="w-12 h-12 text-white" />
      </motion.div>

      <h1 className="text-3xl font-black text-gray-900 mb-2">결제 실패</h1>
      <p className="text-gray-500 mb-4">{displayMessage}</p>

      {/* 에러 정보 */}
      <div className="w-full max-w-sm bg-red-50 rounded-xl p-4 mb-8">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-red-400">에러 코드</span>
            <span className="text-xs font-mono text-red-600">{code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-red-400">사유</span>
            <span className="text-xs text-red-600 text-right max-w-[200px]">{message}</span>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <Link href="/payment">
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            다시 시도하기
          </button>
        </Link>
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            대시보드
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <GlobalHeader />
      <main className="max-w-[640px] mx-auto px-4 md:px-6">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-4" />
              <p className="text-sm text-gray-500">로딩 중...</p>
            </div>
          }
        >
          <FailContent />
        </Suspense>
      </main>
    </div>
  );
}
