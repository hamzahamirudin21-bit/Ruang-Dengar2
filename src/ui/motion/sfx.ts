/**
 * Pemutar efek suara & latar musik kampus cozy WebAudio (100% offline, mati bawaan).
 * AudioContext dibuat malas hanya di dalam berkas ini dan hanya bila diaktifkan.
 * Semua kegagalan diam-diam agar aman di lingkungan headless/SSR.
 */
import { SFX_GAIN_MAX, SfxName, shouldPlaySfx, sfxPlan } from './sfxPlan';

export type FeedbackSfxKind = 'tepat' | 'salah' | 'flip' | 'drawer';

let enabled = false;
let ctx: AudioContext | null = null;
const lastPlayed: Partial<Record<SfxName, number>> = {};

// State mesin musik kampus akustik-lo-fi prosedural (Rhodes hangat + kalimba pentatonik)
let bgmTimer: number | null = null;
let bgmStep = 0;
let visibilityBound = false;

// State ambien hujan kampus cozy prosedural (pink-noise lembut berfilter bandpass)
let rainDesired = false;
let rainSource: AudioBufferSourceNode | null = null;
let rainGainNode: GainNode | null = null;

interface BgmChord {
  notes: readonly number[];
  melody: readonly (number | null)[];
}

// Progresi cozy 8-bar bernuansa kampus pagi hangat (Fmaj7 -> Em7 -> Dm7 -> Cmaj7 -> Bbmaj7 -> Am7 -> Gm7 -> C9sus4)
const COZY_PROGRESSION: readonly BgmChord[] = [
  { notes: [174.61, 220.0, 261.63, 329.63], melody: [523.25, null, 659.25, 587.33] },
  { notes: [164.81, 196.0, 246.94, 293.66], melody: [493.88, null, 587.33, null] },
  { notes: [146.83, 174.61, 220.0, 261.63], melody: [440.0, 523.25, null, 587.33] },
  { notes: [130.81, 196.0, 246.94, 329.63], melody: [659.25, null, 523.25, null] },
  { notes: [233.08, 293.66, 349.23, 440.0], melody: [587.33, null, 523.25, 440.0] },
  { notes: [220.0, 261.63, 329.63, 392.0], melody: [523.25, null, 440.0, null] },
  { notes: [196.0, 233.08, 293.66, 349.23], melody: [440.0, 493.88, 523.25, null] },
  { notes: [130.81, 174.61, 233.08, 293.66], melody: [587.33, null, 523.25, null] },
];

const BGM_BEAT_MS = 680; // ~88 BPM santai ala game cozy kampus

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

function scheduleRhodesChord(c: AudioContext, freqs: readonly number[], t0: number, durSec: number): void {
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(860, t0);
  filter.Q.setValueAtTime(0.6, t0);
  filter.connect(c.destination);

  const perVoiceGain = 0.015;
  freqs.forEach((f, idx) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = idx === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(f, t0);
    const onset = t0 + idx * 0.032; // strum halus seperti jari menyentuh tuts Rhodes
    g.gain.setValueAtTime(0.0001, onset);
    g.gain.linearRampToValueAtTime(perVoiceGain, onset + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + durSec);
    osc.connect(g);
    g.connect(filter);
    osc.start(onset);
    osc.stop(t0 + durSec + 0.04);
  });
}

function scheduleKalimbaNote(c: AudioContext, freq: number, t0: number): void {
  const osc = c.createOscillator();
  const overtone = c.createOscillator();
  const g = c.createGain();
  const og = c.createGain();
  const filter = c.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2200, t0);
  filter.connect(c.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  overtone.type = 'triangle';
  overtone.frequency.setValueAtTime(freq * 2, t0);

  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(0.017, t0 + 0.014);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.72);

  og.gain.setValueAtTime(0.0001, t0);
  og.gain.linearRampToValueAtTime(0.0045, t0 + 0.01);
  og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);

  osc.connect(g);
  overtone.connect(og);
  g.connect(filter);
  og.connect(filter);
  osc.start(t0);
  overtone.start(t0);
  osc.stop(t0 + 0.76);
  overtone.stop(t0 + 0.26);
}

function tickBgm(): void {
  try {
    if (!enabled) {
      stopCozyBgm();
      return;
    }
    if (typeof document !== 'undefined' && document.hidden) return;
    const c = getContext();
    if (!c) return;
    if (c.state === 'suspended') void c.resume().catch(() => undefined);

    const barIndex = Math.floor(bgmStep / 4) % COZY_PROGRESSION.length;
    const beatInBar = bgmStep % 4;
    const chord = COZY_PROGRESSION[barIndex];
    const t0 = c.currentTime + 0.02;

    if (beatInBar === 0) {
      scheduleRhodesChord(c, chord.notes, t0, (BGM_BEAT_MS * 3.85) / 1000);
    }
    const mel = chord.melody[beatInBar];
    if (mel) {
      scheduleKalimbaNote(c, mel, t0 + 0.01);
    }
    bgmStep = (bgmStep + 1) % (COZY_PROGRESSION.length * 4);
  } catch {
    /* gagal diam-diam */
  }
}

export function startCozyBgm(): void {
  try {
    if (!enabled || typeof window === 'undefined') return;
    if (bgmTimer !== null) return;
    if (!visibilityBound && typeof document !== 'undefined') {
      visibilityBound = true;
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && enabled && ctx && ctx.state === 'suspended') {
          void ctx.resume().catch(() => undefined);
        }
      });
    }
    tickBgm();
    bgmTimer = window.setInterval(tickBgm, BGM_BEAT_MS);
  } catch {
    /* gagal diam-diam */
  }
}

