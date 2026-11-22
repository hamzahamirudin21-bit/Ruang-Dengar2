import {
  AgentSessionVars,
  CounselorSkillId,
  RepairStepId,
  RuptureKind,
  RuptureState,
  StudentAgent,
} from '../types';

export const REPAIR_STEP_ORDER: readonly RepairStepId[] = [
  'akui-dampak',
  'minta-maaf',
  'eksplorasi-perasaan',
  'beri-pilihan',
];

export function createInitialRuptureState(): RuptureState {
  return {
    active: false,
    kind: null,
    recognized: false,
    ignoredTurns: 0,
    completedRepairSteps: [],
    ruptureCountInSession: 0,
    repairedCountInSession: 0,
    endedEarlyByRupture: false,
    reasonSummary: null,
  };
}

export function determineRuptureKind(
  agent: StudentAgent,
  vars: AgentSessionVars,
  skillId?: CounselorSkillId
): RuptureKind {
  // Mahasiswa dengan ekstroversi lebih tinggi + keramahan lebih rendah atau ketika diremehkan/dipaksa cenderung konfrontatif
  const confrontScore =
    agent.personality.extraversion * 0.48 +
    (1 - agent.personality.agreeableness) * 0.42 +
    (skillId === 'meremehkan' ? 0.16 : 0) +
    (skillId === 'interogasi' ? 0.08 : 0) -
    vars.socialAnxiety * 0.32 -
    vars.selfReliance * 0.18;

  return confrontScore >= 0.34 ? 'konfrontasi' : 'menarik-diri';
}

export function shouldTriggerRupture(
  skillId: CounselorSkillId,
  trustDelta: number,
  currentLevel: number
): { trigger: boolean; reason: string | null } {
  if (skillId === 'interogasi') {
    return {
      trigger: true,
      reason: 'Pertanyaan yang mendesak membuat mahasiswa merasa disudutkan.',
    };
  }
  if (skillId === 'meremehkan') {
    return {
      trigger: true,
      reason: 'Pernyataan terdengar mengecilkan pengalaman atau membandingkan dengan teman lain.',
    };
  }
  if (skillId === 'nasihat-dini' && currentLevel < 2) {
    return {
      trigger: true,
      reason: 'Nasihat diberikan terlalu dini sebelum mahasiswa sempat menyampaikan perasaannya.',
    };
  }
  if (trustDelta <= -8) {
    return {
      trigger: true,
      reason: 'Penurunan kepercayaan tajam dalam satu giliran memicu ketegangan relasi.',
    };
  }
  return { trigger: false, reason: null };
}

export function activateRupture(
  prev: RuptureState,
  kind: RuptureKind,
  reasonSummary: string
): RuptureState {
  const alreadyActive = prev.active;
  return {
    ...prev,
    active: true,
    kind,
    recognized: false,
    ignoredTurns: 0,
    completedRepairSteps: [],
    ruptureCountInSession: alreadyActive
      ? prev.ruptureCountInSession
      : prev.ruptureCountInSession + 1,
    reasonSummary,
  };
}

export function recordIgnoredRuptureTurn(prev: RuptureState): RuptureState {
  if (!prev.active || prev.recognized) return prev;
  const nextIgnored = prev.ignoredTurns + 1;
  return {
    ...prev,
    ignoredTurns: nextIgnored,
    endedEarlyByRupture: nextIgnored >= 2,
  };
}

export function recognizeRupture(prev: RuptureState): {
  next: RuptureState;
  changed: boolean;
} {
  if (!prev.active || prev.recognized) {
    return { next: prev, changed: false };
  }
  return {
    changed: true,
    next: {
      ...prev,
      recognized: true,
      ignoredTurns: 0,
    },
  };
}

export interface RepairStepResolution {
  next: RuptureState;
  accepted: boolean;
  repairedNow: boolean;
  trustRecovery: number;
  readinessRecovery: number;
  agentReply: string;
  nonverbalCue: string;
}

