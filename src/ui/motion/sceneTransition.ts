/** Transisi adegan (murni). */
import type { SceneArtId } from '../scene/sceneArt'

export type TransitionKind = 'none' | 'fade' | 'iris'

/**
 * Klasifikasi: Ruang BK = 'ruang-bk'. Laboratorium = semua adegan kerja
 * (lab-umum, cetak-3d, elektronik, pemrograman, las, gudang, diskusi, istirahat).
 * 'ruang-dosen' adalah ruang terpisah (bukan lab dan bukan Ruang BK), sehingga
 * pasangan yang melibatkannya memakai 'fade'.
 */
function isRuangBk(id: SceneArtId): boolean {
  return id === 'ruang-bk'
}

function isLab(id: SceneArtId): boolean {
  return id !== 'ruang-bk' && id !== 'ruang-dosen'
}

export function sceneTransitionKind(
  prev: SceneArtId | null,
  next: SceneArtId,
  reduced: boolean,
): TransitionKind {
  if (reduced || prev === null || prev === next) return 'none'
  if ((isLab(prev) && isRuangBk(next)) || (isRuangBk(prev) && isLab(next))) return 'iris'
  return 'fade'
}

/** Jari-jari iris relatif (0..1), terjepit. `opening`: 0 → 1; menutup: 1 → 0. */
export function irisRadiusFraction(progress: number, opening: boolean): number {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
  return opening ? p : 1 - p
}
