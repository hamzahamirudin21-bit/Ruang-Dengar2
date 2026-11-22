import type {
  AnecdotalRecord,
  CounselorSkillId,
  DebriefTurn,
  ReplayComparison,
  ReplayErrorCode,
  ReplayOutcome,
  RubricItemId,
  ScriptStep,
  SessionAnalysis,
  SessionTurnOption,
  StrategyPreset,
  CounselorActionLogEntry,
  CounselorHypothesis,
  DailySociometrySnapshot,
  DebriefSessionInit,
  DebriefSessionRecord,
  ObservationLogState,
  SessionState,
  StudentAgent,
} from '../types';
import {
  applyCounselorSkillTurn,
  applyRepairStepTurn,
  createCounselingSession,
  createFollowUpPromiseInSession,
  recognizeSessionTension,
} from './trust';
import { REPAIR_STEP_ORDER } from './rupture';
import { analyzeSession } from './rubric';
import { RUBRIC_CONFIG, STRATEGY_PRESETS } from '../data/rubric';

/* =========================================================
 * Serialisasi stabil & hash (tanpa node:crypto, tanpa Date/Math.random)
 * ========================================================= */

/**
 * JSON deterministik: kunci objek diurutkan (urutan unit kode UTF-16),
 * larik mempertahankan urutan, `undefined` pada objek dibuang,
 * -0 ditulis 0, NaN/±Infinity ditulis sebagai string token tetap.
 */
export function stableStringify(value: unknown): string {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (Number.isNaN(value)) return '"__NaN__"';
      if (value === Infinity) return '"__Infinity__"';
      if (value === -Infinity) return '"__-Infinity__"';
      return Object.is(value, -0) ? '0' : String(value);
    case 'bigint':
      return JSON.stringify(value.toString());
    case 'undefined':
    case 'function':
    case 'symbol':
      return 'null';
    default:
      break;
  }
  if (Array.isArray(value)) {
    // Selaras dengan JSON: elemen undefined/fungsi pada larik menjadi null
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of Object.keys(obj).sort()) {
    const v = obj[key];
    if (v === undefined || typeof v === 'function' || typeof v === 'symbol') continue;
    parts.push(`${JSON.stringify(key)}:${stableStringify(v)}`);
  }
  return `{${parts.join(',')}}`;
}

/** cyrb53: 53 bit, dikeluarkan sebagai 14 digit heksadesimal. */
export function hashString(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const value = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return value.toString(16).padStart(14, '0');
}

/** Hash keadaan awal sesi dari persis argumen createCounselingSession. */
export function computeInitialStateHash(init: DebriefSessionInit): string {
  return hashString(
    stableStringify({
      seed: init.seed,
      agent: init.agent,
      context: init.context,
      exposure: init.exposure,
      memory: init.memory,
    })
  );
}

/* =========================================================
 * Perekaman sesi (read-only terhadap argumen)
 * ========================================================= */

export interface CaptureParams {
  /** Agen sasaran SEBELUM sesi (sebelum finalizeCounselingSession) */
  agent: StudentAgent;
  /** Exposure yang dipakai saat createCounselingSession */
  exposure: number;
  /** Memori agen SEBELUM sesi */
  memory: DebriefSessionInit['memory'];
  context: DebriefSessionInit['context'];
  seed: number;
  /** Sesi akhir (belum difinalisasi atau sesudahnya, hanya dibaca) */
  session: SessionState;
  finishedByUser: boolean;
  hypotheses: CounselorHypothesis[];
  anecdotalRecords: AnecdotalRecord[];
  actionLogs: CounselorActionLogEntry[];
  /** Snapshot sosiometri harian yang sudah ada */
  sociometrySnapshots: DailySociometrySnapshot[];
  livePreview: DailySociometrySnapshot | null;
  /** Seluruh agen kohort (STUDENT_COUNT = 15) */
  agents: StudentAgent[];
  observationLog: ObservationLogState;
}