export function applyRepairStep(
  prev: RuptureState,
  stepId: RepairStepId,
  agentName: string
): RepairStepResolution {
  if (!prev.active || !prev.recognized) {
    return {
      next: prev,
      accepted: false,
      repairedNow: false,
      trustRecovery: 0,
      readinessRecovery: 0,
      agentReply: 'Tidak ada ketegangan aktif yang perlu diperbaiki saat ini.',
      nonverbalCue: `${agentName} duduk dengan sikap biasa saja.`,
    };
  }

  const completed = prev.completedRepairSteps.includes(stepId)
    ? prev.completedRepairSteps
    : [...prev.completedRepairSteps, stepId];

  const isWithdrawal = prev.kind === 'menarik-diri';

  if (stepId === 'akui-dampak') {
    return {
      next: { ...prev, completedRepairSteps: completed },
      accepted: true,
      repairedNow: false,
      trustRecovery: 3,
      readinessRecovery: 2,
      agentReply: isWithdrawal
        ? 'Iya... tadi memang sempat terasa agak canggung buatku.'
        : 'Iya, tadi kesannya aku yang paling disalahkan, makanya aku langsung bertahan.',
      nonverbalCue: isWithdrawal
        ? `${agentName} mengangkat pandangan sebentar, bahunya tidak sekaku sebelumnya.`
        : `${agentName} menghela napas pelan dan menurunkan nada bicaranya.`,
    };
  }

  if (stepId === 'minta-maaf') {
    return {
      next: { ...prev, completedRepairSteps: completed },
      accepted: true,
      repairedNow: false,
      trustRecovery: 4,
      readinessRecovery: 3,
      agentReply: isWithdrawal
        ? 'Enggak apa-apa... makasih sudah mau bilang begitu secara langsung.'
        : 'Oke, aku hargai kamu mau mengakui bagian itu tanpa mutar-mutar.',
      nonverbalCue: `${agentName} mengangguk pelan dan tidak lagi menjauhkan posisi duduknya.`,
    };
  }

  if (stepId === 'eksplorasi-perasaan') {
    return {
      next: { ...prev, completedRepairSteps: completed },
      accepted: true,
      repairedNow: false,
      trustRecovery: 4,
      readinessRecovery: 4,
      agentReply: isWithdrawal
        ? 'Aku cuma takut kalau ngomong salah, nanti malah makin repot di lab.'
        : 'Aku sebenarnya bukan menolak diajak ngobrol, cuma capek kalau langsung disuruh begini-begitu sebelum didengarkan.',
      nonverbalCue: `${agentName} membuka genggaman tangannya di atas meja dan menatap lebih tenang.`,
    };
  }

  // stepId === 'beri-pilihan'
  const hasCoreSteps =
    completed.includes('akui-dampak') ||
    completed.includes('minta-maaf') ||
    completed.includes('eksplorasi-perasaan');

  if (!hasCoreSteps) {
    return {
      next: { ...prev, completedRepairSteps: completed },
      accepted: true,
      repairedNow: false,
      trustRecovery: 2,
      readinessRecovery: 1,
      agentReply:
        'Aku boleh pilih kok, tapi rasanya kita belum sempat bahas ketegangan barusan.',
      nonverbalCue: `${agentName} masih tampak menimbang-nimbang sebelum menjawab.`,
    };
  }

  // Perbaikan selesai -> relasi pulih dengan bonus kecil ("pola retak lalu pulih")
  return {
    next: {
      active: false,
      kind: null,
      recognized: false,
      ignoredTurns: 0,
      completedRepairSteps: [],
      ruptureCountInSession: prev.ruptureCountInSession,
      repairedCountInSession: prev.repairedCountInSession + 1,
      endedEarlyByRupture: false,
      reasonSummary: null,
    },
    accepted: true,
    repairedNow: true,
    trustRecovery: 6, // total pemulihan + bonus kecil relasi retak lalu pulih
    readinessRecovery: 5,
    agentReply: isWithdrawal
      ? 'Kalau memang bisa pelan-pelan dan aku boleh bilang kalau enggak nyaman, aku masih mau lanjut ngobrol sebentar.'
      : 'Baik, kalau memang temponya bisa kita atur bareng dan tidak terburu-buru, aku bersedia lanjut.',
    nonverbalCue: `${agentName} menarik napas lega, mengangguk mantap, dan kembali menghadap konselor.`,
  };
}
