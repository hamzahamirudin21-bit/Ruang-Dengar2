import type {
  AgentMemoryRecord, CounselorSkillId, DisclosureLevel, PlaceholderConversationContext,
  SessionState, StudentAgent,
} from '../../types';
import { mulberry32, shuffleDeterministic } from '../rng';
import {
  applyCounselorSkillTurn, applyRepairStepTurn, createCounselingSession,
  createFollowUpPromiseInSession, recognizeSessionTension,
} from '../trust';
import { evaluateConditions } from './conditions';
import { computeStoryOutcome } from './outcome';
import type {
  StoryChoice, StoryGraph, StoryLine, StoryNode, StoryOutcomeKind, StoryScene,
} from './storyTypes';
import type { StoryAdaptation } from '../../types';

export { evaluateConditions };

/** Batas giliran pilihan sebelum cerita dipaksa berakhir (dipakai tugas 5.6). */
export const MAX_STORY_TURNS = 80;

/**
 * Hasil akhir cerita. Dihitung oleh `computeStoryOutcome` (tugas 6.1, outcome.ts);
 * tipenya didefinisikan di sini agar runner tidak mengimpor outcome.ts.
 */
export interface StoryOutcome {
  kind: StoryOutcomeKind;
  quality: number;
  energyDelta: number;
  stressDelta: number;
  adaptation: StoryAdaptation;
  missionComplete: boolean;
  endedBy: 'cerita' | 'penutupan-pengguna' | 'keretakan';
  summaryTitle: string;
  summaryBody: string;
  reasons: string[];
}

export interface StoryRunnerState {
  graphId: string; // = studentId
  graphVersion: number;
  agentId: string;
  seed: number;
  nodeId: string;
  sceneId: string;
  session: SessionState; // dari trust.ts, satu sesi untuk seluruh adegan
  initContext: PlaceholderConversationContext; // untuk DebriefSessionInit
  flags: string[]; // terurut
  pendingResume: string | null;
  turn: number; // Choice yang sudah dipilih
  history: StoryHistoryEntry[];
  ended: boolean;
  outcome: StoryOutcome | null;
}

export interface StoryHistoryEntry {
  turn: number; // 0 = pembuka
  nodeId: string;
  /** Simpul asal sebelum pindah ke nodeId (opsional demi kompatibilitas simpanan lama). */
  fromNodeId?: string;
  counselorLine: string | null;
  studentLine: StoryLine;
  skillId: CounselorSkillId | null;
  tension: 'mulai' | 'diakui' | 'pulih' | null;
}

export interface StoryArrival {
  counselorLine: string | null;
  student: StoryLine;
  fromNodeId?: string;
  sceneChange: { fromSceneId: string; toSceneId: string; walkTogether: boolean } | null;
  tension: 'mulai' | 'diakui' | 'pulih' | null;
  ended: boolean;
}

export type StoryRunnerErrorCode =
  | 'cerita-selesai'
  | 'simpul-tidak-ada'
  | 'pilihan-tidak-ada'
  | 'aksi-ditolak';
export interface StoryRunnerError { code: StoryRunnerErrorCode; message: string }

export type StoryStepResult =
  | { ok: true; state: StoryRunnerState; arrival: StoryArrival }
  | { ok: false; error: StoryRunnerError; state: StoryRunnerState }; // state identik dengan masukan

// ---------------------------------------------------------------------------
// Pembantu internal (murni)
// ---------------------------------------------------------------------------

