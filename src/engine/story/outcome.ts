import type { StoryAdaptation } from '../../types';
import type { StoryRunnerState, StoryOutcome } from './runner';
import type { StoryGraph, StoryOutcomeKind } from './storyTypes';

/** Hasil akhir cerita: fungsi murni (Requirement 1, 9.5, 10). */

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Ambang kualitas minimum "kemajuan kecil" pada akhir cerita dan penutupan pengguna. */
const MIN_QUALITY_PROGRESS = 35;
const MIN_QUALITY_PROGRESS_EARLY = 20;

export function computeStoryQuality(graph: StoryGraph, state: StoryRunnerState): number {
  const { session } = state;
  const T = session.vars.trust;
  const L = session.highestLevelReached;
  const Rp = session.rupture.repairedCountInSession;
  const Ru = session.rupture.active ? 1 : 0;
  const Ev = session.ethicsViolationsCount;
  const planFlag = graph.outcomeRules.planFlag;
  const P = planFlag && state.flags.includes(planFlag) ? 1 : 0;
  const raw = 0.55 * T + 10 * L + 6 * Math.min(2, Rp) - 8 * Ru - 6 * Math.min(3, Ev) + 6 * P;
  return clamp(Math.round(raw), 0, 100);
}

function classify(
  graph: StoryGraph,
  state: StoryRunnerState,
  endedBy: StoryOutcome['endedBy'],
  quality: number,
): StoryOutcomeKind {
  const { session } = state;
  const rules = graph.outcomeRules;

  if (session.rupture.endedEarlyByRupture || endedBy === 'keretakan') {
    return 'menarik-diri-sementara';
  }
  if (endedBy === 'penutupan-pengguna') {
    return quality >= MIN_QUALITY_PROGRESS_EARLY ? 'kemajuan-kecil' : 'menarik-diri-sementara';
  }
  const helped =
    quality >= rules.helpedMinQuality &&
    session.highestLevelReached >= rules.helpedMinLevel &&
    rules.requiredFlags.every((f) => state.flags.includes(f)) &&
    !session.rupture.active &&
    rules.maxKind === undefined;
  if (helped) return 'terbantu';
  if (quality >= MIN_QUALITY_PROGRESS) return 'kemajuan-kecil';
  return 'menarik-diri-sementara';
}

function buildAdaptation(kind: StoryOutcomeKind): StoryAdaptation {
  switch (kind) {
    case 'terbantu':
      return { zoneBonuses: { diskusi: 0.72 }, daysRemaining: 3, reason: kind };
    case 'kemajuan-kecil':
      return { zoneBonuses: { diskusi: 0.28 }, daysRemaining: 2, reason: kind };
    default:
      return { zoneBonuses: { istirahat: 0.45, diskusi: -0.3 }, daysRemaining: 1, reason: kind };
  }
}

function buildDeltas(
  kind: StoryOutcomeKind,
  s: number,
  closedByRupture: boolean,
): { energyDelta: number; stressDelta: number } {
  switch (kind) {
    case 'terbantu':
      return { energyDelta: 0.38 + 0.16 * s, stressDelta: -(0.22 + 0.14 * s) };
    case 'kemajuan-kecil':
      return { energyDelta: 0.18 + 0.08 * s, stressDelta: -(0.08 + 0.08 * s) };
    default:
      return { energyDelta: -0.05, stressDelta: 0.06 + (closedByRupture ? 0.04 : 0) };
  }
}

const TITLES: Record<StoryOutcomeKind, string> = {
  terbantu: 'Terbantu',
  'kemajuan-kecil': 'Kemajuan kecil',
  'menarik-diri-sementara': 'Menarik diri sementara',
};

