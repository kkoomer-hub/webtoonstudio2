'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, User, MapPin, Clock, Lightbulb,
  ChevronRight, BookOpen, Wand2, AlertCircle, Info,
} from 'lucide-react';
import { GlobalHeader } from '@/components/layout/header';
import { Button, Card } from '@/components/ui-primitives';
import { useStoryStore } from '@/stores/story-store';
import type { StoryGenerationResponse } from '@/app/api/generate-story/route';

// =========================================================
// 예시 데이터
// =========================================================
const EXAMPLES = [
  {
    protagonist: '초등학생 민준',
    location: '학교 운동장',
    timeBackground: '봄날 점심시간',
    incident: '강아지가 갑자기 운동장으로 들어와서 친구들이 함께 도와주는 이야기',
  },
  {
    protagonist: '마법을 쓰는 어린이 소라',
    location: '숲 속 오두막',
    timeBackground: '여름 방학 오후',
    incident: '마법 지팡이가 사라져서 숲 속 동물 친구들과 함께 찾는 이야기',
  },
  {
    protagonist: '로봇을 만드는 어린이 태양',
    location: '발명 동아리 교실',
    timeBackground: '과학 발표회 날 아침',
    incident: '만들던 로봇이 혼자 움직이기 시작해서 학교를 돌아다니는 이야기',
  },
];

// =========================================================
// Input Field 컴포넌트
// =========================================================
interface FieldProps {
  id: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}
