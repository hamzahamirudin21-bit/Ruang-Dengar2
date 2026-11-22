/**
 * Palet UI cerita (kotak dialog, tombol Choice, latar, aksen).
 * Nilai selaras dengan variabel --ui-* di src/index.css (nuansa kalem).
 * Murni data, tanpa DOM.
 */

export const STORY_PALETTE = {
  /** Latar adegan / halaman. */
  background: "#f4f6f8",
  backgroundMuted: "#edf1f5",
  border: "#d5dde6",

  /** Kotak dialog. */
  dialogBg: "#ffffff",
  dialogText: "#1e293b",
  dialogSpeaker: "#164860",
  dialogMutedText: "#526072",

  /** Tombol Choice. */
  choiceBg: "#ffffff",
  choiceText: "#1e293b",
  choiceBorder: "#1d5d7a",
  choiceHoverBg: "#e4f0f6",
  choiceHoverText: "#164860",
  choiceSelectedBg: "#1d5d7a",
  choiceSelectedText: "#ffffff",
  choiceDisabledBg: "#edf1f5",
  choiceDisabledText: "#526072",

  /** Aksen. */
  accent: "#1d5d7a",
  accentHover: "#164860",
  accentSoft: "#e4f0f6",
  accentOnSoftText: "#164860",

  /** Status. */
  warningBg: "#fef7e6",
  warningText: "#6e4e08",
  dangerText: "#b42318",
  successText: "#166534",
} as const;

export type StoryPaletteKey = keyof typeof STORY_PALETTE;

export interface StoryContrastPair {
  readonly name: string;
  readonly fg: string;
  readonly bg: string;
}

const P = STORY_PALETTE;

/** Semua pasangan teks/latar yang dipakai UI cerita; masing-masing harus >= 4.5:1. */
export const STORY_CONTRAST_PAIRS: readonly StoryContrastPair[] = [
  { name: "dialog: teks utama", fg: P.dialogText, bg: P.dialogBg },
  { name: "dialog: nama pembicara", fg: P.dialogSpeaker, bg: P.dialogBg },
  { name: "dialog: teks redup", fg: P.dialogMutedText, bg: P.dialogBg },
  { name: "latar: teks utama", fg: P.dialogText, bg: P.background },
  { name: "latar: teks redup", fg: P.dialogMutedText, bg: P.background },
  { name: "latar redup: teks utama", fg: P.dialogText, bg: P.backgroundMuted },
  { name: "latar redup: teks redup", fg: P.dialogMutedText, bg: P.backgroundMuted },
  { name: "choice: normal", fg: P.choiceText, bg: P.choiceBg },
  { name: "choice: hover", fg: P.choiceHoverText, bg: P.choiceHoverBg },
  { name: "choice: terpilih", fg: P.choiceSelectedText, bg: P.choiceSelectedBg },
  { name: "choice: nonaktif", fg: P.choiceDisabledText, bg: P.choiceDisabledBg },
  { name: "aksen: teks aksen di kotak dialog", fg: P.accent, bg: P.dialogBg },
  { name: "aksen: teks pada aksen lembut", fg: P.accentOnSoftText, bg: P.accentSoft },
  { name: "aksen: teks putih pada aksen", fg: "#ffffff", bg: P.accent },
  { name: "aksen: teks putih pada aksen hover", fg: "#ffffff", bg: P.accentHover },
  { name: "peringatan: teks", fg: P.warningText, bg: P.warningBg },
  { name: "bahaya: teks di kotak dialog", fg: P.dangerText, bg: P.dialogBg },
  { name: "sukses: teks di kotak dialog", fg: P.successText, bg: P.dialogBg },
];
