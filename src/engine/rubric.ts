/**
 * Rubrik debrief: fungsi murni tanpa jaringan, tanpa Gemini, tanpa efek samping.
 * Tidak mengimpor `src/llm/client`, `classifier`, maupun `fetch`.
 *
 * Bagian 1 (modul ini saat ini): rekonstruksi transkrip dari `SessionState`.
 * Fungsi rubrik lain ditambahkan di bagian bawah berkas ini oleh tugas berikutnya.
 */
import { CONTACT_CHANNELS } from '../data/contactChannels';
import { RUBRIC_CONFIG } from '../data/rubric';
import { COUNSELOR_SKILLS } from '../data/skillEffects';
import { evaluateMemoryAtSessionStart } from './memory';
import { detectInterpretiveWordsInFacts } from './observationLog';
import type {
  AgentMemoryRecord,
  AnecdotalRecord,
  RubricDetailLine,
  RubricItemId,
  RubricItemResult,
  RubricResult,
  ContactChannelId,
  CounselorHypothesis,
  CounselorSkillId,
  ContactFitResult,
  DebriefSessionRecord,
  SessionAnalysis,
  DebriefTurn,
  HypothesisVerdict,
  KeyPoint,
  RubricConfig,
  RubricDescriptor,
  RuptureEpisode,
  SessionState,
  StudentAgent,
} from '../types';
import { buildAgentSessionVars, clamp100 } from './trust';
import { generateSupervisorFeedback } from '../llm/supervisor';

/* ------------------------------------------------------------------ */
/* Rekonstruksi transkrip                                              */
/* ------------------------------------------------------------------ */

export interface ReconstructedTranscript {
  /** Nomor 1..n, tanpa giliran pembuka. */
  turns: DebriefTurn[];
  /** Indeks = nomor giliran; panjang n+1 (indeks 0 = kepercayaan awal). */
  trustSeries: number[];
  keyPoints: KeyPoint[];
  episodes: RuptureEpisode[];
}

const SKILL_ID_BY_LABEL: ReadonlyMap<string, CounselorSkillId> = new Map(
  COUNSELOR_SKILLS.map((s) => [s.label, s.id] as const)
);

/**
 * Menurunkan transkrip, deret kepercayaan, Key_Point, dan episode keretakan dari `session.turns`.
 * Tidak memodifikasi `session`.
 */
export function reconstructTranscript(
  session: SessionState,
  config: RubricConfig = RUBRIC_CONFIG
): ReconstructedTranscript {
  const threshold = config.keyPointTrustThreshold;
  const opening = session.turns.find((t) => t.kind === 'pembuka') ?? null;
  const entries = session.turns.filter((t) => t.kind !== 'pembuka');

  const turns: DebriefTurn[] = [];
  const trustSeries: number[] = [session.initialTrust];
  const keyPoints: KeyPoint[] = [];
  const episodes: RuptureEpisode[] = [];

  let open: RuptureEpisode | null = null;
  if (opening?.ruptureTriggered) {
    open = { startTurn: 0, recognizedAtTurn: null, repairedAtTurn: null };
    episodes.push(open);
    keyPoints.push({ kind: 'keretakan', turnNumber: 0, trustDelta: opening.trustDelta });
  }

  let levelBefore = 0 as DebriefTurn['levelBefore'];

  entries.forEach((entry, i) => {
    const n = i + 1;
    const trustBefore = trustSeries[n - 1];
    const trustAfter = clamp100(trustBefore + entry.trustDelta);
    trustSeries.push(trustAfter);
    const d = trustAfter - trustBefore;

    turns.push({
      turnNumber: n,
      kind: entry.kind,
      skillId:
        entry.kind === 'keterampilan' ? (SKILL_ID_BY_LABEL.get(entry.actionLabel) ?? null) : null,
      actionLabel: entry.actionLabel,
      counselorText: entry.counselorText,
      agentReply: entry.agentReply,
      trustBefore,
      trustAfter,
      levelBefore,
      levelAfter: entry.disclosureLevelAfter,
      ruptureTriggered: entry.ruptureTriggered,
      ruptureRepaired: entry.ruptureRepaired,
    });
    levelBefore = entry.disclosureLevelAfter;

    if (d <= -threshold) keyPoints.push({ kind: 'trust-turun-tajam', turnNumber: n, trustDelta: d });
    if (d >= threshold) keyPoints.push({ kind: 'trust-naik-tajam', turnNumber: n, trustDelta: d });

    if (entry.ruptureTriggered) {
      keyPoints.push({ kind: 'keretakan', turnNumber: n, trustDelta: d });
      if (open) {
        // Sudah aktif: engine hanya mengatur ulang `recognized`, tanpa menambah hitungan.
        open.recognizedAtTurn = null;
      } else {
        open = { startTurn: n, recognizedAtTurn: null, repairedAtTurn: null };
        episodes.push(open);
      }
    }
    if (entry.kind === 'akui-ketegangan' && open && open.recognizedAtTurn === null) {
      open.recognizedAtTurn = n;
    }
    if (entry.ruptureRepaired) {
      keyPoints.push({ kind: 'perbaikan', turnNumber: n, trustDelta: d });
      if (open) {
        open.repairedAtTurn = n;
        open = null;
      }
    }
  });

  return { turns, trustSeries, keyPoints, episodes };
}

