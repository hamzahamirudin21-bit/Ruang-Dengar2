import type {
  AnecdotalRecord,
  AgentMemoryRecord,
  CounselorActionLogEntry,
  CounselorHypothesis,
  DailySociometrySnapshot,
  DebriefSessionInit,
  DebriefSessionRecord,
  ObservationLogState,
  StoryOutcomeSummary,
  StudentAgent,
} from '../../types';
import { captureSessionRecord } from '../replay';
import { buildDebriefProps } from '../../ui/Debrief';
import type { DebriefProps } from '../../ui/Debrief';
import type { StoryRunnerState } from './runner';

/** Alasan replay nonaktif pada mode cerita (design: Adaptor Debrief). */
export const STORY_REPLAY_BLOCKED_REASON =
  'Putar ulang strategi tidak tersedia pada mode cerita: skrip strategi melewati graf cerita sehingga balasannya tidak mewakili cerita. Tinjau transkrip dan umpan balik di atas.';

export interface StoryDebriefParams {
  /** Keadaan Runner (sesi dipakai langsung). */
  state: StoryRunnerState;
  /** Agen sasaran SEBELUM sesi. */
  agent: StudentAgent;
  /** Memori agen SEBELUM sesi. */
  memory: AgentMemoryRecord;
  exposure: number;
  /** Seluruh agen kohort untuk data sosiometri. */
  agents: StudentAgent[];
  sociometrySnapshots?: DailySociometrySnapshot[];
  livePreview?: DailySociometrySnapshot | null;
  observationLog?: ObservationLogState;
  hypotheses?: CounselorHypothesis[];
  anecdotalRecords?: AnecdotalRecord[];
  actionLogs?: CounselorActionLogEntry[];
  /** Bila tidak diberikan: true saat sesi belum tertutup. */
  finishedByUser?: boolean;
}

const EMPTY_OBSERVATION_LOG: ObservationLogState = {
  byDay: {},
  tileHeatmapByAgent: {},
  coPresenceScores: {},
  coPresenceByDay: {},
};

/** `DebriefSessionInit` dari keadaan Runner dan keadaan agen sebelum sesi. */
export function buildStoryDebriefInit(p: StoryDebriefParams): DebriefSessionInit {
  return {
    seed: p.state.seed,
    agent: p.agent,
    context: { ...p.state.initContext, storyMode: true },
    exposure: p.exposure,
    memory: p.memory,
  };
}

/** Rekaman Debrief untuk sesi cerita; replay selalu nonaktif. */
export function buildStoryDebriefRecord(p: StoryDebriefParams): DebriefSessionRecord {
  const init = buildStoryDebriefInit(p);
  const record = captureSessionRecord({
    agent: init.agent,
    exposure: init.exposure,
    memory: init.memory,
    context: init.context,
    seed: init.seed,
    session: p.state.session,
    finishedByUser: p.finishedByUser ?? !p.state.session.closed,
    hypotheses: p.hypotheses ?? [],
    anecdotalRecords: p.anecdotalRecords ?? [],
    actionLogs: p.actionLogs ?? [],
    sociometrySnapshots: p.sociometrySnapshots ?? [],
    livePreview: p.livePreview ?? null,
    agents: p.agents,
    observationLog: p.observationLog ?? EMPTY_OBSERVATION_LOG,
  });
  return {
    ...record,
    replayable: false,
    replayBlockedReason: STORY_REPLAY_BLOCKED_REASON,
  };
}

/** Props Debrief untuk sesi cerita (storyMode dan storyOutcome terisi pada view). */
export function buildStoryDebrief(p: StoryDebriefParams): DebriefProps {
  const record = buildStoryDebriefRecord(p);
  const props = buildDebriefProps(record, record.finishedByUser);
  if (props.status !== 'selesai') return props;
  const outcome = p.state.outcome;
  const storyOutcome: StoryOutcomeSummary | undefined = outcome
    ? {
        kind: outcome.kind,
        quality: outcome.quality,
        summaryTitle: outcome.summaryTitle,
        summaryBody: outcome.summaryBody,
      }
    : undefined;
  return {
    status: 'selesai',
    view: { ...props.view, storyMode: true, ...(storyOutcome ? { storyOutcome } : {}) },
  };
}
