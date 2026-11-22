import { useEffect, useRef, useState } from 'react';
import { countUpValue } from './countUp';
import { shouldAdvanceFrame } from './frameClock';
import { MOTION_MS } from './motionTokens';

const PREFERS_QUERY = '(prefers-reduced-motion: reduce)';

function readReduced(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.documentElement.dataset.reducedMotion === 'true') return true;
  try {
    return typeof window !== 'undefined' && !!window.matchMedia?.(PREFERS_QUERY).matches;
  } catch {
    return false;
  }
}

/** Gabungan html[data-reduced-motion="true"] dan prefers-reduced-motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(readReduced);
  useEffect(() => {
    const update = () => setReduced(readReduced());
    update();
    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia?.(PREFERS_QUERY) ?? null;
    } catch {
      mq = null;
    }
    mq?.addEventListener?.('change', update);
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-reduced-motion'],
    });
    return () => {
      mq?.removeEventListener?.('change', update);
      obs.disconnect();
    };
  }, []);
  return reduced;
}

/**
 * Satu loop rAF dibatasi 30 fps. Mengembalikan waktu (ms) sejak mulai.
 * Berhenti saat tab tersembunyi, gerak dikurangi, atau tidak aktif.
 */
export function useAnimationClock(active = true): number {
  const reduced = useReducedMotion();
  const [timeMs, setTimeMs] = useState(0);
  useEffect(() => {
    if (!active || reduced || typeof requestAnimationFrame === 'undefined') return;
    let raf = 0;
    let prev = -Infinity;
    let origin: number | null = null;
    let stopped = false;
    const loop = (now: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (origin === null) origin = now;
      if (!shouldAdvanceFrame(prev, now)) return;
      prev = now;
      setTimeMs(now - origin);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [active, reduced]);
  return timeMs;
}

/** Hitung-naik angka menuju target; langsung ke target bila gerak dikurangi. */
export function useCountUp(target: number, durationMs: number = MOTION_MS['hitung-naik']): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState<number>(() => countUpValue(target, target, 0, 0, true));
  const fromRef = useRef<number>(value);
  useEffect(() => {
    const from = fromRef.current;
    if (reduced || from === target || typeof requestAnimationFrame === 'undefined') {
      fromRef.current = target;
      setValue(countUpValue(from, target, 0, 0, true));
      return;
    }
    let raf = 0;
    let origin: number | null = null;
    let prev = -Infinity;
    const loop = (now: number) => {
      if (origin === null) origin = now;
      const elapsed = now - origin;
      if (elapsed >= durationMs) {
        fromRef.current = target;
        setValue(countUpValue(from, target, durationMs, durationMs));
        return;
      }
      if (shouldAdvanceFrame(prev, now)) {
        prev = now;
        const v = countUpValue(from, target, elapsed, durationMs);
        fromRef.current = v;
        setValue(v);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, reduced]);
  return value;
}
