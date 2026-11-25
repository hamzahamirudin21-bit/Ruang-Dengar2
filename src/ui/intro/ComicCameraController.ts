import { TileViewport } from './StoryTimeline';

export interface PanelWorldCamera {
  /** Skala piksel kanvas per piksel dunia LAB_MAP */
  scale: number;
  /** Offset X dalam piksel kanvas */
  offsetX: number;
  /** Offset Y dalam piksel kanvas */
  offsetY: number;
  /** Viewport tile aktif hasil interpolasi */
  viewport: TileViewport;
}

function easeInOutCubic(t: number): number {
  const p = Math.max(0, Math.min(1, t));
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

export function interpolateTileViewport(
  start: TileViewport,
  end: TileViewport,
  progress01: number,
  reducedMotion = false
): TileViewport {
  if (reducedMotion) {
    return {
      x: (start.x + end.x) * 0.5,
      y: (start.y + end.y) * 0.5,
      w: (start.w + end.w) * 0.5,
      h: (start.h + end.h) * 0.5,
    };
  }
  const e = easeInOutCubic(progress01);
  return {
    x: start.x + (end.x - start.x) * e,
    y: start.y + (end.y - start.y) * e,
    w: start.w + (end.w - start.w) * e,
    h: start.h + (end.h - start.h) * e,
  };
}

/**
 * Menghitung transformasi kamera 2D dari koordinat dunia LAB_MAP (tileSizePx = 28)
 * ke kanvas panel komik menggunakan pendekatan cover-fill terpusat sehingga
 * tidak pernah ada area hitam kosong di tepi panel.
 */
export function computePanelWorldCamera(
  startViewport: TileViewport,
  endViewport: TileViewport,
  panelElapsedMs: number,
  pageDurationMs: number,
  canvasWidth: number,
  canvasHeight: number,
  tileSizePx: number,
  reducedMotion = false
): PanelWorldCamera {
  const progress01 = Math.max(0, Math.min(1, panelElapsedMs / Math.max(1, pageDurationMs)));
  const vp = interpolateTileViewport(startViewport, endViewport, progress01, reducedMotion);

  const viewWorldW = Math.max(4, vp.w) * tileSizePx;
  const viewWorldH = Math.max(3, vp.h) * tileSizePx;
  const viewCenterX = (vp.x + vp.w * 0.5) * tileSizePx;
  const viewCenterY = (vp.y + vp.h * 0.5) * tileSizePx;

  // Gunakan Math.max agar ilustrasi peta memenuhi 100% panel tanpa ruang kosong
  const scaleX = canvasWidth / Math.max(1, viewWorldW);
  const scaleY = canvasHeight / Math.max(1, viewWorldH);
  const scale = Math.max(scaleX, scaleY);

  const offsetX = canvasWidth * 0.5 - viewCenterX * scale;
  const offsetY = canvasHeight * 0.5 - viewCenterY * scale;

  return {
    scale,
    offsetX,
    offsetY,
    viewport: vp,
  };
}

/**
 * Mengonversi posisi tile dunia LAB_MAP (x, y) ke koordinat normalisasi (0..1) di dalam panel
 * agar ekor balon dialog mengarah tepat ke atas kepala sprite miniatur.
 */
export function worldTileToPanelNorm(
  tileX: number,
  tileY: number,
  camera: PanelWorldCamera,
  canvasWidth: number,
  canvasHeight: number,
  tileSizePx: number,
  verticalOffsetWorldPx = -52
): { xNorm: number; yNorm: number } {
  const worldX = (tileX + 0.5) * tileSizePx;
  const worldY = (tileY + 0.5) * tileSizePx + 8 + verticalOffsetWorldPx;
  const screenX = worldX * camera.scale + camera.offsetX;
  const screenY = worldY * camera.scale + camera.offsetY;

  return {
    xNorm: Math.max(0.06, Math.min(0.94, screenX / Math.max(1, canvasWidth))),
    yNorm: Math.max(0.08, Math.min(0.92, screenY / Math.max(1, canvasHeight))),
  };
}
