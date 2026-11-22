import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { STORY_GRAPHS } from '../../data/stories';
import { STRINGS } from '../../data/strings';
import { formatClockTime } from '../../engine/clock';
import { finalizeCounselingSession } from '../../engine/trust';
import { getOrCreateAgentMemory } from '../../engine/memory';
import type { NavigationGrid } from '../../engine/pathfinding';
import type { StoryArrival, StoryRunnerState } from '../../engine/story/runner';
import {
  chooseStoryChoice as runChooseStoryChoice,
  finishStoryEarly as runFinishStoryEarly,
  startStory,
} from '../../engine/story/runner';
import {
  AVATAR_START,
  advanceAvatar,
  planApproach,
  planWalkTogether,
  reduceAvatar,
  teleportTogether,
} from '../../engine/story/avatar';
import type { AvatarMode, AvatarState } from '../../engine/story/avatar';
import { STORY_SAVE_VERSION, validateSaveSlot } from '../../engine/story/saveSlot';
import type { MissionRecord } from '../../engine/story/saveSlot';
import { buildStoryDebrief, buildStoryDebriefRecord } from '../../engine/story/debriefAdapter';
import type { StoryDebriefParams } from '../../engine/story/debriefAdapter';
import type { DebriefProps } from '../Debrief';
import type { StoryGraph } from '../../engine/story/storyTypes';
import {
  clearStorySlot,
  loadMissionRecords,
  loadStorySlotRaw,
  saveMissionRecords,
  saveStorySlot,
} from '../../utils/storyStorage';
import { walkMode } from './storyUi';
import { setWorldPaused } from '../../engine/world';
import {
  applyStoryOutcomeToAgents,
  placeAgentAtSeat,
  releaseAgent,
  snapAgentToTile,
} from '../../engine/story/worldBridge';
import type {
  AgentMemoryRecord,
  DebriefSessionRecord,
  GridPoint,
  StudentAgent,
  WorldState,
} from '../../types';

/** Kecepatan avatar menuju mahasiswa (petak per detik). Gerak dikurangi: cepat (18). */
export const AVATAR_TILES_PER_SECOND = 6;

export type StoryArrivalView = Pick<StoryArrival, 'counselorLine' | 'student' | 'fromNodeId'>;

export interface UseStoryMissionOptions {
  worldRef: MutableRefObject<WorldState>;
  navGridRef: MutableRefObject<NavigationGrid>;
  /** Menyinkronkan dunia baru ke ref dan keadaan React milik pemanggil. */
  syncWorld: (world: WorldState) => void;
  agentMemoryMap: Readonly<Record<string, AgentMemoryRecord>>;
  /** Paparan konselor terhadap mahasiswa (untuk createCounselingSession). */
  getExposure: (agentId: string) => number;
  seed: number;
  reducedMotion: boolean;
  /** Menerima peta memori baru setelah finalizeCounselingSession. */
  onMemoryMapChange?: (next: Record<string, AgentMemoryRecord>) => void;
}

export interface UseStoryMission {
  avatarRef: MutableRefObject<AvatarState>;
  avatarMode: AvatarMode;
  /** Id mahasiswa yang sedang dihampiri atau diajak bicara. */
  activeAgentId: string | null;
  graph: StoryGraph | null;
  agent: StudentAgent | null;
  storyState: StoryRunnerState | null;
  arrival: StoryArrivalView | null;
  /** false saat StoryScreen disembunyikan selama Walk_Together. */
  storyVisible: boolean;
  /** Pesan status (role="status") untuk bilah info kanvas dan StoryScreen. */
  statusMessage: string | null;
  requestApproach: (agentId: string) => boolean;
  cancelApproach: () => void;
  /** Dipanggil tiap frame; menggerakkan avatar dan memulai cerita saat tiba. */
  advanceFrame: (dtSeconds: number) => void;
  chooseStoryChoice: (choiceId: string) => void;
  finishStoryEarly: () => void;
  /** Simpan progres cerita aktif ke Save_Slot. */
  saveStory: () => void;
  /** Muat Save_Slot; bila gagal sesi aktif dipertahankan. */
  loadStory: () => void;
  setStatusMessage: (message: string | null) => void;
  /** Status misi per mahasiswa (tersimpan di storyStorage). */
  missions: Readonly<Record<string, MissionRecord>>;
  /** Props Debrief; non-null berarti Debrief terbuka. */
  debriefProps: DebriefProps | null;
  /** Rekaman Debrief untuk Ungkap (tidak pernah menjadi props). */
  getDebriefRecord: () => DebriefSessionRecord | null;
  /** Terapkan hasil ke dunia, simpan misi, lalu buka Debrief (tombol Lihat Debrief). */
  viewDebrief: () => void;
  /** Terapkan hasil ke dunia, simpan misi, lalu langsung kembali ke denah lab. */
  finishAndReturnToLab: () => void;
  /** Tutup Debrief dan kembalikan avatar ke idle. */
  closeDebrief: () => void;
  /** Mulai sesi lanjutan (hanya untuk misi berstatus lanjutan). */
  startFollowUp: (agentId: string) => boolean;
}