/* ------------------------------------------------------------------ */
/* Descriptor, jalur kontak, sasaran, dan vonis hipotesis              */
/* ------------------------------------------------------------------ */

/** Descriptor untuk skor 0..100: rentang config yang memuat skor (dibulatkan dan dijepit). */
export function descriptorFor(
  score: number,
  config: RubricConfig = RUBRIC_CONFIG
): RubricDescriptor {
  const s = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
  const hit = config.descriptors.find((d) => s >= d.min && s <= d.max);
  if (hit) return hit.id;
  // Cadangan bila config berlubang: rentang terdekat dari bawah, atau yang pertama.
  const sorted = [...config.descriptors].sort((a, b) => a.min - b.min);
  const below = sorted.filter((d) => d.min <= s);
  return (below.length > 0 ? below[below.length - 1] : sorted[0]).id;
}

/** Penyendiri sehat: suka menyendiri dan nyaman secara sosial. */
export function isHealthySolitary(agent: StudentAgent, config: RubricConfig = RUBRIC_CONFIG): boolean {
  return (
    agent.solitudePreference >= config.sasaran.healthySolitaryMinSolitude &&
    agent.hiddenVars.socialComfort >= config.sasaran.healthySolitaryMinComfort
  );
}

/** Membutuhkan dukungan: kenyamanan sosial di bawah ambang. */
export function needsSupport(agent: StudentAgent, config: RubricConfig = RUBRIC_CONFIG): boolean {
  return agent.hiddenVars.socialComfort < config.sasaran.needsSupportMaxComfort;
}

function qualitativeLevel(value: number, config: RubricConfig): 'rendah' | 'sedang' | 'tinggi' {
  if (value < config.jalur.tierLow) return 'rendah';
  if (value < config.jalur.tierHigh) return 'sedang';
  return 'tinggi';
}

/**
 * Kecocokan jalur kontak dengan profil agen.
 * fit(c) = S*(privacyScore - stigmaBaseCost) + (1-S)*reach(c) - exposure*visCost(c)
 */
