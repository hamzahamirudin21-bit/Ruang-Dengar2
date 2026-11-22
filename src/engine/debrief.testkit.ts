/**
 * Perkakas uji untuk fitur Debrief. Bukan berkas `*.test.*` dan tidak boleh diimpor kode produksi.
 * Semua generator berbasis mulberry32 sehingga kegagalan dapat diulang dari seed yang tercetak.
 */
import { CONTACT_CHANNELS } from '../data/contactChannels';
import { STUDENT_BLUEPRINTS, STUDENT_COUNT } from '../data/agents.seed';
import { COUNSELOR_SKILLS } from '../data/skillEffects';
import {
  AnecdotalRecord,
  ContactChannelId,
  ContactOutcomeKind,
  CounselorActionLogEntry,
  CounselorHypothesis,
  CounselorSkillId,
  DailySociometrySnapshot,
  DebriefSessionInit,
  DebriefSessionRecord,
  DebriefTurn,
  DisclosureLevel,
  KeyPoint,
  KeyPointKind,
  PlaceholderConversationContext,
  SessionState,
  SessionTurnEntry,
  SociometryStatus,
  StudentAgent,
} from '../types';
import { createEmptyAgentMemory } from './memory';
import { REPAIR_STEP_ORDER } from './rupture';
import {
  clamp100,
  applyCounselorSkillTurn,
  applyRepairStepTurn,
  createCounselingSession,
  createFollowUpPromiseInSession,
  recognizeSessionTension,
} from './trust';
import {
  clamp01,
  mulberry32,
  pickOne,
  randomInt,
  randomRange,
  shuffleDeterministic,
  SeededRng,
} from './rng';

/* ------------------------------------------------------------------ */
/* forAll                                                              */
/* ------------------------------------------------------------------ */

/**
 * Menjalankan `check` pada `runs` nilai hasil `gen`. Setiap iterasi memakai RNG sendiri
 * dengan seed turunan deterministik, sehingga satu iterasi dapat diulang saja.
 * Galat dibungkus dengan nama properti, seed dasar, indeks iterasi, dan seed iterasi.
 */
export function forAll<T>(
  name: string,
  seed: number,
  runs: number,
  gen: (rng: SeededRng, i: number) => T,
  check: (value: T, i: number) => void
): void {
  for (let i = 0; i < runs; i += 1) {
    const iterSeed = (Math.imul(seed | 0, 0x9e3779b1) + Math.imul(i + 1, 0x85ebca6b)) >>> 0;
    const rng = mulberry32(iterSeed);
    try {
      const value = gen(rng, i);
      check(value, i);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      const wrapped = new Error(
        `[forAll] "${name}" gagal pada iterasi ${i} (seed=${seed}, iterSeed=${iterSeed}): ${detail}`
      );
      if (error instanceof Error && error.stack) {
        wrapped.stack = `${wrapped.message}\n${error.stack}`;
      }
      (wrapped as Error & { cause?: unknown }).cause = error;
      throw wrapped;
    }
  }
}

/* ------------------------------------------------------------------ */
/* genAgent                                                            */
/* ------------------------------------------------------------------ */

function agentFromBlueprint(index: number): StudentAgent {
  const bp = STUDENT_BLUEPRINTS[index];
  return {
    id: bp.id,
    name: bp.name,
    cohort: bp.cohort,
    demographicLabel: bp.demographicLabel,
    uniquePotential: bp.uniquePotential,
    socialCircleHint: bp.socialCircleHint,
    counselingDomain: bp.counselingDomain,
    interests: { ...bp.interests },
    skills: { ...bp.skills },
    personality: { ...bp.personality },
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
  };
}

function jitter(rng: SeededRng, value: number, amount: number): number {
  return clamp01(value + randomRange(rng, -amount, amount));
}

/** Agen valid dari salah satu blueprint (mhs-01..mhs-15) dengan variasi profil kecil. */
export function genAgent(rng: SeededRng): StudentAgent {
  const agent = agentFromBlueprint(randomInt(rng, 0, STUDENT_COUNT - 1));
  const p = agent.personality;
  agent.personality = {
    openness: jitter(rng, p.openness, 0.1),
    conscientiousness: jitter(rng, p.conscientiousness, 0.1),
    extraversion: jitter(rng, p.extraversion, 0.15),
    agreeableness: jitter(rng, p.agreeableness, 0.15),
    stressSensitivity: jitter(rng, p.stressSensitivity, 0.15),
  };
  agent.solitudePreference = jitter(rng, agent.solitudePreference, 0.2);
  const h = agent.hiddenVars;
  agent.hiddenVars = {
    ...h,
    trustInCounselor: jitter(rng, h.trustInCounselor, 0.15),
    disclosureReadiness: jitter(rng, h.disclosureReadiness, 0.15),
    socialComfort: jitter(rng, h.socialComfort, 0.2),
    stigmaSensitivity: jitter(rng, h.stigmaSensitivity, 0.15),
    ruptureLevel: jitter(rng, h.ruptureLevel, 0.05),
  };
  agent.energy = randomRange(rng, 0.3, 1);
  agent.stress = randomRange(rng, 0.1, 0.9);
  agent.taskLoad = randomRange(rng, 0.1, 0.9);
  return agent;
}

