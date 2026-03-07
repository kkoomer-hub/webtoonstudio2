'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { GlobalHeader } from '@/components/layout/header';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<{
    credits?: number;
    orderId?: string;
    amount?: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('결제 정보가 올바르지 않습니다.');
      return;
    }

    const confirmPayment = async () => {
      try {
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          router.push(`/payment/fail?code=${data.code}&message=${encodeURIComponent(data.message)}`);
          return;
        }

        setResult(data);
        setStatus('success');
      } catch (err) {
        console.error('결제 확인 오류:', err);
        setStatus('error');
        setErrorMessage('결제 확인 중 오류가 발생했습니다.');
      }
    };

    confirmPayment();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-black text-gray-900 mb-2">결제 확인 중...</h2>
        <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">결제 확인 실패</h2>
        <p className="text-sm text-gray-500 mb-8">{errorMessage}</p>
        <Link href="/payment">
          <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">
            다시 시도하기
          </button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      {/* 성공 아이콘 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl shadow-emerald-200">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>

      <h1 className="text-3xl font-black text-gray-900 mb-2">충전 완료!</h1>
      <p className="text-gray-500 mb-8">AI 크레딧이 성공적으로 충전되었습니다.</p>

      {/* 충전 정보 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">충전 크레딧</span>
            <span className="text-lg font-black text-indigo-600">
              +{result?.credits?.toLocaleString()} 크레딧
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">결제 금액</span>
            <span className="text-sm font-bold text-gray-900">
              {result?.amount?.toLocaleString()}원
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">주문번호</span>
            <span className="text-xs font-mono text-gray-400">
              {result?.orderId}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
            대시보드로 이동
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
        <Link href="/create/story">
          <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            이야기 만들기
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <GlobalHeader />
      <main className="max-w-[640px] mx-auto px-4 md:px-6">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-sm text-gray-500">로딩 중...</p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
