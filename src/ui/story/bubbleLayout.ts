/** Geometri murni gelembung dialog: posisi ekor yang menunjuk pembicara. */

export type SpeakerSide = 'kiri' | 'kanan' | 'tengah';

export interface TailSpec {
  /** Posisi horizontal ekor relatif terhadap tepi kiri gelembung. */
  xPx: number;
  side: 'atas' | 'bawah';
  visible: boolean;
}

export const TAIL_INSET_PX = 28;

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function bubbleTail(
  bubbleWidthPx: number,
  speakerCenterXPx: number,
  bubbleLeftPx: number,
  insetPx: number = TAIL_INSET_PX,
): TailSpec {
  const width = Math.max(0, finiteOr(bubbleWidthPx, 0));
  const inset = Math.max(0, finiteOr(insetPx, TAIL_INSET_PX));
  if (width <= 2 * inset) return { xPx: width / 2, side: 'atas', visible: false };
  const rel = finiteOr(speakerCenterXPx, 0) - finiteOr(bubbleLeftPx, 0);
  const x = Math.min(width - inset, Math.max(inset, rel));
  return { xPx: x, side: 'atas', visible: true };
}

/** Dosen di kiri, mahasiswa di kanan, selingan/isyarat di tengah. */
export function speakerSideOf(role: string, isDosen: boolean): SpeakerSide {
  if (isDosen || role === 'dosen') return 'kiri';
  if (role === 'mahasiswa') return 'kanan';
  return 'tengah';
}