/* ------------------------------------------------------------------ */
/* genEngineSession                                                    */
/* ------------------------------------------------------------------ */

const SKILL_IDS: CounselorSkillId[] = COUNSELOR_SKILLS.map((s) => s.id);

const OUTCOME_CHOICES: ContactOutcomeKind[] = [
  'berhasil',
  'berhasil',
  'berhasil',
  'terbuka-ringan',
  'terpaksa',
  'kerahasiaan-bocor',
  'terhubung-perantara',
  'respons-tertulis',
  'tidak-hadir',
];

function genContext(
  rng: SeededRng,
  agent: StudentAgent,
  channelId: ContactChannelId,
  day: number
): PlaceholderConversationContext {
  const channel = CONTACT_CHANNELS.find((c) => c.id === channelId) ?? CONTACT_CHANNELS[0];
  const outcomeKind = pickOne(rng, OUTCOME_CHOICES);
  const witnessCount = channel.witnessRadius > 0 ? randomInt(rng, 0, 3) : 0;
  const context: PlaceholderConversationContext = {
    channelId: channel.id,
    channelName: channel.name,
    targetAgentId: agent.id,
    targetAgentName: agent.name,
    targetZoneLabel: 'Ruang Konsultasi Praktikum',
    day,
    timeFormatted: '10:00',
    witnessCount,
    witnessNames: Array.from({ length: witnessCount }, (_, k) => `Saksi ${k + 1}`),
    visibilitySummary: witnessCount === 0 ? 'Tanpa saksi.' : `${witnessCount} saksi.`,
    outcomeKind,
    outcomeHeadline: `Hasil kontak: ${outcomeKind}`,
    outcomeDescription: 'Mahasiswa hadir untuk percakapan.',
    maxDialogueLevel: channel.maxDialogueLevel,
    energyCost: channel.energyCost,
    durationMinutes: channel.durationMinutes,
    endsDayAfterClose: false,
  };
  if (channel.id === 'lewat-perantara') {
    context.intermediaryKind = pickOne(rng, ['teman', 'teknisi', 'dosen'] as const);
    context.shareDetailsToIntermediary = rng() < 0.4;
  }
  return context;
}

