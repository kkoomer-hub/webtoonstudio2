'use client';

import React from 'react';
import { LegalLayout } from '@/components/layout/legal-layout';

export default function TermsPage() {
  return (
    <LegalLayout title="이용약관" lastUpdated="2026년 3월 4일">
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">01</span>
            서비스의 목적
          </h2>
          <p>
            WebtoonStudio 서비스 이용약관은 어린이를 위한 AI 기반 웹툰 창작 플랫폼 'WebtoonStudio'(이하 '서비스')를 이용하시는 회원 여러분이 서비스를 더욱 즐겁고 안전하게 이용하실 수 있도록 돕기 위해 만들어졌습니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">02</span>
            창작물 및 저작권
          </h2>
          <p>
            여러분이 WebtoonStudio에서 AI와 함께 만든 이야기와 웹툰 이미지는 여러분의 소중한 창작물입니다.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
            <li>여러분이 만든 웹툰은 서비스 내에서 자유롭게 공유하고 저장할 수 있습니다.</li>
            <li>다만, AI가 생성한 이미지는 AI 기술의 특성상 동일하거나 유사한 결과물이 다른 사용자에게도 생성될 수 있습니다.</li>
            <li>서비스 개선과 기술 연구를 위해 여러분이 만든 웹툰이 익명으로 활용될 수 있습니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">03</span>
            지켜야 할 약속
          </h2>
          <p>
            모두가 즐거운 환경을 만들기 위해 아래와 같은 행동은 삼가해 주세요.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-red-500">
            <li>다른 사람에게 상처를 주는 말이나 무서운 이야기를 만드는 것</li>
            <li>나쁜 내용을 포함하거나 선생님이나 부모님이 보시기에 부적절한 내용을 만드는 것</li>
            <li>다른 사람의 이름이나 개인정보를 허락 없이 사용하는 것</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">04</span>
            서비스 이용의 중단
          </h2>
          <p>
            약속을 지키지 않거나 다른 친구들에게 해가 되는 행동을 반복할 경우, 서비스 이용이 일시적 또는 영구적으로 제한될 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">05</span>
            문의하기
          </h2>
          <p>
            서비스 이용 중 궁금한 점이나 어려운 점이 있다면 언제든지 고객센터를 통해 도움을 요청하세요!
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
