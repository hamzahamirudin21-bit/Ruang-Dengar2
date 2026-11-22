import { STUDENT_BLUEPRINTS } from '../data/agents.seed';
import { LAB_MAP } from '../data/map';
import {
  COUNSELOR_SKILLS,
  getAgentHiddenProblemProfile,
  getSkillSpec,
} from '../data/skillEffects';
import {
  AgentMemoryRecord,
  AgentSessionVars,
  CounselorSkillId,
  DisclosureLevel,
  FollowUpPromise,
  PlaceholderConversationContext,
  RandomSessionsAuditResult,
  RepairStepId,
  SessionState,
  SessionTurnEntry,
  SessionTurnOption,
  StudentAgent,
} from '../types';
import {
  buildAgentTemplatedTurnResponse,
  computeAgentDisclosureThresholds,
  evaluateDisclosureStep,
} from './disclosure';
import {
  commitSessionToAgentMemory,
  createEmptyAgentMemory,
  evaluateMemoryAtSessionStart,
  getOrCreateAgentMemory,
} from './memory';
import { clamp01, mulberry32 } from './rng';
import {
  REPAIR_STEP_ORDER,
  activateRupture,
  applyRepairStep,
  createInitialRuptureState,
  determineRuptureKind,
  recognizeRupture,
  recordIgnoredRuptureTurn,
  shouldTriggerRupture,
} from './rupture';