export function stopCozyBgm(): void {
  try {
    if (bgmTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(bgmTimer);
      bgmTimer = null;
    }
  } catch {
    bgmTimer = null;
  }
}

function syncRainAmbienceNode(): void {
  try {
    if (!enabled || !rainDesired || typeof window === 'undefined') {
      if (rainSource) {
        try {
          rainSource.stop();
          rainSource.disconnect();
        } catch {
          /* abaikan */
        }
        rainSource = null;
      }
      if (rainGainNode) {
        try {
          rainGainNode.disconnect();
        } catch {
          /* abaikan */
        }
        rainGainNode = null;
      }
      return;
    }

    if (rainSource) return;
    const c = getContext();
    if (!c) return;
    if (c.state === 'suspended') void c.resume().catch(() => undefined);

    const sampleRate = c.sampleRate || 44100;
    const length = sampleRate * 2;
    const buffer = c.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    // Filter Paul Kellet pink-noise ringan agar suara rintik hujan terdengar organik & hangat
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.08;
    }

    const src = c.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1050, c.currentTime);
    filter.Q.setValueAtTime(0.65, c.currentTime);

    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.linearRampToValueAtTime(0.016, c.currentTime + 0.45);

    src.connect(filter);
    filter.connect(g);
    g.connect(c.destination);
    src.start();

    rainSource = src;
    rainGainNode = g;
  } catch {
    /* gagal diam-diam di headless/Node */
  }
}

/** Mengaktifkan atau mematikan ambien rintik hujan cozy saat cuaca kampus disetel ke 'hujan'. */
export function setRainAmbienceEnabled(active: boolean): void {
  rainDesired = active === true;
  syncRainAmbienceNode();
}

export function setSfxEnabled(value: boolean): void {
  enabled = value === true;
  if (enabled) {
    startCozyBgm();
  } else {
    stopCozyBgm();
  }
  syncRainAmbienceNode();
}

export function isSfxEnabled(): boolean {
  return enabled;
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
    if (bgmTimer === null) startCozyBgm();

    const t0 = c.currentTime;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(name === 'ketik' ? 1900 : 2800, t0);
    filter.connect(c.destination);

    for (const step of sfxPlan(name)) {
      const osc = c.createOscillator();
      const g = c.createGain();
      const peak = Math.min(SFX_GAIN_MAX, Math.max(0, step.gain));
      const start = t0 + step.delayMs / 1000;
      const end = start + step.durationMs / 1000;
      osc.type = step.wave;
      osc.frequency.setValueAtTime(step.freqHz, start);

      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(Math.max(0.0001, peak), start + 0.009);
      g.gain.exponentialRampToValueAtTime(0.0001, end);

      osc.connect(g);
      g.connect(filter);
      osc.start(start);
      osc.stop(end + 0.015);

      // Harmonik kalimba lembut untuk efek klik, pilih, & misi selesai agar terdengar hangat & taktil
      if (name === 'klik' || name === 'pilih' || name === 'misi-selesai') {
        const harm = c.createOscillator();
        const hg = c.createGain();
        harm.type = 'sine';
        harm.frequency.setValueAtTime(step.freqHz * 2, start);
        hg.gain.setValueAtTime(0.0001, start);
        hg.gain.linearRampToValueAtTime(Math.max(0.0001, peak * 0.22), start + 0.006);
        hg.gain.exponentialRampToValueAtTime(0.0001, start + Math.min(0.065, step.durationMs / 1000));
        harm.connect(hg);
        hg.connect(filter);
        harm.start(start);
        harm.stop(start + Math.min(0.075, step.durationMs / 1000 + 0.01));
      }
    }
  } catch {
    /* gagal diam-diam */
  }
}

/** Efek foley taktil tambahan untuk interaksi khusus (balik kartu, buka laci, umpan balik tepat/salah). */
export function playFeedbackSfx(kind: FeedbackSfxKind): void {
  try {
    if (!enabled) return;
    const c = getContext();
    if (!c) return;
    if (c.state === 'suspended') void c.resume().catch(() => undefined);

    const t0 = c.currentTime;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t0);
    filter.connect(c.destination);

    const steps: ReadonlyArray<{ f: number; d: number; delay: number; w: OscillatorType; g: number }> =
      kind === 'tepat'
        ? [
            { f: 523.25, d: 0.11, delay: 0, w: 'triangle', g: 0.095 },
            { f: 659.25, d: 0.12, delay: 0.065, w: 'triangle', g: 0.095 },
            { f: 783.99, d: 0.18, delay: 0.13, w: 'sine', g: 0.105 },
          ]
        : kind === 'salah'
          ? [
              { f: 311.13, d: 0.11, delay: 0, w: 'triangle', g: 0.08 },
              { f: 246.94, d: 0.16, delay: 0.08, w: 'sine', g: 0.075 },
            ]
          : kind === 'flip'
            ? [
                { f: 420, d: 0.045, delay: 0, w: 'sine', g: 0.055 },
                { f: 620, d: 0.06, delay: 0.035, w: 'triangle', g: 0.06 },
              ]
            : [
                { f: 480, d: 0.055, delay: 0, w: 'sine', g: 0.055 },
                { f: 560, d: 0.065, delay: 0.04, w: 'sine', g: 0.05 },
              ];

    for (const s of steps) {
      const osc = c.createOscillator();
      const g = c.createGain();
      const start = t0 + s.delay;
      const end = start + s.d;
      osc.type = s.w;
      osc.frequency.setValueAtTime(s.f, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(Math.min(SFX_GAIN_MAX, s.g), start + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(g);
      g.connect(filter);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  } catch {
    /* gagal diam-diam */
  }
}
