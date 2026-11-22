import type { AgentMemoryRecord } from '../../types';
import type { StoryGraph, StoryOutcomeKind } from './storyTypes';
import type { StoryRunnerState } from './runner';

/** Versi format Save_Slot. Versi lain ditolak oleh validateSaveSlot. */
export const STORY_SAVE_VERSION = 1 as const;

export interface StorySaveSlot {
  version: typeof STORY_SAVE_VERSION;
  agentId: string;
  graphVersion: number;
  seed: number;
  day: number;
  initMemory: AgentMemoryRecord; // untuk DebriefSessionInit setelah dimuat
  initExposure: number;
  state: StoryRunnerState; // JSON biasa (SessionState polos)
}

/** Status misi per mahasiswa. */
export interface MissionRecord {
  status: 'belum' | 'berlangsung' | 'selesai' | 'lanjutan';
  sessions: number;
  lastOutcome: StoryOutcomeKind | null;
  lastDay: number | null;
}

export type SaveSlotResult =
  | { ok: true; slot: StorySaveSlot; state: StoryRunnerState }
  | { ok: false; reason: string };

/** Serialisasi slot menjadi string JSON. */
export function serializeSaveSlot(slot: StorySaveSlot): string {
  return JSON.stringify(slot);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function fail(reason: string): SaveSlotResult {
  return { ok: false, reason };
}

/**
 * Memvalidasi data simpanan mentah (string JSON atau objek). Tidak pernah melempar.
 */
export function validateSaveSlot(raw: unknown, graph: StoryGraph): SaveSlotResult {
  try {
    let data: unknown = raw;
    if (typeof raw === 'string') {
      try {
        data = JSON.parse(raw);
      } catch {
        return fail('JSON tidak valid');
      }
    }
    if (!isObj(data)) return fail('Bentuk data bukan objek');
    if (data.version !== STORY_SAVE_VERSION) return fail('Versi tidak dikenali');
    if (typeof data.agentId !== 'string' || data.agentId !== graph.studentId) {
      return fail('agentId tidak cocok dengan graf');
    }
    if (data.graphVersion !== graph.version) return fail('Versi graf berbeda');
    if (!isNum(data.seed)) return fail('seed tidak valid');
    if (!isNum(data.day)) return fail('day tidak valid');
    if (!isNum(data.initExposure)) return fail('initExposure tidak valid');
    if (!isObj(data.initMemory)) return fail('initMemory tidak valid');

    const st = data.state;
    if (!isObj(st)) return fail('state tidak valid');
    if (st.agentId !== data.agentId) return fail('state.agentId tidak cocok');
    if (st.graphId !== graph.studentId) return fail('state.graphId tidak cocok');
    if (st.graphVersion !== graph.version) return fail('state.graphVersion berbeda');
    if (!isNum(st.seed)) return fail('state.seed tidak valid');
    if (typeof st.nodeId !== 'string' || !graph.nodes.some((n) => n.id === st.nodeId)) {
      return fail('nodeId tidak ada pada graf');
    }
    if (typeof st.sceneId !== 'string' || !graph.scenes.some((s) => s.id === st.sceneId)) {
      return fail('sceneId tidak ada pada graf');
    }
    if (!Array.isArray(st.flags) || !st.flags.every((f) => typeof f === 'string')) {
      return fail('flags bukan larik string');
    }
    if (!(st.pendingResume === null || typeof st.pendingResume === 'string')) {
      return fail('pendingResume tidak valid');
    }
    if (!isNum(st.turn) || !Number.isInteger(st.turn) || st.turn < 0) return fail('turn tidak valid');
    if (!Array.isArray(st.history) || !st.history.every(isObj)) return fail('history tidak valid');
    if (typeof st.ended !== 'boolean') return fail('ended tidak valid');
    if (!(st.outcome === null || isObj(st.outcome))) return fail('outcome tidak valid');
    if (!isObj(st.initContext)) return fail('initContext tidak valid');

    const session = st.session;
    if (!isObj(session)) return fail('session tidak valid');
    if (!isObj(session.vars)) return fail('session.vars tidak valid');
    const vars = Object.values(session.vars);
    if (vars.length === 0 || !vars.every(isNum)) return fail('session.vars harus numerik');
    if (!Array.isArray(session.turns) || !session.turns.every(isObj)) {
      return fail('session.turns bukan larik');
    }

    return { ok: true, slot: data as unknown as StorySaveSlot, state: st as unknown as StoryRunnerState };
  } catch {
    return fail('Data tidak dapat divalidasi');
  }
}
