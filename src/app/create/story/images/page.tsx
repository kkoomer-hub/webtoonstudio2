'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, RefreshCw, ChevronLeft, Image as ImageIcon, AlertCircle, Pencil, Music, AlertTriangle,
} from 'lucide-react';
import { GlobalHeader } from '@/components/layout/header';
import { Button } from '@/components/ui-primitives';
import { useStoryStore } from '@/stores/story-store';
import type { PanelImageResult } from '@/lib/image-service';
import { validateImageFit } from '@/lib/image-validator';

// =========================================================
// 패널 메타
// =========================================================
const PANEL_META = [
  { title: '1컷 — 시작 🌱', color: 'from-blue-400 to-indigo-500', textColor: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { title: '2컷 — 사건 발생 🌊', color: 'from-violet-400 to-purple-500', textColor: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  { title: '3컷 — 위기 🔥', color: 'from-amber-400 to-orange-500', textColor: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { title: '4컷 — 해결 🌈', color: 'from-emerald-400 to-teal-500', textColor: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

// =========================================================
// Image Panel Card
// =========================================================
interface ImageCardProps {
  panelNum: number;
  story: string;
  index: number;
  delay: number;
  status: 'idle' | 'loading' | 'done' | 'error';
  imageUrl: string;
  error?: string;
  onRegenerate: (index: number) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  panelNum, story, index, delay, status, imageUrl, error, onRegenerate,
}) => {
  const meta = PANEL_META[index];
  const [validationWarn, setValidationWarn] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // ── 이미지 로드 후 검증 (경고만 표시, 자동 재시도 없음) ────
  useEffect(() => {
    if (status !== 'done' || !imageUrl) {
      setValidationWarn(null);
      return;
    }

    setIsValidating(true);
    setValidationWarn(null);

    validateImageFit(imageUrl)
      .then((result) => {
        setIsValidating(false);
        if (!result.valid) {
          setValidationWarn(result.reason ?? '여백이 감지됨');
        }
      })
      .catch(() => setIsValidating(false));
  }, [status, imageUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-lg"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${meta.color} px-5 py-3.5 text-white flex items-center gap-3`}>
        <span className="w-9 h-9 rounded-xl bg-white/20 font-black text-xl flex items-center justify-center">{panelNum}</span>
        <h3 className="text-base font-black">{meta.title}</h3>
        {/* 검증 상태 배지 */}
        {isValidating && (
          <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full animate-pulse">
            검증중...
          </span>
        )}
        {validationWarn && !isValidating && (
          <span className="ml-auto flex items-center gap-1 text-[10px] bg-yellow-400/30 border border-yellow-400/50 text-yellow-100 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-2.5 h-2.5" /> 여백 감지
          </span>
        )}
      </div>

      {/* Image area */}
      <div className={`${meta.bg} border-b ${meta.border} relative`}>
        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full aspect-square flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white/60 flex items-center justify-center">
                  <ImageIcon className={`w-7 h-7 ${meta.textColor}`} />
                </div>
                <div className={`absolute inset-0 rounded-full border-2 border-white border-t-current ${meta.textColor} animate-spin`} />
              </div>
              <p className={`text-xs font-bold ${meta.textColor}`}>{panelNum}컷 그리는 중...</p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className={`w-1.5 h-1.5 rounded-full ${meta.textColor} bg-current`}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </motion.div>
          )}

          {status === 'done' && imageUrl && (
            <div key="image" className="relative">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={imageUrl}
                alt={`${panelNum}컷 웹툰 이미지`}
                className="w-full aspect-square object-cover"
              />
              {/* 여백 경고 오버레이 */}
              {validationWarn && (
                <div className="absolute inset-0 bg-yellow-400/10 border-2 border-yellow-400/60 flex items-end">
                  <div className="w-full bg-yellow-400/80 px-3 py-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-900 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-yellow-900">
                      {validationWarn} — 다시 그리기를 권장합니다
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="w-full aspect-square flex flex-col items-center justify-center gap-2 p-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-xs text-red-500 text-center">{error || '이미지 생성에 실패했어요.'}</p>
            </motion.div>
          )}

          {status === 'idle' && (
            <motion.div key="idle" className="w-full aspect-square flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Story */}
      <div className="bg-white px-4 py-4 flex-1">
        <p className="text-sm text-gray-700 leading-relaxed">{story}</p>
      </div>

      {/* 개별 다시 그리기 */}
      <div className={`px-4 py-3 border-t border-gray-100 ${
        validationWarn ? 'bg-yellow-50' : 'bg-gray-50'
      }`}>
        <button
          id={`regen-panel-${index}`}
          onClick={() => onRegenerate(index)}
          disabled={status === 'loading'}
          className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-all
            ${status === 'loading'
              ? 'text-gray-400 cursor-not-allowed'
              : validationWarn
                ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300'
                : `${meta.textColor} hover:${meta.bg} hover:bg-opacity-50 active:scale-95`
            }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
          {status === 'loading' ? '그리는 중...' : validationWarn ? '⚠️ 다시 그리기 (여백 감지)' : '이 컷 다시 그리기'}
        </button>
      </div>
    </motion.div>
  );
};

// =========================================================
// Page
// =========================================================
export default function StoryImagesPage() {
  const router = useRouter();
  const { input, panels, panelImages, applyImageResults, updatePanelImage, resetImages, clearLocalCache } =
    useStoryStore();

  const [hasStarted, setHasStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 패널이 없으면 결과 페이지로 리다이렉트
  useEffect(() => {
    if (!panels || panels.length === 0) {
      router.replace('/create/story');
      return;
    }
    if (!hasStarted) {
      setHasStarted(true);
      generateAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 순차 생성 (1→2→3→4) ─ 한 컷씩 생성 후 화면에 표시 ────────
  const generateAll = async () => {
    if (!panels || panels.length === 0) return;

    // 모든 패널 idle로 초기화 및 에디터 캐시 삭제
    panels.forEach((_, i) => updatePanelImage(i, { status: 'idle', imageUrl: '' }));
    clearLocalCache();

    const prompts = panels.map((p) => p.image_prompt);
    let prevImageUrl = ''; // 이전 패널 이미지 (참조용)

    for (let i = 0; i < prompts.length; i++) {
      // 현재 패널 loading 상태
      updatePanelImage(i, { status: 'loading', imageUrl: '' });

      try {
        const body: Record<string, unknown> = {
          prompts,
          panelIndex: i,
          storyInput: { protagonist: input.protagonist, location: input.location },
        };

        // 2번째 패널부터 이전 패널 이미지를 참조로 전달
        if (prevImageUrl) {
          body.referenceImage = prevImageUrl;
        }

        const res = await fetch('/api/generate-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data: { images: PanelImageResult[]; error?: string } = await res.json();

        if (!res.ok || data.error) throw new Error(data.error || '이미지 생성 실패');

        const result = data.images[0];
        if (result && result.imageUrl) {
          updatePanelImage(i, { status: 'done', imageUrl: result.imageUrl });
          prevImageUrl = result.imageUrl; // 다음 패널 참조용으로 저장
        } else {
          throw new Error(result?.error || '이미지 데이터 없음');
        }
      } catch (err) {
        updatePanelImage(i, {
          status: 'error',
          imageUrl: '',
          error: err instanceof Error ? err.message : '오류 발생',
        });
        // 에러가 나도 다음 패널 시도 계속
      }
    }
  };

  // ── 개별 재생성 (이전 패널 이미지를 참조로 전달) ────────────────
  const regeneratePanel = async (panelIndex: number) => {
    if (!panels[panelIndex]) return;
    updatePanelImage(panelIndex, { status: 'loading', imageUrl: '' });

    // 이전 패널의 완성된 이미지를 참조로 전달 (일관성 유지)
    let referenceImage: string | undefined;
    if (panelIndex > 0) {
      const prevPanel = panelImages[panelIndex - 1];
      if (prevPanel?.status === 'done' && prevPanel.imageUrl) {
        referenceImage = prevPanel.imageUrl;
      }
    }

    try {
      const res = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: panels.map((p) => p.image_prompt),
          panelIndex,
          referenceImage,
          storyInput: { protagonist: input.protagonist, location: input.location },
        }),
      });
      const data: { images: PanelImageResult[]; error?: string } = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '이미지 생성 실패');
      
      // 이미지 수정 시 이전 편집본(캐시) 강제 삭제
      clearLocalCache();
      
      applyImageResults(data.images);
    } catch (err) {
      updatePanelImage(panelIndex, {
        status: 'error',
        imageUrl: '',
        error: err instanceof Error ? err.message : '오류 발생',
      });
    }
  };

  const allLoading = panelImages.some((s) => s.status === 'loading');
  const allDone = panelImages.every((s) => s.status === 'done' || s.status === 'error');

  const handleRegenerateAll = () => {
    clearLocalCache();
    resetImages();
    generateAll();
  };

  if (!panels || panels.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40">
      <GlobalHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 py-14 px-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-400/20 rounded-full blur-2xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {['① 이야기 입력', '② 이야기 확인', '③ 그림 완성'].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-5 h-0.5 bg-white/30" />}
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    i === 2 ? 'bg-white text-indigo-700'
                    : 'bg-white/30 text-white'
                  }`}>{s}</div>
                </React.Fragment>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
              {allDone ? '🎉 웹툰 완성!' : '🎨 그림을 그리고 있어요...'}
            </h1>
            <p className="text-indigo-100 text-base font-medium">
              {allDone
                ? `"${input.protagonist}"의 4컷 웹툰이 완성됐어요!`
                : 'AI가 각 컷에 어울리는 그림을 그리고 있어요. 잠깐만요! ✨'}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* 2×2 이미지 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {panels.map((panel, i) => (
            <ImageCard
              key={panel.panel}
              panelNum={panel.panel}
              story={panel.story}
              index={i}
              delay={i * 0.08}
              status={panelImages[i]?.status ?? 'idle'}
              imageUrl={panelImages[i]?.imageUrl ?? ''}
              error={panelImages[i]?.error}
              onRegenerate={regeneratePanel}
            />
          ))}
        </div>

        {/* 하단 액션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center"
        >
          {allDone && (
            <div className="mb-4">
              <p className="font-black text-gray-900 text-lg mb-1">🌟 웹툰 완성을 축하해요!</p>
              <p className="text-sm text-gray-500">그림이 마음에 안 들면 전체 또는 개별로 다시 그릴 수 있어요.</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 justify-center">
            {/* 전체 다시 그리기 */}
            <Button variant="outline" size="md"
              onClick={handleRegenerateAll}
              disabled={allLoading}
              leftIcon={<RefreshCw className={`w-4 h-4 ${allLoading ? 'animate-spin' : ''}`} />}
              id="regen-all-btn">
              전체 그림 다시 그리기
            </Button>

            {/* 이야기로 돌아가기 */}
            <Button variant="ghost" size="md"
              onClick={() => router.push('/create/story/result')}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              id="back-to-result-btn">
              이야기 확인으로 돌아가기
            </Button>

            {/* 말풍선 에디터 */}
            {allDone && (
              <Button variant="primary" size="md"
                onClick={() => router.push('/create/story/editor')}
                leftIcon={<Pencil className="w-4 h-4" />}
                id="open-editor-btn">
                ✏️ 말풍선 편집하기
              </Button>
            )}

            {/* 주제가 만들기 */}
            {allDone && (
              <Button variant="primary" size="md"
                onClick={async () => {
                  setIsTransitioning(true);
                  // 잠깐 기분 좋은 딜레이 (저장되는 느낌)
                  await new Promise(resolve => setTimeout(resolve, 600));
                  router.push('/create/story/music');
                }}
                disabled={isTransitioning}
                leftIcon={isTransitioning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                id="go-to-music-btn"
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 border-none shadow-lg">
                {isTransitioning ? '저장 중...' : '🎵 주제가 만들기!'}
              </Button>
            )}

            {/* 새 이야기 만들기 */}
            <Button variant="ghost" size="md"
              onClick={() => router.push('/create/story')}
              leftIcon={<Sparkles className="w-4 h-4" />}
              id="new-story-btn">
              새 이야기 만들기 ✨
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
