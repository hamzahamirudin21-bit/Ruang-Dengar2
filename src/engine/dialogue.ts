import { getSkillSpec } from '../data/skillEffects';
import {
  classifyCounselorInputHybrid,
  detectForbiddenTopicsLocally,
  detectPromptInjectionLocally,
  generateAgentUtteranceHybrid,
} from '../llm';
import type {
  CounselorInputClassification,
  CounselorSkillId,
  DialogueEngineMode,
  RepairStepId,
  SessionState,
  SessionTurnOption,
  StudentAgent,
} from '../types';
import {
  applyCounselorSkillTurn,
  applyRepairStepTurn,
  recognizeSessionTension,
} from './trust';

export type SkillSelectionChoice = CounselorSkillId | 'otomatis';

export interface HybridTurnInput {
  session: SessionState;
  agent: StudentAgent;
  selectedSkill: SkillSelectionChoice;
  counselorText: string;
  options?: SessionTurnOption;
  mode: DialogueEngineMode;
  recordingMode: boolean;
  seed: number;
}

export interface HybridTurnOutput {
  nextSession: SessionState;
  classification: CounselorInputClassification | null;
  utteranceSource: 'gemini' | 'cache' | 'cadangan-aturan';
  blockedOutOfScope: boolean;
  forbiddenTopicCategory: 'bunuh-diri' | 'menyakiti-diri' | 'kekerasan' | null;
  needsManualSkillChoice: boolean;
}

/**
 * Orkestrator dialog hibrida (LLM + aturan):
 * - Memvalidasi topik terlarang & upaya injeksi terlebih dahulu
 * - Mengklasifikasikan kalimat bebas (klasifikasi keterampilan) atau memakai pilihan keterampilan manual
 * - Menjalankan mesin deterministik sesi konseling (trust.ts / disclosure.ts / rupture.ts tanpa modifikasi)
 * - Mengemas respons alami via pembangkitan ucapan + validator + cadangan offline
 */
export async function processHybridCounselorTurn(
  input: HybridTurnInput
): Promise<HybridTurnOutput> {
  const {
    session,
    agent,
    selectedSkill,
    counselorText,
    options,
    mode,
    recordingMode,
    seed,
  } = input;

  if (session.closed) {
    return {
      nextSession: session,
      classification: null,
      utteranceSource: 'cadangan-aturan',
      blockedOutOfScope: false,
      forbiddenTopicCategory: null,
      needsManualSkillChoice: false,
    };
  }

  const trimmed = counselorText.trim();

  // 1. Pengecekan cepat topik terlarang lokal pada setiap masukan teks bebas
  if (trimmed.length > 0) {
    const localSafety = detectForbiddenTopicsLocally(trimmed);
    if (localSafety.forbidden) {
      return {
        nextSession: session,
        classification: {
          keterampilan: 'pertanyaan-terbuka',
          kualitas: 0,
          nada: 'netral',
          menyentuh_topik_terlarang: true,
          forbiddenTopicCategory: localSafety.category,
          alasan_singkat: 'Topik krisis keselamatan di luar cakupan simulator.',
          source: 'cadangan-aturan',
        },
        utteranceSource: 'cadangan-aturan',
        blockedOutOfScope: true,
        forbiddenTopicCategory: localSafety.category,
        needsManualSkillChoice: false,
      };
    }
  }

  // 2. Klasifikasi keterampilan konseling (jika mode otomatis dengan teks bebas)
  let classification: CounselorInputClassification | null = null;
  let resolvedSkill: CounselorSkillId;

  if (selectedSkill === 'otomatis') {
    if (trimmed.length === 0) {
      return {
        nextSession: session,
        classification: null,
        utteranceSource: 'cadangan-aturan',
        blockedOutOfScope: false,
        forbiddenTopicCategory: null,
        needsManualSkillChoice: true,
      };
    }

    classification = await classifyCounselorInputHybrid({
      counselorText: trimmed,
      mode,
      recordingMode,
      seed,
      agentId: agent.id,
      unlockedLevel: session.unlockedLevel,
    });

    if (classification.menyentuh_topik_terlarang) {
      return {
        nextSession: session,
        classification,
        utteranceSource: 'cadangan-aturan',
        blockedOutOfScope: true,
        forbiddenTopicCategory:
          classification.forbiddenTopicCategory ?? 'menyakiti-diri',
        needsManualSkillChoice: false,
      };
    }

    if (
      classification.ambiguousOffline &&
      mode === 'cadangan-aturan' &&
      trimmed.split(/\s+/).length < 2
    ) {
      return {
        nextSession: session,
        classification,
        utteranceSource: 'cadangan-aturan',
        blockedOutOfScope: false,
        forbiddenTopicCategory: null,
        needsManualSkillChoice: true,
      };
    }

    resolvedSkill = classification.keterampilan;
  } else {
    resolvedSkill = selectedSkill;
    // Pengaman injeksi tetap aktif meskipun menu manual sedang terpilih
    if (trimmed.length > 0 && detectPromptInjectionLocally(trimmed)) {
      resolvedSkill = 'interogasi';
    }
  }

  const effectiveOptions: SessionTurnOption | undefined =
    resolvedSkill === 'sampaikan-pengamatan' &&
    classification?.nada === 'menghakimi' &&
    !options?.observationTone
      ? { ...options, observationTone: 'menilai' }
      : options;

  const effectiveText =
    trimmed.length > 0 ? trimmed : getSkillSpec(resolvedSkill).samplePrompts[0];

  // 3. Jalankan mesin deterministik sesi konseling (tanpa mengubah trust.ts/disclosure.ts/rupture.ts)
  const engineNextSession = applyCounselorSkillTurn(
    session,
    agent,
    resolvedSkill,
    effectiveText,
    effectiveOptions
  );

  const latestTurn = engineNextSession.turns[engineNextSession.turns.length - 1];
  if (!latestTurn || engineNextSession.rupture.endedEarlyByRupture) {
    return {
      nextSession: engineNextSession,
      classification,
      utteranceSource: 'cadangan-aturan',
      blockedOutOfScope: false,
      forbiddenTopicCategory: null,
      needsManualSkillChoice: false,
    };
  }

  // 4. Pembangkitan ucapan mahasiswa: bungkus respons sesuai level, keterampilan & nada dengan validator pasca-panggilan + cadangan offline
  const generated = await generateAgentUtteranceHybrid({
    agent,
    session: engineNextSession,
    counselorText: effectiveText,
    engineReply: latestTurn.agentReply,
    engineNonverbalCue: latestTurn.nonverbalCue,
    mode,
    recordingMode,
    seed,
    skillId: resolvedSkill,
    reflectionIncorrect:
      resolvedSkill === 'refleksi-perasaan' &&
      (effectiveOptions?.reflectionCorrectOverride === false || latestTurn.trustDelta < 0),
    accusatoryObservation:
      resolvedSkill === 'sampaikan-pengamatan' && effectiveOptions?.observationTone === 'menilai',
    alreadyExplainedConfidentiality:
      resolvedSkill === 'batas-kerahasiaan' && session.usedConfidentialityOnce,
  });

  const updatedTurns = engineNextSession.turns.map((turn, idx) =>
    idx === engineNextSession.turns.length - 1
      ? {
          ...turn,
          agentReply: generated.ucapan,
          nonverbalCue: generated.nonverbal,
        }
      : turn
  );

  return {
    nextSession: {
      ...engineNextSession,
      turns: updatedTurns,
    },
    classification,
    utteranceSource: generated.source,
    blockedOutOfScope: false,
    forbiddenTopicCategory: null,
    needsManualSkillChoice: false,
  };
}

