/**
 * Palet sistem desain game (kartun: kayu, krem, merah, navy). Ditambahkan di samping
 * VN_PALETTE dan STORY_PALETTE yang tidak diubah. Nilai harus sama dengan token
 * `--game-*` di src/index.css.
 */
import type { StoryContrastPair } from "../../story/palette";

export const GAME_PALETTE = {
  woodDark: "#4a2c17",
  wood: "#8a5a2b",
  woodLight: "#b8803f",
  creamPaper: "#fbf1d9",
  creamEdge: "#e8d5a5",
  redBanner: "#b3261e",
  redDeep: "#7f1913",
  navy: "#1b2a49",
  gold: "#f2b632",
  white: "#ffffff",
  ink: "#2a1a0e",
  inkMuted: "#5a4636",
} as const;

export type GamePaletteKey = keyof typeof GAME_PALETTE;

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

/** Peta nama token CSS ("--game-wood-dark") ke nilai warnanya. */
export const GAME_CSS_TOKENS: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    (Object.entries(GAME_PALETTE) as [GamePaletteKey, string][]).map(([k, v]) => [
      `--game-${kebab(k)}`,
      v,
    ]),
  ),
);

const G = GAME_PALETTE;

/** Pasangan teks/latar yang benar-benar dipakai; masing-masing harus >= 4.5:1. */
export const GAME_CONTRAST_PAIRS: readonly StoryContrastPair[] = [
  { name: "game: tinta pada krem", fg: G.ink, bg: G.creamPaper },
  { name: "game: tinta redup pada krem", fg: G.inkMuted, bg: G.creamPaper },
  { name: "game: tinta pada tepi krem", fg: G.ink, bg: G.creamEdge },
  { name: "game: tinta redup pada tepi krem", fg: G.inkMuted, bg: G.creamEdge },
  { name: "game: krem pada merah", fg: G.creamPaper, bg: G.redBanner },
  { name: "game: putih pada merah", fg: G.white, bg: G.redBanner },
  { name: "game: putih pada merah tua", fg: G.white, bg: G.redDeep },
  { name: "game: krem pada navy", fg: G.creamPaper, bg: G.navy },
  { name: "game: emas pada navy", fg: G.gold, bg: G.navy },
  { name: "game: krem pada kayu tua", fg: G.creamPaper, bg: G.woodDark },
  { name: "game: emas pada kayu tua", fg: G.gold, bg: G.woodDark },
  { name: "game: tinta pada emas", fg: G.ink, bg: G.gold },
  { name: "game: merah pada krem", fg: G.redBanner, bg: G.creamPaper },
];