export function computeContactFit(
  agent: StudentAgent,
  exposure: number,
  chosen: ContactChannelId,
  config: RubricConfig = RUBRIC_CONFIG
): ContactFitResult {
  const vars = buildAgentSessionVars(agent, exposure);
  const S = (vars.selfStigma + vars.socialAnxiety) / 2;

  const fits = {} as Record<ContactChannelId, number>;
  let bestCfg = CONTACT_CHANNELS[0];
  let bestFit = -Infinity;
  for (const c of CONTACT_CHANNELS) {
    const visCost = c.witnessRadius * c.exposurePerWitness;
    const reach = c.maxDialogueLevel / 3;
    const fit = S * (c.privacyScore - c.stigmaBaseCost) + (1 - S) * reach - vars.exposure * visCost;
    fits[c.id] = fit;
    if (fit > bestFit + 1e-12 || (Math.abs(fit - bestFit) <= 1e-12 && c.order < bestCfg.order)) {
      bestFit = fit;
      bestCfg = c;
    }
  }

  const chosenCfg = CONTACT_CHANNELS.find((c) => c.id === chosen) ?? bestCfg;
  const chosenFit = fits[chosenCfg.id];
  const score =
    chosenFit >= bestFit - 1e-9 || bestFit <= 0
      ? 100
      : Math.max(0, Math.min(100, Math.round((100 * Math.max(0, chosenFit)) / bestFit)));

  const stigma = qualitativeLevel(vars.selfStigma, config);
  const anxiety = qualitativeLevel(vars.socialAnxiety, config);
  const expo = qualitativeLevel(vars.exposure, config);
  const factors =
    `Stigma diri ${stigma}, kecemasan sosial ${anxiety}, paparan sebelumnya ${expo}.`;
  const explanation =
    chosenCfg.id === bestCfg.id
      ? `Jalur terpilih "${chosenCfg.name}" sama dengan jalur yang paling sesuai. ${factors}`
      : `Jalur terpilih "${chosenCfg.name}"; jalur yang paling sesuai untuk profil ini adalah "${bestCfg.name}". ${factors}`;

  return { chosen: chosenCfg.id, best: bestCfg.id, fits, score, explanation };
}

/**
 * Vonis hipotesis konselor terhadap profil sebenarnya agen.
 * Klaim "perlu-didekati" bila status sosiometri saat dibuat atau kata kunci teks mendukungnya.
 */
export function judgeHypothesis(
  h: CounselorHypothesis,
  agent: StudentAgent,
  config: RubricConfig = RUBRIC_CONFIG
): HypothesisVerdict {
  const text = h.hypothesisText.toLowerCase();
  const claimsSupport =
    config.sasaran.supportClaimStatuses.includes(h.sociometryStatusAtCreation) ||
    config.sasaran.supportClaimKeywords.some((k) => text.includes(k.toLowerCase()));
  const claim = claimsSupport ? 'perlu-didekati' : 'tidak-perlu-didekati';
  const actual = needsSupport(agent, config);
  const correct = claimsSupport === actual;
  return {
    hypothesisId: h.id,
    verdict: correct ? 'terbukti' : 'false positive',
    claim,
  };
}

/* ------------------------------------------------------------------ */
/* Rubrik delapan butir                                                */
/* ------------------------------------------------------------------ */

export interface RubricInput {
  transcript: DebriefTurn[];
  keyPoints: KeyPoint[];
  episodes: RuptureEpisode[];
  session: SessionState;
  agent: StudentAgent;
  exposure: number;
  memory: AgentMemoryRecord;
  hypotheses: CounselorHypothesis[];
  anecdotalRecords: AnecdotalRecord[];
}

const RUBRIC_ORDER: readonly RubricItemId[] = [
  'sasaran',
  'jalur-kontak',
  'kualitas-pertanyaan',
  'kesalahan-fatal',
  'keretakan-perbaikan',
  'kerahasiaan-peran',
  'ritme',
  'catatan-pengamatan',
];

const SENTENCE_SPLIT = /(?<=[.!?])\s+|\n+/;

