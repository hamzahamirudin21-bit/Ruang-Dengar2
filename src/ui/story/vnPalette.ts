/**
 * Palet visual novel (navy-krem bergaya game). Ditambahkan di samping
 * STORY_PALETTE yang tidak diubah. Nilai harus sama dengan token `--vn-*`
 * di src/index.css.
 */
import type { StoryContrastPair } from "./palette";

export const VN_PALETTE = {
  navy: "#1b2a49",
  navyDeep: "#12203a",
  cream: "#f6efe0",
  creamDeep: "#e9dfc6",
  gold: "#d9a441",
  ink: "#1e293b",
  inkMuted: "#475569",
  panelBg: "rgba(246,239,224,0.92)",
  frame: "#1b2a49",
  accent: "#1d5d7a",
  danger: "#b42318",
} as const;

export type VnPaletteKey = keyof typeof VN_PALETTE;

const V = VN_PALETTE;

/** Pasangan teks/latar VN; masing-masing harus >= 4.5:1 (latar semi-transparan diukur pada krem). */
export const VN_CONTRAST_PAIRS: readonly StoryContrastPair[] = [
  { name: "vn: teks pada krem", fg: V.ink, bg: V.cream },
  { name: "vn: teks pada krem tua", fg: V.ink, bg: V.creamDeep },
  { name: "vn: teks redup pada krem", fg: V.inkMuted, bg: V.cream },
  { name: "vn: teks redup pada krem tua", fg: V.inkMuted, bg: V.creamDeep },
  { name: "vn: krem pada navy (label nama)", fg: V.cream, bg: V.navy },
  { name: "vn: krem pada navy dalam", fg: V.cream, bg: V.navyDeep },
  { name: "vn: emas pada navy", fg: V.gold, bg: V.navy },
  { name: "vn: navy pada krem", fg: V.navy, bg: V.cream },
  { name: "vn: putih pada aksen", fg: "#ffffff", bg: V.accent },
  { name: "vn: aksen pada krem", fg: V.accent, bg: V.cream },
  { name: "vn: bahaya pada krem", fg: V.danger, bg: V.cream },
];
