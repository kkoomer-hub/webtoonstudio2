'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Pencil,
  Image as ImageIcon,
  Type,
  LayoutGrid,
  Undo,
  Redo,
  Download,
  Eye,
  Share2,
  Play,
  Trash2,
  Plus,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Wand2,
  Layers,
  ChevronRight,
  ChevronLeft,
  MousePointer,
  Square,
  Circle,
  Triangle,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  Palette,
  Sliders,
} from 'lucide-react';
import { Button, Badge, Tooltip, Spinner } from '@/components/ui-primitives';
import { useWebtoonStore } from '@/stores/webtoon-store';
import type { StudioTab } from '@/types';

// =========================================================
// Studio Tool Types
// =========================================================
const STUDIO_TABS: { id: StudioTab; icon: React.ElementType; label: string }[] = [
  { id: 'canvas', icon: MousePointer, label: '선택' },
  { id: 'panels', icon: LayoutGrid, label: '패널' },
  { id: 'text', icon: Type, label: '텍스트' },
  { id: 'assets', icon: ImageIcon, label: '에셋' },
  { id: 'ai', icon: Sparkles, label: 'AI' },
];

const AI_STYLES = ['귀여운 느낌', '밝고 화사한', '판타지', '학교 이야기', '동물 친구', '우주 모험', '마법 세계'];
const AI_PROMPTS = [
  '학교 운동장, 봄날, 강아지와 친구들',
  '숲 속 오두막, 마법사 어린이, 반짝이는 빛',
  '우주선 안, 로봇 친구, 신비로운 행성',
  '바닷속 세계, 인어 공주, 물고기 친구들',
  '마법 학교, 빗자루 타기, 무지개 하늘',
];

