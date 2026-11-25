import { ComicCameraPreset } from './StoryTimeline';

export interface CameraMatrix2D {
  zoom: number;
  panXNorm: number;
  panYNorm: number;
  rotationRad: number;
  shakeXPx: number;
  shakeYPx: number;
}

function easeInOutCubic(t: number): number {
  const p = Math.max(0, Math.min(1, t));
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/**
 * Menghitung pergerakan kamera sinematik 2D per panel komik:
 * zoom-in ke wajah/objek penting, pan mengikuti karakter berjalan,
 * transisi wide shot ke close-up, serta focus shifting antartokoh.
 */
export function computePanelCameraMatrix(
  preset: ComicCameraPreset,
  panelElapsedMs: number,
  pageDurationMs: number,
  reducedMotion = false
): CameraMatrix2D {
  if (reducedMotion) {
    return {
      zoom: 1,
      panXNorm: 0,
      panYNorm: 0,
      rotationRad: 0,
      shakeXPx: 0,
      shakeYPx: 0,
    };
  }

  const progress = Math.max(0, Math.min(1, panelElapsedMs / Math.max(1, pageDurationMs)));
  const e = easeInOutCubic(progress);
  const tSec = Math.max(0, panelElapsedMs) / 1000;

  switch (preset) {
    case 'pan-exterior-to-building':
      return {
        zoom: 1.03 + e * 0.09,
        panXNorm: -0.04 + e * 0.07,
        panYNorm: 0.02 - e * 0.03,
        rotationRad: 0,
        shakeXPx: 0,
        shakeYPx: 0,
      };

    case 'zoom-foliage-sign':
      return {
        zoom: 1.02 + e * 0.1,
        panXNorm: 0.02 * e,
        panYNorm: -0.02 * e,
        rotationRad: 0,
        shakeXPx: 0,
        shakeYPx: 0,
      };

    case 'track-walking-student':
      return {
        zoom: 1.04 + e * 0.06,
        panXNorm: -0.05 + e * 0.1,
        panYNorm: 0,
        rotationRad: 0,
        shakeXPx: 0,
        shakeYPx: 0,
      };

    case 'snap-zoom-feet': {
      const impact = panelElapsedMs < 350 ? Math.sin(tSec * 38) * 2.2 : 0;
      return {
        zoom: 1.05 + e * 0.12,
        panXNorm: 0.03 * e,
        panYNorm: 0.02 * e,
        rotationRad: -0.01 * e,
        shakeXPx: impact,
        shakeYPx: Math.abs(impact) * 0.6,
      };
    }

    case 'snap-zoom-hand-handle': {
      const clickShake =
        panelElapsedMs > 650 && panelElapsedMs < 1050 ? Math.sin(tSec * 45) * 2.8 : 0;
      return {
        zoom: 1.06 + e * 0.14,
        panXNorm: 0.04 * e,
        panYNorm: -0.02 * e,
        rotationRad: 0.012 * e,
        shakeXPx: clickShake,
        shakeYPx: -clickShake * 0.7,
      };
    }

    case 'push-through-open-doors':
      return {
        zoom: 1.02 + e * 0.12,
        panXNorm: -0.02 + e * 0.04,
        panYNorm: 0.02 - e * 0.04,
        rotationRad: 0,
        shakeXPx: 0,
        shakeYPx: 0,
      };

    case 'focus-solder-tip':
      return {
        zoom: 1.04 + e * 0.1,
        panXNorm: -0.02 + e * 0.04,
        panYNorm: 0.03 * e,
        rotationRad: 0,
        shakeXPx: 0,
        shakeYPx: 0,
      };

    case 'focus-coding-monitors':
      return {
        zoom: 1.04 + e * 0.08,
        panXNorm: 0.03 - e * 0.06,
        panYNorm: -0.01 * e,
        rotationRad: 0,
        shakeXPx: 0,
        shakeYPx: 0,
      };

    case 'focus-3d-nozzle':
      return {
        zoom: 1.03 + e * 0.09,
        panXNorm: -0.02 + e * 0.05,
        panYNorm: 0.02 * e,
        rotationRad: 0,
        shakeXPx: 0,
        shakeYPx: 0,
      };

    case 'focus-welding-arc': {
      const arcVibration = Math.sin(tSec * 32) * 1.1;
      return {
        zoom: 1.05 + e * 0.11,
        panXNorm: -0.03 + e * 0.05,
        panYNorm: 0.02 * e,
        rotationRad: 0,
        shakeXPx: arcVibration,
        shakeYPx: arcVibration * 0.5,
      };
    }

    case 'pan-group-discussion':
      return {
        zoom: 1.03 + e * 0.06,
        panXNorm: -0.04 + e * 0.08,
        panYNorm: 0,
        rotationRad: 0,
        shakeXPx: 0,
        shakeYPx: 0,
      };

    case 'pullback-community-panorama':
      return {
        zoom: 1.12 - e * 0.1,
        panXNorm: -0.03 + e * 0.06,
        panYNorm: 0.02 - e * 0.02,
        rotationRad: 0,
        shakeXPx: 0,
        shakeYPx: 0,
      };

    case 'dramatic-title-zoom':
      return {
        zoom: 1.02 + e * 0.08,
        panXNorm: 0,
        panYNorm: -0.02 * e,
        rotationRad: 0,
        shakeXPx: 0,
        shakeYPx: 0,
      };
  }
}
