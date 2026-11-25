import { PanelEnterDirection } from './StoryTimeline';

export interface PanelTransitionState {
  isVisible: boolean;
  revealProgress01: number;
  cssTransform: string;
  cssClipPath: string;
  opacity: number;
  impactFlash01: number;
  speedLinesIntensity01: number;
}

function easeOutBack(t: number): number {
  const p = Math.max(0, Math.min(1, t));
  const c1 = 1.45;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
}

/**
 * Menghitung animasi masuk panel komik (Panel Reveal, Masking, Impact Flash,
 * dan Speed Lines) sehingga setiap panel terbuka berurutan mengikuti kronologi cerita.
 */
export function computePanelTransitionState(
  enterDirection: PanelEnterDirection,
  pageElapsedMs: number,
  revealAtMs: number,
  reducedMotion = false
): PanelTransitionState {
  if (pageElapsedMs < revealAtMs) {
    return {
      isVisible: false,
      revealProgress01: 0,
      cssTransform: 'translate3d(0px, 0px, 0px) scale(0.95)',
      cssClipPath: 'inset(0% 100% 0% 0%)',
      opacity: 0,
      impactFlash01: 0,
      speedLinesIntensity01: 0,
    };
  }

  const panelElapsed = pageElapsedMs - revealAtMs;
  if (reducedMotion) {
    return {
      isVisible: true,
      revealProgress01: 1,
      cssTransform: 'translate3d(0px, 0px, 0px) scale(1)',
      cssClipPath: 'inset(0% 0% 0% 0%)',
      opacity: 1,
      impactFlash01: 0,
      speedLinesIntensity01: 0,
    };
  }

  const revealDurationMs = 460;
  const rawP = Math.max(0, Math.min(1, panelElapsed / revealDurationMs));
  const eased = easeOutBack(rawP);
  const clipPct = Math.round((1 - Math.min(1, rawP * 1.25)) * 100);

  // Kilatan komik singkat (impact flash) saat panel baru saja terkunci masuk
  const impactFlash01 =
    panelElapsed >= 180 && panelElapsed <= 380
      ? Math.max(0, 1 - Math.abs(panelElapsed - 260) / 110) * 0.45
      : 0;

  const speedLinesIntensity01 = rawP < 1 ? 0.85 : 0.35;

  switch (enterDirection) {
    case 'from-left': {
      const tx = (1 - eased) * -42;
      return {
        isVisible: true,
        revealProgress01: rawP,
        cssTransform: `translate3d(${tx.toFixed(1)}px, 0px, 0px) scale(${(0.94 + 0.06 * rawP).toFixed(3)})`,
        cssClipPath: `inset(0% ${clipPct}% 0% 0%)`,
        opacity: Math.min(1, rawP * 2.2),
        impactFlash01,
        speedLinesIntensity01,
      };
    }
    case 'from-right': {
      const tx = (1 - eased) * 42;
      return {
        isVisible: true,
        revealProgress01: rawP,
        cssTransform: `translate3d(${tx.toFixed(1)}px, 0px, 0px) scale(${(0.94 + 0.06 * rawP).toFixed(3)})`,
        cssClipPath: `inset(0% 0% 0% ${clipPct}%)`,
        opacity: Math.min(1, rawP * 2.2),
        impactFlash01,
        speedLinesIntensity01,
      };
    }
    case 'from-top': {
      const ty = (1 - eased) * -36;
      return {
        isVisible: true,
        revealProgress01: rawP,
        cssTransform: `translate3d(0px, ${ty.toFixed(1)}px, 0px) scale(${(0.95 + 0.05 * rawP).toFixed(3)})`,
        cssClipPath: `inset(0% 0% ${clipPct}% 0%)`,
        opacity: Math.min(1, rawP * 2.2),
        impactFlash01,
        speedLinesIntensity01,
      };
    }
    case 'from-bottom': {
      const ty = (1 - eased) * 36;
      return {
        isVisible: true,
        revealProgress01: rawP,
        cssTransform: `translate3d(0px, ${ty.toFixed(1)}px, 0px) scale(${(0.95 + 0.05 * rawP).toFixed(3)})`,
        cssClipPath: `inset(${clipPct}% 0% 0% 0%)`,
        opacity: Math.min(1, rawP * 2.2),
        impactFlash01,
        speedLinesIntensity01,
      };
    }
    case 'diagonal-wipe':
    case 'impact-zoom': {
      const sc = 0.88 + eased * 0.12;
      return {
        isVisible: true,
        revealProgress01: rawP,
        cssTransform: `translate3d(0px, 0px, 0px) scale(${sc.toFixed(3)})`,
        cssClipPath: 'inset(0% 0% 0% 0%)',
        opacity: Math.min(1, rawP * 2.4),
        impactFlash01: impactFlash01 * 1.25,
        speedLinesIntensity01: 0.9,
      };
    }
  }
}