// =========================================================
// Panel Component (웹툰 패널)
// =========================================================
interface PanelItemProps {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const PanelItem: React.FC<PanelItemProps> = ({ index, isSelected, onClick, onDelete }) => {
  const gradients = [
    'from-indigo-100 to-blue-100',
    'from-purple-100 to-pink-100',
    'from-amber-100 to-yellow-100',
    'from-green-100 to-teal-100',
    'from-red-100 to-orange-100',
  ];

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
        isSelected
          ? 'border-indigo-500 shadow-lg shadow-indigo-200'
          : 'border-transparent hover:border-gray-200'
      }`}
    >
      <div
        className={`aspect-[3/4] bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center`}
      >
        <span className="text-xs font-bold text-gray-400">패널 {index + 1}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
      >
        ×
      </button>
    </div>
  );
};

// =========================================================
// Studio Sidebar Panels
// =========================================================
const AISidebarPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('웹툰');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2500);
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
          AI 그림 만들기 ✨
        </h3>
        <div className="relative">
          <textarea
            id="ai-prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={"어떤 장면을 그리고 싶은가요?\n예: 학교 운동장에서 강아지랑 노는 어린이"}
            className="w-full h-28 p-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-xs resize-none"
          />
        </div>
      </div>

      {/* Quick Prompts */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">빠른 프롬프트</p>
        <div className="flex flex-col gap-1.5">
          {AI_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => setPrompt(p)}
              className="text-left text-xs p-2.5 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">스타일</p>
        <div className="flex flex-wrap gap-1.5">
          {AI_STYLES.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStyle === style
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        onClick={handleGenerate}
        loading={isGenerating}
        leftIcon={<Wand2 className="w-4 h-4" />}
        className="w-full"
        id="ai-generate-btn"
      >
        {isGenerating ? 'AI 생성 중...' : 'AI 이미지 생성'}
      </Button>

      {isGenerating && (
        <div className="text-center py-6">
          <Spinner size="lg" className="mx-auto mb-3" />
          <p className="text-xs text-gray-500">AI가 장면을 그리고 있어요...</p>
        </div>
      )}
    </div>
  );
};

const TextSidebarPanel: React.FC = () => (
  <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
      텍스트 & 말풍선
    </h3>
    <div className="space-y-3">
      {['일반 말풍선', '화난 말풍선', '속삭임', '효과음', '나레이션'].map((type) => (
        <button
          key={type}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group text-sm font-semibold text-gray-700 hover:text-indigo-600"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-500">
            <Type className="w-4 h-4" />
          </div>
          {type}
          <ChevronRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-indigo-400" />
        </button>
      ))}
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">텍스트 스타일</p>
      <div className="flex gap-2">
        {[Bold, Italic, AlignLeft, AlignCenter].map((Icon, i) => (
          <button
            key={i}
            className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-gray-500 transition-all"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

const AssetsSidebarPanel: React.FC = () => (
  <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
      에셋 라이브러리
    </h3>
    <div className="relative">
      <input
        type="text"
        placeholder="에셋 검색..."
        className="w-full h-9 pl-3 pr-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-xs"
      />
    </div>
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 12 }).map((_, i) => {
        const colors = [
          'from-indigo-100 to-blue-100',
          'from-purple-100 to-pink-100',
          'from-amber-100 to-yellow-100',
          'from-green-100 to-teal-100',
        ];
        return (
          <div
            key={i}
            className={`aspect-square rounded-xl bg-gradient-to-br ${colors[i % colors.length]} cursor-pointer hover:scale-105 transition-transform border-2 border-transparent hover:border-indigo-300 flex items-center justify-center`}
          >
            <ImageIcon className="w-5 h-5 text-gray-300" />
          </div>
        );
      })}
    </div>
  </div>
);

const PanelsSidebarPanel: React.FC<{
  panels: number[];
  selectedPanel: number;
  onSelectPanel: (i: number) => void;
  onAddPanel: () => void;
  onDeletePanel: (i: number) => void;
}> = ({ panels, selectedPanel, onSelectPanel, onAddPanel, onDeletePanel }) => (
  <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto">
    <div className="flex items-center justify-between">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
        패널 목록
      </h3>
      <Button variant="ghost" size="icon" onClick={onAddPanel} id="add-panel-btn">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {panels.map((_, i) => (
        <PanelItem
          key={i}
          index={i}
          isSelected={selectedPanel === i}
          onClick={() => onSelectPanel(i)}
          onDelete={() => onDeletePanel(i)}
        />
      ))}
      <button
        onClick={onAddPanel}
        className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer"
      >
        <Plus className="w-6 h-6" />
        <span className="text-xs font-semibold">패널 추가</span>
      </button>
    </div>
  </div>
);

// =========================================================
// Main Studio Page
// =========================================================
export default function StudioPage() {
  const { projects } = useWebtoonStore();
  const [activeTab, setActiveTab] = useState<StudioTab>('canvas');
  const [panels, setPanels] = useState<number[]>([0, 1, 2]);
  const [selectedPanel, setSelectedPanel] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentProject = projects[0];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1200);
  };

  const handleAddPanel = useCallback(() => {
    setPanels((prev) => [...prev, prev.length]);
  }, []);

  const handleDeletePanel = useCallback((index: number) => {
    setPanels((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [0];
    });
    setSelectedPanel(0);
  }, []);

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'ai':
        return <AISidebarPanel />;
      case 'text':
        return <TextSidebarPanel />;
      case 'assets':
        return <AssetsSidebarPanel />;
      case 'panels':
        return (
          <PanelsSidebarPanel
            panels={panels}
            selectedPanel={selectedPanel}
            onSelectPanel={setSelectedPanel}
            onAddPanel={handleAddPanel}
            onDeletePanel={handleDeletePanel}
          />
        );
      default:
        return (
          <div className="p-4 flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
              캔버스 도구
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: MousePointer, label: '선택' },
                { icon: Pencil, label: '그리기' },
                { icon: Square, label: '사각형' },
                { icon: Circle, label: '원형' },
                { icon: Type, label: '텍스트' },
                { icon: Layers, label: '레이어' },
                { icon: Palette, label: '색상' },
                { icon: Sliders, label: '조절' },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  id={`tool-${label}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 transition-all group"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* ===== Top Bar ===== */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-700">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-black text-sm tracking-tight hidden sm:block">
            Studio
          </span>
        </div>

