import {
  deriveAgentSpeakingStyle,
  selectOfflineTemplatedUtterance,
} from '../data/utteranceTemplates';
import type {
  AgentDialogueTone,
  AgentLimitedStateCard,
  CounselorSkillId,
  DialogueEngineMode,
  GeneratedUtterancePayload,
  SessionState,
  StudentAgent,
} from '../types';
import {
  buildUtteranceCacheKey,
  getCachedUtterance,
  setCachedUtterance,
} from './cache';
import { postJsonWithTimeout } from './client';
import { LLM_CONFIG } from './config';
import { recordLlmAuditEntry } from './logger';
import {
  extractForbiddenHigherLevelKeywords,
  validateUtteranceOutput,
} from './validator';

export function deriveAgentDialogueTone(session: SessionState): AgentDialogueTone {
  if (session.rupture.active) {
    return session.rupture.kind === 'konfrontasi' ? 'defensif' : 'menarik-diri';
  }
  const latestTurn = session.turns[session.turns.length - 1];
  if (latestTurn && latestTurn.trustDelta <= -3) {
    return session.vars.socialAnxiety >= 0.55 ? 'menarik-diri' : 'defensif';
  }
  if (session.vars.trust < 38) {
    return 'menarik-diri';
  }
  return 'terbuka';
}

export function buildAllowedFactsForLevel(session: SessionState): string[] {
  const facts: string[] = [];
  if (session.unlockedLevel >= 1) {
    facts.push(session.problem.l1Fact);
  }
  if (session.unlockedLevel >= 2) {
    facts.push(session.problem.l2Feeling);
  }
  if (session.unlockedLevel >= 3) {
    facts.push(session.problem.l3CoreNeed);
  }
  return facts;
}

/**
 * Membangun kartu keadaan terbatas tanpa data pribadi maupun fakta level di atas levelMaksimal.
 */
export function buildAgentLimitedStateCard(
  agent: StudentAgent,
  session: SessionState,
  counselorText: string,
  engineNonverbalCue: string
): AgentLimitedStateCard {
  const duaGiliranTerakhir = session.turns
    .slice(-3, -1)
    .map((t) => ({
      konselor: t.counselorText,
      agen: t.agentReply,
    }));

  return {
    nama: agent.name,
    gayaBicara: deriveAgentSpeakingStyle(agent),
    levelMaksimal: session.unlockedLevel,
    faktaBolehDisebut: buildAllowedFactsForLevel(session),
    nada: deriveAgentDialogueTone(session),
    isyaratNonverbal: engineNonverbalCue,
    duaGiliranTerakhir,
    masukanKonselorTerakhir: counselorText,
  };
}

export interface GenerateUtteranceResult {
  ucapan: string;
  nonverbal: string;
  source: 'gemini' | 'cache' | 'cadangan-aturan';
  validatorPassed: boolean;
  retried: boolean;
}

/**
 * Pembangkitan ucapan mahasiswa: menghasilkan ucapan alami agen dari kartu keadaan terbatas,
 * divalidasi oleh kode murni (JSON, panjang kata, dan tidak bocor fakta level terkunci),
 * dengan 1x coba ulang lalu jatuh balik otomatis ke pustaka templat offline ber-seed.
 */
