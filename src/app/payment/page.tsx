'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Crown,
  Gem,
  Star,
  ArrowLeft,
  Check,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { GlobalHeader } from '@/components/layout/header';

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';

interface CreditPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  badge?: string;
  perCredit: number;
}

const CREDIT_PLANS: CreditPlan[] = [
  {
    id: 'starter',
    name: '스타터',
    credits: 50,
    price: 5000,
    icon: Zap,
    color: 'text-blue-600',
    bgGradient: 'from-blue-500 to-cyan-500',
    perCredit: 100,
  },
  {
    id: 'basic',
    name: '베이직',
    credits: 150,
    price: 12000,
    icon: Star,
    color: 'text-violet-600',
    bgGradient: 'from-violet-500 to-purple-600',
    badge: '인기',
    perCredit: 80,
  },
  {
    id: 'pro',
    name: '프로',
    credits: 500,
    price: 35000,
    icon: Crown,
    color: 'text-amber-600',
    bgGradient: 'from-amber-500 to-orange-600',
    badge: '가성비 최고',
    perCredit: 70,
  },
  {
    id: 'premium',
    name: '프리미엄',
    credits: 1200,
    price: 70000,
    icon: Gem,
    color: 'text-rose-600',
    bgGradient: 'from-rose-500 to-pink-600',
    perCredit: 58,
  },
];

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<CreditPlan | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [widgets, setWidgets] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'pay'>('select');
  const widgetsRenderedRef = React.useRef(false);

  // Phase 1: SDK 초기화 (DOM 접근 없음)
  const initWidgets = useCallback(async (plan: CreditPlan) => {
    try {
      setLoading(true);
      setReady(false);
      widgetsRenderedRef.current = false;

      const tossPayments = await loadTossPayments(CLIENT_KEY);
      const w = tossPayments.widgets({
        customerKey: 'ANONYMOUS',
      });

      await w.setAmount({
        currency: 'KRW',
        value: plan.price,
      });

      setWidgets(w);
      setStep('pay');
    } catch (error) {
      console.error('결제 위젯 초기화 오류:', error);
      setLoading(false);
    }
  }, []);

  // Phase 2: DOM이 준비된 후 위젯 렌더링 (useEffect로 보장)
  useEffect(() => {
    if (step !== 'pay' || !widgets || widgetsRenderedRef.current) return;

    const renderWidgets = async () => {
      try {
        // DOM 요소가 확실히 존재하는지 확인
        const paymentMethodEl = document.getElementById('payment-method');
        const agreementEl = document.getElementById('agreement');

        if (!paymentMethodEl || !agreementEl) {
          // DOM이 아직 없으면 다음 프레임에 다시 시도
          requestAnimationFrame(() => renderWidgets());
          return;
        }

        widgetsRenderedRef.current = true;

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#payment-method',
            variantKey: 'DEFAULT',
          }),
          widgets.renderAgreement({
            selector: '#agreement',
            variantKey: 'AGREEMENT',
          }),
        ]);

        setReady(true);
      } catch (error) {
        console.error('결제 위젯 렌더링 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    renderWidgets();
  }, [step, widgets]);

  const handleSelectPlan = async (plan: CreditPlan) => {
    setSelectedPlan(plan);
    await initWidgets(plan);
  };

  const handlePayment = async () => {
    if (!widgets || !selectedPlan) return;

    try {
      setLoading(true);

      // 1. 서버에 주문 정보 생성
      const prepareRes = await fetch('/api/payment/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });

      const prepareData = await prepareRes.json();

      if (!prepareRes.ok) {
        alert(prepareData.error || '주문 생성에 실패했습니다.');
        return;
      }

      // 2. 결제 요청
      await widgets.requestPayment({
        orderId: prepareData.orderId,
        orderName: prepareData.orderName,
        successUrl: window.location.origin + '/payment/success',
        failUrl: window.location.origin + '/payment/fail',
      });
    } catch (error) {
      console.error('결제 요청 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedPlan(null);
    setWidgets(null);
    setReady(false);
    widgetsRenderedRef.current = false;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <GlobalHeader />

      <main className="max-w-[960px] mx-auto px-4 md:px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 헤더 */}
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold mb-4"
                >
                  <Sparkles className="w-4 h-4" />
                  AI 크레딧 충전
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
                  창작에 날개를 달아보세요
                </h1>
                <p className="text-gray-500 text-base max-w-md mx-auto">
                  AI 이미지 생성, 스토리 제작, 음악 생성에 사용할 수 있는 크레딧을 충전하세요.
                </p>
              </div>

              {/* 플랜 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {CREDIT_PLANS.map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={loading}
                      className={`
                        relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300
                        hover:scale-[1.02] hover:shadow-xl
                        ${selectedPlan?.id === plan.id
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100'
                          : 'border-gray-200 bg-white hover:border-indigo-300'
                        }
                        disabled:opacity-60 disabled:cursor-not-allowed
                      `}
                    >
                      {plan.badge && (
                        <span className={`absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r ${plan.bgGradient} text-white text-xs font-bold rounded-full shadow-lg`}>
                          {plan.badge}
                        </span>
                      )}

                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.bgGradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <plan.icon className="w-6 h-6 text-white" />
                      </div>

                      <h3 className="text-lg font-black text-gray-900 mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {plan.credits.toLocaleString()} 크레딧
                      </p>

                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-black text-gray-900">
                          {plan.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400">원</span>
                      </div>

                      <p className="text-xs text-gray-400">
                        크레딧당 {plan.perCredit}원
                      </p>

                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          AI 이미지 생성
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          AI 스토리 생성
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          AI 음악 생성
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* 안내 */}
              <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  안전한 결제
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  카드 / 계좌이체 / 간편결제
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* 뒤로가기 */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                플랜 다시 선택
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
                {/* 결제 위젯 영역 */}
                <div className="space-y-4">
                  <div
                    id="payment-method"
                    className="rounded-2xl overflow-hidden"
                  />
                  <div
                    id="agreement"
                    className="rounded-2xl overflow-hidden"
                  />

                  <button
                    onClick={handlePayment}
                    disabled={!ready || loading}
                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-lg rounded-2xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
                  >
                    {loading ? '처리 중...' : `${selectedPlan?.price.toLocaleString()}원 결제하기`}
                  </button>
                </div>

                {/* 주문 요약 */}
                {selectedPlan && (
                  <div className="lg:sticky lg:top-24">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                        주문 요약
                      </h3>

                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedPlan.bgGradient} flex items-center justify-center mb-4 shadow-lg`}>
                        <selectedPlan.icon className="w-7 h-7 text-white" />
                      </div>

                      <h4 className="text-xl font-black text-gray-900 mb-1">
                        {selectedPlan.name} 플랜
                      </h4>
                      <p className="text-sm text-gray-500 mb-6">
                        {selectedPlan.credits.toLocaleString()} 크레딧 충전
                      </p>

                      <div className="space-y-3 border-t border-gray-100 pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">크레딧</span>
                          <span className="font-bold text-gray-900">
                            {selectedPlan.credits.toLocaleString()}개
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">크레딧당 단가</span>
                          <span className="font-bold text-gray-900">
                            {selectedPlan.perCredit}원
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-bold text-gray-700">결제 금액</span>
                          <div className="text-right">
                            <span className="text-2xl font-black text-gray-900">
                              {selectedPlan.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-400 ml-1">원</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-3 bg-indigo-50 rounded-xl">
                        <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                          💡 충전된 크레딧은 유효기간 없이 사용 가능하며, AI 이미지/스토리/음악 생성에 사용됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