function clampScore(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function turnsOf(transcript: DebriefTurn[], pred: (t: DebriefTurn) => boolean): number[] {
  return transcript.filter(pred).map((t) => t.turnNumber);
}

function line(label: string, value: string | number, turnNumbers?: number[]): RubricDetailLine {
  return turnNumbers && turnNumbers.length > 0 ? { label, value, turnNumbers } : { label, value };
}

function makeItem(
  id: RubricItemId,
  score: number,
  neutral: boolean,
  neutralNote: string | null,
  details: RubricDetailLine[],
  config: RubricConfig
): RubricItemResult {
  const s = neutral ? 100 : clampScore(score);
  return {
    id,
    score: s,
    descriptor: descriptorFor(s, config),
    neutral,
    neutralNote: neutral ? neutralNote : null,
    details,
  };
}

function sasaranItem(input: RubricInput, config: RubricConfig): RubricItemResult {
  const { transcript, session, agent, hypotheses } = input;
  const cfg = config.sasaran;
  const healthy = isHealthySolitary(agent, config);
  const needs = needsSupport(agent, config);
  const forcedTurns = healthy
    ? turnsOf(transcript, (t) => t.skillId !== null && cfg.forcedSkills.includes(t.skillId))
    : [];
  const forcedChannel = healthy && cfg.forcedChannelOutcomes.includes(session.channelContext.outcomeKind);
  const F = forcedTurns.length + (forcedChannel ? 1 : 0);
  const verdicts = hypotheses
    .filter((h) => h.agentId === agent.id)
    .map((h) => judgeHypothesis(h, agent, config));
  const HFP = verdicts.filter((v) => v.verdict === 'false positive').length;

  const details: RubricDetailLine[] = [
    line('Penyendiri sehat', healthy ? 'ya' : 'tidak'),
    line('Membutuhkan dukungan', needs ? 'ya' : 'tidak'),
    line('Aksi memaksa (F)', F, forcedTurns),
  ];
  if (forcedChannel) {
    details.push(line('Jalur berakhir memaksa/bocor', session.channelContext.outcomeKind, [0]));
  }
  details.push(line('Hipotesis dinilai', verdicts.length));
  details.push(line('Hipotesis false positive (HFP)', HFP));
  const score = 100 - cfg.forcedActionPenalty * F - cfg.hypothesisFalsePositivePenalty * HFP;
  details.push(
    line(
      'Hitungan',
      `100 - ${cfg.forcedActionPenalty}*${F} - ${cfg.hypothesisFalsePositivePenalty}*${HFP} = ${score}`
    )
  );
  const neutral = F === 0 && verdicts.length === 0 && !healthy;
  return makeItem(
    'sasaran',
    score,
    neutral,
    'tidak ada hipotesis dan sasaran tidak menunjukkan risiko salah pilih',
    details,
    config
  );
}

function jalurItem(input: RubricInput, config: RubricConfig): RubricItemResult {
  if (input.session.channelContext.storyMode) {
    return makeItem('jalur-kontak', 100, true, 'Mode cerita: jalur kontak tidak dinilai', [], config);
  }
  const fit = computeContactFit(input.agent, input.exposure, input.session.channelContext.channelId, config);
  const details: RubricDetailLine[] = [
    line('Jalur terpilih', fit.chosen),
    line('Jalur terbaik', fit.best),
    line('Kecocokan jalur terpilih', Number(fit.fits[fit.chosen].toFixed(3))),
    line('Kecocokan jalur terbaik', Number(fit.fits[fit.best].toFixed(3))),
    line('Penjelasan', fit.explanation),
  ];
  return makeItem('jalur-kontak', fit.score, false, null, details, config);
}

function pertanyaanItem(input: RubricInput, config: RubricConfig): RubricItemResult {
  const tr = input.transcript;
  const O = tr.filter((t) => t.skillId === 'pertanyaan-terbuka').length;
  const C = tr.filter((t) => t.skillId === 'pertanyaan-tertutup').length;
  const refl = tr.filter((t) => t.skillId === 'refleksi-perasaan' && t.trustAfter - t.trustBefore > 0);
  const R = refl.length;
  const P = tr.filter((t) => t.skillId === 'parafrase-ringkasan').length;
  const pc = config.pertanyaan;
  const openPart = O + C > 0 ? (100 * O) / (O + C) : null;
  const depthPart = 100 * Math.min(1, (R + P) / pc.depthTarget);
  const score =
    openPart === null
      ? depthPart
      : pc.openRatioWeight * openPart + pc.depthWeight * depthPart;
  const details: RubricDetailLine[] = [
    line('Pertanyaan terbuka (O)', O, turnsOf(tr, (t) => t.skillId === 'pertanyaan-terbuka')),
    line('Pertanyaan tertutup (C)', C, turnsOf(tr, (t) => t.skillId === 'pertanyaan-tertutup')),
    line('Refleksi tepat (R)', R, refl.map((t) => t.turnNumber)),
    line('Parafrase (P)', P, turnsOf(tr, (t) => t.skillId === 'parafrase-ringkasan')),
    line('Bagian keterbukaan', openPart === null ? 'tidak ada' : Number(openPart.toFixed(2))),
    line('Bagian kedalaman', Number(depthPart.toFixed(2))),
  ];
  return makeItem(
    'kualitas-pertanyaan',
    score,
    O + C + R + P === 0,
    'tidak ada pertanyaan, refleksi, atau parafrase',
    details,
    config
  );
}

function fatalItem(input: RubricInput, config: RubricConfig): RubricItemResult {
  const events: { turn: number; skill: CounselorSkillId; penalty: number }[] = [];
  for (const t of input.transcript) {
    if (!t.skillId) continue;
    const p = config.fatal.penalty[t.skillId];
    if (p === undefined) continue;
    if (t.skillId === 'nasihat-dini' && t.levelBefore >= config.fatal.nasihatPrematureBelowLevel) continue;
    events.push({ turn: t.turnNumber, skill: t.skillId, penalty: p });
  }
  const total = events.reduce((a, e) => a + e.penalty, 0);
  const details: RubricDetailLine[] = events.map((e) =>
    line(`${e.skill} (penalti ${e.penalty})`, e.penalty, [e.turn])
  );
  details.push(line('Jumlah kejadian', events.length));
  details.push(line('Total penalti', total));
  return makeItem(
    'kesalahan-fatal',
    100 - total,
    events.length === 0,
    'tidak ada kesalahan fatal',
    details,
    config
  );
}

function keretakanItem(input: RubricInput, config: RubricConfig): RubricItemResult {
  const eps = input.episodes;
  const k = config.keretakan;
  const details: RubricDetailLine[] = [];
  let sum = 0;
  eps.forEach((e, i) => {
    const recognized = e.recognizedAtTurn !== null;
    const repaired = e.repairedAtTurn !== null;
    const gap = repaired ? (e.repairedAtTurn as number) - e.startTurn : null;
    const speed = !repaired || gap === null ? 0 : gap <= k.fastGapTurns ? 1 : gap <= k.slowGapTurns ? k.slowFactor : 0;
    const pts =
      k.recognizedPoints * (recognized ? 1 : 0) + k.repairedPoints * (repaired ? 1 : 0) + k.speedPoints * speed;
    sum += pts;
    const turns = [e.startTurn];
    if (e.recognizedAtTurn !== null) turns.push(e.recognizedAtTurn);
    if (e.repairedAtTurn !== null) turns.push(e.repairedAtTurn);
    details.push(
      line(
        `Episode ${i + 1}: dikenali=${recognized ? 'ya' : 'tidak'}, diperbaiki=${repaired ? 'ya' : 'tidak'}, jeda=${gap === null ? '-' : gap}, faktor kecepatan=${speed}`,
        pts,
        turns
      )
    );
  });
  const score = eps.length > 0 ? sum / eps.length : 100;
  if (eps.length > 0) details.push(line('Rata-rata poin', Number(score.toFixed(2))));
  return makeItem('keretakan-perbaikan', score, eps.length === 0, 'tidak ada keretakan', details, config);
}

function kerahasiaanItem(input: RubricInput, config: RubricConfig): RubricItemResult {
  const { transcript, session, memory } = input;
  const k = config.kerahasiaan;
  const ctx = session.channelContext;
  const details: RubricDetailLine[] = [];
  let penalty = 0;

  const sTurn = transcript.find((t) => t.levelAfter >= k.sensitiveLevel);
  const bTurn = transcript.find((t) => t.skillId === 'batas-kerahasiaan');
  if (sTurn) {
    const late = !bTurn || bTurn.turnNumber > sTurn.turnNumber;
    details.push(line('Pengungkapan sensitif pertama', sTurn.turnNumber, [sTurn.turnNumber]));
    details.push(
      line('Batas kerahasiaan dijelaskan', bTurn ? `Turn ${bTurn.turnNumber}` : 'tidak pernah', bTurn ? [bTurn.turnNumber] : undefined)
    );
    if (late) {
      penalty += k.lateExplainPenalty;
      details.push(line('Penjelasan terlambat (penalti)', k.lateExplainPenalty, [sTurn.turnNumber]));
    }
  }

  const leaked =
    ctx.outcomeKind === 'kerahasiaan-bocor' ||
    (ctx.channelId === 'lewat-perantara' && ctx.shareDetailsToIntermediary === true);
  if (leaked) {
    penalty += k.leakPenalty;
    details.push(line('Kebocoran lewat perantara (penalti)', k.leakPenalty, [0]));
  }

  const absTurns = turnsOf(transcript, (t) => t.skillId === 'janji-mutlak');
  if (absTurns.length > 0) {
    const p = k.absolutePromisePenalty * absTurns.length;
    penalty += p;
    details.push(line(`Janji mutlak x${absTurns.length} (penalti)`, p, absTurns));
  }

  const impact = evaluateMemoryAtSessionStart(memory, ctx.day, ctx.channelId, ctx.witnessCount);
  const kept = impact.fulfilledCount;
  const broken = impact.overdueCount;
  const given = session.promisesCreatedInSession.length;
  if (given > 0 || kept > 0 || broken > 0) {
    details.push(line('Janji baru diberikan (menunggu)', given));
    details.push(line('Janji lama ditepati', kept));
    details.push(line('Janji lama terlewat', broken));
  }
  if (broken > 0) {
    const p = k.brokenPromisePenalty * broken;
    penalty += p;
    details.push(line('Janji terlewat (penalti)', p));
  }
  details.push(line('Total penalti', penalty));

  const neutral = !sTurn && !leaked && absTurns.length === 0 && kept === 0 && broken === 0;
  return makeItem(
    'kerahasiaan-peran',
    100 - penalty,
    neutral,
    'tidak ada pengungkapan sensitif, kebocoran, janji mutlak, atau janji lama',
    details,
    config
  );
}

function ritmeItem(input: RubricInput, config: RubricConfig): RubricItemResult {
  const rc = config.ritme;
  const skillTurns = input.transcript.filter((t) => t.kind === 'keterampilan');
  const N = skillTurns.length;
  const spaceTurns = skillTurns.filter((t) => t.skillId !== null && rc.spaceSkills.includes(t.skillId));
  const S = spaceTurns.length;

  let openUnrecognized = input.episodes.some((e) => e.startTurn === 0);
  const pushTurns: number[] = [];
  for (const t of input.transcript) {
    const pushedByRupture = openUnrecognized && t.kind === 'keterampilan';
    const pushedBySkill = t.skillId === 'interogasi' || t.skillId === 'nasihat-dini';
    if (pushedByRupture || pushedBySkill) pushTurns.push(t.turnNumber);
    if (t.ruptureTriggered) openUnrecognized = true;
    if (t.kind === 'akui-ketegangan') openUnrecognized = false;
    if (t.ruptureRepaired) openUnrecognized = false;
  }
  const K = pushTurns.length;
  const ratio = N > 0 ? S / N : 0;
  const ratioScore = N > 0 ? Math.round(100 * Math.min(1, ratio / rc.targetSpaceRatio)) : 0;
  const score = Math.max(0, ratioScore - rc.pushPenalty * K);
  const details: RubricDetailLine[] = [
    line('Giliran keterampilan (N)', N),
    line('Giliran memberi ruang (S)', S, spaceTurns.map((t) => t.turnNumber)),
    line('Rasio ruang S/N', Number(ratio.toFixed(3))),
    line('Skor rasio', ratioScore),
    line('Dorongan (K)', K, pushTurns),
    line('Hitungan', `${ratioScore} - ${rc.pushPenalty}*${K} = ${score}`),
  ];
  return makeItem('ritme', score, N === 0, 'tidak ada giliran keterampilan', details, config);
}

function catatanItem(input: RubricInput, config: RubricConfig): RubricItemResult {
  const records = input.anecdotalRecords.filter((r) => r.agentId === input.agent.id);
  let factCount = 0;
  let total = 0;
  let interpretationSentences = 0;
  const details: RubricDetailLine[] = [];
  const split = (s: string) =>
    s
      .split(SENTENCE_SPLIT)
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
  records.forEach((r, i) => {
    for (const sentence of split(r.observedFact)) {
      total += 1;
      const words = detectInterpretiveWordsInFacts(sentence);
      if (words.length > 0) {
        details.push(line(`Catatan ${i + 1}: tafsir di kolom fakta`, `"${sentence}" (${words.join(', ')})`));
      } else {
        factCount += 1;
        details.push(line(`Catatan ${i + 1}: fakta`, `"${sentence}"`));
      }
    }
    interpretationSentences += split(r.counselorInterpretation ?? '').length;
  });
  if (interpretationSentences > 0) {
    details.push(line('kolom-tafsir (tidak dihitung)', interpretationSentences));
  }
  details.push(line('Kalimat fakta / total kalimat kolom fakta', `${factCount}/${total}`));
  const score = total > 0 ? (100 * factCount) / total : 100;
  return makeItem('catatan-pengamatan', score, total === 0, 'tidak ada catatan pengamatan', details, config);
}

function safeWeights(config: RubricConfig): Record<RubricItemId, number> {
  const w = config.weights;
  const vals = RUBRIC_ORDER.map((id) => w?.[id]);
  const valid =
    vals.every((v) => typeof v === 'number' && Number.isFinite(v) && v >= 0) &&
    vals.reduce((a, v) => a + (v as number), 0) > 0;
  const out = {} as Record<RubricItemId, number>;
  RUBRIC_ORDER.forEach((id, i) => {
    out[id] = valid ? (vals[i] as number) : 1;
  });
  return out;
}

/** Menghitung delapan butir rubrik dan total tertimbang. Fungsi murni. */
export function computeRubric(input: RubricInput, config: RubricConfig = RUBRIC_CONFIG): RubricResult {
  const items: RubricItemResult[] = [
    sasaranItem(input, config),
    jalurItem(input, config),
    pertanyaanItem(input, config),
    fatalItem(input, config),
    keretakanItem(input, config),
    kerahasiaanItem(input, config),
    ritmeItem(input, config),
    catatanItem(input, config),
  ];
  const w = { ...safeWeights(config) };
  if (input.session.channelContext.storyMode) w['jalur-kontak'] = 0;
  let num = 0;
  let den = 0;
  for (const it of items) {
    num += w[it.id] * it.score;
    den += w[it.id];
  }
  const total = clampScore(den > 0 ? num / den : 0);
  return {
    items,
    total,
    totalDescriptor: descriptorFor(total, config),
    neutralCount: items.filter((i) => i.neutral).length,
  };
}

/* ------------------------------------------------------------------ */
/* Analisis sesi lengkap                                               */
/* ------------------------------------------------------------------ */

/** Menggabungkan transkrip, rubrik, kecocokan jalur, vonis hipotesis, dan umpan balik. Fungsi murni. */
export function analyzeSession(
  record: DebriefSessionRecord,
  config: RubricConfig = RUBRIC_CONFIG
): SessionAnalysis {
  const { session, init } = record;
  const rec = reconstructTranscript(session, config);
  const rubric = computeRubric(
    {
      transcript: rec.turns,
      keyPoints: rec.keyPoints,
      episodes: rec.episodes,
      session,
      agent: init.agent,
      exposure: init.exposure,
      memory: init.memory,
      hypotheses: record.hypotheses,
      anecdotalRecords: record.anecdotalRecords,
    },
    config
  );
  const contactFit = computeContactFit(init.agent, init.exposure, session.channelContext.channelId, config);
  const hypothesisVerdicts = record.hypotheses
    .filter((h) => h.agentId === init.agent.id)
    .map((h) => judgeHypothesis(h, init.agent, config));
  const feedback = generateSupervisorFeedback({
    transcript: rec.turns,
    keyPoints: rec.keyPoints,
    rubric,
  });
  return {
    transcript: rec.turns,
    trustSeries: rec.trustSeries,
    keyPoints: rec.keyPoints,
    episodes: rec.episodes,
    rubric,
    contactFit,
    hypothesisVerdicts,
    highestLevel: session.highestLevelReached,
    feedback,
  };
}
