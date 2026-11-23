import type { StudentAgent } from '../types';

/**
 * Algoritma ketahanan energi mahasiswa & aturan kalah/menang RUANG DENGAR.
 * - Energi mahasiswa turun alami dalam kisaran ~60-90 detik jika dibiarkan terisolasi.
 * - Jika energi menyentuh 0% -> mahasiswa hilang dari kelas.
 * - Jika 3 mahasiswa hilang -> Game Over (kalah).
 * - Di dalam percakapan 7 giliran (2 pilihan): pilihan tepat menambah energi (+12%),
 *   pilihan salah mengurangi energi (-14%).
 */

export const MAX_LOST_STUDENTS = 3;
export const LOST_ENERGY_EPSILON = 0.001;
export const STABILIZED_MIN_ENERGY = 0.45;
export const STORY_CORRECT_ENERGY_DELTA = 0.12;
export const STORY_WRONG_ENERGY_DELTA = -0.14;

export type SurvivalRunStatus = 'berjalan' | 'kalah' | 'menang';
export type SurvivalEndingTier = 'sempurna' | 'baik' | 'bertahan' | 'gagal';

export interface SurvivalSummary {
  status: SurvivalRunStatus;
  endingTier: SurvivalEndingTier;
  totalStudents: number;
  activeCount: number;
  lostCount: number;
  maxLost: number;
  remainingLives: number;
  stabilizedCount: number;
}

export function applyLiveChoiceEnergy(currentEnergy: number, isCorrect: boolean): number {
  const delta = isCorrect ? STORY_CORRECT_ENERGY_DELTA : STORY_WRONG_ENERGY_DELTA;
  return Math.max(0, Math.min(1, Number((currentEnergy + delta).toFixed(3))));
}

/**
 * Mendeteksi mahasiswa baru yang energinya baru saja habis (<= 0%) di peta.
 * Mahasiswa yang sudah stabil ('selesai') atau sedang dalam sesi percakapan tidak ikut hilang pasif.
 */
export function detectNewlyLostAgentIds(
  agents: readonly Pick<StudentAgent, 'id' | 'energy'>[],
  alreadyLostIds: ReadonlySet<string>,
  stabilizedIds: ReadonlySet<string>,
  inSessionIds: ReadonlySet<string>,
): string[] {
  const newlyLost: string[] = [];
  for (const agent of agents) {
    if (alreadyLostIds.has(agent.id)) continue;
    if (stabilizedIds.has(agent.id)) continue;
    if (inSessionIds.has(agent.id)) continue;
    if (agent.energy <= LOST_ENERGY_EPSILON) {
      newlyLost.push(agent.id);
    }
  }
  return newlyLost;
}

export function evaluateSurvivalStatus(
  totalStudents: number,
  lostCount: number,
  stabilizedCount: number,
): SurvivalSummary {
  const clampedLost = Math.max(0, Math.min(totalStudents, lostCount));
  const activeCount = Math.max(0, totalStudents - clampedLost);
  const remainingLives = Math.max(0, MAX_LOST_STUDENTS - clampedLost);

  if (clampedLost >= MAX_LOST_STUDENTS) {
    return {
      status: 'kalah',
      endingTier: 'gagal',
      totalStudents,
      activeCount,
      lostCount: clampedLost,
      maxLost: MAX_LOST_STUDENTS,
      remainingLives: 0,
      stabilizedCount,
    };
  }

  if (activeCount > 0 && stabilizedCount >= activeCount) {
    const endingTier: SurvivalEndingTier =
      clampedLost === 0 ? 'sempurna' : clampedLost === 1 ? 'baik' : 'bertahan';
    return {
      status: 'menang',
      endingTier,
      totalStudents,
      activeCount,
      lostCount: clampedLost,
      maxLost: MAX_LOST_STUDENTS,
      remainingLives,
      stabilizedCount,
    };
  }

  return {
    status: 'berjalan',
    endingTier: clampedLost === 0 ? 'sempurna' : clampedLost === 1 ? 'baik' : 'bertahan',
    totalStudents,
    activeCount,
    lostCount: clampedLost,
    maxLost: MAX_LOST_STUDENTS,
    remainingLives,
    stabilizedCount,
  };
}
