'use client';

import React from 'react';
import { LegalLayout } from '@/components/layout/legal-layout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="개인정보처리방침" lastUpdated="2026년 3월 4일">
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">01</span>
            소중한 정보 수집
          </h2>
          <p>
            WebtoonStudio는 여러분이 서비스를 안전하게 이용할 수 있도록 최소한의 정보만을 소중하게 관리합니다.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
            <li><strong>계정 정보:</strong> 이메일, 닉네임 (로그인을 위해 사용됩니다.)</li>
            <li><strong>창작 정보:</strong> 여러분이 입력한 이야기 제목, 내용, 생성된 웹툰 이미지</li>
            <li><strong>서비스 이용 기록:</strong> 방문 일시, 기기 종류, 어떤 기능을 자주 사용하는지 등</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">02</span>
            정보를 사용하는 이유
          </h2>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-gray-600">
            <li>여러분의 웹툰 작품을 안전하게 저장하고 나중에 다시 보여주기 위해</li>
            <li>AI 기술을 더 똑똑하고 편리하게 만들기 위한 연구를 위해</li>
            <li>새로운 기능이나 이벤트를 안내하기 위해 (선택 시)</li>
            <li>문제가 생겼을 때 빠르게 해결하기 위해</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">03</span>
            정보의 보관 및 보호
          </h2>
          <p>
            여러분의 정보는 Supabase와 같은 안전한 저장소에 암호화되어 보관됩니다. 
            회원을 탈퇴하거나 보관 기간이 지나면 여러분의 정보는 즉시 지워지거나 아무도 알 수 없게 처리됩니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">04</span>
            권리 및 요청 방법
          </h2>
          <p>
            여러분(또는 보호자님)은 언제든지 자신의 개인정보를 확인하거나, 고치거나, 지워달라고 요청할 수 있습니다. 
            설정 메뉴에서 회원 탈퇴를 하거나 고객센터에 연락해 주세요.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-2 italic">부모님 및 보호자님께:</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            WebtoonStudio는 어린이의 안전한 디지털 창작 활동을 최우선으로 생각합니다. 
            서비스 이용 과정에서 어린이가 부적절한 정보를 입력하지 않도록 지도를 부탁드립니다. 
            관련된 모든 문의는 <span className="text-indigo-600 font-bold">privacy@webtoonstudio.com</span>으로 보내주시기 바랍니다.
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
