/**
 * Mesin ketik murni untuk gelembung dialog. Teks yang tampak selalu awalan dari
 * teks asli, dihitung dalam titik kode agar pasangan surrogat tidak terbelah.
 */

export const DEFAULT_CPS = 40;
/** Lama "pop" satu huruf (ms). */
export const CHAR_POP_MS = 140;
const CHAR_POP_PEAK = 1.25;

export interface TypeState {
  /** Jumlah titik kode yang tampak. */
  visibleCount: number;
  done: boolean;
  /** Indeks titik kode terakhir yang tampak (-1 bila belum ada). */
  lastPopIndex: number;
}

function safeTime(ms: number): number {
  return Number.isFinite(ms) && ms > 0 ? ms : 0;
}

export function typewriterState(text: string, elapsedMs: number, cps: number, reduced: boolean): TypeState {
  const total = Array.from(text).length;
  if (reduced || !Number.isFinite(cps) || cps <= 0) {
    return { visibleCount: total, done: true, lastPopIndex: total - 1 };
  }
  if (elapsedMs === Infinity) return { visibleCount: total, done: true, lastPopIndex: total - 1 };
  const n = Math.min(total, Math.max(0, Math.floor((safeTime(elapsedMs) * cps) / 1000)));
  return { visibleCount: n, done: n === total, lastPopIndex: n - 1 };
}

/** Skala "pop" huruf: 1 naik ke 1,25 lalu kembali ke 1. */
export function charPopScale(msSinceChar: number, reduced: boolean): number {
  if (reduced || !Number.isFinite(msSinceChar) || msSinceChar <= 0 || msSinceChar >= CHAR_POP_MS) return 1;
  return 1 + (CHAR_POP_PEAK - 1) * Math.sin((Math.PI * msSinceChar) / CHAR_POP_MS);
}