/** Hash sederhana khusus testkit (placeholder; hash resmi ada di replay.ts). */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj)
      .filter((k) => obj[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

function simpleHash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i += 1) {
    h = (Math.imul(h, 33) ^ text.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const HYPOTHESIS_TEXTS = [
  'Ia sering menyendiri dan tampak terisolasi dari kelompok.',
  'Ia menikmati waktu sendiri dan tidak perlu didekati.',
  'Ia terlihat tertekan dan butuh bantuan.',
  'Pola kehadirannya stabil, belum ada tanda masalah.',
];

const OBSERVED_FACTS = [
  'Ia duduk sendiri selama 20 menit di pojok gudang. Ia terlihat malas dan sombong.',
  'Ia membawa kotak komponen ke meja kelompok.',
  'Ia meninggalkan ruang diskusi sebelum rapat selesai. Tampaknya ia kesal.',
];

/**
 * Sesi nyata dari fungsi engine (keterampilan acak, pengakuan, perbaikan, janji), dibungkus
 * sebagai `DebriefSessionRecord`. Memakai seluruh 15 agen kohort untuk data sosiometri.
 */
export function genEngineSession(rng: SeededRng): DebriefSessionRecord {
  const agent = genAgent(rng);
  const day = randomInt(rng, 1, 5);
  const channelId = pickOne(rng, CONTACT_CHANNELS).id;
  const exposure = rng() < 0.4 ? 0 : randomRange(rng, 0, 1);
  const context = genContext(rng, agent, channelId, day);

  const memory = createEmptyAgentMemory(agent.id);
  if (day >= 3 && rng() < 0.4) {
    memory.promises = [
      {
        id: `janji-${agent.id}-lama`,
        createdDay: 1,
        dueDay: 2,
        note: 'Janji lama untuk menindaklanjuti.',
        status: 'menunggu',
      },
    ];
    memory.totalSessions = 1;
    memory.lastSessionDay = 1;
  }

  const seed = randomInt(rng, 1, 0x7fffffff);
  const init: DebriefSessionInit = { seed, agent, context, exposure, memory };
  let session: SessionState = createCounselingSession(init);

  const targetTurns = randomInt(rng, 1, 20);
  let attempts = 0;
  while (!session.closed && session.turnCounter < targetTurns && attempts < targetTurns * 3) {
    attempts += 1;
    const before = session;
    const ruptureOpen = session.rupture.active;
    if (ruptureOpen && !session.rupture.recognized && rng() < 0.45) {
      session = recognizeSessionTension(session, agent, '');
    } else if (ruptureOpen && session.rupture.recognized && rng() < 0.8) {
      const step = REPAIR_STEP_ORDER[session.rupture.completedRepairSteps.length];
      session = step
        ? applyRepairStepTurn(session, agent, step, '')
        : applyCounselorSkillTurn(session, agent, pickOne(rng, SKILL_IDS), '');
    } else if (rng() < 0.08) {
      session = createFollowUpPromiseInSession(session, agent, day + randomInt(rng, 1, 5), '');
    } else {
      const skillId = pickOne(rng, SKILL_IDS);
      const options =
        skillId === 'refleksi-perasaan'
          ? { reflectionCorrectOverride: rng() < 0.6 }
          : skillId === 'sampaikan-pengamatan'
            ? { observationTone: rng() < 0.5 ? ('faktual' as const) : ('menilai' as const) }
            : undefined;
      session = applyCounselorSkillTurn(session, agent, skillId, '', options);
    }
    if (session === before && session.closed) break;
  }

  const cohort = STUDENT_BLUEPRINTS.map((_, idx) => agentFromBlueprint(idx));
  const makeSnapshot = (d: number, live: boolean): DailySociometrySnapshot => {
    const choicesByAgent: Record<string, string[]> = {};
    for (const a of cohort) {
      const others = cohort.filter((o) => o.id !== a.id).map((o) => o.id);
      choicesByAgent[a.id] = shuffleDeterministic(rng, others).slice(0, randomInt(rng, 0, 3));
    }
    return { day: d, question: 'Dengan siapa Anda nyaman bekerja?', choicesByAgent, isLivePreview: live };
  };
  const snapshots = [makeSnapshot(1, false)];
  if (day > 1) snapshots.push(makeSnapshot(day, false));

  const statuses: SociometryStatus[] = ['bintang', 'terisolasi', 'terabaikan', 'jembatan', 'umum'];
  const hypotheses: CounselorHypothesis[] = Array.from({ length: randomInt(rng, 0, 3) }, (_, k) => ({
    id: `hip-${agent.id}-${k}`,
    agentId: agent.id,
    agentName: agent.name,
    day: randomInt(rng, 1, day),
    timeFormatted: '09:00',
    hypothesisText: pickOne(rng, HYPOTHESIS_TEXTS),
    confidence: pickOne(rng, ['rendah', 'sedang', 'tinggi'] as const),
    sociometryStatusAtCreation: pickOne(rng, statuses),
  }));
  const anecdotalRecords: AnecdotalRecord[] = Array.from({ length: randomInt(rng, 0, 3) }, (_, k) => ({
    id: `cat-${agent.id}-${k}`,
    agentId: agent.id,
    agentName: agent.name,
    dateLabel: `Hari ${day}`,
    timeLabel: '09:30',
    locationZoneId: agent.currentZoneId,
    observedFact: pickOne(rng, OBSERVED_FACTS),
    counselorInterpretation: 'Mungkin ia sedang lelah.',
    detectedInterpretiveWords: [],
    createdAtDay: randomInt(rng, 1, day),
  }));
  const actionLogs: CounselorActionLogEntry[] = [
    {
      id: `aksi-${agent.id}-${day}`,
      day,
      timeFormatted: context.timeFormatted,
      kind: 'jalur-kontak',
      channelId: context.channelId,
      actionLabel: context.channelName,
      targetAgentId: agent.id,
      targetAgentName: agent.name,
      energyCost: context.energyCost,
      durationMinutes: context.durationMinutes,
      witnessCount: context.witnessCount,
      outcomeSummary: context.outcomeHeadline,
    },
  ];

  return {
    init,
    initialStateHash: simpleHash(canonical(init)),
    session,
    finishedByUser: !session.closed,
    hypotheses,
    anecdotalRecords,
    actionLogs,
    sociometry: {
      snapshots,
      livePreview: rng() < 0.3 ? makeSnapshot(day, true) : null,
      agents: cohort,
      observationLog: { byDay: {}, tileHeatmapByAgent: {}, coPresenceScores: {}, coPresenceByDay: {} },
    },
    replayable: true,
    replayBlockedReason: null,
  };
}

/* ------------------------------------------------------------------ */
/* genSyntheticTurns                                                   */
/* ------------------------------------------------------------------ */

const LABEL_BY_SKILL = new Map(COUNSELOR_SKILLS.map((s) => [s.id, s.label] as const));

/**
 * Giliran sintetis bernomor 1..length yang konsisten secara internal
 * (`trustBefore` = `trustAfter` giliran sebelumnya, level berubah paling banyak 1).
 * `length` dijepit ke 1..50. Awal kepercayaan acak di 0..100.
 */
export function genSyntheticTurns(rng: SeededRng, length: number): DebriefTurn[] {
  const n = Math.max(1, Math.min(50, Math.floor(length)));
  const turns: DebriefTurn[] = [];
  let trust = Math.round(randomRange(rng, 10, 90));
  let level = 0 as DisclosureLevel;
  let ruptureOpen = false;

  for (let i = 1; i <= n; i += 1) {
    const roll = rng();
    let kind: SessionTurnEntry['kind'] = 'keterampilan';
    let skillId: CounselorSkillId | null = null;
    let actionLabel: string;
    let delta = randomInt(rng, -10, 10);
    let ruptureTriggered = false;
    let ruptureRepaired = false;

    if (ruptureOpen && roll < 0.25) {
      kind = 'akui-ketegangan';
      actionLabel = 'Akui ketegangan';
      delta = 2;
    } else if (ruptureOpen && roll < 0.5) {
      kind = 'perbaikan';
      actionLabel = 'Perbaikan: Akui dampak';
      delta = randomInt(rng, 2, 6);
      if (rng() < 0.5) {
        ruptureRepaired = true;
        ruptureOpen = false;
      }
    } else if (roll > 0.95) {
      kind = 'janji-tindak-lanjut';
      actionLabel = 'Janji tindak lanjut';
      delta = 2;
    } else {
      skillId = pickOne(rng, SKILL_IDS);
      actionLabel = LABEL_BY_SKILL.get(skillId) ?? skillId;
      if (!ruptureOpen && rng() < 0.08) {
        ruptureTriggered = true;
        ruptureOpen = true;
        delta = -randomInt(rng, 6, 12);
      }
    }

    const trustBefore = trust;
    const trustAfter = clamp100(trustBefore + delta);
    trust = trustAfter;
    const levelBefore = level;
    const step = rng();
    let nextLevel: number = level;
    if (kind === 'keterampilan' && step < 0.2) nextLevel = Math.min(3, level + 1);
    else if (step > 0.9) nextLevel = Math.max(0, level - 1);
    level = nextLevel as DisclosureLevel;

    turns.push({
      turnNumber: i,
      kind,
      skillId,
      actionLabel,
      counselorText: `Ucapan konselor giliran ${i}.`,
      agentReply: `Balasan mahasiswa giliran ${i}.`,
      trustBefore,
      trustAfter,
      levelBefore,
      levelAfter: level,
      ruptureTriggered,
      ruptureRepaired,
    });
  }
  return turns;
}

/* ------------------------------------------------------------------ */
/* genKeyPoints                                                        */
/* ------------------------------------------------------------------ */

const KEY_POINT_KINDS: KeyPointKind[] = [
  'trust-turun-tajam',
  'trust-naik-tajam',
  'keretakan',
  'perbaikan',
];

/**
 * `n` Key_Point. Bila `allowInvalid` salah, semua `turnNumber` berada di 1..n.
 * Bila benar, sebagian bernomor 0, negatif, atau melebihi n (untuk uji validator).
 */
export function genKeyPoints(rng: SeededRng, n: number, allowInvalid: boolean): KeyPoint[] {
  const count = Math.max(0, Math.floor(n));
  const points: KeyPoint[] = [];
  for (let i = 0; i < count; i += 1) {
    const kind = pickOne(rng, KEY_POINT_KINDS);
    let turnNumber = randomInt(rng, 1, Math.max(1, count));
    if (allowInvalid && rng() < 0.35) {
      turnNumber = pickOne(rng, [0, -randomInt(rng, 1, 5), count + randomInt(rng, 1, 10)]);
    }
    const trustDelta =
      kind === 'trust-turun-tajam' || kind === 'keretakan'
        ? -randomInt(rng, 7, 15)
        : randomInt(rng, 7, 15);
    points.push({ kind, turnNumber, trustDelta });
  }
  return points;
}

/* ------------------------------------------------------------------ */
/* shuffleKeysDeep, deepFreeze                                         */
/* ------------------------------------------------------------------ */

/** Salinan dalam dengan urutan penyisipan kunci objek diacak; urutan larik tetap. */
export function shuffleKeysDeep(rng: SeededRng, value: unknown): unknown {
  if (Array.isArray(value)) return value.map((v) => shuffleKeysDeep(rng, v));
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of shuffleDeterministic(rng, Object.keys(obj))) {
      out[key] = shuffleKeysDeep(rng, obj[key]);
    }
    return out;
  }
  return value;
}

/** Membekukan objek secara rekursif (mengembalikan objek yang sama). */
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as object)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}