const InputField: React.FC<FieldProps> = ({
  id, label, placeholder, icon, hint, value, onChange, multiline = false, rows = 4,
}) => {
  const [focused, setFocused] = useState(false);
  const cls = `w-full px-4 bg-white border rounded-xl outline-none text-sm text-gray-800
    placeholder:text-gray-400 transition-all duration-200
    ${focused
      ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-sm'
      : 'border-gray-200 hover:border-gray-300'}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-bold text-gray-700">
        <span className="text-indigo-500">{icon}</span>
        {label}
      </label>
      {multiline ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={rows}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={`${cls} py-3 resize-none`} />
      ) : (
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={`${cls} h-11`} />
      )}
      {hint && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0" /> {hint}
        </p>
      )}
    </div>
  );
};

// =========================================================
// 로딩 애니메이션
// =========================================================
const LoadingDots: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-14 gap-5">
    <div className="relative">
      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
      </div>
      <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
    </div>
    <div className="text-center">
      <p className="text-lg font-black text-gray-900">🤖 AI가 이야기를 만들고 있어요!</p>
      <p className="text-sm text-gray-500 mt-1">잠깐만 기다려주세요...</p>
    </div>
    <div className="flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <motion.div key={i} className="w-2 h-2 rounded-full bg-indigo-400"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </div>
  </div>
);

// =========================================================
// Page
// =========================================================
export default function StoryFormPage() {
  const router = useRouter();
  const { input, setInput, setPanels, resetImages, clearLocalCache } = useStoryStore();

  const [protagonist, setProtagonist] = useState(input.protagonist);
  const [location, setLocation] = useState(input.location);
  const [timeBackground, setTimeBackground] = useState(input.timeBackground);
  const [incident, setIncident] = useState(input.incident);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid =
    protagonist.trim() && location.trim() && timeBackground.trim() && incident.trim();

  const applyExample = (ex: (typeof EXAMPLES)[0]) => {
    setProtagonist(ex.protagonist);
    setLocation(ex.location);
    setTimeBackground(ex.timeBackground);
    setIncident(ex.incident);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    setError(null);

    // 입력값 스토어에 저장 및 캐시 정리
    setInput({ protagonist, location, timeBackground, incident });
    resetImages();
    clearLocalCache();

    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protagonist, location, timeBackground, incident }),
      });
      const data: StoryGenerationResponse & { error?: string } = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '이야기 생성에 실패했습니다.');

      // 패널 스토어에 저장 후 result 페이지로 이동
      setPanels(data.webtoon);
      router.push('/create/story/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      setIsLoading(false);
    }
  };

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
                    i === 0 ? 'bg-white text-indigo-700' : 'bg-white/10 text-white/50'
                  }`}>{s}</div>
                </React.Fragment>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
              내 이야기로<br />
              <span className="text-yellow-300">웹툰을 만들어요! 🎨</span>
            </h1>
            <p className="text-indigo-100 text-base font-medium">
              주인공, 장소, 시간, 사건을 입력하면 AI가 4컷 이야기를 만들어 줘요!
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {isLoading ? (
          <LoadingDots />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            {/* Left — 입력 폼 */}
            <Card padding="lg" className="shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-lg font-black text-gray-900">✏️ 이야기 재료 입력하기</h2>
              </div>
              <div className="space-y-5">
                <InputField id="protagonist" label="주인공은 누구인가요? 👤"
                  placeholder="예: 초등학생 민준, 마법사 소라, 로봇을 좋아하는 태양"
                  icon={<User className="w-4 h-4" />}
                  hint="이름과 특징을 같이 쓰면 더 재미있는 이야기가 나와요!"
                  value={protagonist} onChange={setProtagonist} />
                <InputField id="location" label="어디서 일어나는 이야기인가요? 📍"
                  placeholder="예: 학교 운동장, 숲 속 오두막, 우주선 안"
                  icon={<MapPin className="w-4 h-4" />}
                  hint="장소를 자세히 쓸수록 그림이 더 예쁘게 만들어져요!"
                  value={location} onChange={setLocation} />
                <InputField id="time-background" label="언제, 어떤 세계인가요? 🕐"
                  placeholder="예: 봄날 점심시간, 마법이 있는 나라, 여름 방학 오후"
                  icon={<Clock className="w-4 h-4" />}
                  hint="'봄날', '밤', '마법 나라' 같은 것을 써주세요."
                  value={timeBackground} onChange={setTimeBackground} />
                <InputField id="incident" label="어떤 일이 생기나요? 💡"
                  placeholder={"예: 강아지가 갑자기 나타나서 친구들과 함께 도와준다\n마법 지팡이가 사라져서 찾으러 떠난다..."}
                  icon={<Lightbulb className="w-4 h-4" />}
                  hint="이야기에서 가장 중요한 사건을 써주세요!"
                  value={incident} onChange={setIncident} multiline rows={4} />

                <Button id="generate-story-btn" variant="primary" size="lg"
                  onClick={handleGenerate}
                  disabled={!isFormValid}
                  rightIcon={<Sparkles className="w-5 h-5" />}
                  className="w-full h-14 text-base font-black rounded-2xl shadow-xl shadow-indigo-200 disabled:shadow-none">
                  ✨ 웹툰 이야기 만들기!
                </Button>

                {!isFormValid && (
                  <p className="text-xs text-gray-400 text-center">
                    위에 있는 칸을 모두 채워야 이야기를 만들 수 있어요! 😊
                  </p>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-700">오류 발생</p>
                        <p className="text-sm text-red-600 mt-0.5">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>

            {/* Right — 예시 & 팁 */}
            <div className="space-y-5 lg:sticky lg:top-20">
              <Card padding="md" className="shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <h3 className="text-sm font-black text-gray-800">🎯 예시 이야기 바로 써보기</h3>
                </div>
                <div className="space-y-2.5">
                  {EXAMPLES.map((ex, i) => (
                    <button key={i} id={`example-${i}`} onClick={() => applyExample(ex)}
                      className="w-full text-left p-3.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-gray-700 group-hover:text-indigo-700 mb-1">{ex.protagonist}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{ex.incident}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 flex-shrink-0 mt-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card padding="md" className="shadow-sm bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
                <h3 className="text-sm font-black text-indigo-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  💡 더 재미있는 이야기 만들기 팁!
                </h3>
                <ul className="space-y-2">
                  {[
                    '주인공의 성격이나 특기를 쓰면 더 재미있어요',
                    '슬픔, 기쁨, 놀라움 같은 감정을 넣으면 신나요',
                    '마음에 안 들면 다시 만들기 버튼을 눌러보세요',
                    '친구들과 함께 만들어도 재미있어요',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-indigo-700">
                      <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
