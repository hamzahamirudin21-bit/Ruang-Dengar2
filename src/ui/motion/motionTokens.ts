/** Token gerak: durasi terpusat. Modul murni (tanpa react/document/window). */

export type MotionToken =
  | 'panel-masuk'
  | 'tombol-pantul'
  | 'pita-kilau'
  | 'pilih-kilat'
  | 'emote'
  | 'transisi-adegan'
  | 'hitung-naik'
  | 'squash-bicara'
  | 'kedip'
  | 'napas';

export const MOTION_MS: Record<MotionToken, number> = {
  'panel-masuk': 320,
  'tombol-pantul': 220,
  'pita-kilau': 1600,
  'pilih-kilat': 240,
  emote: 1400,
  'transisi-adegan': 520,
  'hitung-naik': 600,
  'squash-bicara': 280,
  kedip: 140,
  napas: 3200,
};

/** Batas laju bingkai animasi (bingkai/detik). */
export const MAX_FPS = 30;

/** Durasi efektif: 0 bila gerak dikurangi aktif. */
export function effectiveMs(token: MotionToken, reduced: boolean): number {
  return reduced ? 0 : MOTION_MS[token];
}
