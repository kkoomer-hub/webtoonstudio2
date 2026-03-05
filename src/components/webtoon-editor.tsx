'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fabric } from 'fabric';
import { useStoryStore } from '@/stores/story-store';
import {
  Trash2, Download, Minus, Plus,
  MessageCircle, Cloud, Square, Type, Music, CheckCircle2,
} from 'lucide-react';

// =========================================================
// 말풍선 SVG Path 정의
// =========================================================
// 1. 둥근 말풍선 (일반 대화)
const BUBBLE_ROUND =
  'M 20 0 H 180 Q 200 0 200 20 V 75 Q 200 95 180 95 H 100 L 75 125 L 85 95 H 20 Q 0 95 0 75 V 20 Q 0 0 20 0 Z';

// 2. 구름 말풍선 (생각)
const BUBBLE_CLOUD =
  'M 55 90 Q 25 90 20 65 Q 5 62 5 45 Q 5 28 22 25 Q 20 8 38 5 Q 50 -3 65 8 Q 76 0 95 5 Q 112 2 120 15 Q 138 12 148 28 Q 162 28 168 44 Q 178 50 175 65 Q 178 85 155 90 Z M 45 105 Q 45 115 52 115 Q 59 115 59 105 Q 59 98 52 98 Q 45 98 45 105 Z M 28 118 Q 28 124 33 124 Q 38 124 38 118 Q 38 112 33 112 Q 28 112 28 118 Z';

// 3. 사각 말풍선 (외침)
const BUBBLE_RECT =
  'M 0 0 H 200 V 100 H 120 L 100 130 L 90 100 H 0 Z';

type BubbleType = 'round' | 'cloud' | 'rect';

// =========================================================
// 색상 팔레트
// =========================================================
const FILL_COLORS = [
  '#ffffff', '#fef3c7', '#dbeafe', '#fce7f3',
  '#dcfce7', '#ede9fe', '#fee2e2', '#000000',
];
const TEXT_COLORS = ['#000000', '#1e3a8a', '#7c3aed', '#be123c', '#166534', '#92400e'];

