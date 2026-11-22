import {
  DailySociometrySnapshot,
  ObservationLogState,
  StudentAgent,
} from '../types';
import { getStoryRoleBias } from '../data/storyRoles';
import { makePairKey } from './observationLog';
import { mulberry32, randomRange } from './rng';

export const POSITIVE_SOCIOMETRY_QUESTION =
  'Siapa yang akan kamu pilih untuk kerja kelompok praktikum berikutnya?';

export const MAX_SOCIOMETRY_CHOICES = 3;

function computeComplementarySkillScore(
  chooser: StudentAgent,
  candidate: StudentAgent
): number {
  const gaps = [
    Math.max(0, 0.85 - chooser.skills.cetak3d) * candidate.skills.cetak3d,
    Math.max(0, 0.85 - chooser.skills.pemrograman) * candidate.skills.pemrograman,
    Math.max(0, 0.85 - chooser.skills.pengelasan) * candidate.skills.pengelasan,
    Math.max(0, 0.85 - chooser.skills.elektronika) * candidate.skills.elektronika,
  ];
  const maxGapFill = Math.max(...gaps);
  const avgGapFill = (gaps[0] + gaps[1] + gaps[2] + gaps[3]) / 4;
  return maxGapFill * 0.6 + avgGapFill * 0.4 + candidate.skills.kolaborasi * 0.25;
}

/**
 * Menghasilkan snapshot pilihan sosiometri positif di akhir hari simulasi.
 * Hanya menggunakan pertanyaan positif (memilih rekan kerja kelompok, maks. 3).
 * Catatan etis: demographicLabel TIDAK PERNAH dibaca.
 */
export function generateDailySociometrySnapshot(
  agents: readonly StudentAgent[],
  observationLog: ObservationLogState,
  day: number,
  seed: number,
  isLivePreview = false,
  roleBiasOf: (id: string) => number = getStoryRoleBias
): DailySociometrySnapshot {
  const rng = mulberry32(seed + day * 13109 + (isLivePreview ? 37 : 0));
  const choicesByAgent: Record<string, string[]> = {};

  // Cari nilai ko-presensi maksimal untuk normalisasi ke [0, 1]
  let maxCoPresence = 1;
  for (const val of Object.values(observationLog.coPresenceScores)) {
    if (val > maxCoPresence) maxCoPresence = val;
  }
  const dayCoMap = observationLog.coPresenceByDay[day] ?? {};
  let maxDayCo = 1;
  for (const val of Object.values(dayCoMap)) {
    if (val > maxDayCo) maxDayCo = val;
  }

  for (const chooser of agents) {
    const scored: { id: string; score: number }[] = [];

    for (const candidate of agents) {
      if (candidate.id === chooser.id) continue;

      const affinity = chooser.affinities[candidate.id] ?? 0;
      const pairKey = makePairKey(chooser.id, candidate.id);
      const totalCo = (observationLog.coPresenceScores[pairKey] ?? 0) / maxCoPresence;
      const todayCo = (dayCoMap[pairKey] ?? 0) / maxDayCo;
      const coPresenceFactor = totalCo * 0.55 + todayCo * 0.45;

      const complementary = computeComplementarySkillScore(chooser, candidate);
      const noise = randomRange(rng, -0.055, 0.055);

      // Kemauan memilih dipengaruhi afinitas nyata, riwayat kebersamaan, dan saling melengkapi keterampilan
      const score =
        affinity * 0.62 +
        coPresenceFactor * 0.34 +
        complementary * 0.24 +
        (affinity > 0.15 ? 0.06 : 0) +
        noise +
        roleBiasOf(candidate.id);

      scored.push({ id: candidate.id, score });
    }

    scored.sort((a, b) => b.score - a.score);

    const chosen: string[] = [];
    for (const item of scored) {
      if (chosen.length >= MAX_SOCIOMETRY_CHOICES) break;
      if (item.score >= 0.23 || (chosen.length === 0 && item.score >= 0.12)) {
        chosen.push(item.id);
      }
    }

    choicesByAgent[chooser.id] = chosen;
  }

  return {
    day,
    question: POSITIVE_SOCIOMETRY_QUESTION,
    choicesByAgent,
    isLivePreview,
  };
}