export async function processHybridTensionRecognition(params: {
  session: SessionState;
  agent: StudentAgent;
  counselorText: string;
  mode: DialogueEngineMode;
  recordingMode: boolean;
  seed: number;
}): Promise<{ nextSession: SessionState; source: 'gemini' | 'cache' | 'cadangan-aturan' }> {
  const { session, agent, counselorText, mode, recordingMode, seed } = params;
  const engineNext = recognizeSessionTension(session, agent, counselorText);
  const latestTurn = engineNext.turns[engineNext.turns.length - 1];
  if (!latestTurn || engineNext.turnCounter === session.turnCounter) {
    return { nextSession: engineNext, source: 'cadangan-aturan' };
  }

  if (mode === 'cadangan-aturan') {
    return { nextSession: engineNext, source: 'cadangan-aturan' };
  }

  const generated = await generateAgentUtteranceHybrid({
    agent,
    session: engineNext,
    counselorText: latestTurn.counselorText,
    engineReply: latestTurn.agentReply,
    engineNonverbalCue: latestTurn.nonverbalCue,
    mode,
    recordingMode,
    seed,
  });

  return {
    source: generated.source,
    nextSession: {
      ...engineNext,
      turns: engineNext.turns.map((t, idx) =>
        idx === engineNext.turns.length - 1
          ? { ...t, agentReply: generated.ucapan, nonverbalCue: generated.nonverbal }
          : t
      ),
    },
  };
}

export async function processHybridRepairStep(params: {
  session: SessionState;
  agent: StudentAgent;
  stepId: RepairStepId;
  counselorText: string;
  mode: DialogueEngineMode;
  recordingMode: boolean;
  seed: number;
}): Promise<{ nextSession: SessionState; source: 'gemini' | 'cache' | 'cadangan-aturan' }> {
  const { session, agent, stepId, counselorText, mode, recordingMode, seed } = params;
  const engineNext = applyRepairStepTurn(session, agent, stepId, counselorText);
  const latestTurn = engineNext.turns[engineNext.turns.length - 1];
  if (!latestTurn || engineNext.turnCounter === session.turnCounter) {
    return { nextSession: engineNext, source: 'cadangan-aturan' };
  }

  if (mode === 'cadangan-aturan') {
    return { nextSession: engineNext, source: 'cadangan-aturan' };
  }

  const generated = await generateAgentUtteranceHybrid({
    agent,
    session: engineNext,
    counselorText: latestTurn.counselorText,
    engineReply: latestTurn.agentReply,
    engineNonverbalCue: latestTurn.nonverbalCue,
    mode,
    recordingMode,
    seed,
  });

  return {
    source: generated.source,
    nextSession: {
      ...engineNext,
      turns: engineNext.turns.map((t, idx) =>
        idx === engineNext.turns.length - 1
          ? { ...t, agentReply: generated.ucapan, nonverbalCue: generated.nonverbal }
          : t
      ),
    },
  };
}
