/**
 * 이미지가 패널 프레임을 제대로 채우는지 검증합니다.
 *
 * 검사 항목:
 * 1. 테두리 화이트스페이스 비율 (엣지 픽셀 중 흰색 계열 비율)
 * 2. 단색 배경 비율 (전체 픽셀 중 uniform color 비율)
 */

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  edgeWhitespacePct: number; // 테두리 흰 픽셀 비율 (0~100)
  uniformPct: number;         // 단색/여백 비율 (0~100)
}

/** 픽셀이 "흰색 계열" (또는 매우 밝은 단색)인지 판단 */
function isWhitish(r: number, g: number, b: number): boolean {
  return r > 230 && g > 230 && b > 230;
}

/** 두 픽셀이 비슷한 색인지 판단 (허용 오차 15) */
function isSimilar(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number,
  tolerance = 15
): boolean {
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
}

/**
 * Canvas API를 사용하여 이미지가 프레임을 제대로 채우는지 검증.
 * (브라우저 전용 — 클라이언트 사이드에서만 호출 가능)
 */
export function validateImageFit(imageUrl: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const SIZE = 120; // 100×100 픽셀로 다운샘플링
      const EDGE = 8;   // 테두리에서 샘플링할 두께(px)

      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ valid: true, edgeWhitespacePct: 0, uniformPct: 0 });
        return;
      }

      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

      const getPixel = (x: number, y: number) => {
        const i = (y * SIZE + x) * 4;
        return { r: data[i], g: data[i + 1], b: data[i + 2] };
      };

      // ── 1. 테두리 엣지 픽셀 중 흰색 비율 ──────────────────
      let edgeWhite = 0;
      let edgeTotal = 0;

      for (let e = 0; e < EDGE; e++) {
        for (let i = 0; i < SIZE; i++) {
          // 상단
          const top = getPixel(i, e);
          if (isWhitish(top.r, top.g, top.b)) edgeWhite++;
          edgeTotal++;
          // 하단
          const bot = getPixel(i, SIZE - 1 - e);
          if (isWhitish(bot.r, bot.g, bot.b)) edgeWhite++;
          edgeTotal++;
        }
        for (let j = EDGE; j < SIZE - EDGE; j++) {
          // 좌측
          const lft = getPixel(e, j);
          if (isWhitish(lft.r, lft.g, lft.b)) edgeWhite++;
          edgeTotal++;
          // 우측
          const rgt = getPixel(SIZE - 1 - e, j);
          if (isWhitish(rgt.r, rgt.g, rgt.b)) edgeWhite++;
          edgeTotal++;
        }
      }

      const edgeWhitespacePct = Math.round((edgeWhite / edgeTotal) * 100);

      // ── 2. 전체 픽셀 중 코너 색상과 비슷한 단색 비율 ──────
      // 네 코너 색상 샘플 (대표 배경 색 추정)
      const corners = [
        getPixel(2, 2),
        getPixel(SIZE - 3, 2),
        getPixel(2, SIZE - 3),
        getPixel(SIZE - 3, SIZE - 3),
      ];

      let uniformCount = 0;
      const SAMPLE_STEP = 3; // 3픽셀마다 샘플(속도)
      let totalSampled = 0;

      for (let y = 0; y < SIZE; y += SAMPLE_STEP) {
        for (let x = 0; x < SIZE; x += SAMPLE_STEP) {
          const p = getPixel(x, y);
          // 네 코너 중 하나와 비슷하면 "uniform" 처리
          if (corners.some(c => isSimilar(p.r, p.g, p.b, c.r, c.g, c.b))) {
            uniformCount++;
          }
          totalSampled++;
        }
      }

      const uniformPct = Math.round((uniformCount / totalSampled) * 100);

      // ── 판정 ──────────────────────────────────────────────
      const EDGE_THRESHOLD = 35;    // 테두리 35% 이상 흰색이면 여백 과다
      const UNIFORM_THRESHOLD = 55; // 전체 55% 이상 단색이면 배경이 너무 많음

      if (edgeWhitespacePct > EDGE_THRESHOLD) {
        resolve({
          valid: false,
          reason: `테두리 여백이 많습니다 (${edgeWhitespacePct}%)`,
          edgeWhitespacePct,
          uniformPct,
        });
      } else if (uniformPct > UNIFORM_THRESHOLD) {
        resolve({
          valid: false,
          reason: `단색 배경이 너무 많습니다 (${uniformPct}%)`,
          edgeWhitespacePct,
          uniformPct,
        });
      } else {
        resolve({ valid: true, edgeWhitespacePct, uniformPct });
      }
    };

    img.onerror = () => {
      // 이미지 로드 실패 시 검증 통과로 처리
      resolve({ valid: true, edgeWhitespacePct: 0, uniformPct: 0 });
    };

    img.src = imageUrl;
  });
}