/** FNV-1a 32-bit atas string; hasil bilangan bulat tak bertanda. */
function fnv1a(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function findNode(graph: StoryGraph, nodeId: string): StoryNode | undefined {
  return graph.nodes.find((n) => n.id === nodeId);
}

function findScene(graph: StoryGraph, sceneId: string): StoryScene | undefined {
  return graph.scenes.find((s) => s.id === sceneId);
}

// ---------------------------------------------------------------------------
// startStory
// ---------------------------------------------------------------------------

export function startStory(p: {
  graph: StoryGraph;
  agent: StudentAgent;
  memory: AgentMemoryRecord;
  exposure: number;
  seed: number;
  day: number;
  timeFormatted: string;
  entry?: 'awal' | 'lanjutan';
}): StoryRunnerState {
  const { graph, agent, memory, exposure, seed, day, timeFormatted } = p;

  const startId =
    p.entry === 'lanjutan' && graph.followUpNodeId ? graph.followUpNodeId : graph.startNodeId;
  const node = findNode(graph, startId);
  if (!node) {
    throw new Error(`Simpul awal "${startId}" tidak ada pada graf ${graph.studentId}`);
  }
  const scene = findScene(graph, node.sceneId);
  if (!scene) {
    throw new Error(`Adegan "${node.sceneId}" tidak ada pada graf ${graph.studentId}`);
  }

  const initContext: PlaceholderConversationContext = {
    channelId: 'ajak-aktivitas',
    channelName: 'Mode cerita',
    targetAgentId: agent.id,
    targetAgentName: agent.name,
    targetZoneLabel: scene.title,
    day,
    timeFormatted,
    witnessCount: scene.witnessCount,
    witnessNames: [],
    visibilitySummary: scene.caption,
    storyMode: true,
    outcomeKind: 'berhasil',
    outcomeHeadline: scene.title,
    outcomeDescription: node.reply.text,
    maxDialogueLevel: scene.maxDialogueLevel,
    energyCost: 0,
    durationMinutes: 0,
    endsDayAfterClose: false,
  };

  const session = createCounselingSession({
    agent,
    context: initContext,
    exposure,
    memory,
    seed,
  });

  const opening: StoryHistoryEntry = {
    turn: 0,
    nodeId: node.id,
    counselorLine: null,
    studentLine: node.reply,
    skillId: null,
    tension: null,
  };

  const flags = [...(node.onEnter?.setFlags ?? [])];
  flags.sort();

  return {
    graphId: graph.studentId,
    graphVersion: graph.version,
    agentId: agent.id,
    seed,
    nodeId: node.id,
    sceneId: scene.id,
    session,
    initContext,
    flags: flags.filter((f, i) => flags.indexOf(f) === i),
    pendingResume: null,
    turn: 0,
    history: [opening],
    ended: false,
    outcome: null,
  };
}

// ---------------------------------------------------------------------------
// presentChoices
// ---------------------------------------------------------------------------

/**
 * Seluruh pilihan simpul aktif dalam urutan acak deterministik. Hanya urutan
 * tampil yang bergantung pada seed; isi pilihan tidak berubah.
 */
export function presentChoices(graph: StoryGraph, state: StoryRunnerState): StoryChoice[] {
  const node = findNode(graph, state.nodeId);
  if (!node) return [];
  const rng = mulberry32(fnv1a(`${state.seed}|${node.id}|${state.turn}`));
  return shuffleDeterministic(rng, node.choices);
}

// ---------------------------------------------------------------------------
// Stub: diisi tugas 5.4 sampai 5.6
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// chooseStoryChoice: pipeline langkah terpisah (design: Perilaku chooseStoryChoice)
// ---------------------------------------------------------------------------

type StepFail = { ok: false; error: StoryRunnerError };

function fail(code: StoryRunnerErrorCode, message: string): StepFail {
  return { ok: false, error: { code, message } };
}

/** Langkah 1: validasi masukan. Mengembalikan simpul dan pilihan aktif. */
function stepValidate(
  graph: StoryGraph,
  state: StoryRunnerState,
  choiceId: string,
): { ok: true; node: StoryNode; choice: StoryChoice } | StepFail {
  if (state.ended) return fail('cerita-selesai', 'Cerita sudah selesai.');
  const node = findNode(graph, state.nodeId);
  if (!node) return fail('simpul-tidak-ada', `Simpul "${state.nodeId}" tidak ada.`);
  const choice = node.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return fail('pilihan-tidak-ada', `Pilihan "${choiceId}" tidak ada pada simpul "${node.id}".`);
  }
  return { ok: true, node, choice };
}

