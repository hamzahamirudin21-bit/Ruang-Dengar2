import type { LabMapData } from '../../types';
import type { CameraTransform } from '../canvas/labRenderer';

export interface Viewport {
  width: number;
  height: number;
}

export const MIN_SCALE = 0.5;
export const MAX_SCALE = 3.2;

const FIT_PADDING = 28;

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function safeViewport(viewport: Viewport): Viewport {
  return {
    width: Math.max(0, finiteOr(viewport.width, 0)),
    height: Math.max(0, finiteOr(viewport.height, 0)),
  };
}

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, finiteOr(scale, MIN_SCALE)));
}

/** Skala penuh tanpa ruang kosong: peta selalu mengisi 100% lebar & tinggi viewport kanvas. */
export function coverFillScale(viewport: Viewport, map: LabMapData): number {
  const vp = safeViewport(viewport);
  const worldW = Math.max(1, map.width * map.tileSizePx);
  const worldH = Math.max(1, map.height * map.tileSizePx);
  const cover = Math.max(vp.width / worldW, vp.height / worldH);
  return clampScale(Math.max(cover * 1.03, 1.05));
}

/** Skala bawaan: lebih dekat daripada skala muat (fit), maksimum 2.2. */
export function defaultScale(viewport: Viewport, map: LabMapData): number {
  const vp = safeViewport(viewport);
  const worldW = Math.max(1, map.width * map.tileSizePx);
  const worldH = Math.max(1, map.height * map.tileSizePx);
  const availW = Math.max(200, vp.width - FIT_PADDING * 2);
  const availH = Math.max(160, vp.height - FIT_PADDING * 2);
  const fit = Math.max(0.45, Math.min(2.2, Math.min(availW / worldW, availH / worldH)));
  const close = Math.max(fit, Math.min(fit * 1.6, 2.2));
  return clampScale(close);
}

/** Mengalikan skala dan menjaga hasil dalam [MIN_SCALE, MAX_SCALE]. */
export function zoomScale(current: number, factor: number): number {
  return clampScale(finiteOr(current, 1) * finiteOr(factor, 1));
}

function clampAxis(offset: number, worldPx: number, viewportPx: number): number {
  if (worldPx >= viewportPx) {
    return Math.min(0, Math.max(viewportPx - worldPx, offset));
  }
  return (viewportPx - worldPx) / 2;
}

/** Peta mengisi viewport pada sumbu yang lebih kecil dari peta, terpusat pada sumbu sebaliknya. */
export function clampCamera(
  cam: CameraTransform,
  viewport: Viewport,
  map: LabMapData
): CameraTransform {
  const vp = safeViewport(viewport);
  const scale = clampScale(cam.scale);
  const worldW = map.width * map.tileSizePx * scale;
  const worldH = map.height * map.tileSizePx * scale;
  return {
    scale,
    offsetX: clampAxis(finiteOr(cam.offsetX, 0), worldW, vp.width),
    offsetY: clampAxis(finiteOr(cam.offsetY, 0), worldH, vp.height),
  };
}

/** Menggeser kamera ke target dengan peredaman eksponensial; melompat bila gerak dikurangi. */
export function followCamera(
  cam: CameraTransform,
  targetWorld: { x: number; y: number },
  viewport: Viewport,
  map: LabMapData,
  dtSeconds: number,
  reducedMotion: boolean
): CameraTransform {
  const vp = safeViewport(viewport);
  const scale = clampScale(cam.scale);
  const desiredX = vp.width / 2 - finiteOr(targetWorld.x, 0) * scale;
  const desiredY = vp.height / 2 - finiteOr(targetWorld.y, 0) * scale;
  const dt = Math.max(0, finiteOr(dtSeconds, 0));
  const k = reducedMotion ? 1 : 1 - Math.exp(-8 * dt);
  const offsetX = finiteOr(cam.offsetX, 0);
  const offsetY = finiteOr(cam.offsetY, 0);
  return clampCamera(
    {
      scale,
      offsetX: offsetX + (desiredX - offsetX) * k,
      offsetY: offsetY + (desiredY - offsetY) * k,
    },
    vp,
    map
  );
}
