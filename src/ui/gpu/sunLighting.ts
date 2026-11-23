/**
 * Model matematika pencahayaan matahari & bayangan terarah waktu nyata (modul murni, tanpa DOM/React).
 * Menghitung sudut bayangan gedung, pohon, & 18 karakter serta suhu warna (Pagi -> Siang -> Senja)
 * dari `clockMinutesOfDay` (08:00 = 480 s.d. 17:00 = 1020).
 */

export type SunPhase = 'pagi' | 'siang' | 'sore';

export interface SunLightingState {
  phase: SunPhase;
  /** Progres 0 (08:00) .. 1 (17:00). */
  dayProgress: number;
  /** Vektor arah bayangan jatuh di tanah (X: negatif = barat saat pagi, positif = timur saat sore). */
  shadowDirX: number;
  /** Vektor arah bayangan jatuh di sumbu Y (selalu positif ke selatan-bawah). */
  shadowDirY: number;
  /** Faktor panjang bayangan relatif (0.55 di siang terik .. 1.35 di pagi/senja). */
  shadowLength: number;
  /** Warna RGBA siap pakai untuk bayangan tanah. */
  shadowColor: string;
  /** Intensitas lampu interior & bloom (0.38 di siang terik -> 1.0 di senja). */
  indoorLampBoost: number;
  /** Warna nuansa grading global RGB (1.0 = netral) untuk shader WebGL2 ACES. */
  gradeRgb: readonly [number, number, number];
  /** Sudut berkas sinar matahari (radian) untuk volumetric god-rays shader. */
  godRayAngle: number;
  /** Intensitas berkas sinar matahari (0..1). */
  godRayIntensity: number;
  /** Kadar penggelapan senja lembut (0..0.22) agar lampu ruangan tampak menyala dramatis. */
  duskShade: number;
}

const DAY_START_MIN = 480; // 08:00
const DAY_END_MIN = 1020; // 17:00

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0.5;
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function computeSunLighting(clockMinutesOfDay: number): SunLightingState {
  const safeMin = Number.isFinite(clockMinutesOfDay) ? clockMinutesOfDay : 660;
  const p = clamp01((safeMin - DAY_START_MIN) / (DAY_END_MIN - DAY_START_MIN));

  const phase: SunPhase = safeMin < 660 ? 'pagi' : safeMin >= 870 ? 'sore' : 'siang';

  // Sudut horizontal matahari: -1.0 (pagi, bayangan ke kiri/barat) -> 0 (siang) -> +1.15 (sore, bayangan ke kanan/timur)
  const centered = p * 2 - 1; // -1 .. +1
  const shadowDirX = centered * (centered >= 0 ? 1.12 : 0.96);
  const shadowDirY = 0.28 + Math.abs(centered) * 0.22;
  const shadowLength = 0.55 + Math.pow(Math.abs(centered), 1.35) * 0.82;

  // Warna bayangan berubah dari biru-pagi sejuk -> abu hangat siang -> ungu-amber senja
  const morningT = clamp01(1 - p * 2.3);
  const eveningT = clamp01((p - 0.56) / 0.44);
  const sr = Math.round(lerp(lerp(32, 24, morningT), 58, eveningT));
  const sg = Math.round(lerp(lerp(38, 44, morningT), 28, eveningT));
  const sb = Math.round(lerp(lerp(48, 72, morningT), 42, eveningT));
  const sa = Number((0.22 + Math.abs(centered) * 0.08).toFixed(3));
  const shadowColor = `rgba(${sr}, ${sg}, ${sb}, ${sa})`;

  // Lampu dalam ruangan makin terang & dramatis menjelang sore / pagi awal
  const indoorLampBoost = Number(
    Math.min(1, Math.max(0.38, 0.38 + morningT * 0.32 + Math.pow(eveningT, 1.15) * 0.62)).toFixed(3)
  );

  // Grading warna sinematik lembut [R, G, B]
  const gr = Number((1.0 + eveningT * 0.09 - morningT * 0.02).toFixed(3));
  const gg = Number((1.0 + morningT * 0.02 + eveningT * 0.015).toFixed(3));
  const gb = Number((1.0 + morningT * 0.055 - eveningT * 0.095).toFixed(3));

  const godRayAngle = 0.42 + centered * 0.28;
  const godRayIntensity = Number((0.46 + morningT * 0.22 + eveningT * 0.36).toFixed(3));
  const duskShade = Number((Math.pow(eveningT, 1.45) * 0.19).toFixed(3));

  return {
    phase,
    dayProgress: p,
    shadowDirX,
    shadowDirY,
    shadowLength,
    shadowColor,
    indoorLampBoost,
    gradeRgb: [gr, gg, gb] as const,
    godRayAngle,
    godRayIntensity,
    duskShade,
  };
}