/** Langkah 2: aksi mesin pada sesi (fungsi trust.ts tidak memutasi masukan). */
function stepEngineAction(
  agent: StudentAgent,
  session: SessionState,
  choice: StoryChoice,
): { ok: true; session: SessionState } | StepFail {
  const action = choice.action ?? { kind: 'skill' as const };
  let next: SessionState;
  switch (action.kind) {
    case 'akui-ketegangan':
      next = recognizeSessionTension(session, agent, choice.text);
      break;
    case 'perbaikan':
      next = applyRepairStepTurn(session, agent, action.step, choice.text);
      break;
    case 'janji':
      next = createFollowUpPromiseInSession(
        session, agent, session.channelContext.day + action.dueDayOffset, choice.text,
      );
      break;
    default:
      next = applyCounselorSkillTurn(session, agent, choice.skillId, choice.text, choice.options);
  }
  if (
    next.turnCounter <= session.turnCounter
    && (action.kind === 'akui-ketegangan' || action.kind === 'perbaikan')
  ) {
    // Mesin menolak (keretakan sudah diakui/tidak aktif): jalankan sebagai giliran keterampilan biasa.
    next = applyCounselorSkillTurn(session, agent, choice.skillId, choice.text, choice.options);
  }
  if (next.turnCounter <= session.turnCounter) {
    return fail('aksi-ditolak', `Mesin menolak aksi pilihan "${choice.id}".`);
  }
  return { ok: true, session: next };
}

/** Langkah 3: timpa balasan dan isyarat giliran terakhir dengan teks penulis. */
function stepOverrideLastTurn(session: SessionState, line: StoryLine | undefined): SessionState {
  if (!line || session.turns.length === 0) return session;
  const turns = session.turns.slice();
  const last = turns[turns.length - 1];
  turns[turns.length - 1] = { ...last, agentReply: line.text, nonverbalCue: line.cue };
  return { ...session, turns };
}

function mergeFlags(flags: string[], add: string[] | undefined): string[] {
  const merged = Array.from(new Set([...flags, ...(add ?? [])]));
  merged.sort();
  return merged;
}

/** Langkah 4b: tujuan mentah dari routes pertama yang cocok, jika tidak `next`. */
function stepRawDestination(choice: StoryChoice, probe: StoryRunnerState): string {
  for (const route of choice.routes ?? []) {
    if (evaluateConditions(route.when, probe)) return route.next;
  }
  return choice.next;
}