export function clamp100(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

export function buildAgentSessionVars(
  agent: StudentAgent,
  exposure: number
): AgentSessionVars {
  const selfReliance = clamp01(
    agent.solitudePreference * 0.65 +
      (1 - agent.personality.agreeableness) * 0.15 +
      agent.personality.conscientiousness * 0.2
  );
  const selfStigma = clamp01(agent.hiddenVars.stigmaSensitivity);
  const socialAnxiety = clamp01(
    (1 - agent.hiddenVars.socialComfort) * 0.72 +
      agent.personality.stressSensitivity * 0.28
  );
  const gossipSensitivity = clamp01(
    selfStigma * 0.45 + socialAnxiety * 0.35 + agent.personality.stressSensitivity * 0.2
  );

  return {
    trust: clamp100(agent.hiddenVars.trustInCounselor * 100),
    readiness: clamp100(agent.hiddenVars.disclosureReadiness * 100),
    selfReliance,
    selfStigma,
    socialAnxiety,
    gossipSensitivity,
    exposure: clamp01(exposure),
  };
}

export interface TrustCalculationResult {
  trustDelta: number;
  readinessDelta: number;
  reflectionIncorrect: boolean;
  accusatoryObservation: boolean;
  confidentialityRepeated: boolean;
}

/**
 * Rumus kepercayaan murni TypeScript:
 * efek = basis * modulator watak agen * konteks (jalur kontak, level, saksi/paparan)
 */
export function computeSkillTrustDelta(params: {
  agent: StudentAgent;
  vars: AgentSessionVars;
  skillId: CounselorSkillId;
  unlockedLevel: DisclosureLevel;
  context: PlaceholderConversationContext;
  lastTurnDisclosedSomething: boolean;
  usedConfidentialityOnce: boolean;
  consecutiveClosedQuestions: number;
  expectedEmotion: string;
  options?: SessionTurnOption;
}): TrustCalculationResult {
  const {
    agent,
    vars,
    skillId,
    unlockedLevel,
    context,
    lastTurnDisclosedSomething,
    usedConfidentialityOnce,
    consecutiveClosedQuestions,
    expectedEmotion,
    options,
  } = params;

  const spec = getSkillSpec(skillId);
  let basis = spec.baseEffect;
  let reflectionIncorrect = false;
  let accusatoryObservation = false;
  let confidentialityRepeated = false;

  if (skillId === 'pertanyaan-terbuka') {
    basis = lastTurnDisclosedSomething ? 6 : 4;
  } else if (skillId === 'refleksi-perasaan') {
    const isCorrect =
      options?.reflectionCorrectOverride !== undefined
        ? options.reflectionCorrectOverride
        : options?.reflectionNuance
          ? options.reflectionNuance === expectedEmotion
          : true;
    if (isCorrect) {
      basis = unlockedLevel === 1 ? 7 * 1.15 : 7;
    } else {
      basis = -3;
      reflectionIncorrect = true;
    }
  } else if (skillId === 'validasi-normalisasi') {
    basis = vars.selfReliance >= 0.6 ? 1 : 4;
  } else if (skillId === 'sampaikan-pengamatan') {
    if (options?.observationTone === 'menilai') {
      basis = -6;
      accusatoryObservation = true;
    } else {
      basis = 3;
    }
  } else if (skillId === 'jeda-hening') {
    basis = vars.socialAnxiety >= 0.58 ? -2 : 2;
  } else if (skillId === 'batas-kerahasiaan') {
    if (usedConfidentialityOnce) {
      basis = 0;
      confidentialityRepeated = true;
    } else {
      basis = 4;
    }
  } else if (skillId === 'pertanyaan-tertutup') {
    // -2 per pengulangan berturut-turut (penggunaan pertama netral 0; pengulangan ke-2 = -2, ke-3 = -4, dst.)
    const repeatIndex = consecutiveClosedQuestions;
    basis = repeatIndex >= 1 ? -2 * repeatIndex : 0;
  } else if (skillId === 'nasihat-dini') {
    basis = unlockedLevel < 2 ? -5 : -1;
  }

  // Modulator watak agen & konteks (jalur kontak, level, saksi/paparan)
  const channelPrivacyMod =
    context.channelId === 'pintu-akademik' || context.channelId === 'pesan-tertulis'
      ? 1.08
      : context.channelId === 'panggilan-resmi'
        ? 0.9
        : 1.0;
  const witnessExposureDampener = Math.max(
    0.7,
    1 - vars.exposure * vars.gossipSensitivity * 0.25 - Math.min(3, context.witnessCount) * 0.04
  );

  let trustDelta = 0;
  if (basis > 0) {
    const traitMod =
      0.86 +
      agent.personality.openness * 0.16 +
      agent.personality.agreeableness * 0.12 -
      vars.selfStigma * 0.14 -
      vars.selfReliance * 0.08;
    const levelContextMod =
      unlockedLevel === 0 ? 1.0 : unlockedLevel === 1 ? 1.04 : 0.96;

    // Untuk validasi pada swakemandirian tinggi (+1) atau batas kerahasiaan, jaga minimal +1 agar tidak hilang oleh pembulatan
    const rawPositive =
      basis * traitMod * channelPrivacyMod * witnessExposureDampener * levelContextMod;
    trustDelta = Math.max(1, Math.round(rawPositive));
  } else if (basis < 0) {
    const hurtMod =
      0.92 +
      vars.selfStigma * 0.18 +
      vars.socialAnxiety * 0.14 +
      vars.exposure * vars.gossipSensitivity * 0.2 +
      (context.witnessCount >= 2 ? 0.08 : 0) -
      agent.personality.agreeableness * 0.08;
    const rawNegative = basis * hurtMod;
    trustDelta = Math.min(-1, Math.round(rawNegative));
  }

  // Kesiapan membuka diri mengikuti dinamika kepercayaan dengan peredam stigma diri & swakemandirian
  let readinessDelta = 0;
  if (trustDelta > 0) {
    const readinessFactor = Math.max(
      0.45,
      1.05 - vars.selfStigma * 0.35 - vars.selfReliance * 0.22
    );
    readinessDelta = Math.max(1, Math.round(trustDelta * readinessFactor));
  } else if (trustDelta < 0) {
    readinessDelta = Math.round(trustDelta * 1.1);
  }

  return {
    trustDelta,
    readinessDelta,
    reflectionIncorrect,
    accusatoryObservation,
    confidentialityRepeated,
  };
}

export function createCounselingSession(params: {
  agent: StudentAgent;
  context: PlaceholderConversationContext;
  exposure: number;
  memory: AgentMemoryRecord;
  seed: number;
}): SessionState {
  const { agent, context, exposure, memory, seed } = params;
  const problem = getAgentHiddenProblemProfile(agent);
  const vars = buildAgentSessionVars(agent, exposure);

  // Cek apakah kontak gagal dimulai dari Tahap 4 (tidak hadir, menolak, tenggat penuh)
  const blockedOutcomes: PlaceholderConversationContext['outcomeKind'][] = [
    'tidak-hadir',
    'menolak',
    'gagal-tenggat',
  ];
  if (blockedOutcomes.includes(context.outcomeKind)) {
    const thresholds = computeAgentDisclosureThresholds(agent, vars);
    return {
      agentId: agent.id,
      agentName: agent.name,
      channelContext: context,
      vars,
      initialTrust: vars.trust,
      problem,
      thresholds,
      unlockedLevel: 0,
      highestLevelReached: 0,
      maxAllowedLevel: Math.min(3, Math.max(0, context.maxDialogueLevel)) as DisclosureLevel,
      rupture: createInitialRuptureState(),
      usedConfidentialityOnce: false,
      consecutiveClosedQuestions: 0,
      lastTurnDisclosedSomething: false,
      ethicsViolationsCount: 0,
      memoryNotesAtStart: [],
      promisesCreatedInSession: [],
      fulfilledPromiseInSession: false,
      turns: [
        {
          turnNumber: 0,
          kind: 'pembuka',
          actionLabel: context.channelName,
          counselorText: '',
          agentReply: context.outcomeDescription,
          nonverbalCue: `${agent.name} tidak berada dalam sesi percakapan lanjutan saat ini.`,
          disclosureLevelAfter: 0,
          trustDelta: 0,
          ruptureTriggered: false,
          ruptureRepaired: false,
        },
      ],
      turnCounter: 0,
      rngState: (seed ^ (context.day * 7919)) >>> 0,
      closed: true,
      cannotStartReason: context.outcomeHeadline,
    };
  }

  const memImpact = evaluateMemoryAtSessionStart(
    memory,
    context.day,
    context.channelId,
    context.witnessCount
  );

  const adjustedVars: AgentSessionVars = {
    ...vars,
    trust: clamp100(vars.trust + memImpact.trustDelta),
    readiness: clamp100(vars.readiness + memImpact.readinessDelta),
  };

  const thresholds = computeAgentDisclosureThresholds(agent, adjustedVars);
  let initialRupture = createInitialRuptureState();
  let openingReply = context.outcomeDescription;
  let openingCue = `${agent.name} duduk dan menoleh singkat ke arah konselor sambil menunggu pembicaraan dimulai.`;

  // Jika jalur kontak memaksa atau membocorkan rahasia lewat perantara, sesi dimulai dengan ketegangan aktif
  if (
    context.outcomeKind === 'terpaksa' ||
    context.outcomeKind === 'kerahasiaan-bocor'
  ) {
    const kind = determineRuptureKind(agent, adjustedVars);
    const reason =
      context.outcomeKind === 'kerahasiaan-bocor'
        ? 'Mahasiswa mengetahui detail pribadinya sempat diceritakan kepada perantara.'
        : 'Mahasiswa merasa terpaksa hadir setelah dipanggil secara resmi di depan rekan lab.';
    initialRupture = activateRupture(initialRupture, kind, reason);
    openingReply =
      kind === 'konfrontasi'
        ? context.outcomeKind === 'kerahasiaan-bocor'
          ? 'Aku agak kaget dengar perantara tadi sudah tahu cerita pribadiku. Kenapa bisa sampai ke sana?'
          : 'Aku datang karena dipanggil resmi, tapi sebenarnya lagi banyak kerjaan di lab.'
        : 'Iya... aku sudah di sini. Sebenarnya enggak ada hal khusus kok.';
    openingCue =
      kind === 'konfrontasi'
        ? `${agent.name} menatap tajam dengan lengan terlipat dan bahu menegang.`
        : `${agent.name} menunduk memandangi lantai dan menarik kursinya sedikit menjauh.`;
  } else if (memImpact.overdueCount > 0) {
    openingReply =
      'Oh, halo... kemarin sempat ada janji tindak lanjut sampai hari sebelumnya ya, tapi keburu lewat tanpa kabar.';
    openingCue = `${agent.name} berbicara datar dan sedikit menjaga jarak saat duduk.`;
  } else if (memImpact.fulfilledCount > 0) {
    openingReply =
      'Makasih sudah menepati janji buat ketemu lagi sesuai waktu yang disepakati kemarin.';
    openingCue = `${agent.name} tampak lebih tenang dan menyapa lebih dulu dengan anggukan hangat.`;
  }

  const maxAllowedLevel = Math.min(
    3,
    Math.max(0, context.maxDialogueLevel)
  ) as DisclosureLevel;

  return {
    agentId: agent.id,
    agentName: agent.name,
    channelContext: context,
    vars: adjustedVars,
    initialTrust: adjustedVars.trust,
    problem,
    thresholds,
    unlockedLevel: 0,
    highestLevelReached: 0,
    maxAllowedLevel,
    rupture: initialRupture,
    usedConfidentialityOnce: false,
    consecutiveClosedQuestions: 0,
    lastTurnDisclosedSomething: false,
    ethicsViolationsCount: 0,
    memoryNotesAtStart: memImpact.notes,
    promisesCreatedInSession: [],
    fulfilledPromiseInSession: memImpact.fulfilledCount > 0,
    turns: [
      {
        turnNumber: 0,
        kind: 'pembuka',
        actionLabel: context.channelName,
        counselorText: '',
        agentReply: openingReply,
        nonverbalCue: openingCue,
        disclosureLevelAfter: 0,
        trustDelta: memImpact.trustDelta,
        ruptureTriggered: initialRupture.active,
        ruptureRepaired: false,
      },
    ],
    turnCounter: 0,
    rngState: (seed ^ (context.day * 7919)) >>> 0,
    closed: false,
    cannotStartReason: null,
  };
}

export function applyCounselorSkillTurn(
  session: SessionState,
  agent: StudentAgent,
  skillId: CounselorSkillId,
  counselorText: string,
  options?: SessionTurnOption
): SessionState {
  if (session.closed) return session;

  const spec = getSkillSpec(skillId);
  const nextTurnNum = session.turnCounter + 1;
  const cleanText =
    counselorText.trim().length > 0 ? counselorText.trim() : spec.samplePrompts[0];

  // Jika ada keretakan aktif yang belum diakui dan konselor mengabaikannya dengan keterampilan biasa:
  let nextRupture = session.rupture;
  if (session.rupture.active && !session.rupture.recognized) {
    nextRupture = recordIgnoredRuptureTurn(session.rupture);
    if (nextRupture.endedEarlyByRupture) {
      const { reply, nonverbalCue } = buildAgentTemplatedTurnResponse({
        agent,
        problem: session.problem,
        skillId,
        prevLevel: session.unlockedLevel,
        nextLevel: session.unlockedLevel,
        disclosedNewLayer: false,
        trustDelta: -4,
        rupture: nextRupture,
        justTriggeredRupture: false,
        reflectionIncorrect: false,
        accusatoryObservation: false,
        alreadyExplainedConfidentiality: session.usedConfidentialityOnce,
        maxAllowedLevel: session.maxAllowedLevel,
      });

      const nextVars: AgentSessionVars = {
        ...session.vars,
        trust: clamp100(session.vars.trust - 4),
        readiness: clamp100(session.vars.readiness - 6),
      };

      const entry: SessionTurnEntry = {
        turnNumber: nextTurnNum,
        kind: 'keterampilan',
        actionLabel: spec.label,
        counselorText: cleanText,
        agentReply: reply,
        nonverbalCue,
        disclosureLevelAfter: session.unlockedLevel,
        trustDelta: -4,
        ruptureTriggered: false,
        ruptureRepaired: false,
        ethicsFlag: spec.ethicsViolation,
      };

      return {
        ...session,
        vars: nextVars,
        rupture: nextRupture,
        turns: [...session.turns, entry],
        turnCounter: nextTurnNum,
        closed: true,
      };
    }
  }

  const trustCalc = computeSkillTrustDelta({
    agent,
    vars: session.vars,
    skillId,
    unlockedLevel: session.unlockedLevel,
    context: session.channelContext,
    lastTurnDisclosedSomething: session.lastTurnDisclosedSomething,
    usedConfidentialityOnce: session.usedConfidentialityOnce,
    consecutiveClosedQuestions: session.consecutiveClosedQuestions,
    expectedEmotion: session.problem.primaryEmotion,
    options,
  });

  // Saat keretakan aktif (meski sudah diakui tapi belum selesai diperbaiki), keterampilan biasa tidak menaikkan trust secara signifikan
  let effectiveTrustDelta = trustCalc.trustDelta;
  let effectiveReadinessDelta = trustCalc.readinessDelta;
  if (nextRupture.active && effectiveTrustDelta > 0) {
    effectiveTrustDelta = 0;
    effectiveReadinessDelta = 0;
  }

  const ruptureCheck = shouldTriggerRupture(
    skillId,
    effectiveTrustDelta,
    session.unlockedLevel
  );
  let justTriggeredRupture = false;
  if (ruptureCheck.trigger && ruptureCheck.reason) {
    const kind = determineRuptureKind(agent, session.vars, skillId);
    nextRupture = activateRupture(nextRupture, kind, ruptureCheck.reason);
    justTriggeredRupture = true;
  }

  const nextVars: AgentSessionVars = {
    ...session.vars,
    trust: clamp100(session.vars.trust + effectiveTrustDelta),
    readiness: clamp100(session.vars.readiness + effectiveReadinessDelta),
  };

  const disclosureStep = evaluateDisclosureStep({
    prevLevel: session.unlockedLevel,
    maxAllowedLevel: session.maxAllowedLevel,
    skillId,
    trustDelta: effectiveTrustDelta,
    vars: nextVars,
    thresholds: session.thresholds,
    rupture: nextRupture,
    justTriggeredRupture,
  });

  const { reply, nonverbalCue } = buildAgentTemplatedTurnResponse({
    agent,
    problem: session.problem,
    skillId,
    prevLevel: session.unlockedLevel,
    nextLevel: disclosureStep.nextLevel,
    disclosedNewLayer: disclosureStep.disclosedNewLayer,
    trustDelta: effectiveTrustDelta,
    rupture: nextRupture,
    justTriggeredRupture,
    reflectionIncorrect: trustCalc.reflectionIncorrect,
    accusatoryObservation: trustCalc.accusatoryObservation,
    alreadyExplainedConfidentiality: trustCalc.confidentialityRepeated,
    maxAllowedLevel: session.maxAllowedLevel,
  });

  const nextHighest = Math.max(
    session.highestLevelReached,
    disclosureStep.nextLevel
  ) as DisclosureLevel;

  const entry: SessionTurnEntry = {
    turnNumber: nextTurnNum,
    kind: 'keterampilan',
    actionLabel: spec.label,
    counselorText: cleanText,
    agentReply: reply,
    nonverbalCue,
    disclosureLevelAfter: disclosureStep.nextLevel,
    trustDelta: effectiveTrustDelta,
    ruptureTriggered: justTriggeredRupture,
    ruptureRepaired: false,
    ethicsFlag: spec.ethicsViolation,
  };

  return {
    ...session,
    vars: nextVars,
    unlockedLevel: disclosureStep.nextLevel,
    highestLevelReached: nextHighest,
    rupture: nextRupture,
    usedConfidentialityOnce:
      session.usedConfidentialityOnce || skillId === 'batas-kerahasiaan',
    consecutiveClosedQuestions:
      skillId === 'pertanyaan-tertutup'
        ? session.consecutiveClosedQuestions + 1
        : 0,
    lastTurnDisclosedSomething: disclosureStep.disclosedNewLayer,
    ethicsViolationsCount:
      session.ethicsViolationsCount + (spec.ethicsViolation ? 1 : 0),
    turns: [...session.turns, entry],
    turnCounter: nextTurnNum,
  };
}

export function recognizeSessionTension(
  session: SessionState,
  agent: StudentAgent,
  counselorText: string
): SessionState {
  if (session.closed) return session;
  const { next, changed } = recognizeRupture(session.rupture);
  if (!changed) return session;

  const nextTurnNum = session.turnCounter + 1;
  const cleanText =
    counselorText.trim().length > 0
      ? counselorText.trim()
      : 'Aku merasa ada ketegangan di antara kita barusan; aku ingin mendengarkan perspektifmu dulu.';

  const nextVars: AgentSessionVars = {
    ...session.vars,
    trust: clamp100(session.vars.trust + 2),
    readiness: clamp100(session.vars.readiness + 1),
  };

  const reply =
    next.kind === 'konfrontasi'
      ? 'Iya, memang terasa kurang enak tadi. Aku merasa langsung disalahkan sebelum selesai cerita.'
      : 'Mmm... iya, tadi aku sempat merasa agak enggak nyaman aja.';
  const nonverbalCue = `${agent.name} berhenti sejenak, menarik napas pelan, dan menatap kembali ke arah konselor.`;

  const entry: SessionTurnEntry = {
    turnNumber: nextTurnNum,
    kind: 'akui-ketegangan',
    actionLabel: 'Akui ketegangan',
    counselorText: cleanText,
    agentReply: reply,
    nonverbalCue,
    disclosureLevelAfter: session.unlockedLevel,
    trustDelta: 2,
    ruptureTriggered: false,
    ruptureRepaired: false,
  };

  return {
    ...session,
    vars: nextVars,
    rupture: next,
    consecutiveClosedQuestions: 0,
    turns: [...session.turns, entry],
    turnCounter: nextTurnNum,
  };
}

export function applyRepairStepTurn(
  session: SessionState,
  agent: StudentAgent,
  stepId: RepairStepId,
  counselorText: string
): SessionState {
  if (session.closed) return session;

  const stepLabels: Record<RepairStepId, string> = {
    'akui-dampak': 'Perbaikan: Akui dampak',
    'minta-maaf': 'Perbaikan: Minta maaf',
    'eksplorasi-perasaan': 'Perbaikan: Eksplorasi perasaan',
    'beri-pilihan': 'Perbaikan: Beri pilihan',
  };
  const stepDefaultPrompts: Record<RepairStepId, string> = {
    'akui-dampak':
      'Aku sadar caraku menyampaikan tadi bisa membuatmu merasa tertekan dan kurang nyaman.',
    'minta-maaf':
      'Aku minta maaf untuk bagian itu—tujuanku bukan menyudutkan atau mengecilkan situasimu.',
    'eksplorasi-perasaan':
      'Kalau boleh tahu, bagian mana tadi yang paling terasa mengganjal buatmu?',
    'beri-pilihan':
      'Sekarang keputusannya ada di kamu: kita bisa lanjut pelan-pelan, ganti topik yang lebih nyaman, atau cukupkan dulu sampai sini.',
  };

  const resolution = applyRepairStep(session.rupture, stepId, agent.name);
  if (!resolution.accepted) return session;

  const nextTurnNum = session.turnCounter + 1;
  const nextVars: AgentSessionVars = {
    ...session.vars,
    trust: clamp100(session.vars.trust + resolution.trustRecovery),
    readiness: clamp100(session.vars.readiness + resolution.readinessRecovery),
  };

  const entry: SessionTurnEntry = {
    turnNumber: nextTurnNum,
    kind: 'perbaikan',
    actionLabel: stepLabels[stepId],
    counselorText:
      counselorText.trim().length > 0
        ? counselorText.trim()
        : stepDefaultPrompts[stepId],
    agentReply: resolution.agentReply,
    nonverbalCue: resolution.nonverbalCue,
    disclosureLevelAfter: session.unlockedLevel,
    trustDelta: resolution.trustRecovery,
    ruptureTriggered: false,
    ruptureRepaired: resolution.repairedNow,
  };

  return {
    ...session,
    vars: nextVars,
    rupture: resolution.next,
    consecutiveClosedQuestions: 0,
    turns: [...session.turns, entry],
    turnCounter: nextTurnNum,
  };
}

export function createFollowUpPromiseInSession(
  session: SessionState,
  agent: StudentAgent,
  dueDay: number,
  note: string
): SessionState {
  if (session.closed) return session;
  const safeDueDay = Math.max(session.channelContext.day + 1, Math.round(dueDay));
  const cleanNote =
    note.trim().length > 0
      ? note.trim()
      : `Menindaklanjuti percakapan bersama ${agent.name} paling lambat Hari ${safeDueDay}.`;

  const promise: FollowUpPromise = {
    id: `janji-${agent.id}-d${session.channelContext.day}-t${session.turnCounter + 1}`,
    createdDay: session.channelContext.day,
    dueDay: safeDueDay,
    note: cleanNote,
    status: 'menunggu',
  };

  const nextTurnNum = session.turnCounter + 1;
  const nextVars: AgentSessionVars = {
    ...session.vars,
    trust: clamp100(session.vars.trust + 2),
    readiness: clamp100(session.vars.readiness + 1),
  };

  const entry: SessionTurnEntry = {
    turnNumber: nextTurnNum,
    kind: 'janji-tindak-lanjut',
    actionLabel: `Janji tindak lanjut (s.d. Hari ${safeDueDay})`,
    counselorText: cleanNote,
    agentReply: `Baik, aku pegang janjinya ya—kita cek lagi paling lambat Hari ${safeDueDay}.`,
    nonverbalCue: `${agent.name} mencatat pengingat kecil di bukunya dan mengangguk pelan.`,
    disclosureLevelAfter: session.unlockedLevel,
    trustDelta: 2,
    ruptureTriggered: false,
    ruptureRepaired: false,
  };

  return {
    ...session,
    vars: nextVars,
    promisesCreatedInSession: [...session.promisesCreatedInSession, promise],
    turns: [...session.turns, entry],
    turnCounter: nextTurnNum,
  };
}

/**
 * Menyinkronkan hasil sesi kembali ke state agen dunia (`hiddenVars`) dan memori lintas sesi.
 */
export function finalizeCounselingSession(
  session: SessionState,
  agents: StudentAgent[],
  memoryMap: Readonly<Record<string, AgentMemoryRecord>>
): {
  nextAgents: StudentAgent[];
  nextMemoryMap: Record<string, AgentMemoryRecord>;
  closedSession: SessionState;
} {
  const closedSession: SessionState = {
    ...session,
    closed: true,
  };

  const prevMemory = getOrCreateAgentMemory(memoryMap, session.agentId);
  const startEvaluatedMemory = evaluateMemoryAtSessionStart(
    prevMemory,
    session.channelContext.day,
    session.channelContext.channelId,
    session.channelContext.witnessCount
  ).updatedMemory;

  const committedMemory = commitSessionToAgentMemory(
    startEvaluatedMemory,
    closedSession
  );

  const nextMemoryMap: Record<string, AgentMemoryRecord> = {
    ...memoryMap,
    [session.agentId]: committedMemory,
  };

  const nextAgents = agents.map((a) => {
    if (a.id !== session.agentId) return a;
    return {
      ...a,
      hiddenVars: {
        ...a.hiddenVars,
        trustInCounselor: clamp01(session.vars.trust / 100),
        disclosureReadiness: clamp01(session.vars.readiness / 100),
        ruptureLevel: session.rupture.active ? 0.65 : 0,
      },
    };
  });

  return {
    nextAgents,
    nextMemoryMap,
    closedSession,
  };
}

/**
 * Menjalankan simulasi 100 sesi acak deterministik untuk memverifikasi seluruh invariant mesin:
 * - kepercayaan selalu berada pada rentang 0-100
 * - level keterbukaan tidak pernah naik lebih dari +1 per giliran
 * - keterampilan penghambat (interogasi, nasihat-dini, meremehkan) tidak pernah menaikkan level
 * - kedua jenis keretakan (menarik-diri & konfrontasi) muncul dan dapat diperbaiki
 */
export function runRandomSessionsSimulation(
  seed: number,
  sessionCount = 100
): RandomSessionsAuditResult {
  const rng = mulberry32(seed + 5050);

  // Bangun agen ringan dari STUDENT_BLUEPRINTS untuk audit deterministik murni
  const baseAgents: StudentAgent[] = STUDENT_BLUEPRINTS.map((bp) => ({
    id: bp.id,
    name: bp.name,
    cohort: bp.cohort,
    demographicLabel: bp.demographicLabel,
    uniquePotential: bp.uniquePotential,
    socialCircleHint: bp.socialCircleHint,
    counselingDomain: bp.counselingDomain,
    interests: bp.interests,
    skills: bp.skills,
    personality: bp.personality,
    solitudePreference: bp.solitudePreference,
    affinities: {},
    position: { x: 5, y: 5 },
    tilePosition: { x: 5, y: 5 },
    targetPosition: null,
    path: [],
    pathStepIndex: 0,
    currentZoneId: bp.initialZoneId,
    targetZoneId: bp.initialZoneId,
    activityGoal: 'Praktikum',
    status: 'bekerja',
    energy: 0.8,
    stress: 0.4,
    taskLoad: 0.5,
    activityDurationTicks: 0,
    socialStatus: 'sendiri',
    interactingWithIds: [],
    hiddenVars: { ...bp.hiddenVars },
  }));

  const channels: PlaceholderConversationContext['channelId'][] = [
    'ajak-aktivitas',
    'pintu-akademik',
    'panggilan-resmi',
    'lewat-perantara',
    'pesan-tertulis',
    'sapa-di-tempat',
  ];

  let totalTurns = 0;
  let trustOutOfBoundsCount = 0;
  let levelJumpGtOneCount = 0;
  let harmfulRaisedLevelCount = 0;
  let withdrawalRuptureCount = 0;
  let confrontationRuptureCount = 0;
  let repairedRuptureCount = 0;
  let earlyEndedRuptureCount = 0;

  const memoryMap: Record<string, AgentMemoryRecord> = {};

  for (let i = 0; i < sessionCount; i += 1) {
    const agent = baseAgents[i % baseAgents.length];
    const channelId = channels[Math.floor(rng() * channels.length)];
    const maxLevel = channelId === 'sapa-di-tempat' ? 0 : 3;
    const zoneLabel =
      LAB_MAP.zones.find((z) => z.id === agent.currentZoneId)?.label ?? 'Lab';

    const context: PlaceholderConversationContext = {
      channelId,
      channelName: channelId,
      targetAgentId: agent.id,
      targetAgentName: agent.name,
      targetZoneLabel: zoneLabel,
      day: 1 + Math.floor(i / 10),
      timeFormatted: '10:00',
      witnessCount: Math.floor(rng() * 4),
      witnessNames: [],
      visibilitySummary: 'Audit simulasi',
      outcomeKind: 'berhasil',
      outcomeHeadline: 'Audit sesi',
      outcomeDescription: 'Sesi percobaan acak dimulai.',
      maxDialogueLevel: maxLevel,
      energyCost: 10,
      durationMinutes: 15,
      endsDayAfterClose: false,
    };

    const mem = memoryMap[agent.id] ?? createEmptyAgentMemory(agent.id);
    let session = createCounselingSession({
      agent,
      context,
      exposure: rng() * 0.6,
      memory: mem,
      seed: seed + i,
    });

    const turnBudget = 10 + Math.floor(rng() * 8);
    for (let t = 0; t < turnBudget && !session.closed; t += 1) {
      const prevLevel = session.unlockedLevel;

      // Jika terjadi keretakan, sebagian besar mencoba memperbaiki, sebagian kecil menguji pemutusan 2 giliran
      if (session.rupture.active) {
        if (!session.rupture.recognized && rng() < 0.78) {
          session = recognizeSessionTension(session, agent, 'Aku merasa ada ketegangan.');
          totalTurns += 1;
        } else if (session.rupture.recognized) {
          const nextStep =
            REPAIR_STEP_ORDER.find(
              (s) => !session.rupture.completedRepairSteps.includes(s)
            ) ?? 'beri-pilihan';
          const beforeRepaired = session.rupture.repairedCountInSession;
          session = applyRepairStepTurn(session, agent, nextStep, 'Langkah perbaikan.');
          totalTurns += 1;
          if (session.rupture.repairedCountInSession > beforeRepaired) {
            repairedRuptureCount += 1;
          }
        } else {
          const randomSkill =
            COUNSELOR_SKILLS[Math.floor(rng() * COUNSELOR_SKILLS.length)].id;
          session = applyCounselorSkillTurn(session, agent, randomSkill, '');
          totalTurns += 1;
          if (session.rupture.endedEarlyByRupture) {
            earlyEndedRuptureCount += 1;
          }
        }
      } else {
        const randomSkill =
          COUNSELOR_SKILLS[Math.floor(rng() * COUNSELOR_SKILLS.length)].id;
        const beforeRuptureCount = session.rupture.ruptureCountInSession;
        const opt: SessionTurnOption =
          randomSkill === 'refleksi-perasaan'
            ? { reflectionCorrectOverride: rng() < 0.75 }
            : randomSkill === 'sampaikan-pengamatan'
              ? { observationTone: rng() < 0.8 ? 'faktual' : 'menilai' }
              : {};

        session = applyCounselorSkillTurn(session, agent, randomSkill, '', opt);
        totalTurns += 1;

        if (session.rupture.ruptureCountInSession > beforeRuptureCount) {
          if (session.rupture.kind === 'menarik-diri') {
            withdrawalRuptureCount += 1;
          } else if (session.rupture.kind === 'konfrontasi') {
            confrontationRuptureCount += 1;
          }
        }

        if (
          (randomSkill === 'interogasi' ||
            randomSkill === 'nasihat-dini' ||
            randomSkill === 'meremehkan') &&
          session.unlockedLevel > prevLevel
        ) {
          harmfulRaisedLevelCount += 1;
        }
      }

      if (session.vars.trust < 0 || session.vars.trust > 100) {
        trustOutOfBoundsCount += 1;
      }
      if (session.unlockedLevel - prevLevel > 1) {
        levelJumpGtOneCount += 1;
      }
    }

    const fin = finalizeCounselingSession(session, baseAgents, memoryMap);
    memoryMap[agent.id] = fin.nextMemoryMap[agent.id];
  }

  const allInvariantsPassed =
    trustOutOfBoundsCount === 0 &&
    levelJumpGtOneCount === 0 &&
    harmfulRaisedLevelCount === 0 &&
    withdrawalRuptureCount > 0 &&
    confrontationRuptureCount > 0 &&
    repairedRuptureCount > 0;

  return {
    seed,
    sessionCount,
    totalTurns,
    trustOutOfBoundsCount,
    levelJumpGtOneCount,
    harmfulRaisedLevelCount,
    withdrawalRuptureCount,
    confrontationRuptureCount,
    repairedRuptureCount,
    earlyEndedRuptureCount,
    allInvariantsPassed,
  };
}
