/**
 * Pemutar efek suara WebAudio (opsional, mati bawaan).
 * AudioContext dibuat malas hanya di dalam playSfx dan hanya bila diaktifkan.
 * Semua kegagalan diam-diam.
 */
import { SFX_GAIN_MAX, SfxName, shouldPlaySfx, sfxPlan } from './sfxPlan';

let enabled = false;
let ctx: AudioContext | null = null;
const lastPlayed: Partial<Record<SfxName, number>> = {};

export function setSfxEnabled(value: boolean): void {
  enabled = value === true;
}

export function isSfxEnabled(): boolean {
  return enabled;
}

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctor: typeof AudioContext | undefined =
      typeof window === 'undefined'
        ? undefined
        : (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
            .AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

export function playSfx(name: SfxName): void {
  try {
    if (!enabled) return;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!shouldPlaySfx(true, name, lastPlayed[name], now)) return;
    const c = getContext();
    if (!c) return;
    lastPlayed[name] = now;
    if (c.state === 'suspended') void c.resume().catch(() => undefined);
    const t0 = c.currentTime;
    for (const step of sfxPlan(name)) {
      const osc = c.createOscillator();
      const g = c.createGain();
      const peak = Math.min(SFX_GAIN_MAX, Math.max(0, step.gain));
      const start = t0 + step.delayMs / 1000;
      const end = start + step.durationMs / 1000;
      osc.type = step.wave;
      osc.frequency.value = step.freqHz;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(Math.max(0.0001, peak), start + 0.01);
      g.gain.linearRampToValueAtTime(0.0001, end);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(start);
      osc.stop(end + 0.01);
    }
  } catch {
    /* gagal diam-diam */
  }
}