export function chooseStoryChoice(
  graph: StoryGraph,
  agent: StudentAgent,
  state: StoryRunnerState,
  choiceId: string,
): StoryStepResult {
  // 1
  const v = stepValidate(graph, state, choiceId);
  if (!v.ok) return { ok: false, error: v.error, state };
  const { node, choice } = v;

  // 2
  const act = stepEngineAction(agent, state.session, choice);
  if (!act.ok) return { ok: false, error: act.error, state };

  // 4a: flag pilihan (routes dievaluasi atas sesi dan flag terbaru)
  const flags = mergeFlags(state.flags, choice.setFlags);
  const probe: StoryRunnerState = { ...state, session: act.session, flags };

  // 4b: tujuan mentah
  let destination = stepRawDestination(choice, probe);
  let pendingResume = state.pendingResume;
  let endedBy: 'keretakan' | null = null;
  let redirectedToTensionFallback = false;

  if (act.session.closed) {
    // 5: penutupan paksa; penanganan '@ending' oleh tugas 5.6.
    destination = '@ending';
    endedBy = 'keretakan';
  } else {
    // 6: pengaman Ketegangan
    if (destination === '@resume') {
      destination = pendingResume ?? graph.closingNodeId;
      pendingResume = null;
    }
    const rawDest = destination.startsWith('@') ? undefined : findNode(graph, destination);
    if (act.session.rupture.active && !rawDest?.tension) {
      pendingResume = destination;
      destination = graph.tensionFallbackNodeId;
      redirectedToTensionFallback = true;
    } else if (rawDest?.tension?.phase === 'awal' && pendingResume === null) {
      pendingResume = node.id;
    }
    // 7: gerbang
    const gated = destination.startsWith('@') ? undefined : findNode(graph, destination);
    if (gated?.gate && !evaluateConditions(gated.gate.conditions, probe)) {
      destination = gated.gate.otherwise;
    }
  }
  // 9: akhir cerita ('@ending' atau batas giliran)
  const turn = state.turn + 1;
  let outcome: StoryOutcome | null = null;
  if (destination === '@ending' || turn >= MAX_STORY_TURNS) {
    outcome = computeStoryOutcome(graph, { ...probe, turn }, endedBy ?? 'cerita');
    destination = graph.endings[outcome.kind];
  }
  const destNode = destination.startsWith('@') ? undefined : findNode(graph, destination);
  if (!destination.startsWith('@') && !destNode) {
    return {
      ok: false,
      error: { code: 'simpul-tidak-ada', message: `Simpul tujuan "${destination}" tidak ada.` },
      state,
    };
  }

  // 8: masuk simpul (flag onEnter, perubahan adegan)
  const allFlags = mergeFlags(flags, destNode?.onEnter?.setFlags);
  let sceneChange: StoryArrival['sceneChange'] = null;
  let sceneId = state.sceneId;
  let sessionBase = act.session;
  if (destNode && destNode.sceneId !== state.sceneId) {
    const newScene = findScene(graph, destNode.sceneId);
    if (!newScene) {
      return {
        ok: false,
        error: { code: 'simpul-tidak-ada', message: `Adegan "${destNode.sceneId}" tidak ada.` },
        state,
      };
    }
    sessionBase = {
      ...sessionBase,
      channelContext: {
        ...sessionBase.channelContext,
        witnessCount: newScene.witnessCount,
        targetZoneLabel: newScene.title,
      },
      maxAllowedLevel: Math.min(3, Math.max(0, newScene.maxDialogueLevel)) as DisclosureLevel,
    };
    sceneChange = {
      fromSceneId: state.sceneId,
      toSceneId: newScene.id,
      walkTogether: newScene.entryTransition === 'jalan-berdua',
    };
    sceneId = newScene.id;
  }

  // Penanda Ketegangan
  const before = state.session.rupture;
  const after = act.session.rupture;
  let tension: 'mulai' | 'diakui' | 'pulih' | null = null;
  if (after.repairedCountInSession > before.repairedCountInSession) tension = 'pulih';
  else if (!before.recognized && after.recognized && after.active) tension = 'diakui';
  else if (after.ruptureCountInSession > before.ruptureCountInSession) tension = 'mulai';

  // 3: teks penulis (reaction pilihan; abaikan reaction bila dialihkan paksa oleh keretakan)
  const useReaction = !redirectedToTensionFallback && endedBy !== 'keretakan';
  const line = (useReaction ? choice.reaction : undefined) ?? destNode?.reply;
  const session = stepOverrideLastTurn(sessionBase, line);
  const student: StoryLine = line ?? {
    text: session.turns[session.turns.length - 1].agentReply,
    expression: 'netral',
    cue: session.turns[session.turns.length - 1].nonverbalCue,
  };

  // 10: riwayat dan kedatangan
  const entry: StoryHistoryEntry = {
    turn,
    nodeId: destNode?.id ?? node.id,
    fromNodeId: node.id,
    counselorLine: choice.text,
    studentLine: student,
    skillId: choice.skillId,
    tension,
  };
  const nextState: StoryRunnerState = {
    ...state,
    nodeId: destNode?.id ?? state.nodeId,
    sceneId,
    session,
    flags: allFlags,
    pendingResume,
    turn,
    history: [...state.history, entry],
    ended: outcome !== null,
    outcome,
  };
  return {
    ok: true,
    state: nextState,
    arrival: {
      counselorLine: choice.text,
      student,
      fromNodeId: node.id,
      sceneChange,
      tension,
      ended: outcome !== null,
    },
  };
}

/** Penutupan oleh pengguna: tidak pernah `terbantu`. State selesai dikembalikan apa adanya. */
export function finishStoryEarly(graph: StoryGraph, state: StoryRunnerState): StoryRunnerState {
  if (state.ended) return state;
  const outcome = computeStoryOutcome(graph, state, 'penutupan-pengguna');
  return { ...state, ended: true, outcome };
}