function buildSummaryBody(
  kind: StoryOutcomeKind,
  endedBy: StoryOutcome['endedBy'],
  name: string,
): string {
  if (kind === 'terbantu') {
    return `${name} pulang dengan perasaan lebih lega dan satu langkah kecil yang siap dicoba. Kepercayaan yang kamu bangun membuat ${name} mau terbuka, dan misi pendampingan ini selesai.`;
  }
  if (kind === 'kemajuan-kecil') {
    return endedBy === 'penutupan-pengguna'
      ? `Kamu mengakhiri sesi lebih awal, dan ${name} sudah mendapat sedikit ruang untuk bernapas. Kamu bisa melanjutkan obrolan di lain waktu dari titik ini.`
      : `${name} mulai merasa lebih tenang walau belum semuanya terbuka. Ini awal yang baik, dan sesi lanjutan akan membantu melangkah lebih jauh.`;
  }
  if (endedBy === 'keretakan') {
    return `${name} perlu menjauh sebentar karena percakapan terasa kurang nyaman. Hal ini wajar terjadi, dan hubungan masih bisa diperbaiki dengan sabar pada pertemuan berikutnya.`;
  }
  return `${name} masih butuh waktu untuk merasa aman bercerita. Beri jarak sejenak, lalu coba dekati lagi dengan lebih pelan.`;
}

function buildReasons(
  graph: StoryGraph,
  state: StoryRunnerState,
  kind: StoryOutcomeKind,
  quality: number,
  endedBy: StoryOutcome['endedBy'],
): string[] {
  const { session } = state;
  const rules = graph.outcomeRules;
  const reasons: string[] = [];

  if (session.rupture.endedEarlyByRupture || endedBy === 'keretakan') {
    reasons.push('Percakapan terhenti saat ada ketegangan. Lain kali, akui perasaannya lebih dulu sebelum melanjutkan.');
  } else if (session.rupture.active) {
    reasons.push('Ketegangan belum sempat dipulihkan. Mengakui dan memperbaikinya membantu membangun rasa aman.');
  }
  if (endedBy === 'penutupan-pengguna' && kind !== 'terbantu') {
    reasons.push('Sesi ditutup lebih awal, jadi hasil terbaik belum dapat dicapai. Sesi lanjutan memberi kesempatan baru.');
  }
  if (kind !== 'terbantu') {
    if (rules.maxKind !== undefined) {
      reasons.push('Cerita ini masih tahap awal, jadi kemajuan kecil adalah hasil terbaik yang tersedia untuk saat ini.');
    } else {
      if (session.highestLevelReached < rules.helpedMinLevel) {
        reasons.push('Percakapan belum sampai ke inti perasaan. Pertanyaan terbuka dan refleksi perasaan dapat membantu.');
      }
      const missing = rules.requiredFlags.filter((f) => !state.flags.includes(f));
      if (missing.length > 0 && endedBy !== 'keretakan') {
        reasons.push('Ada langkah penting yang belum terlewati, misalnya menjelaskan batas kerahasiaan atau mengamati dengan teliti.');
      }
      if (quality < rules.helpedMinQuality) {
        reasons.push('Kepercayaan masih bisa ditumbuhkan dengan mendengarkan lebih sabar dan tidak terburu-buru memberi saran.');
      }
    }
  }
  if (session.ethicsViolationsCount > 0) {
    reasons.push('Ada ucapan yang kurang sesuai etika konseling. Tinjau kembali catatan sesi untuk belajar dari momen itu.');
  }
  if (kind === 'terbantu') {
    reasons.push('Kepercayaan, keterbukaan, dan langkah kecil yang disepakati berjalan baik. Pertahankan cara ini.');
  }
  return reasons;
}

export function computeStoryOutcome(
  graph: StoryGraph,
  state: StoryRunnerState,
  endedBy: StoryOutcome['endedBy'],
): StoryOutcome {
  const quality = computeStoryQuality(graph, state);
  const kind = classify(graph, state, endedBy, quality);
  const closedByRupture = state.session.rupture.endedEarlyByRupture || endedBy === 'keretakan';
  const { energyDelta, stressDelta } = buildDeltas(kind, quality / 100, closedByRupture);
  const name = state.session.channelContext.targetAgentName;

  return {
    kind,
    quality,
    energyDelta,
    stressDelta,
    adaptation: buildAdaptation(kind),
    missionComplete: kind === 'terbantu',
    endedBy,
    summaryTitle: TITLES[kind],
    summaryBody: buildSummaryBody(kind, endedBy, name),
    reasons: buildReasons(graph, state, kind, quality, endedBy),
  };
}