function createInitialAvatar(): AvatarState {
  return {
    mode: 'idle',
    position: { x: AVATAR_START.x, y: AVATAR_START.y },
    tile: { x: AVATAR_START.x, y: AVATAR_START.y },
    path: [],
    stepIndex: 0,
    targetAgentId: null,
    companion: null,
  };
}

export function useStoryMission(options: UseStoryMissionOptions): UseStoryMission {
  const { worldRef, navGridRef, syncWorld, seed, reducedMotion } = options;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const avatarRef = useRef<AvatarState>(createInitialAvatar());
  const [avatarMode, setAvatarMode] = useState<AvatarMode>('idle');
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [storyState, setStoryState] = useState<StoryRunnerState | null>(null);
  const [arrival, setArrival] = useState<StoryArrivalView | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [storyVisible, setStoryVisible] = useState(true);
  // Masukan awal sesi, disimpan ke Save_Slot agar Debrief dapat dibangun setelah Muat.
  const startInfoRef = useRef<{ memory: AgentMemoryRecord; exposure: number; seed: number; day: number } | null>(null);

  // Status pause dunia sebelum avatar meninggalkan idle; dipulihkan saat kembali idle.
  const pausedBeforeRef = useRef<boolean | null>(null);
  const [missions, setMissions] = useState<Record<string, MissionRecord>>(() => loadMissionRecords());
  const missionsRef = useRef<Record<string, MissionRecord>>(missions);
  const [debriefProps, setDebriefProps] = useState<DebriefProps | null>(null);
  const debriefRecordRef = useRef<DebriefSessionRecord | null>(null);
  const finalizedRef = useRef(false);
  const storyStateRef = useRef<StoryRunnerState | null>(null);

  const commitAvatar = useCallback((next: AvatarState) => {
    avatarRef.current = next;
    setAvatarMode(next.mode);
    setActiveAgentId(next.targetAgentId);
  }, []);

  /** Pause dunia saat avatar tidak idle (D8). Idempoten. */
  const pauseWorld = useCallback(() => {
    if (pausedBeforeRef.current !== null) return;
    const world = worldRef.current;
    pausedBeforeRef.current = world.clock.paused;
    syncWorld(setWorldPaused(world, true));
  }, [worldRef, syncWorld]);

  /** Pulihkan status pause sebelumnya. Idempoten. */
  const restoreWorld = useCallback(() => {
    if (pausedBeforeRef.current === null) return;
    const wasPaused = pausedBeforeRef.current;
    pausedBeforeRef.current = null;
    syncWorld(setWorldPaused(worldRef.current, wasPaused));
  }, [worldRef, syncWorld]);

  const requestApproach = useCallback(
    (agentId: string): boolean => {
      const current = avatarRef.current;
      if (current.mode !== 'idle') {
        // Klik saat berjalan ditolak (Requirement 2.5).
        setStatusMessage(STRINGS.story.approachBusyMessage);
        return false;
      }
      const world = worldRef.current;
      const target = world.agents.find((a) => a.id === agentId);
      const storyGraph = STORY_GRAPHS[agentId];
      if (!target || !storyGraph) {
        setStatusMessage(STRINGS.story.unreachableMessage(target?.name ?? 'Mahasiswa'));
        return false;
      }
      const plan = planApproach(
        navGridRef.current,
        current.tile,
        target.tilePosition,
        world.agents.filter((a) => a.id !== agentId).map((a) => a.tilePosition)
      );
      if (!plan) {
        setStatusMessage(STRINGS.story.unreachableMessage(target.name));
        return false;
      }
      const { state, ditolak } = reduceAvatar(current, {
        type: 'klik',
        path: plan.path,
        targetAgentId: agentId,
      });
      if (ditolak) {
        setStatusMessage(STRINGS.story.approachBusyMessage);
        return false;
      }
      pauseWorld();
      setStatusMessage(null);
      commitAvatar(state);
      return true;
    },
    [worldRef, navGridRef, pauseWorld, commitAvatar]
  );

  const cancelApproach = useCallback(() => {
    const { state } = reduceAvatar(avatarRef.current, { type: 'batal' });
    if (state === avatarRef.current) return;
    commitAvatar(state);
    restoreWorld();
    setStatusMessage(STRINGS.story.approachCancelledMessage);
  }, [commitAvatar, restoreWorld]);

  // Esc membatalkan perjalanan menuju mahasiswa.
  useEffect(() => {
    if (avatarMode !== 'menuju-mahasiswa') return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelApproach();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [avatarMode, cancelApproach]);

  const updateMission = useCallback((agentId: string, record: MissionRecord) => {
    const next = { ...missionsRef.current, [agentId]: record };
    missionsRef.current = next;
    setMissions(next);
    saveMissionRecords(next);
  }, []);

  const beginStory = useCallback(
    (agentId: string) => {
      const opts = optionsRef.current;
      const world = opts.worldRef.current;
      const target = world.agents.find((a) => a.id === agentId);
      const storyGraph = STORY_GRAPHS[agentId];
      if (!target || !storyGraph) {
        const { state } = reduceAvatar(avatarRef.current, { type: 'batal' });
        commitAvatar(state);
        restoreWorld();
        return;
      }
      const frozen = snapAgentToTile(world, agentId);
      opts.syncWorld(frozen);
      const frozenAgent = frozen.agents.find((a) => a.id === agentId) ?? target;
      const startMemory = getOrCreateAgentMemory(opts.agentMemoryMap, agentId);
      startInfoRef.current = {
        memory: startMemory,
        exposure: opts.getExposure(agentId),
        seed: opts.seed,
        day: frozen.clock.day,
      };
      const mission = missionsRef.current[agentId];
      const isFollowUp = mission?.status === 'lanjutan' && !!storyGraph.followUpNodeId;
      if (!mission || mission.status === 'belum') {
        updateMission(agentId, {
          status: 'berlangsung',
          sessions: mission?.sessions ?? 0,
          lastOutcome: mission?.lastOutcome ?? null,
          lastDay: mission?.lastDay ?? null,
        });
      }
      finalizedRef.current = false;
      const started = startStory({
        entry: isFollowUp ? 'lanjutan' : 'awal',
        graph: storyGraph,
        agent: frozenAgent,
        memory: getOrCreateAgentMemory(opts.agentMemoryMap, agentId),
        exposure: opts.getExposure(agentId),
        seed: opts.seed,
        day: frozen.clock.day,
        timeFormatted: formatClockTime(frozen.clock.minutesOfDay),
      });
      storyStateRef.current = started;
      setStoryVisible(true);
      setStoryState(started);
      setArrival(null);
      setStatusMessage(STRINGS.story.arrivedAt(frozenAgent.name));
    },
    [commitAvatar, restoreWorld, updateMission]
  );

  /** Akhiri Walk_Together: letakkan mahasiswa di kursi, tampilkan lagi StoryScreen. */
  const finishWalkTogether = useCallback(
    (walkingState: AvatarState) => {
      const companion = walkingState.companion;
      const { state } = reduceAvatar(walkingState, { type: 'selesai-jalan-berdua' });
      commitAvatar(state);
      if (companion) {
        const opts = optionsRef.current;
        opts.syncWorld(placeAgentAtSeat(opts.worldRef.current, companion.agentId, companion.seat));
      }
      setStoryVisible(true);
    },
    [commitAvatar]
  );

  /** Mulai Walk_Together (Requirement 6.6, 6.7, 6.8): rute A*, teleport bila tak ada rute atau Reduced_Motion. */
  const startWalkTogether = useCallback(
    (agentId: string) => {
      const opts = optionsRef.current;
      const world = opts.worldRef.current;
      const target = world.agents.find((a) => a.id === agentId);
      const current = avatarRef.current;
      if (!target || current.mode !== 'dalam-cerita') return;
      const plan = planWalkTogether(opts.navGridRef.current, current.tile, target.tilePosition);
      const seats = plan ?? teleportTogether();
      const direct = !plan || walkMode(opts.reducedMotion) === 'langsung';
      const avatarPath: GridPoint[] = plan && !direct ? plan.avatarPath : [];
      const companionPath: GridPoint[] = plan && !direct ? plan.companionPath : [];
      const { state } = reduceAvatar(current, {
        type: 'mulai-jalan-berdua',
        avatarPath,
        companion: {
          agentId,
          path: companionPath,
          seat: seats.studentSeat,
          avatarSeat: seats.avatarSeat,
        },
      });
      if (state === current) return;
      setStoryVisible(false);
      commitAvatar(state);
      if (direct) finishWalkTogether(state);
    },
    [commitAvatar, finishWalkTogether]
  );

  const advanceFrame = useCallback(
    (dtSeconds: number) => {
      const current = avatarRef.current;
      if (current.mode === 'berdua-ke-bk') {
        const walked = advanceAvatar(current, dtSeconds, AVATAR_TILES_PER_SECOND, reducedMotion);
        if (!walked.tiba) {
          avatarRef.current = walked.state;
          return;
        }
        finishWalkTogether(walked.state);
        return;
      }
      if (current.mode !== 'menuju-mahasiswa') return;
      const tilesPerSecond = reducedMotion ? 18 : AVATAR_TILES_PER_SECOND;
      const moved = advanceAvatar(current, dtSeconds, tilesPerSecond, reducedMotion);
      if (!moved.tiba) {
        avatarRef.current = moved.state;
        return;
      }
      const agentId = moved.state.targetAgentId;
      const { state } = reduceAvatar(moved.state, { type: 'tiba' });
      commitAvatar(state);
      if (agentId) beginStory(agentId);
    },
    [reducedMotion, commitAvatar, beginStory, finishWalkTogether]
  );

  const chooseStoryChoice = useCallback(
    (choiceId: string) => {
      const state = storyStateRef.current;
      if (!state) return;
      const storyGraph = STORY_GRAPHS[state.agentId];
      const target = worldRef.current.agents.find((a) => a.id === state.agentId);
      if (!storyGraph || !target) return;
      const result = runChooseStoryChoice(storyGraph, target, state, choiceId);
      if (!result.ok) {
        setStatusMessage(result.error.message);
        return;
      }
      storyStateRef.current = result.state;
      setStoryState(result.state);
      setArrival({
        counselorLine: result.arrival.counselorLine,
        student: result.arrival.student,
        fromNodeId: result.arrival.fromNodeId,
      });
      setStatusMessage(null);
      if (result.arrival.sceneChange?.walkTogether) startWalkTogether(state.agentId);
    },
    [worldRef, startWalkTogether]
  );

  const finishStoryEarly = useCallback(() => {
    const state = storyStateRef.current;
    if (!state) return;
    const storyGraph = STORY_GRAPHS[state.agentId];
    if (!storyGraph) return;
    const finished = runFinishStoryEarly(storyGraph, state);
    storyStateRef.current = finished;
    setStoryState(finished);
  }, []);

  const saveStory = useCallback(() => {
    const state = storyStateRef.current;
    const info = startInfoRef.current;
    if (!state || !info) return;
    const ok = saveStorySlot({
      version: STORY_SAVE_VERSION,
      agentId: state.agentId,
      graphVersion: state.graphVersion,
      seed: info.seed,
      day: info.day,
      initMemory: info.memory,
      initExposure: info.exposure,
      state,
    });
    setStatusMessage(ok ? STRINGS.story.saveDoneMessage : STRINGS.story.saveFailedMessage);
  }, []);

  const loadStory = useCallback(() => {
    const current = storyStateRef.current;
    if (!current) return;
    const storyGraph = STORY_GRAPHS[current.agentId];
    const raw = loadStorySlotRaw(current.agentId);
    if (raw === null) {
      setStatusMessage(STRINGS.story.loadEmptyMessage);
      return;
    }
    const result = storyGraph ? validateSaveSlot(raw, storyGraph) : null;
    if (!result || !result.ok) {
      // Slot rusak diabaikan; sesi aktif dipertahankan (Requirement 7.11).
      setStatusMessage(STRINGS.story.loadFailedMessage);
      return;
    }
    startInfoRef.current = {
      memory: result.slot.initMemory,
      exposure: result.slot.initExposure,
      seed: result.slot.seed,
      day: result.slot.day,
    };
    storyStateRef.current = result.state;
    setStoryState(result.state);
    setArrival(null);
    setStatusMessage(null);
  }, []);

  /**
   * Terapkan hasil sesi ke dunia & simpan progres misi (idempoten lewat finalizedRef).
   * Mengembalikan payload Debrief bila pemanggil ingin membukanya.
   */
  const finalizeStorySession = useCallback((): {
    record: DebriefSessionRecord;
    props: DebriefProps;
  } | null => {
    const state = storyStateRef.current;
    const outcome = state?.outcome;
    if (!state || !state.ended || !outcome || finalizedRef.current) return null;
    const opts = optionsRef.current;
    const world = opts.worldRef.current;
    const agentBefore = world.agents.find((a) => a.id === state.agentId);
    if (!agentBefore) return null;
    const info = startInfoRef.current;
    const params: StoryDebriefParams = {
      state,
      agent: agentBefore,
      memory: info?.memory ?? getOrCreateAgentMemory(opts.agentMemoryMap, state.agentId),
      exposure: info?.exposure ?? opts.getExposure(state.agentId),
      agents: world.agents,
      finishedByUser: true,
    };
    // (1) Tangkap rekaman SEBELUM finalisasi (hiddenVars agen masih keadaan awal).
    const record = buildStoryDebriefRecord(params);
    const props = buildStoryDebrief(params);

    // (2) Finalisasi sesi: hiddenVars dan memori lintas sesi.
    const fin = finalizeCounselingSession(state.session, world.agents, opts.agentMemoryMap);
    opts.onMemoryMapChange?.(fin.nextMemoryMap);

    // (3) Terapkan hasil hanya ke agen sasaran.
    const agents = applyStoryOutcomeToAgents(fin.nextAgents, state.agentId, outcome);

    // (4) Perbarui dan simpan MissionRecord.
    const prev = missionsRef.current[state.agentId];
    const complete = outcome.missionComplete || outcome.kind === 'terbantu';
    updateMission(state.agentId, {
      status: complete ? 'selesai' : 'lanjutan',
      sessions: (prev?.sessions ?? 0) + 1,
      lastOutcome: outcome.kind,
      lastDay: world.clock.day,
    });
    clearStorySlot(state.agentId);

    // (5) Lepas agen dan pulihkan status pause.
    opts.syncWorld(releaseAgent({ ...world, agents }, state.agentId));
    restoreWorld();
    setStatusMessage(complete ? STRINGS.story.missionCompleteNote : STRINGS.story.followUpNote);
    finalizedRef.current = true;
    return { record, props };
  }, [restoreWorld, updateMission]);

  /**
   * Penyelesaian sesi (Requirement 1.4, 1.5, 10.x): terapkan hasil lalu buka Debrief.
   */
  const viewDebrief = useCallback(() => {
    const res = finalizeStorySession();
    if (!res) return;
    debriefRecordRef.current = res.record;
    setDebriefProps(res.props);
  }, [finalizeStorySession]);

  /** Tutup Debrief: avatar kembali idle, sesi cerita dibersihkan. */
  const closeDebrief = useCallback(() => {
    debriefRecordRef.current = null;
    setDebriefProps(null);
    const { state } = reduceAvatar(avatarRef.current, { type: 'cerita-selesai' });
    commitAvatar(state);
    restoreWorld();
    storyStateRef.current = null;
    startInfoRef.current = null;
    finalizedRef.current = false;
    setStoryState(null);
    setArrival(null);
    setStoryVisible(true);
  }, [commitAvatar, restoreWorld]);

  /** Terapkan hasil ke dunia lalu langsung kembali ke peta lab tanpa membuka Debrief. */
  const finishAndReturnToLab = useCallback(() => {
    finalizeStorySession();
    closeDebrief();
  }, [finalizeStorySession, closeDebrief]);

  const getDebriefRecord = useCallback(() => debriefRecordRef.current, []);

  const startFollowUp = useCallback(
    (agentId: string): boolean => {
      if (missionsRef.current[agentId]?.status !== 'lanjutan') return false;
      return requestApproach(agentId);
    },
    [requestApproach]
  );
  const graph = storyState ? STORY_GRAPHS[storyState.agentId] ?? null : null;
  const agent = storyState
    ? worldRef.current.agents.find((a) => a.id === storyState.agentId) ?? null
    : null;

  return {
    avatarRef,
    avatarMode,
    activeAgentId,
    graph,
    agent,
    storyState,
    arrival,
    storyVisible,
    statusMessage,
    requestApproach,
    cancelApproach,
    advanceFrame,
    chooseStoryChoice,
    finishStoryEarly,
    saveStory,
    loadStory,
    setStatusMessage,
    missions,
    debriefProps,
    getDebriefRecord,
    viewDebrief,
    finishAndReturnToLab,
    closeDebrief,
    startFollowUp,
  };
}