// =========================================================
// WebtoonEditor 컴포넌트 (no SSR)
// =========================================================
export default function WebtoonEditor() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const [fillColor, setFillColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#222222');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [hasSelected, setHasSelected] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { panelImages } = useStoryStore();

  // ── 캔버스 초기화 ─────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 820,
      height: 820,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    // 선택 이벤트
    canvas.on('selection:created', () => setHasSelected(true));
    canvas.on('selection:updated', () => setHasSelected(true));
    canvas.on('selection:cleared', () => setHasSelected(false));

    // 더블클릭 시 텍스트 편집 활성화
    canvas.on('mouse:dblclick', (e) => {
      if (e.target && e.target.type === 'i-text') {
        (e.target as fabric.IText).enterEditing();
        canvas.renderAll();
      }
    });

    fabricRef.current = canvas;

    // 패널 이미지 로드
    loadPanelImages(canvas);

    return () => {
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 4컷 이미지 배치 ───────────────────────────────────────
  const loadPanelImages = useCallback(
    (canvas: fabric.Canvas) => {
      const PANEL_W = 410;
      const PANEL_H = 410;
      const GAP = 0;
      const positions = [
        { left: 0, top: 0 },
        { left: PANEL_W + GAP, top: 0 },
        { left: 0, top: PANEL_H + GAP },
        { left: PANEL_W + GAP, top: PANEL_H + GAP },
      ];

      // 컷 번호 레이블용 색상
      const labelColors = ['#4f46e5', '#7c3aed', '#d97706', '#059669'];

      panelImages.forEach((imgState, i) => {
        const pos = positions[i];

        if (imgState.status === 'done' && imgState.imageUrl) {
          fabric.Image.fromURL(
            imgState.imageUrl,
            (img) => {
              img.set({
                left: pos.left,
                top: pos.top,
                selectable: false,
                evented: false,
                crossOrigin: 'anonymous',
              });
              img.scaleToWidth(PANEL_W);
              img.scaleToHeight(PANEL_H);
              canvas.add(img);
              canvas.sendToBack(img);

              // 컷 번호 배지
              addPanelLabel(canvas, i + 1, pos.left + 8, pos.top + 8, labelColors[i]);
              canvas.renderAll();
            },
            { crossOrigin: 'anonymous' }
          );
        } else {
          // 이미지가 없으면 placeholder 사각형
          const placeholder = new fabric.Rect({
            left: pos.left,
            top: pos.top,
            width: PANEL_W,
            height: PANEL_H,
            fill: '#f3f4f6',
            stroke: '#e5e7eb',
            strokeWidth: 2,
            selectable: false,
            evented: false,
          });
          const label = new fabric.Text(`${i + 1}컷`, {
            left: pos.left + PANEL_W / 2,
            top: pos.top + PANEL_H / 2,
            originX: 'center',
            originY: 'center',
            fontSize: 32,
            fill: '#9ca3af',
            selectable: false,
            evented: false,
          });
          canvas.add(placeholder, label);
          addPanelLabel(canvas, i + 1, pos.left + 8, pos.top + 8, labelColors[i]);
          canvas.renderAll();
        }
      });

      // 패널 구분선
      const divider = new fabric.Line([PANEL_W, 0, PANEL_W, 820], {
        stroke: '#1f2937',
        strokeWidth: 3,
        selectable: false,
        evented: false,
      });
      const dividerH = new fabric.Line([0, PANEL_H, 820, PANEL_H], {
        stroke: '#1f2937',
        strokeWidth: 3,
        selectable: false,
        evented: false,
      });
      canvas.add(divider, dividerH);
      canvas.renderAll();
    },
    [panelImages]
  );

  // 컷 번호 배지
  const addPanelLabel = (
    canvas: fabric.Canvas,
    num: number,
    x: number,
    y: number,
    color: string
  ) => {
    const badge = new fabric.Circle({
      left: x,
      top: y,
      radius: 16,
      fill: color,
      selectable: false,
      evented: false,
    });
    const text = new fabric.Text(String(num), {
      left: x + 16,
      top: y + 16,
      originX: 'center',
      originY: 'center',
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#ffffff',
      selectable: false,
      evented: false,
    });
    canvas.add(badge, text);
  };

  // ── 말풍선 추가 ───────────────────────────────────────────
  const addBubble = (type: BubbleType) => {
    const c = fabricRef.current;
    if (!c) return;

    const pathData =
      type === 'round' ? BUBBLE_ROUND : type === 'cloud' ? BUBBLE_CLOUD : BUBBLE_RECT;

    const shape = new fabric.Path(pathData, {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2,
      left: 200,
      top: 80,
      scaleX: 1.2,
      scaleY: 1.2,
    });

    const itext = new fabric.IText('대사를 입력하세요', {
      left: shape.left! + 20,
      top: shape.top! + 30,
      fontSize,
      fill: textColor,
      fontFamily: 'Noto Sans KR, sans-serif',
      textAlign: 'center',
      width: 200,
    });

    c.add(shape, itext);
    c.setActiveObject(itext);
    c.renderAll();
    setHasSelected(true);
  };

  // ── 텍스트만 추가 ──────────────────────────────────────────
  const addText = () => {
    const c = fabricRef.current;
    if (!c) return;

    const itext = new fabric.IText('텍스트를 입력하세요', {
      left: 100,
      top: 100,
      fontSize,
      fill: textColor,
      fontFamily: 'Noto Sans KR, sans-serif',
      fontWeight: 'bold',
    });
    c.add(itext);
    c.setActiveObject(itext);
    itext.enterEditing();
    c.renderAll();
    setHasSelected(true);
  };

  // ── 선택 삭제 ─────────────────────────────────────────────
  const deleteSelected = () => {
    const c = fabricRef.current;
    if (!c) return;
    c.getActiveObjects().forEach((obj) => {
      // 잠긴(non-selectable) 배경 객체는 삭제 불가
      if (obj.selectable !== false) c.remove(obj);
    });
    c.discardActiveObject();
    c.renderAll();
    setHasSelected(false);
  };

  // ── 선택 색상 변경 ───────────────────────────────────────
  const applyFillToSelected = (color: string) => {
    setFillColor(color);
    const c = fabricRef.current;
    if (!c) return;
    c.getActiveObjects().forEach((obj) => {
      obj.set('fill', color);
    });
    c.renderAll();
  };

  const applyTextColorToSelected = (color: string) => {
    setTextColor(color);
    const c = fabricRef.current;
    if (!c) return;
    c.getActiveObjects().forEach((obj) => {
      if (obj.type === 'i-text') (obj as fabric.IText).set('fill', color);
    });
    c.renderAll();
  };

  const applyFontSize = (size: number) => {
    setFontSize(size);
    const c = fabricRef.current;
    if (!c) return;
    c.getActiveObjects().forEach((obj) => {
      if (obj.type === 'i-text') (obj as fabric.IText).set('fontSize', size);
    });
    c.renderAll();
  };

  // ── PNG 내보내기 (다운로드)
  const exportPNG = () => {
    const c = fabricRef.current;
    if (!c) return;
    c.discardActiveObject();
    c.renderAll();
    const dataURL = c.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'webtoon_4cut.png';
    link.click();
  };

  // ── 저장 후 주제가 페이지로 이동 ──────────────────────────
  const saveAndGoMusic = async () => {
    const c = fabricRef.current;
    if (!c) return;
    
    setIsSaved(true); // 로딩 상태 시작
    c.discardActiveObject();
    c.renderAll();

    // 캔버스를 PNG dataURL로 변환
    const dataURL = c.toDataURL({ format: 'png', quality: 0.8, multiplier: 1.5 });
    
    try {
      // 서버 API를 통해 Supabase Storage에 업로드
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataURL,
          path: `edited/webtoon_${Date.now()}.png`
        })
      });
      
      const data = await res.json();
      if (data.url) {
        // 성공 시 억 단위 base64 대신 짧은 URL 저장
        const { set } = await import('idb-keyval');
        await set('edited-webtoon', data.url);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Failed to upload edited webtoon:', err);
      // 실패 시 폴백 (작은 사이즈로 시도하거나 경고)
      try {
        const smallDataURL = c.toDataURL({ format: 'png', quality: 0.5, multiplier: 0.6 });
        const { set } = await import('idb-keyval');
        await set('edited-webtoon', smallDataURL);
      } catch (e) {
        console.error('Final fallback failed:', e);
      }
    }

    // 주제가 페이지로 이동
    router.push('/create/story/music');
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-0 min-h-screen bg-gray-100">
      {/* ── 툴바 ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm sticky top-0 z-20">

        {/* 말풍선 추가 */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-black text-gray-500 mr-1">말풍선</span>
          <ToolBtn
            id="add-bubble-round"
            label="둥근"
            icon={<MessageCircle className="w-4 h-4" />}
            onClick={() => addBubble('round')}
          />
          <ToolBtn
            id="add-bubble-cloud"
            label="구름"
            icon={<Cloud className="w-4 h-4" />}
            onClick={() => addBubble('cloud')}
          />
          <ToolBtn
            id="add-bubble-rect"
            label="사각"
            icon={<Square className="w-4 h-4" />}
            onClick={() => addBubble('rect')}
          />
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* 텍스트 추가 */}
        <ToolBtn
          id="add-text"
          label="텍스트"
          icon={<Type className="w-4 h-4" />}
          onClick={addText}
        />

        <div className="w-px h-6 bg-gray-200" />

        {/* 채우기 색상 */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-400 font-bold">채우기</span>
          <div className="flex gap-1">
            {FILL_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => applyFillToSelected(c)}
                title={c}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 ${
                  fillColor === c ? 'border-indigo-500 scale-125' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* 글자 색상 */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-400 font-bold">글자색</span>
          <div className="flex gap-1">
            {TEXT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => applyTextColorToSelected(c)}
                title={c}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 ${
                  textColor === c ? 'border-indigo-500 scale-125' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* 글자 크기 */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-gray-400 font-bold">글자 크기 {fontSize}px</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => applyFontSize(Math.max(10, fontSize - 2))}
              className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-bold">{fontSize}</span>
            <button
              onClick={() => applyFontSize(Math.min(60, fontSize + 2))}
              className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* 삭제 */}
        {hasSelected && (
          <button
            id="delete-selected"
            onClick={deleteSelected}
            className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200 hover:bg-red-100 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> 삭제
          </button>
        )}

        <div className="flex-1" />

        {/* PNG 다운로드 */}
        <button
          id="export-png"
          onClick={exportPNG}
          className="flex items-center gap-2 px-4 h-9 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-all border border-gray-200"
        >
          <Download className="w-4 h-4" /> PNG 저장
        </button>

        {/* 저장하고 주제가 만들기 */}
        <button
          id="save-and-go-music"
          onClick={saveAndGoMusic}
          disabled={isSaved}
          className={`flex items-center gap-2 px-5 h-9 rounded-xl text-sm font-black transition-all shadow-md ${
            isSaved
              ? 'bg-green-500 text-white shadow-green-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 hover:from-yellow-300 hover:to-orange-300 shadow-yellow-200 active:scale-95'
          }`}
        >
          {isSaved ? (
            <><CheckCircle2 className="w-4 h-4" /> 저장 완료! 이동 중...</>
          ) : (
            <><Music className="w-4 h-4" /> 저장하고 주제가 만들기!</>
          )}
        </button>
      </div>

      {/* ── 캔버스 영역 ── */}
      <div className="flex-1 flex items-start justify-center p-8 overflow-auto">
        <div className="shadow-2xl rounded-sm overflow-hidden border border-gray-300">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* 안내 */}
      <div className="bg-white border-t border-gray-100 px-4 py-2 text-center text-xs text-gray-400">
        말풍선/텍스트: 드래그로 이동 · 모서리 핸들로 크기 조절 · 더블클릭으로 텍스트 편집 · Delete키로 삭제
      </div>
    </div>
  );
}

// ─── 툴 버튼 ───────────────────────────────────────────────
interface ToolBtnProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}
function ToolBtn({ id, label, icon, onClick }: ToolBtnProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 transition-all"
    >
      {icon}
      <span className="text-[10px] font-bold leading-none">{label}</span>
    </button>
  );
}
