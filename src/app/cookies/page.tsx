'use client';

import React from 'react';
import { LegalLayout } from '@/components/layout/legal-layout';

export default function CookiesPage() {
  return (
    <LegalLayout title="쿠키 정책" lastUpdated="2026년 3월 4일">
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">01</span>
            쿠키(Cookie)란 무엇인가요?
          </h2>
          <p>
            쿠키는 여러분이 웹사이트를 방문할 때 브라우저에 저장되는 작은 기억 조각들입니다. 
            다음에 다시 방문했을 때 여러분을 기억하거나, 여러분이 설정한 항목을 유지하는 데 도움을 줍니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">02</span>
            어떤 쿠키를 사용하나요?
          </h2>
          <div className="grid gap-4 mt-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-800 mb-1">🏠 필수 쿠키</h4>
              <p className="text-xs text-gray-500">
                로그인 상태를 유지하고, 여러분이 안전하게 웹사이트를 이용하기 위해 반드시 필요한 쿠키입니다.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-800 mb-1">📊 분석 쿠키</h4>
              <p className="text-xs text-gray-500">
                사용자들이 어떤 기능을 좋아하는지, 어디에서 어려움을 느끼는지 확인하여 좋은 서비스를 만드는 기반이 됩니다.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">03</span>
            쿠키를 끄고 싶어요
          </h2>
          <p>
            브라우저 설정에서 쿠키 저장을 거부할 수 있습니다. 하지만 쿠키를 끄면 로그인을 유지할 수 없거나 일부 기능을 사용하는 데 불편함이 생길 수 있습니다.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-gray-500">
            <li>Chrome: 설정 {'>'} 개인정보 및 보안 {'>'} 쿠키 및 기타 사이트 데이터</li>
            <li>Safari: 설정 {'>'} 개인정보 보호 {'>'} 모든 쿠키 차단</li>
          </ul>
        </div>
      </section>
    </LegalLayout>
  );
}
