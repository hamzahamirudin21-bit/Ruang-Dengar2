/**
 * Penata Daftar Karakter ringkas (fungsi murni).
 * Memilih jumlah kolom (6 → 2) agar kartu tetap terbaca dan muat bila memungkinkan.
 */

export interface RosterLayout {
  columns: number;
  rows: number;
  cardWidth: number;
  cardHeight: number;
  gap: number;
  portraitScale: 1 | 2;
  fitsOneScreen: boolean;
}

/** Tinggi header + footer + padding vertikal. */
export const ROSTER_CHROME_HEIGHT = 168;

const GAP = 10;
const PAD_X = 20;
const MIN_CARD_HEIGHT = 144;
const MAX_CARD_HEIGHT = 220;
const MIN_CARD_WIDTH = 178;
const COLUMN_CANDIDATES = [6, 5, 4, 3, 2] as const;

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function computeRosterLayout(
  viewport: { width: number; height: number },
  count: number,
): RosterLayout {
  const width = Math.max(0, finiteOr(viewport.width, 0));
  const height = Math.max(0, finiteOr(viewport.height, 0));
  const total = Math.max(1, Math.floor(finiteOr(count, 1)));
  const avail = height - ROSTER_CHROME_HEIGHT;

  for (const columns of COLUMN_CANDIDATES) {
    const rows = Math.ceil(total / columns);
    const cardW = Math.floor((width - 2 * PAD_X - (columns - 1) * GAP) / columns);
    const cardH = Math.floor((avail - (rows - 1) * GAP) / rows);
    if (cardH >= MIN_CARD_HEIGHT && cardW >= MIN_CARD_WIDTH) {
      return {
        columns,
        rows,
        cardWidth: cardW,
        cardHeight: Math.min(cardH, MAX_CARD_HEIGHT),
        gap: GAP,
        portraitScale: cardH >= 192 ? 2 : 1,
        fitsOneScreen: true,
      };
    }
  }

  const columns =
    COLUMN_CANDIDATES.find((candidate) => {
      const cardWidth =
        (width - 2 * PAD_X - (candidate - 1) * GAP) / candidate;
      return candidate <= total && cardWidth >= MIN_CARD_WIDTH;
    }) ?? 2;
  return {
    columns,
    rows: Math.ceil(total / columns),
    cardWidth: Math.max(
      MIN_CARD_WIDTH,
      Math.floor((width - 2 * PAD_X - (columns - 1) * GAP) / columns),
    ),
    cardHeight: MIN_CARD_HEIGHT,
    gap: GAP,
    portraitScale: 1,
    fitsOneScreen: false,
  };
}