export async function generateAgentUtteranceHybrid(params: {
  agent: StudentAgent;
  session: SessionState;
  counselorText: string;
  engineReply: string;
  engineNonverbalCue: string;
  mode: DialogueEngineMode;
  recordingMode: boolean;
  seed: number;
  skillId?: CounselorSkillId;
  reflectionIncorrect?: boolean;
  accusatoryObservation?: boolean;
  alreadyExplainedConfidentiality?: boolean;
}): Promise<GenerateUtteranceResult> {
  const {
    agent,
    session,
    counselorText,
    engineNonverbalCue,
    mode,
    recordingMode,
    seed,
    skillId,
    reflectionIncorrect,
    accusatoryObservation,
    alreadyExplainedConfidentiality,
  } = params;
  const recentReplies = session.turns.slice(-4, -1).map((t) => t.agentReply);

  const tone = deriveAgentDialogueTone(session);
  const stateCard = buildAgentLimitedStateCard(
    agent,
    session,
    counselorText,
    engineNonverbalCue
  );
  const cacheKey = buildUtteranceCacheKey({
    seed,
    agentId: agent.id,
    day: session.channelContext.day,
    turnNumber: session.turnCounter,
    level: session.unlockedLevel,
    tone,
    counselorText,
  });

  // 1. Jika Mode Rekaman aktif, putar ulang dari cache bila tersedia tanpa jaringan
  if (recordingMode) {
    const cached = getCachedUtterance(cacheKey);
    if (cached) {
      const check = validateUtteranceOutput({
        payload: cached,
        agent,
        problem: session.problem,
        unlockedLevel: session.unlockedLevel,
      });
      if (check.valid) {
        recordLlmAuditEntry({
          callKind: 'ucapan-agen',
          modeUsed: 'cache',
          sanitizedInputCard: stateCard as unknown as Record<string, unknown>,
          rawOutput: cached,
          validatorPassed: true,
          validatorReasons: [],
          retried: false,
          latencyMs: 0,
        });
        return {
          ucapan: cached.ucapan,
          nonverbal: cached.nonverbal,
          source: 'cache',
          validatorPassed: true,
          retried: false,
        };
      }
    }
  }

  // 2. Jika mode offline (atau Mode Rekaman belum punya entri), gunakan pustaka templat ber-seed sadar keterampilan
  if (mode === 'cadangan-aturan' || recordingMode) {
    const templated = selectOfflineTemplatedUtterance({
      agent,
      problem: session.problem,
      level: session.unlockedLevel,
      tone,
      seed,
      turnNumber: session.turnCounter,
      skillId,
      counselorText,
      disclosedNewLayer: session.lastTurnDisclosedSomething,
      reflectionIncorrect,
      accusatoryObservation,
      alreadyExplainedConfidentiality,
      recentReplies,
    });
    setCachedUtterance(cacheKey, templated);
    recordLlmAuditEntry({
      callKind: 'ucapan-agen',
      modeUsed: 'cadangan-aturan',
      sanitizedInputCard: stateCard as unknown as Record<string, unknown>,
      rawOutput: templated,
      validatorPassed: true,
      validatorReasons: [],
      retried: false,
      latencyMs: 0,
    });
    return {
      ucapan: templated.ucapan,
      nonverbal: templated.nonverbal,
      source: 'cadangan-aturan',
      validatorPassed: true,
      retried: false,
    };
  }

  // 3. Mode Gemini: panggil server proxy dengan validator pasca-panggilan + 1x retry
  const forbiddenKeywords = extractForbiddenHigherLevelKeywords(
    agent,
    session.problem,
    session.unlockedLevel
  );
  let retried = false;
  let totalLatency = 0;
  let lastReasons: string[] = [];

  for (let attempt = 0; attempt <= LLM_CONFIG.maxRetries; attempt += 1) {
    if (attempt > 0) retried = true;
    const res = await postJsonWithTimeout<GeneratedUtterancePayload>(
      LLM_CONFIG.endpoints.utterance,
      {
        stateCard,
        strictRetryHint:
          attempt > 0
            ? `Peringatan percobaan ulang: jangan melebihi ${LLM_CONFIG.maxReplyWords} kata dan jangan menyebut kata kunci terlarang.`
            : undefined,
      }
    );
    totalLatency += res.latencyMs;

    if (res.ok && res.data) {
      const check = validateUtteranceOutput({
        payload: res.data,
        agent,
        problem: session.problem,
        unlockedLevel: session.unlockedLevel,
      });

      if (check.valid) {
        const clean: GeneratedUtterancePayload = {
          ucapan: res.data.ucapan.trim(),
          nonverbal: res.data.nonverbal.trim(),
        };
        setCachedUtterance(cacheKey, clean);
        recordLlmAuditEntry({
          callKind: 'ucapan-agen',
          modeUsed: 'gemini',
          sanitizedInputCard: {
            ...stateCard,
            jumlahKataTerlarangDipantau: forbiddenKeywords.length,
          },
          rawOutput: clean,
          validatorPassed: true,
          validatorReasons: [],
          retried,
          latencyMs: totalLatency,
        });
        return {
          ucapan: clean.ucapan,
          nonverbal: clean.nonverbal,
          source: 'gemini',
          validatorPassed: true,
          retried,
        };
      }
      lastReasons = check.reasons;
    } else if (res.error) {
      lastReasons = [res.error];
    }
  }

  // 4. Validator gagal setelah 1x retry atau jaringan offline/timeout -> jatuh balik ke templat offline sadar keterampilan
  const fallback = selectOfflineTemplatedUtterance({
    agent,
    problem: session.problem,
    level: session.unlockedLevel,
    tone,
    seed,
    turnNumber: session.turnCounter,
    skillId,
    counselorText,
    disclosedNewLayer: session.lastTurnDisclosedSomething,
    reflectionIncorrect,
    accusatoryObservation,
    alreadyExplainedConfidentiality,
    recentReplies,
  });
  setCachedUtterance(cacheKey, fallback);
  recordLlmAuditEntry({
    callKind: 'ucapan-agen',
    modeUsed: 'cadangan-aturan',
    sanitizedInputCard: stateCard as unknown as Record<string, unknown>,
    rawOutput: fallback,
    validatorPassed: false,
    validatorReasons:
      lastReasons.length > 0
        ? lastReasons
        : ['Jatuh balik ke templat offline setelah validasi/jaringan gagal.'],
    retried,
    latencyMs: totalLatency,
  });

  return {
    ucapan: fallback.ucapan,
    nonverbal: fallback.nonverbal,
    source: 'cadangan-aturan',
    validatorPassed: false,
    retried,
  };
}
