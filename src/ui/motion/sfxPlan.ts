/**
 * Rencana suara murni: nada pendek dan lembut yang dihasilkan secara prosedural.
 * Tanpa berkas audio, tanpa react, tanpa akses document/window.
 */

export type SfxName = 'klik' | 'pilih' | 'ketik' | 'emote' | 'misi-selesai' | 'ganti-adegan';

export type ToneWave = 'sine' | 'triangle' | 'square' | 'sawtooth';

export interface ToneStep {
  freqHz: number;
  durationMs: number;
  delayMs: number;
  wave: ToneWave;
  gain: number;
}

export const SFX_GAIN_MAX = 0.15;
export const SFX_TYPING_GAP_MS = 60;
export const SFX_TOTAL_MAX_MS = 400;

const PLANS: Readonly<Record<SfxName, readonly ToneStep[]>> = {
  klik: [{ freqHz: 660, durationMs: 60, delayMs: 0, wave: 'sine', gain: 0.1 }],
  pilih: [
    { freqHz: 523, durationMs: 80, delayMs: 0, wave: 'triangle', gain: 0.1 },
    { freqHz: 784, durationMs: 100, delayMs: 70, wave: 'triangle', gain: 0.1 },
  ],
  ketik: [{ freqHz: 880, durationMs: 25, delayMs: 0, wave: 'sine', gain: 0.04 }],
  emote: [
    { freqHz: 700, durationMs: 90, delayMs: 0, wave: 'sine', gain: 0.09 },
    { freqHz: 940, durationMs: 120, delayMs: 90, wave: 'sine', gain: 0.09 },
  ],
  'misi-selesai': [
    { freqHz: 523, durationMs: 90, delayMs: 0, wave: 'triangle', gain: 0.12 },
    { freqHz: 659, durationMs: 90, delayMs: 90, wave: 'triangle', gain: 0.12 },
    { freqHz: 784, durationMs: 90, delayMs: 180, wave: 'triangle', gain: 0.12 },
    { freqHz: 1047, durationMs: 130, delayMs: 270, wave: 'triangle', gain: 0.12 },
  ],
  'ganti-adegan': [
    { freqHz: 440, durationMs: 120, delayMs: 0, wave: 'sine', gain: 0.07 },
    { freqHz: 330, durationMs: 160, delayMs: 100, wave: 'sine', gain: 0.07 },
  ],
};

export function sfxPlan(name: SfxName): ToneStep[] {
  return (PLANS[name] ?? []).map((s) => ({ ...s }));
}

/** Menentukan apakah suara boleh diputar; efek ketik dibatasi jarak minimal 60 ms. */
export function shouldPlaySfx(
  enabled: boolean,
  name: SfxName,
  lastPlayedMs: number | null | undefined,
  nowMs: number,
): boolean {
  if (!enabled) return false;
  if (!(name in PLANS)) return false;
  if (name === 'ketik' && typeof lastPlayedMs === 'number' && Number.isFinite(lastPlayedMs)) {
    return nowMs - lastPlayedMs >= SFX_TYPING_GAP_MS;
  }
  return true;
}