function sameValue(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

function checkConsistency(init: DebriefSessionInit, session: SessionState): string | null {
  let rebuilt: SessionState;
  try {
    rebuilt = createCounselingSession(init);
  } catch {
    return 'Keadaan awal sesi tidak dapat direkonstruksi ulang.';
  }
  const mismatches: string[] = [];
  if (!sameValue(rebuilt.initialTrust, session.initialTrust)) mismatches.push('kepercayaan awal');
  if (!sameValue(rebuilt.thresholds, session.thresholds)) mismatches.push('ambang pengungkapan');
  if (!sameValue(rebuilt.rupture.active, session.rupture.active) && session.turns.length === 1) {
    // rupture.active hanya sebanding pada sesi tanpa giliran lanjutan
    mismatches.push('status keretakan awal');
  }
  if (!sameValue(rebuilt.turns[0], session.turns[0])) mismatches.push('giliran pembuka');
  if (mismatches.length === 0) return null;
  return `Keadaan awal yang direkam tidak cocok dengan sesi asli (${mismatches.join(', ')}), sehingga replay dinonaktifkan.`;
}

/**
 * Membentuk DebriefSessionRecord. Hanya membaca argumen; semua data disalin
 * dalam agar perubahan state setelahnya tidak memengaruhi rekaman.
 */
export function captureSessionRecord(params: CaptureParams): DebriefSessionRecord {
  const init: DebriefSessionInit = structuredClone({
    seed: params.seed,
    agent: params.agent,
    context: params.context,
    exposure: params.exposure,
    memory: params.memory,
  });
  const session = structuredClone(params.session);
  const initialStateHash = computeInitialStateHash(init);
  const blockedReason = checkConsistency(init, session);

  return {
    init,
    initialStateHash,
    session,
    finishedByUser: params.finishedByUser,
    hypotheses: structuredClone(params.hypotheses),
    anecdotalRecords: structuredClone(params.anecdotalRecords),
    actionLogs: structuredClone(params.actionLogs),
    sociometry: {
      snapshots: structuredClone(params.sociometrySnapshots),
      livePreview: structuredClone(params.livePreview),
      agents: structuredClone(params.agents),
      observationLog: structuredClone(params.observationLog),
    },
    replayable: blockedReason === null,
    replayBlockedReason: blockedReason,
  };
}

/* =========================================================
 * Replay dengan strategi lain (fungsi murni, tanpa RNG/Date/jaringan)
 * ========================================================= */

/** Jarak Levenshtein antara dua urutan keterampilan. */
function editDistance(a: string[], b: string[]): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Ambang jarak ternormalisasi; di atasnya strategi dianggap 'kustom'. */
const CUSTOM_STRATEGY_THRESHOLD = 0.4;

/**
 * Preset terdekat berdasarkan urutan keterampilan pada giliran 'keterampilan'
 * (jarak edit ternormalisasi; seri: preset lebih awal). 'kustom' bila tidak ada
 * yang cukup dekat atau tidak ada keterampilan.
 */
export function inferStrategyId(transcript: DebriefTurn[]): string {
  const used: string[] = [];
  for (const t of transcript) {
    if (t.kind === 'keterampilan' && t.skillId) used.push(t.skillId);
  }
  if (used.length === 0) return 'kustom';
  let bestId = 'kustom';
  let bestScore = Infinity;
  for (const preset of STRATEGY_PRESETS) {
    const script = preset.steps.flatMap((s) => (s.type === 'skill' ? [s.skillId as string] : []));
    const denom = Math.max(used.length, script.length, 1);
    const score = editDistance(used, script) / denom;
    if (score < bestScore) {
      bestScore = score;
      bestId = preset.id;
    }
  }
  return bestScore <= CUSTOM_STRATEGY_THRESHOLD ? bestId : 'kustom';
}

function replayError(code: ReplayErrorCode, message: string): ReplayOutcome {
  return { ok: false, error: { code, message } };
}

function stepOptions(step: Extract<ScriptStep, { type: 'skill' }>): SessionTurnOption | undefined {
  const options: SessionTurnOption = {};
  if (step.reflection !== undefined) options.reflectionCorrectOverride = step.reflection === 'tepat';
  if (step.tone !== undefined) options.observationTone = step.tone;
  return Object.keys(options).length > 0 ? options : undefined;
}

function runScript(init: DebriefSessionInit, preset: StrategyPreset): SessionState {
  const agent = init.agent;
  const maxTurns = RUBRIC_CONFIG.maxTurns;
  let session = createCounselingSession(init);
  const canAct = () => !session.closed && session.turnCounter < maxTurns;

  const handleRupture = () => {
    if (preset.ruptureHandling !== 'perbaiki') return;
    if (!canAct() || !session.rupture.active || session.rupture.recognized) return;
    session = recognizeSessionTension(session, agent, '');
    for (const stepId of REPAIR_STEP_ORDER) {
      if (!canAct() || !session.rupture.active) break;
      session = applyRepairStepTurn(session, agent, stepId, '');
    }
  };

  handleRupture();
  for (const step of preset.steps) {
    if (!canAct()) break;
    if (step.type === 'skill') {
      session = applyCounselorSkillTurn(session, agent, step.skillId as CounselorSkillId, '', stepOptions(step));
    } else {
      session = createFollowUpPromiseInSession(
        session,
        agent,
        session.channelContext.day + step.dueDayOffset,
        ''
      );
    }
    handleRupture();
  }
  return session;
}

/**
 * Memutar ulang sesi dengan skrip preset pada keadaan awal yang sama.
 * Tidak mengubah `record`; semua dikerjakan pada salinan `init`.
 */
export function runReplay(record: DebriefSessionRecord, presetId: string): ReplayOutcome {
  const preset = STRATEGY_PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    return replayError('preset-tidak-ditemukan', `Strategi "${presetId}" tidak ditemukan.`);
  }
  const hasOriginalTurns = record.session.turns.some((t) => t.kind !== 'pembuka');
  if (!record.replayable || !hasOriginalTurns) {
    return replayError(
      'tidak-dapat-diputar-ulang',
      record.replayBlockedReason ?? 'Sesi ini tidak dapat diputar ulang karena tidak ada giliran asli.'
    );
  }
  const originalId = inferStrategyId(analyzeSession(record).transcript);
  if (presetId === originalId) {
    return replayError(
      'preset-sama-dengan-asli',
      'Strategi yang dipilih sama dengan strategi sesi asli. Pilih strategi lain.'
    );
  }

  const init: DebriefSessionInit = structuredClone(record.init);
  if (computeInitialStateHash(init) !== record.initialStateHash) {
    return replayError(
      'initial-state-mismatch',
      'Replay dibatalkan: ketidakcocokan keadaan awal antara rekaman dan sesi yang akan diputar ulang.'
    );
  }

  const session = runScript(init, preset);
  const replayRecord: DebriefSessionRecord = {
    init,
    initialStateHash: computeInitialStateHash(init),
    session,
    finishedByUser: record.finishedByUser,
    hypotheses: structuredClone(record.hypotheses),
    anecdotalRecords: structuredClone(record.anecdotalRecords),
    actionLogs: structuredClone(record.actionLogs),
    sociometry: structuredClone(record.sociometry),
    replayable: true,
    replayBlockedReason: null,
  };
  return { ok: true, presetId, record: replayRecord, analysis: analyzeSession(replayRecord) };
}

function summarize(analysis: SessionAnalysis) {
  const itemScores = {} as Record<RubricItemId, number>;
  for (const item of analysis.rubric.items) itemScores[item.id] = item.score;
  return {
    trustSeries: [...analysis.trustSeries],
    highestLevel: analysis.highestLevel,
    itemScores,
    total: analysis.rubric.total,
  };
}

/** Selisih replay terhadap sesi asli (replay dikurangi asli). */
export function buildReplayComparison(
  original: SessionAnalysis,
  replay: SessionAnalysis,
  presetId: string
): ReplayComparison {
  const o = summarize(original);
  const r = summarize(replay);
  const itemDeltas = {} as Record<RubricItemId, number>;
  for (const id of Object.keys(o.itemScores) as RubricItemId[]) {
    itemDeltas[id] = (r.itemScores[id] ?? 0) - o.itemScores[id];
  }
  return {
    presetId,
    original: o,
    replay: r,
    itemDeltas,
    totalDelta: r.total - o.total,
    highestLevelDelta: r.highestLevel - o.highestLevel,
  };
}