        {/* Project Name */}
        <div className="flex-1">
          <input
            id="project-title-input"
            type="text"
            defaultValue={currentProject?.title || '새 에피소드'}
            className="bg-transparent text-white font-bold text-sm outline-none border-b border-transparent hover:border-gray-600 focus:border-indigo-500 transition-colors px-1 py-0.5"
          />
        </div>

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <Tooltip label="실행 취소 (Ctrl+Z)" position="bottom">
            <button className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-all">
              <Undo className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip label="다시 실행 (Ctrl+Y)" position="bottom">
            <button className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-all">
              <Redo className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 bg-gray-800 rounded-xl px-2 py-1">
          <button
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            className="w-6 h-6 text-gray-400 hover:text-white flex items-center justify-center"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-gray-300 w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            className="w-6 h-6 text-gray-400 hover:text-white flex items-center justify-center"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-all">
            <Eye className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-all">
            <Share2 className="w-4 h-4" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            loading={isSaving}
            className="text-gray-300 hover:text-white hover:bg-gray-700 border border-gray-700"
            id="save-btn"
          >
            {isSaving ? '저장 중...' : '저장'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Play className="w-3.5 h-3.5" />}
            className="font-bold"
            id="publish-btn"
          >
            게시
          </Button>
        </div>
      </header>

      {/* ===== Main Area ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===== Icon Toolbar ===== */}
        <div className="w-14 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-3 gap-1 flex-shrink-0">
          {STUDIO_TABS.map((tab) => (
            <Tooltip key={tab.id} label={tab.label} position="right">
              <button
                id={`studio-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:text-white hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
              </button>
            </Tooltip>
          ))}
        </div>

        {/* ===== Sidebar Panel ===== */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-64 bg-white border-r border-gray-100 flex-shrink-0 overflow-hidden flex flex-col"
            >
              {renderSidebarContent()}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          id="sidebar-collapse-btn"
          className="absolute left-[268px] top-1/2 -translate-y-1/2 z-10 w-5 h-10 bg-white border border-gray-200 rounded-r-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all shadow-sm"
          style={{ left: sidebarCollapsed ? '56px' : '268px' }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

        {/* ===== Canvas Area ===== */}
        <div className="flex-1 bg-gray-950 overflow-auto flex items-center justify-center p-8 relative">
          {/* Canvas Grid Background */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'radial-gradient(circle, #6366f1 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Canvas */}
          <motion.div
            id="studio-canvas"
            className="relative bg-white rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
            style={{
              width: 480,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Panel Display */}
            <div className="relative">
              {panels.map((_, i) => {
                const gradients = [
                  'from-indigo-100 to-blue-100',
                  'from-purple-100 to-pink-100',
                  'from-amber-100 to-yellow-100',
                ];
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedPanel(i)}
                    className={`relative cursor-pointer border-b-2 ${
                      selectedPanel === i
                        ? 'border-indigo-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}
                      style={{ height: 300 }}
                    >
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                        <p className="text-sm font-semibold">패널 {i + 1}</p>
                        <p className="text-xs text-gray-300 mt-1">
                          클릭하여 선택 · 더블클릭하여 편집
                        </p>
                      </div>
                    </div>
                    {selectedPanel === i && (
                      <div className="absolute inset-0 ring-2 ring-indigo-500 pointer-events-none rounded-sm" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Zoom Reset */}
          <button
            onClick={() => setZoom(100)}
            className="absolute bottom-4 right-4 w-8 h-8 bg-gray-800 text-gray-400 hover:text-white rounded-xl flex items-center justify-center transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Panel Info */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs text-gray-300 font-semibold">
            패널 {selectedPanel + 1} / {panels.length} · 800 × 1200px
          </div>
        </div>
      </div>
    </div>
  );
}
