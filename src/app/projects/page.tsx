'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GlobalHeader } from '@/components/layout/header';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { 
  BookOpenText, 
  ImagePlus, 
  MessageSquarePlus, 
  Music4, 
  Search, 
  Layout, 
  Home, 
  Layers, 
  Box, 
  Palette,
  Sparkles,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Bell,
  Settings,
  Clock,
  Star,
  Zap,
  Command,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_ITEMS = [
  { icon: Home, label: '홈', href: '/' },
  { icon: Layers, label: '프로젝트', active: true, href: '/projects' },
  { icon: Palette, label: '매직 스튜디오' },
  { icon: Star, label: '즐겨찾기' },
];

const SECONDARY_SIDEBAR = [
  { icon: Box, label: '브랜드 키트' },
  { icon: Layout, label: '내 콘텐츠' },
  { icon: HelpCircle, label: '도움말' },
];

const MAGIC_TOOLS = [
  { 
    icon: BookOpenText, 
    label: '스토리 만들기', 
    desc: 'AI가 당신의 키워드로 한 편의 이야기를 완성합니다.',
    color: 'from-blue-500 to-cyan-400', 
    shadow: 'shadow-blue-200',
    light: 'bg-blue-50'
  },
  { 
    icon: ImagePlus, 
    label: '웹툰 이미지 만들기', 
    desc: '문장 한 줄로 웹툰 스타일의 이미지를 생성하세요.',
    color: 'from-purple-600 to-pink-500', 
    shadow: 'shadow-purple-200',
    light: 'bg-purple-50'
  },
  { 
    icon: MessageSquarePlus, 
    label: '웹툰 말풍선 만들기', 
    desc: '대사를 넣으면 어울리는 말풍선을 디자인합니다.',
    color: 'from-orange-500 to-amber-400', 
    shadow: 'shadow-orange-200',
    light: 'bg-amber-50'
  },
  { 
    icon: Music4, 
    label: '주제가 만들기', 
    desc: '웹툰 스토리에 어울리는 BGM을 AI가 작곡합니다.',
    color: 'from-emerald-500 to-teal-400', 
    shadow: 'shadow-emerald-200',
    light: 'bg-emerald-50'
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('story_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setProjects(data);
      }
      setIsLoading(false);
    }
    fetchProjects();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFF]">
      <GlobalHeader />
      
      <div className="flex flex-1 overflow-hidden pt-1">
        {/* --- Premium Minimal Sidebar --- */}
        <aside className="w-[280px] border-r border-gray-100 flex flex-col py-8 bg-white/80 backdrop-blur-xl shrink-0 hidden lg:flex sticky top-0">
          <div className="px-6 mb-10">
            <button className="w-full h-14 bg-gray-900 text-white rounded-[20px] font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] shadow-xl shadow-gray-200 transition-all active:scale-98 relative overflow-hidden group">
               <Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" /> 
               디자인 만들기
               <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
             <div className="mb-8">
                <p className="px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">메인 메뉴</p>
                <nav className="space-y-1.5">
                  {SIDEBAR_ITEMS.map((item, idx) => (
                    <a 
                      key={idx}
                      href={item.href || '#'} 
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all group ${
                        item.active 
                          ? 'bg-gray-900 text-white shadow-lg' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${item.active ? 'text-indigo-400' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.active && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </a>
                  ))}
                </nav>
             </div>

             <div className="mb-8">
                <p className="px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">도구 및 라이브러리</p>
                <nav className="space-y-1.5">
                  {SECONDARY_SIDEBAR.map((item, idx) => (
                    <a 
                      key={idx}
                      href="#" 
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-all"
                    >
                      <item.icon className="w-5 h-5 text-gray-400" />
                      <span>{item.label}</span>
                    </a>
                  ))}
                </nav>
             </div>
          </div>

          <div className="px-6 mt-auto">
             <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl text-white shadow-2xl relative overflow-hidden group cursor-pointer">
                <div className="relative z-10">
                   <p className="text-sm font-black mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Studio Pro
                   </p>
                   <p className="text-xs font-medium text-white/80 leading-relaxed mb-4">
                      무제한 AI 생성 및 고품질 에셋을 이용하세요.
                   </p>
                   <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-black group-hover:bg-indigo-50 transition-colors">
                      업그레이드 하기
                   </button>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
             </div>
          </div>
        </aside>

        {/* --- Main Magically Enhanced Content --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 lg:p-12 max-w-[1440px] mx-auto">
            
            {/* Searching & Greeting Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
               <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">어떤 마법을 부려볼까요?</h1>
                  <p className="text-lg text-gray-500 font-medium tracking-tight">당신의 상상력을 현실로 바꿀 준비가 되었습니다.</p>
               </div>
               
               <div className={`relative flex-1 max-w-xl group transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
                  <div className={`flex items-center h-16 bg-white border rounded-2xl px-6 shadow-sm transition-all ${searchFocused ? 'border-gray-900 shadow-xl shadow-gray-100 ring-4 ring-gray-900/5' : 'border-gray-100'}`}>
                     <Search className={`w-5 h-5 mr-4 transition-colors ${searchFocused ? 'text-gray-900' : 'text-gray-400'}`} />
                     <input 
                       type="text" 
                       placeholder="원하는 디자인이나 도구를 검색하세요" 
                       className="bg-transparent border-none outline-none flex-1 text-gray-900 font-bold placeholder:text-gray-300"
                       onFocus={() => setSearchFocused(true)}
                       onBlur={() => setSearchFocused(false)}
                     />
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-gray-400 shadow-sm">
                        <Command className="w-3 h-3" /> K
                     </div>
                  </div>
               </div>
            </div>

            {/* AI Core Tools (Bento Card Style) */}
            <section className="mb-20">
               <div className="flex items-center gap-3 mb-10 px-2">
                  <div className="w-2.5 h-10 bg-indigo-600 rounded-full" />
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter">매직 크리에이티브 도구</h2>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 px-2">
                  {MAGIC_TOOLS.map((tool, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ y: -8 }}
                      className="group cursor-pointer"
                    >
                       <div className={`h-full rounded-[40px] bg-white border border-gray-100 p-10 transition-all duration-500 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] group-hover:border-transparent relative overflow-hidden`}>
                          {/* Hover Background Glow */}
                          <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                          
                          <div className={`w-20 h-20 rounded-3xl ${tool.light} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-[5deg] transition-all duration-500`}>
                             <tool.icon className={`w-10 h-10 text-transparent bg-clip-text bg-gradient-to-br ${tool.color}`} style={{ color: 'transparent', backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                          </div>
                          
                          <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight leading-tight">{tool.label}</h3>
                          <p className="text-gray-400 font-bold text-sm leading-relaxed mb-8">{tool.desc}</p>
                          
                          <div className="flex items-center justify-between text-gray-400 font-black text-xs uppercase tracking-widest mt-auto opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                             <span>체험하기</span>
                             <ChevronRight className="w-4 h-4" />
                          </div>
                          
                          {/* Accent Gradient Spot */}
                          <div className={`absolute -bottom-10 -right-10 w-32 h-32 opacity-0 group-hover:opacity-20 blur-3xl rounded-full bg-gradient-to-br ${tool.color} transition-opacity duration-700`} />
                       </div>
                    </motion.div>
                  ))}
               </div>
            </section>

            {/* Recent Creations Section */}
            <section>
               <div className="flex items-center justify-between mb-10 px-2">
                  <div className="flex items-center gap-4">
                     <h2 className="text-3xl font-black text-gray-900 tracking-tighter">내 웹툰 갤러리</h2>
                     {!isLoading && <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[11px] font-black">{projects.length}개</span>}
                  </div>
               </div>
               
               {isLoading ? (
                 <div className="flex justify-center py-20">
                   <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                 </div>
               ) : !user ? (
                 <div className="text-center py-20 text-gray-500 font-medium">로그인 후 나만의 웹툰을 저장하고 감상해보세요.</div>
               ) : projects.length === 0 ? (
                 <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                   <p className="text-gray-500 font-medium mb-4">아직 저장된 웹툰이 없습니다.</p>
                   <button 
                     onClick={() => router.push('/create/story')}
                     className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200"
                   >
                     스토리 만들기 시작
                   </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <div 
                      onClick={() => router.push('/create/story')}
                      className="aspect-[4/3] rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/10 transition-all"
                    >
                       <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6 text-indigo-600" />
                       </div>
                       <span className="font-extrabold text-gray-400">새 웹툰 만들기</span>
                    </div>
                    
                    {projects.map((proj) => (
                      <motion.div 
                        key={proj.id} 
                        whileHover={{ scale: 1.02 }}
                        onClick={() => router.push(`/projects/${proj.id}`)}
                        className="aspect-[4/3] rounded-[32px] bg-white border border-gray-100 overflow-hidden group cursor-pointer flex flex-col hover:shadow-2xl transition-all relative"
                      >
                         <div className="flex-1 overflow-hidden relative bg-gray-50 flex items-center justify-center">
                            {proj.cover_image_url ? (
                               <Image 
                                 src={proj.cover_image_url} 
                                 alt={proj.title || '프로젝트 썸네일'} 
                                 fill 
                                 unoptimized 
                                 className="object-cover group-hover:scale-110 transition-transform duration-700" 
                               />
                            ) : (
                               <ImagePlus className="w-10 h-10 text-gray-300" />
                            )}
                            <div className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
                               <ChevronRight className="w-5 h-5" />
                            </div>
                            {proj.music_url && (
                              <div className="absolute bottom-4 left-4">
                                <div className="px-3 py-1.5 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black rounded-lg flex items-center gap-1.5">
                                  <Music4 className="w-3 h-3" /> BGM 보유
                                </div>
                              </div>
                            )}
                         </div>
                         <div className="p-6">
                            <h4 className="font-black text-gray-900 mb-1 truncate text-lg">{proj.title || '제목 없는 웹툰'}</h4>
                            <p className="text-[11px] font-black text-gray-400 tracking-widest flex items-center gap-2">
                               <Clock className="w-3 h-3" /> {new Date(proj.created_at).toLocaleDateString()}
                            </p>
                         </div>
                      </motion.div>
                    ))}
                 </div>
               )}
            </section>
          </div>
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}
