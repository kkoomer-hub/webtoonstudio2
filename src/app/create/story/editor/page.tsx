'use client';

import dynamic from 'next/dynamic';

// Fabric.js는 브라우저 전용이므로 SSR 비활성화
// 'use client' 페이지에서만 ssr: false 사용 가능
const WebtoonEditor = dynamic(
  () => import('@/components/webtoon-editor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium text-sm">편집기 불러오는 중...</p>
        </div>
      </div>
    ),
  }
);

export default function EditorPage() {
  return <WebtoonEditor />;
}
