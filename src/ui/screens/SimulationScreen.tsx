import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STUDENT_COUNT } from '../../data/agents.seed';
import { LAB_MAP, getEffectiveZonePrivacy } from '../../data/map';
import { STRINGS } from '../../data/strings';
import { formatClockTime, getDayProgressRatio } from '../../engine/clock';
import {
  NavigationGrid,
  buildNavigationGrid,
  findPath,
  pickRandomWalkablePoint,
} from '../../engine/pathfinding';
import { mulberry32 } from '../../engine/rng';
import {
  advanceWorld,
  advanceWorldToNextDay,
  createWorldState,
  getWorldSocialSummary,
  setWorldDoorMode,
  setWorldPaused,
  setWorldSpeed,
} from '../../engine/world';
import {
  analyzeSociometryNetwork,
  buildRawSociometryConsoleReport,
} from '../../engine/network';
import { generateDailySociometrySnapshot } from '../../engine/sociometry';
import { createInitialCounselorState } from '../../engine/counselor';
import { expireOverduePromisesForDay } from '../../engine/memory';
import { runRandomSessionsSimulation } from '../../engine/trust';
import {
  AgentMemoryRecord,
  AnecdotalRecord,
  CanvasViewOptions,
  ClockState,
  CounselorHypothesis,
  CounselorState,
  CounselorTabId,
  DailySociometrySnapshot,
  HiddenReveal,
  DevPathTestState,
  LabEvent,
  ObservationLogState,
  RandomSessionsAuditResult,
  SimulationSpeed,
  StudentAgent,
  WorldSocialSummary,
  WorldState,
  ZoneType,
} from '../../types';
import {
  loadAgentMemoryMap,
  loadCounselorRecords,
  saveAgentMemoryMap,
  saveCounselorRecords,
} from '../../utils/storage';
import { findAgentAtScreenPoint } from '../canvas/agentRenderer';
import { animationTick, shouldRedrawForAnimation } from '../characters/animation';
import {
  CameraTransform,
  ClickRippleState,
  WorldPopup,
  findZoneAtTile,
  renderLabCanvas,
  screenToTile,
} from '../canvas/labRenderer';
import { wholeMapCamera } from '../world/cameraFollow';
import {
  IconBintang,
  IconEnergi,
  IconJeda,
  IconKecepatan,
  IconLog,
  IconPutar,
  IconRelasi,
  IconStres,
  IconTelinga,
} from '../components/GameIcons';
import {
  GameButton,
  GameMeter,
  GameRibbon,
  GameTab,
} from '../components/game';
import type { HudIconId } from '../components/game/hudIcons';
import { PixelPortrait } from '../characters/PixelPortrait';
import { playFeedbackSfx, playSfx, setRainAmbienceEnabled } from '../motion/sfx';
import { computeSunLighting, type CampusWeatherMode } from '../gpu/sunLighting';
import { WebGLPostFxRenderer } from '../gpu/webglPostFx';
import { buildSelectedMeters, buildSpeedControls } from './hudModel';
import { DevPanel } from '../components/DevPanel';
import { ObservationPanel } from '../ObservationPanel';
import {
  DebriefDashboard,
  ReplayViewOutcome,
  buildHiddenReveal,
} from '../Debrief';
import { analyzeSession } from '../../engine/rubric';
import {
  buildReplayComparison,
  runReplay,
} from '../../engine/replay';
import { SociogramPanel } from '../SociogramPanel';
import { useStoryMission } from '../story/useStoryMission';
import { StoryScreen } from '../story/StoryScreen';
import type { SceneVariant } from '../scene/sceneArt';
import { MissionPanel } from '../story/MissionPanel';
import { StoryJournalModal } from '../story/StoryJournalModal';
import { MorningBriefingModal } from './MorningBriefingModal';
import { RoomDecorModal } from './RoomDecorModal';
import { ShiftReportModal } from './ShiftReportModal';
import { SurvivalResultModal } from './SurvivalResultModal';
import { computeCampusMissionSummary } from '../../engine/isolationMission';
import {
  MAX_LOST_STUDENTS,
  detectNewlyLostAgentIds,
  evaluateSurvivalStatus,
} from '../../engine/survivalMission';
import {
  ROOM_DECOR_CATALOG,
  buyRoomDecor,
  computeAvailableStars,
  toggleEquipRoomDecor,
  type RoomDecorId,
  type RoomDecorState,
} from '../../engine/roomDecor';
import { loadRoomDecorState, saveRoomDecorState } from '../../utils/decorStorage';
import {
  SHIFT_TARGET_STORIES,
  computeShiftReport,
  signalForStudent,
} from '../../engine/storySignals';
import type { StoryOutcomeKind } from '../../engine/story/storyTypes';
import {
  IconDoor,
  IconGrid,
  IconSettings,
  IconTag,
} from '../components/Icons';

const SPEED_ICON_COMPONENTS: Partial<Record<HudIconId, React.FC<{ className?: string }>>> = {
  jeda: IconJeda,
  putar: IconPutar,
  kecepatan: IconKecepatan,
};

const TAB_ICON_COMPONENTS: Record<CounselorTabId, React.FC<{ className?: string }>> = {
  pengamatan: IconTelinga,
  sosiogram: IconRelasi,
  catatan: IconLog,
  misi: IconBintang,
};

interface SimulationScreenProps {
  initialClock: ClockState;
  seed: number;
  reducedMotion: boolean;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  onOpenTheory?: () => void;
  onChangeSeed: (nextSeed: number) => void;
  onOpenSettings: () => void;
  onBackToStart: () => void;
}

export const SimulationScreen: React.FC<SimulationScreenProps> = ({
  initialClock,
  seed,
  reducedMotion,
  audioEnabled = false,
  onToggleAudio,
  onOpenTheory,
  onChangeSeed,
  onOpenSettings,
  onBackToStart,
}) => {
  const initialWorld = useMemo(
    () => createWorldState(LAB_MAP, seed, initialClock.speed, 'lab', initialClock.paused),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const worldRef = useRef<WorldState>(initialWorld);
  const navGridRef = useRef<NavigationGrid>(buildNavigationGrid(LAB_MAP, 'lab'));

  const [clock, setClock] = useState<ClockState>(initialWorld.clock);
  const [worldSummary, setWorldSummary] = useState<WorldSocialSummary>(() =>
    getWorldSocialSummary(initialWorld)
  );
  const [activeEvents, setActiveEvents] = useState<LabEvent[]>(initialWorld.activeEvents);
  const [agentsSnapshot, setAgentsSnapshot] = useState<StudentAgent[]>(initialWorld.agents);
  const [observationLog, setObservationLog] = useState<ObservationLogState>(
    initialWorld.observationLog
  );
  const [sociometrySnapshots, setSociometrySnapshots] = useState<
    DailySociometrySnapshot[]
  >(initialWorld.sociometrySnapshots);

  const [hypotheses, setHypotheses] = useState<CounselorHypothesis[]>(
    () => loadCounselorRecords().hypotheses
  );
  const [anecdotalRecords, setAnecdotalRecords] = useState<AnecdotalRecord[]>(
    () => loadCounselorRecords().anecdotalRecords
  );

  const initialCounselor = useMemo(() => createInitialCounselorState(), []);
  const counselorRef = useRef<CounselorState>(initialCounselor);
  const [agentMemoryMap, setAgentMemoryMap] = useState<
    Record<string, AgentMemoryRecord>
  >(() => loadAgentMemoryMap());

  // Laci Panel Konselor mengambang on-demand (tertutup bawaan agar 100% layar adalah dunia kampus hidup!)
  const [activeDrawer, setActiveDrawer] = useState<CounselorTabId | null>(null);
  const [briefingOpen, setBriefingOpen] = useState<boolean>(true);
  const briefingOpenRef = useRef<boolean>(true);
  const [journalOpen, setJournalOpen] = useState<boolean>(false);
  const [shiftReportOpen, setShiftReportOpen] = useState<boolean>(false);
  const [decorShopOpen, setDecorShopOpen] = useState<boolean>(false);
  const [roomDecor, setRoomDecor] = useState<RoomDecorState>(() => loadRoomDecorState());
  const equippedDecorRef = useRef<readonly RoomDecorId[]>(roomDecor.equippedIds);
  const shiftCelebratedRef = useRef<boolean | null>(null);

  // Algoritma ketahanan energi: mahasiswa 0% -> hilang; 3 hilang -> Game Over (kalah)
  const [lostStudentIds, setLostStudentIds] = useState<string[]>([]);
  const [lostAlertToast, setLostAlertToast] = useState<string | null>(null);
  const [victoryDismissed, setVictoryDismissed] = useState<boolean>(false);
  const lostIdsRef = useRef<ReadonlySet<string>>(new Set());
  const stabilizedIdsRef = useRef<ReadonlySet<string>>(new Set());
  const inSessionIdsRef = useRef<ReadonlySet<string>>(new Set());
  const survivalOverRef = useRef<boolean>(false);
  const lostToastTimerRef = useRef<number | null>(null);

  const lostStudentSet = useMemo(() => new Set(lostStudentIds), [lostStudentIds]);
  useEffect(() => {
    lostIdsRef.current = lostStudentSet;
    needsRedrawRef.current = true;
  }, [lostStudentSet]);

  const registerLostAgents = useCallback((ids: readonly string[]) => {
    if (ids.length === 0) return;
    setLostStudentIds((prev) => {
      const existing = new Set(prev);
      const added: string[] = [];
      for (const id of ids) {
        if (!existing.has(id)) {
          existing.add(id);
          added.push(id);
        }
      }
      if (added.length === 0) return prev;
      const next = [...prev, ...added];
      lostIdsRef.current = new Set(next);
      playSfx('emote');
      const names = added
        .map((id) => worldRef.current.agents.find((a) => a.id === id)?.name.split(' ')[0] ?? id)
        .join(', ');
      setLostAlertToast(
        `⚠️ ${names} kehabisan energi (0%) dan meninggalkan kelas! (${next.length}/${MAX_LOST_STUDENTS})`
      );
      if (lostToastTimerRef.current !== null) window.clearTimeout(lostToastTimerRef.current);
      lostToastTimerRef.current = window.setTimeout(() => setLostAlertToast(null), 6500);
      if (selectedAgentRef.current && existing.has(selectedAgentRef.current)) {
        setSelectedAgentId(null);
      }
      const curStory = storyRef.current;
      if (
        curStory &&
        curStory.avatarRef.current.mode === 'menuju-mahasiswa' &&
        curStory.avatarRef.current.targetAgentId &&
        existing.has(curStory.avatarRef.current.targetAgentId)
      ) {
        curStory.cancelApproach();
      }
      if (next.length >= MAX_LOST_STUDENTS) {
        survivalOverRef.current = true;
      }
      needsRedrawRef.current = true;
      return next;
    });
  }, []);
  const registerLostAgentsRef = useRef(registerLostAgents);
  registerLostAgentsRef.current = registerLostAgents;

  useEffect(() => {
    saveRoomDecorState(roomDecor);
    equippedDecorRef.current = roomDecor.equippedIds;
    needsRedrawRef.current = true;
  }, [roomDecor]);

  useEffect(() => {
    briefingOpenRef.current = briefingOpen;
  }, [briefingOpen]);

  const [viewOptions, setViewOptions] = useState<CanvasViewOptions>({
    showGrid: false,
    showZoneLabels: true,
    consultationDoorMode: 'lab',
  });
  // Mulai tanpa kartu zona terbuka agar pemandangan kampus 11 ruangan langsung utuh & lapang
  const [selectedZoneId, setSelectedZoneId] = useState<ZoneType | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<ZoneType | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [selectedAgentSnapshot, setSelectedAgentSnapshot] = useState<StudentAgent | null>(null);

  const [devPanelOpen, setDevPanelOpen] = useState<boolean>(false);
  const [selectedTestZoneId, setSelectedTestZoneId] = useState<ZoneType>('konsultasi');
  const [devPathTest, setDevPathTest] = useState<DevPathTestState | null>(null);
  const [randomSessionsAudit, setRandomSessionsAudit] =
    useState<RandomSessionsAuditResult | null>(null);
  const devPathTestRef = useRef<DevPathTestState | null>(null);
  const testRunCountRef = useRef<number>(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webglFxRef = useRef<WebGLPostFxRenderer | null>(null);
  const pointerNormRef = useRef<{ x: number; y: number }>({ x: -1, y: -1 });
  const [weatherMode, setWeatherMode] = useState<CampusWeatherMode>('otomatis');
  const weatherModeRef = useRef<CampusWeatherMode>('otomatis');
  const [gpuFxEnabled, setGpuFxEnabled] = useState<boolean>(true);
  const gpuFxEnabledRef = useRef<boolean>(true);
  const [webglReady, setWebglReady] = useState<boolean>(false);
  const cameraRef = useRef<CameraTransform>({ offsetX: 8, offsetY: 8, scale: 0.7 });
  const stageSizeRef = useRef<{ width: number; height: number }>({ width: 960, height: 480 });
  const needsRedrawRef = useRef<boolean>(true);
  const lastDrawTimeRef = useRef<number>(0);
  const clickRippleRef = useRef<ClickRippleState | null>(null);
  const worldPopupsRef = useRef<WorldPopup[]>([]);
  const prevEnergyByAgentRef = useRef<Record<string, number>>({});
  const timeSecRef = useRef<number>(0);

  const pushWorldPopup = useCallback(
    (agent: Pick<StudentAgent, 'position'>, text: string, tone: WorldPopup['tone']) => {
      const t = LAB_MAP.tileSizePx;
      worldPopupsRef.current = [
        ...worldPopupsRef.current.slice(-7),
        {
          x: (agent.position.x + 0.5) * t,
          y: (agent.position.y - 0.5) * t,
          text,
          tone,
          startedAtSec: timeSecRef.current,
        },
      ];
      needsRedrawRef.current = true;
    },
    []
  );
  const pointerDownRef = useRef<boolean>(false);

  const viewOptionsRef = useRef<CanvasViewOptions>(viewOptions);
  const hoveredZoneRef = useRef<ZoneType | null>(hoveredZoneId);
  const selectedZoneRef = useRef<ZoneType | null>(selectedZoneId);
  const selectedAgentRef = useRef<string | null>(selectedAgentId);
  const hoveredAgentRef = useRef<string | null>(hoveredAgentId);
  const reducedMotionRef = useRef<boolean>(reducedMotion);
  const storyRef = useRef<ReturnType<typeof useStoryMission> | null>(null);
  const storyMarkerIdsRef = useRef<string[]>([]);
  const storyBadgesRef = useRef<Record<string, StoryOutcomeKind>>({});

  useEffect(() => {
    viewOptionsRef.current = viewOptions;
    navGridRef.current = buildNavigationGrid(LAB_MAP, viewOptions.consultationDoorMode);
    worldRef.current = setWorldDoorMode(worldRef.current, viewOptions.consultationDoorMode);
    needsRedrawRef.current = true;
  }, [viewOptions]);

  useEffect(() => {
    hoveredZoneRef.current = hoveredZoneId;
    needsRedrawRef.current = true;
  }, [hoveredZoneId]);

  useEffect(() => {
    selectedZoneRef.current = selectedZoneId;
    needsRedrawRef.current = true;
  }, [selectedZoneId]);

  useEffect(() => {
    selectedAgentRef.current = selectedAgentId;
    setSelectedAgentSnapshot(
      selectedAgentId
        ? worldRef.current.agents.find((a) => a.id === selectedAgentId) ?? null
        : null
    );
    needsRedrawRef.current = true;
  }, [selectedAgentId]);

  useEffect(() => {
    hoveredAgentRef.current = hoveredAgentId;
    needsRedrawRef.current = true;
  }, [hoveredAgentId]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
    needsRedrawRef.current = true;
  }, [reducedMotion]);

  useEffect(() => {
    weatherModeRef.current = weatherMode;
    setRainAmbienceEnabled(weatherMode === 'hujan');
    needsRedrawRef.current = true;
  }, [weatherMode]);

  useEffect(() => {
    return () => {
      setRainAmbienceEnabled(false);
    };
  }, []);

  useEffect(() => {
    gpuFxEnabledRef.current = gpuFxEnabled;
    needsRedrawRef.current = true;
  }, [gpuFxEnabled]);

  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    if (!glCanvas) return;
    const fx = WebGLPostFxRenderer.create(glCanvas);
    webglFxRef.current = fx;
    setWebglReady(Boolean(fx));
    needsRedrawRef.current = true;
    return () => {
      fx?.dispose();
      webglFxRef.current = null;
    };
  }, []);

  // Saat seed diganti dari Pengaturan/Dev Panel, bangun ulang dunia secara deterministik
  useEffect(() => {
    if (worldRef.current.seed === seed) return;
    const rebuilt = createWorldState(
      LAB_MAP,
      seed,
      worldRef.current.clock.speed,
      viewOptionsRef.current.consultationDoorMode,
      worldRef.current.clock.paused
    );
    worldRef.current = rebuilt;
    const resetCounselor = createInitialCounselorState();
    counselorRef.current = resetCounselor;
    setClock(rebuilt.clock);
    setWorldSummary(getWorldSocialSummary(rebuilt));
    setActiveEvents(rebuilt.activeEvents);
    setAgentsSnapshot(rebuilt.agents);
    setObservationLog(rebuilt.observationLog);
    setSociometrySnapshots(rebuilt.sociometrySnapshots);
    setSelectedAgentSnapshot(
      selectedAgentRef.current
        ? rebuilt.agents.find((a) => a.id === selectedAgentRef.current) ?? null
        : null
    );
    needsRedrawRef.current = true;
  }, [seed]);

  useEffect(() => {
    saveCounselorRecords({ hypotheses, anecdotalRecords });
  }, [hypotheses, anecdotalRecords]);

  useEffect(() => {
    saveAgentMemoryMap(agentMemoryMap);
  }, [agentMemoryMap]);

  useEffect(() => {
    document.body.dataset.state = clock.paused ? 'paused' : 'playing';
  }, [clock.paused]);

  // Pintasan keyboard: Ctrl+Shift+D (Dev Panel), Esc (tutup modal/laci), Spasi/1-3/M/R/B/H/J/S
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDevPanelOpen((prev) => !prev);
        return;
      }
      if (e.key === 'Escape') {
        setActiveDrawer(null);
        setJournalOpen(false);
        setShiftReportOpen(false);
        setDecorShopOpen(false);
        return;
      }
      // Jangan bajak tombol saat sedang mengetik di formulir, di percakapan VN, atau saat briefing/debrief terbuka
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.closest('input, textarea, select') || target.isContentEditable)) return;
      if (briefingOpenRef.current || storyRef.current?.storyVisible || storyRef.current?.debriefProps) return;

      const key = e.key.toLowerCase();
      if (key === ' ' && !target?.closest('button, a, [role="button"]')) {
        e.preventDefault();
        playSfx('klik');
        const nextWorld = setWorldPaused(worldRef.current, !worldRef.current.clock.paused);
        worldRef.current = nextWorld;
        setClock(nextWorld.clock);
      } else if (key === '1') {
        playSfx('klik');
        const nextWorld = setWorldSpeed(worldRef.current, 1);
        worldRef.current = nextWorld;
        setClock(nextWorld.clock);
      } else if (key === '2') {
        playSfx('klik');
        const nextWorld = setWorldSpeed(worldRef.current, 2);
        worldRef.current = nextWorld;
        setClock(nextWorld.clock);
      } else if (key === '3') {
        playSfx('klik');
        const nextWorld = setWorldSpeed(worldRef.current, 4);
        worldRef.current = nextWorld;
        setClock(nextWorld.clock);
      } else if (key === 'm') {
        playFeedbackSfx('drawer');
        setActiveDrawer((cur) => (cur === 'misi' ? null : 'misi'));
      } else if (key === 'r') {
        playFeedbackSfx('drawer');
        setActiveDrawer((cur) => (cur === 'sosiogram' ? null : 'sosiogram'));
      } else if (key === 'b') {
        playFeedbackSfx('drawer');
        setActiveDrawer((cur) => (cur === 'catatan' ? null : 'catatan'));
      } else if (key === 'h') {
        playSfx('klik');
        setDecorShopOpen((cur) => !cur);
      } else if (key === 'j') {
        playSfx('klik');
        setJournalOpen((cur) => !cur);
      } else if (key === 'c') {
        playSfx('klik');
        setWeatherMode((cur) =>
          cur === 'otomatis'
            ? 'cerah'
            : cur === 'cerah'
              ? 'senja'
              : cur === 'senja'
                ? 'hujan'
                : 'otomatis'
        );
      } else if (key === 'g') {
        playSfx('klik');
        setGpuFxEnabled((cur) => !cur);
      } else if (key === 's' && onToggleAudio) {
        onToggleAudio();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onToggleAudio]);

  const handleTogglePause = useCallback(() => {
    const nextWorld = setWorldPaused(worldRef.current, !worldRef.current.clock.paused);
    worldRef.current = nextWorld;
    setClock(nextWorld.clock);
  }, []);

  const handleChangeSpeed = useCallback((speed: SimulationSpeed) => {
    const nextWorld = setWorldSpeed(worldRef.current, speed);
    worldRef.current = nextWorld;
    setClock(nextWorld.clock);
  }, []);

  const handleUpdateViewOptions = useCallback((patch: Partial<CanvasViewOptions>) => {
    setViewOptions((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleDrawer = useCallback((tab: CounselorTabId) => {
    playFeedbackSfx('drawer');
    setActiveDrawer((cur) => (cur === tab ? null : tab));
  }, []);

  const handleRunPathTest = useCallback(() => {
    testRunCountRef.current += 1;
    const rng = mulberry32(seed + testRunCountRef.current * 97);
    const grid = buildNavigationGrid(LAB_MAP, viewOptionsRef.current.consultationDoorMode);
    const zone =
      LAB_MAP.zones.find((z) => z.id === selectedTestZoneId) ?? LAB_MAP.zones[0];
    const slotIndex = Math.floor(rng() * zone.standingSlots.length);
    const targetSlot = zone.standingSlots[slotIndex];
    const start = pickRandomWalkablePoint(grid, rng);
    const path = findPath(grid, start, targetSlot);

    const nextTest: DevPathTestState = {
      active: true,
      start,
      currentPos: { x: start.x, y: start.y },
      targetZoneId: zone.id,
      targetSlot,
      path: path ?? [],
      stepIndex: 0,
      stepProgress: 0,
      reachable: path !== null && path.length > 0,
      wallCollisions: 0,
    };

    devPathTestRef.current = nextTest;
    setDevPathTest(nextTest);
    setSelectedZoneId(zone.id);
    needsRedrawRef.current = true;
  }, [seed, selectedTestZoneId]);

  const handleClearPathTest = useCallback(() => {
    devPathTestRef.current = null;
    setDevPathTest(null);
    needsRedrawRef.current = true;
  }, []);

  useEffect(() => {
    const activeTest = devPathTestRef.current;
    if (!activeTest || !activeTest.active) return;
    const grid = buildNavigationGrid(LAB_MAP, viewOptions.consultationDoorMode);
    const currentTile = {
      x: Math.round(activeTest.currentPos.x),
      y: Math.round(activeTest.currentPos.y),
    };
    const path = findPath(grid, currentTile, activeTest.targetSlot);
    const updated: DevPathTestState = {
      ...activeTest,
      start: currentTile,
      path: path ?? [],
      stepIndex: 0,
      stepProgress: 0,
      reachable: path !== null && path.length > 0,
    };
    devPathTestRef.current = updated;
    setDevPathTest(updated);
    needsRedrawRef.current = true;
  }, [viewOptions.consultationDoorMode]);

  // ResizeObserver menjaga ketajaman HD kanvas 100vw × 100vh penuh
  useEffect(() => {
    const container = stageRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(300, Math.floor(rect.width));
      const height = Math.max(260, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      stageSizeRef.current = { width, height };

      const vp = { width, height };
      cameraRef.current = wholeMapCamera(vp, LAB_MAP);
      needsRedrawRef.current = true;
    };

    updateCanvasSize();
    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Loop simulasi utama (seluruh agen mahasiswa + jam + animasi kanvas HD)
  useEffect(() => {
    let rafId = 0;
    let lastTimestamp = performance.now();

    let lastAnimTick = animationTick(0);
    const frame = (now: number) => {
      const rawDt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);

      const prevWorld = worldRef.current;
      let walkingDirty = false;
      if (!prevWorld.clock.paused && !briefingOpenRef.current && !survivalOverRef.current) {
        const nextWorld = advanceWorld(prevWorld, dt, LAB_MAP, navGridRef.current, {
          inSessionAgentIds: inSessionIdsRef.current,
          lostAgentIds: lostIdsRef.current,
          stabilizedAgentIds: stabilizedIdsRef.current,
        });
        worldRef.current = nextWorld;

        if (nextWorld.tickCount !== prevWorld.tickCount) {
          const newlyLost = detectNewlyLostAgentIds(
            nextWorld.agents,
            lostIdsRef.current,
            stabilizedIdsRef.current,
            inSessionIdsRef.current
          );
          if (newlyLost.length > 0) {
            registerLostAgentsRef.current(newlyLost);
          }
        }

        if (nextWorld.tickCount !== prevWorld.tickCount) {
          needsRedrawRef.current = true;
        } else if (nextWorld.agents.some((a) => a.status === 'berpindah')) {
          walkingDirty = true;
        }

        const prevMinute = Math.floor(prevWorld.clock.minutesOfDay);
        const nextMinute = Math.floor(nextWorld.clock.minutesOfDay);
        if (
          prevWorld.clock.day !== nextWorld.clock.day ||
          prevMinute !== nextMinute ||
          nextWorld.tickCount !== prevWorld.tickCount
        ) {
          if (nextWorld.clock.day > prevWorld.clock.day) {
            const newDay = nextWorld.clock.day;
            setAgentMemoryMap((prev) => expireOverduePromisesForDay(prev, newDay));
          }
          setClock(nextWorld.clock);
          if (nextWorld.tickCount !== prevWorld.tickCount) {
            setWorldSummary(getWorldSocialSummary(worldRef.current));
            setActiveEvents(worldRef.current.activeEvents);
            setAgentsSnapshot(worldRef.current.agents);
            setObservationLog(worldRef.current.observationLog);
            if (
              worldRef.current.sociometrySnapshots.length !==
              prevWorld.sociometrySnapshots.length
            ) {
              setSociometrySnapshots(worldRef.current.sociometrySnapshots);
            }
            if (selectedAgentRef.current) {
              setSelectedAgentSnapshot(
                worldRef.current.agents.find((a) => a.id === selectedAgentRef.current) ?? null
              );
            }
          }
          if (Math.floor(prevMinute / 15) !== Math.floor(nextMinute / 15)) {
            needsRedrawRef.current = true;
          }
        }
      }

      const storyApi = storyRef.current;
      if (storyApi) {
        const modeBefore = storyApi.avatarRef.current.mode;
        if (modeBefore !== 'idle' && modeBefore !== 'dalam-cerita') {
          storyApi.advanceFrame(dt);
          walkingDirty = true;
        }
        if (storyMarkerIdsRef.current.length > 0 && !reducedMotionRef.current) {
          walkingDirty = true;
        }
      }

      const test = devPathTestRef.current;
      if (test && test.active && test.reachable && test.path.length > 1) {
        if (test.stepIndex < test.path.length - 1) {
          const tilesPerSec = reducedMotionRef.current ? 18 : 6 * worldRef.current.clock.speed;
          let nextIdx = test.stepIndex;
          let nextProg = test.stepProgress + dt * tilesPerSec;

          while (nextProg >= 1 && nextIdx < test.path.length - 1) {
            nextProg -= 1;
            nextIdx += 1;
          }

          if (nextIdx >= test.path.length - 1) {
            const lastPt = test.path[test.path.length - 1];
            const finished: DevPathTestState = {
              ...test,
              stepIndex: test.path.length - 1,
              stepProgress: 0,
              currentPos: { x: lastPt.x, y: lastPt.y },
            };
            devPathTestRef.current = finished;
            setDevPathTest(finished);
            needsRedrawRef.current = true;
          } else {
            const p0 = test.path[nextIdx];
            const p1 = test.path[nextIdx + 1];
            test.stepIndex = nextIdx;
            test.stepProgress = nextProg;
            test.currentPos = {
              x: p0.x + (p1.x - p0.x) * nextProg,
              y: p0.y + (p1.y - p0.y) * nextProg,
            };
            walkingDirty = true;
          }
        }
      }

      const nowSec = now / 1000;
      timeSecRef.current = nowSec;
      const animTick = animationTick(nowSec);
      if (shouldRedrawForAnimation(lastAnimTick, animTick, reducedMotionRef.current)) {
        walkingDirty = true;
      }
      if (clickRippleRef.current) {
        if (nowSec - clickRippleRef.current.startedAtSec < 0.72) {
          walkingDirty = true;
        } else {
          clickRippleRef.current = null;
          needsRedrawRef.current = true;
        }
      }
      if (worldPopupsRef.current.length > 0) {
        const alive = worldPopupsRef.current.filter((p) => nowSec - p.startedAtSec < 2.2);
        if (alive.length !== worldPopupsRef.current.length) {
          worldPopupsRef.current = alive;
          needsRedrawRef.current = true;
        }
        if (alive.length > 0) {
          walkingDirty = true;
        }
      }
      lastAnimTick = animTick;

      const shouldDraw =
        needsRedrawRef.current ||
        (walkingDirty && now - lastDrawTimeRef.current >= 33);

      if (shouldDraw) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const { width, height } = stageSizeRef.current;
            ctx.save();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            renderLabCanvas(ctx, canvas, width, height, {
              map: LAB_MAP,
              camera: cameraRef.current,
              viewOptions: viewOptionsRef.current,
              hoveredZoneId: hoveredZoneRef.current,
              selectedZoneId: selectedZoneRef.current,
              agents: worldRef.current.agents.filter((a) => !lostIdsRef.current.has(a.id)),
              selectedAgentId: selectedAgentRef.current,
              hoveredAgentId: hoveredAgentRef.current,
              devPathTest: devPathTestRef.current,
              clockMinutesOfDay: worldRef.current.clock.minutesOfDay,
              timeSeconds: nowSec,
              reducedMotion: reducedMotionRef.current,
              clickRipple: clickRippleRef.current,
              equippedDecor: equippedDecorRef.current,
              worldPopups: worldPopupsRef.current,
              weatherMode: weatherModeRef.current,
              story: storyApi
                ? {
                    avatar: storyApi.avatarRef.current,
                    missionAgentIds: storyMarkerIdsRef.current,
                    outcomeBadges: storyBadgesRef.current,
                    reducedMotion: reducedMotionRef.current,
                    timeSeconds: nowSec,
                  }
                : undefined,
            });
            ctx.restore();

            if (gpuFxEnabledRef.current && webglFxRef.current) {
              const sun = computeSunLighting(
                worldRef.current.clock.minutesOfDay,
                weatherModeRef.current
              );
              webglFxRef.current.renderFromCanvas(canvas, {
                timeSeconds: nowSec,
                reducedMotion: reducedMotionRef.current,
                gradeRgb: sun.gradeRgb,
                godRayAngle: sun.godRayAngle,
                godRayIntensity: sun.godRayIntensity,
                bloomStrength:
                  weatherModeRef.current === 'hujan' || sun.phase === 'sore' ? 0.86 : 0.64,
                tiltShiftStrength: 0.78,
                pointerNormX: pointerNormRef.current.x,
                pointerNormY: pointerNormRef.current.y,
              });
            }
          }
        }
        needsRedrawRef.current = false;
        lastDrawTimeRef.current = now;
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    pointerDownRef.current = true;
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      pointerNormRef.current = {
        x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      };
      if (gpuFxEnabledRef.current && !reducedMotionRef.current) {
        needsRedrawRef.current = true;
      }
    }
    const hitAgent = findAgentAtScreenPoint(
      e.clientX,
      e.clientY,
      rect,
      cameraRef.current,
      LAB_MAP.tileSizePx,
      worldRef.current.agents.filter((a) => !lostIdsRef.current.has(a.id))
    );
    const nextAgentHover = hitAgent ? hitAgent.id : null;
    if (nextAgentHover !== hoveredAgentId) {
      setHoveredAgentId(nextAgentHover);
    }

    const tile = screenToTile(
      e.clientX,
      e.clientY,
      rect,
      cameraRef.current,
      LAB_MAP.tileSizePx
    );
    const zone = findZoneAtTile(LAB_MAP, tile.x, tile.y);
    const nextHover = zone ? zone.id : null;
    if (nextHover !== hoveredZoneId) {
      setHoveredZoneId(nextHover);
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerDownRef.current) return;
    pointerDownRef.current = false;

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const cam = cameraRef.current;
      clickRippleRef.current = {
        x: (e.clientX - rect.left - cam.offsetX) / cam.scale,
        y: (e.clientY - rect.top - cam.offsetY) / cam.scale,
        startedAtSec: timeSecRef.current,
      };
      needsRedrawRef.current = true;
      const hitAgent = findAgentAtScreenPoint(
        e.clientX,
        e.clientY,
        rect,
        cameraRef.current,
        LAB_MAP.tileSizePx,
        worldRef.current.agents.filter((a) => !lostIdsRef.current.has(a.id))
      );
      if (hitAgent) {
        playSfx('klik');
        setSelectedAgentId(hitAgent.id);
        setSelectedZoneId(hitAgent.currentZoneId);
        setActiveDrawer(null);
        storyRef.current?.requestApproach(hitAgent.id);
        return;
      }

      setSelectedAgentId(null);
      const tile = screenToTile(
        e.clientX,
        e.clientY,
        rect,
        cameraRef.current,
        LAB_MAP.tileSizePx
      );
      const zone = findZoneAtTile(LAB_MAP, tile.x, tile.y);
      setSelectedZoneId((prev) => {
        const next = zone ? zone.id : null;
        return prev === next ? null : next;
      });
    }
  };

  const selectedZone = useMemo(
    () => LAB_MAP.zones.find((z) => z.id === selectedZoneId) ?? null,
    [selectedZoneId]
  );

  const dayRatio = getDayProgressRatio(clock.minutesOfDay);
  const formattedTime = formatClockTime(clock.minutesOfDay);
  const speeds: SimulationSpeed[] = [1, 2, 4];

  const livePreviewSnapshot = useMemo(
    () =>
      generateDailySociometrySnapshot(
        agentsSnapshot,
        observationLog,
        clock.day,
        seed,
        true
      ),
    [agentsSnapshot, observationLog, clock.day, seed]
  );

  const handleAddHypothesis = useCallback(
    (draft: Omit<CounselorHypothesis, 'id'>) => {
      setHypotheses((prev) => [
        {
          ...draft,
          id: `hip-${Date.now()}-${prev.length + 1}`,
        },
        ...prev,
      ]);
    },
    []
  );

  const handleAddAnecdotalRecord = useCallback(
    (draft: Omit<AnecdotalRecord, 'id'>) => {
      setAnecdotalRecords((prev) => [
        {
          ...draft,
          id: `ank-${Date.now()}-${prev.length + 1}`,
        },
        ...prev,
      ]);
    },
    []
  );

  const handlePrintSociometryDebug = useCallback(() => {
    const targetSnap =
      sociometrySnapshots[sociometrySnapshots.length - 1] ?? livePreviewSnapshot;
    const stats = analyzeSociometryNetwork(
      targetSnap,
      worldRef.current.agents,
      worldRef.current.observationLog
    );
    const report = buildRawSociometryConsoleReport(targetSnap, stats);
    console.group(
      `[RUANG DENGAR] Audit Sosiometri Hari ${report.day}${report.isLivePreview ? ' (Pratinjau)' : ''}`
    );
    console.log('Ringkasan Jaringan:', {
      totalAgents: report.totalAgents,
      totalDirectedChoices: report.totalDirectedChoices,
      reciprocalPairCount: report.reciprocalPairCount,
      reciprocalDirectedChoices: report.reciprocalDirectedChoices,
      reciprocityChoicePercent: `${report.reciprocityChoicePercent}%`,
      agentsWithReciprocalCount: report.agentsWithReciprocalCount,
      agentsWithReciprocalPercent: `${report.agentsWithReciprocalPercent}%`,
      starThresholdTop10Percent: report.starThresholdTop10Percent,
      componentCount: report.componentCount,
      components: report.components,
    });
    console.table(report.perAgentRows);
    console.groupEnd();
  }, [sociometrySnapshots, livePreviewSnapshot]);

  const syncWorldUiState = useCallback((nextWorld: WorldState) => {
    worldRef.current = nextWorld;
    setClock(nextWorld.clock);
    setWorldSummary(getWorldSocialSummary(nextWorld));
    setActiveEvents(nextWorld.activeEvents);
    setAgentsSnapshot(nextWorld.agents);
    setObservationLog(nextWorld.observationLog);
    setSociometrySnapshots(nextWorld.sociometrySnapshots);
    if (selectedAgentRef.current) {
      setSelectedAgentSnapshot(
        nextWorld.agents.find((a) => a.id === selectedAgentRef.current) ?? null
      );
    }
    needsRedrawRef.current = true;
  }, []);

  const story = useStoryMission({
    worldRef,
    navGridRef,
    syncWorld: syncWorldUiState,
    agentMemoryMap,
    getExposure: (agentId) => counselorRef.current.exposureByAgent[agentId] ?? 0,
    seed,
    reducedMotion,
    onMemoryMapChange: setAgentMemoryMap,
    lostAgentIds: lostStudentSet,
    onAgentLost: (id) => registerLostAgents([id]),
  });
  storyRef.current = story;

  useEffect(() => {
    const stab = new Set<string>();
    for (const [id, rec] of Object.entries(story.missions)) {
      if (rec.status === 'selesai') stab.add(id);
    }
    stabilizedIdsRef.current = stab;
  }, [story.missions]);

  useEffect(() => {
    inSessionIdsRef.current = story.activeAgentId ? new Set([story.activeAgentId]) : new Set();
  }, [story.activeAgentId]);

  useEffect(() => {
    const ids: string[] = [];
    const badges: Record<string, StoryOutcomeKind> = {};
    for (const a of agentsSnapshot) {
      if (lostStudentSet.has(a.id)) continue;
      const m = story.missions[a.id];
      if (!m || m.status !== 'selesai') ids.push(a.id);
      if (m?.lastOutcome && m.lastDay === clock.day) badges[a.id] = m.lastOutcome;
    }
    storyMarkerIdsRef.current = ids;
    storyBadgesRef.current = badges;
    needsRedrawRef.current = true;
  }, [agentsSnapshot, story.missions, clock.day, lostStudentSet]);

  useEffect(() => {
    needsRedrawRef.current = true;
  }, [story.avatarMode, story.storyVisible]);

  const storyGraphForVariant = story.graph;
  const storyAgentIdForVariant = story.agent?.id;
  const storySceneVariant: SceneVariant = useMemo(
    () => (storyAgentIdForVariant && story.missions[storyAgentIdForVariant]?.status === 'lanjutan' ? 'sore' : 'pagi'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storyGraphForVariant, storyAgentIdForVariant]
  );

  const missionsDone = useMemo(
    () =>
      agentsSnapshot.filter(
        (a) => !lostStudentSet.has(a.id) && story.missions[a.id]?.status === 'selesai'
      ).length,
    [agentsSnapshot, story.missions, lostStudentSet]
  );

  const survivalSummary = useMemo(
    () => evaluateSurvivalStatus(STUDENT_COUNT, lostStudentIds.length, missionsDone),
    [lostStudentIds.length, missionsDone]
  );

  useEffect(() => {
    survivalOverRef.current =
      survivalSummary.status === 'kalah' ||
      (survivalSummary.status === 'menang' && !victoryDismissed);
  }, [survivalSummary.status, victoryDismissed]);

  const lostAgentsList = useMemo(
    () =>
      lostStudentIds
        .map((id) => agentsSnapshot.find((a) => a.id === id))
        .filter((a): a is StudentAgent => Boolean(a)),
    [lostStudentIds, agentsSnapshot]
  );

  const otherCriticalAgent = useMemo(() => {
    const talkingId = story.agent?.id ?? null;
    let lowest: StudentAgent | null = null;
    for (const a of agentsSnapshot) {
      if (a.id === talkingId || lostStudentSet.has(a.id)) continue;
      if (story.missions[a.id]?.status === 'selesai') continue;
      if (a.energy < 0.35 && (!lowest || a.energy < lowest.energy)) {
        lowest = a;
      }
    }
    return lowest ? { name: lowest.name, energyPct: Math.round(lowest.energy * 100) } : null;
  }, [agentsSnapshot, story.agent?.id, story.missions, lostStudentSet]);

  const handleRestartRun = useCallback(() => {
    playSfx('klik');
    const rebuilt = createWorldState(
      LAB_MAP,
      seed,
      initialClock.speed,
      viewOptionsRef.current.consultationDoorMode,
      false
    );
    worldRef.current = rebuilt;
    counselorRef.current = createInitialCounselorState();
    lostIdsRef.current = new Set();
    stabilizedIdsRef.current = new Set();
    inSessionIdsRef.current = new Set();
    survivalOverRef.current = false;
    setLostStudentIds([]);
    setLostAlertToast(null);
    setVictoryDismissed(false);
    setSelectedAgentId(null);
    setSelectedZoneId(null);
    setSelectedAgentSnapshot(null);
    setActiveDrawer(null);
    story.resetAllMissions();
    syncWorldUiState(rebuilt);
  }, [seed, initialClock.speed, story, syncWorldUiState]);

  const campusMission = useMemo(
    () => computeCampusMissionSummary(agentsSnapshot, story.missions, lostStudentSet),
    [agentsSnapshot, story.missions, lostStudentSet]
  );

  const shiftReport = useMemo(
    () => computeShiftReport(agentsSnapshot, story.missions),
    [agentsSnapshot, story.missions]
  );

  const availableStars = useMemo(
    () => computeAvailableStars(story.missions, roomDecor),
    [story.missions, roomDecor]
  );

  const canBuyAnyDecor = useMemo(
    () =>
      ROOM_DECOR_CATALOG.some(
        (item) => !roomDecor.ownedIds.includes(item.id) && availableStars >= item.cost
      ),
    [roomDecor.ownedIds, availableStars]
  );

  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);
  const prevMissionsDoneRef = useRef<number>(missionsDone);
  const prevCompletedIdsRef = useRef<ReadonlySet<string>>(new Set());
  useEffect(() => {
    const prev = prevMissionsDoneRef.current;
    prevMissionsDoneRef.current = missionsDone;
    const completedNow = new Set(
      agentsSnapshot
        .filter((a) => !lostStudentSet.has(a.id) && story.missions[a.id]?.status === 'selesai')
        .map((a) => a.id)
    );
    if (missionsDone > prev) {
      for (const id of completedNow) {
        if (!prevCompletedIdsRef.current.has(id)) {
          const agent = agentsSnapshot.find((a) => a.id === id);
          if (agent) pushWorldPopup(agent, '✨ +2 ⭐ Pulih!', 'gold');
        }
      }
      setCelebrationToast(
        `✨ Kisah terungkap (${missionsDone}/${STUDENT_COUNT}) · ⭐ +2 Bintang Empati siap untuk Hias Ruang BK!`
      );
      const timer = window.setTimeout(() => setCelebrationToast(null), 5500);
      prevCompletedIdsRef.current = completedNow;
      return () => window.clearTimeout(timer);
    }
    prevCompletedIdsRef.current = completedNow;
  }, [missionsDone, agentsSnapshot, lostStudentSet, story.missions, pushWorldPopup]);

  // Munculkan teks pop-up halus di peta saat energi mahasiswa turun ke batas kritis (<35%) atau naik drastis karena mengobrol
  useEffect(() => {
    const prevMap = prevEnergyByAgentRef.current;
    for (const a of agentsSnapshot) {
      if (lostStudentSet.has(a.id)) continue;
      const prevE = prevMap[a.id];
      if (typeof prevE === 'number') {
        if (prevE >= 0.35 && a.energy < 0.35 && story.missions[a.id]?.status !== 'selesai') {
          pushWorldPopup(a, '⚠ Energi <35%!', 'warn');
        } else if (a.energy - prevE >= 0.08 && a.interactingWithIds.length > 0) {
          pushWorldPopup(a, '💬 +Energi', 'teal');
        }
      }
      prevMap[a.id] = a.energy;
    }
  }, [agentsSnapshot, lostStudentSet, story.missions, pushWorldPopup]);

  const handleBuyDecor = useCallback(
    (itemId: RoomDecorId) => {
      setRoomDecor((prev) => {
        const res = buyRoomDecor(prev, itemId, story.missions);
        if (res.ok) playSfx('misi-selesai');
        return res.next;
      });
    },
    [story.missions]
  );

  const handleToggleEquipDecor = useCallback((itemId: RoomDecorId) => {
    playSfx('klik');
    setRoomDecor((prev) => toggleEquipRoomDecor(prev, itemId));
  }, []);

  useEffect(() => {
    if (shiftCelebratedRef.current === null) {
      shiftCelebratedRef.current = missionsDone >= SHIFT_TARGET_STORIES;
      return;
    }
    if (
      !shiftCelebratedRef.current &&
      missionsDone >= SHIFT_TARGET_STORIES &&
      !story.storyState &&
      !story.debriefProps
    ) {
      shiftCelebratedRef.current = true;
      setShiftReportOpen(true);
    }
  }, [missionsDone, story.storyState, story.debriefProps]);

  const handleStoryDebriefReveal = useCallback((): HiddenReveal | null => {
    const rec = story.getDebriefRecord();
    return rec ? buildHiddenReveal(rec) : null;
  }, [story]);

  const handleStoryDebriefReplay = useCallback(
    (presetId: string): ReplayViewOutcome => {
      const rec = story.getDebriefRecord();
      if (!rec) return { ok: false, message: 'Rekaman sesi tidak tersedia.' };
      const result = runReplay(rec, presetId);
      if (!result.ok) return { ok: false, message: result.error.message };
      return {
        ok: true,
        comparison: buildReplayComparison(analyzeSession(rec), result.analysis, presetId),
      };
    },
    [story]
  );

  const handleAdvanceOneDay = useCallback(() => {
    const nextWorld = advanceWorldToNextDay(
      worldRef.current,
      LAB_MAP,
      navGridRef.current
    );
    setAgentMemoryMap((prev) =>
      expireOverduePromisesForDay(prev, nextWorld.clock.day)
    );
    syncWorldUiState(nextWorld);
  }, [syncWorldUiState]);

  const handleRun100RandomSessions = useCallback(() => {
    const audit = runRandomSessionsSimulation(seed, 100);
    setRandomSessionsAudit(audit);
    console.group(`[RUANG DENGAR] Simulasi 100 Sesi Acak (Seed ${seed})`);
    console.log(audit);
    console.groupEnd();
  }, [seed]);

  const speedControls = buildSpeedControls(speeds, clock, STRINGS.speedControls);
  const selectedMeters = buildSelectedMeters(
    selectedAgentSnapshot
      ? { energy: selectedAgentSnapshot.energy * 100, stress: selectedAgentSnapshot.stress * 100, max: 100 }
      : { max: 100 },
    STRINGS.meters
  );

  const activeStudentsCount = Math.max(0, worldSummary.totalAgents - lostStudentIds.length);
  const hasUrgentStudent = useMemo(
    () =>
      agentsSnapshot.some(
        (a) =>
          !lostStudentSet.has(a.id) &&
          story.missions[a.id]?.status !== 'selesai' &&
          a.energy < 0.25
      ),
    [agentsSnapshot, lostStudentSet, story.missions]
  );
  const skyEmoji = clock.minutesOfDay < 660 ? '🌅' : clock.minutesOfDay >= 870 ? '🌇' : '☀️';
  const showFirstTimePrompt =
    !briefingOpen &&
    missionsDone === 0 &&
    !story.storyVisible &&
    !activeDrawer &&
    !selectedAgentSnapshot &&
    story.avatarMode === 'idle';

  return (
    <div className="sim-rtx-shell relative h-screen w-screen overflow-hidden bg-[#061522]">
      {/* Bingkai Bevel Luar Viewport Simulator Futuristik (Phase 1 Outer Frame) */}
      <div aria-hidden="true" className="sim-rtx-outer-bezel pointer-events-none" />
      {/* Vinyet darurat lembut di tepi layar bila ada mahasiswa di bawah 25% energi */}
      {hasUrgentStudent && !story.storyVisible && (
        <div aria-hidden="true" className="hud-urgency-vignette" />
      )}
      {/* =====================================================================
          1. DUNIA KAMPUS HIDUP 100% FULL-SCREEN (11 RUANGAN + TAMAN KAMPUS HD)
         ===================================================================== */}
      <div
        ref={stageRef}
        data-testid="lab-canvas-stage"
        className="absolute inset-0 h-full w-full"
      >
        <canvas
          ref={canvasRef}
          data-testid="lab-canvas"
          tabIndex={0}
          aria-label={STRINGS.canvasToolbar.mapLegendTitle}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerLeave={() => {
            pointerNormRef.current = { x: -1, y: -1 };
            needsRedrawRef.current = true;
          }}
          onPointerCancel={() => {
            pointerDownRef.current = false;
            pointerNormRef.current = { x: -1, y: -1 };
          }}
          className={`block h-full w-full ${
            hoveredAgentId || hoveredZoneId ? 'cursor-pointer' : 'cursor-default'
          }`}
        />
        <canvas
          ref={glCanvasRef}
          data-testid="lab-webgl-overlay"
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 block h-full w-full ${
            gpuFxEnabled && webglReady ? '' : 'hidden'
          }`}
        />
      </div>

      {/* =====================================================================
          2. FLOATING TOP GAME HUD (Ramping, Jernih, Melayang di Atas Taman)
         ===================================================================== */}
      <header className="pointer-events-none absolute inset-x-3 top-2.5 z-20 flex flex-wrap items-center justify-between gap-2 lg:flex-nowrap">
        {/* Kiri Atas: Beranda, Waktu & Hari, 3-Nyawa, Progres Kisah, & Kecepatan */}
        <div className="pointer-events-auto flex shrink-0 flex-wrap items-center gap-1.5 lg:flex-nowrap">
          <button
            type="button"
            onClick={() => {
              playSfx('klik');
              onBackToStart();
            }}
            aria-label={STRINGS.statusBar.backToStart}
            title={STRINGS.statusBar.backToStart}
            className="game-btn-round !h-9 !w-9 text-sm"
          >
            <span aria-hidden="true">🏠</span>
          </button>

          {/* Pil Hari & Jam Kampus dengan garis progres hari mungil */}
          <div className="hud-pill relative overflow-hidden">
            <span aria-hidden="true">{skyEmoji}</span>
            <span data-testid="sim-day" className="font-bold">
              Hari {clock.day}
            </span>
            <span className="opacity-40">·</span>
            <span data-testid="sim-time" className="font-mono-data font-bold text-[#9c4c1b]">
              {formattedTime}
            </span>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[3px] bg-[#3e2517]/15"
            >
              <span
                className="block h-full bg-[#e8a730]"
                style={{ width: `${Math.round(dayRatio * 100)}%` }}
              />
            </span>
          </div>

          {/* Lencana 3-Nyawa Kelas (Kalah bila 3 mahasiswa hilang 0%) */}
          <div
            data-testid="survival-lives-badge"
            title={`Kalah bila ${MAX_LOST_STUDENTS} mahasiswa kehabisan energi (0%) dan hilang`}
            className={`hud-pill ${
              lostStudentIds.length >= 2
                ? '!bg-gradient-to-b !from-[#e5594f] !to-[#c23b32] !text-[#fffdf6]'
                : lostStudentIds.length === 1
                  ? '!bg-gradient-to-b !from-[#ffe28a] !to-[#f3b53b] !text-[#3e2517]'
                  : ''
            }`}
          >
            <span aria-hidden="true" className="tracking-tight">
              {Array.from({ length: MAX_LOST_STUDENTS }, (_, idx) =>
                idx < lostStudentIds.length ? '🖤' : '❤️'
              ).join('')}
            </span>
            <span className="hidden sm:inline">
              {lostStudentIds.length}/{MAX_LOST_STUDENTS}
            </span>
          </div>

          {/* Pil Progres Kisah & Mahasiswa Aktif (klik langsung buka Jurnal) */}
          <button
            type="button"
            data-testid="mission-progress"
            onClick={() => {
              playSfx('klik');
              setJournalOpen(true);
            }}
            title="Buka Jurnal Koleksi Kisah Mahasiswa"
            className="hud-pill cursor-pointer !bg-gradient-to-b !from-[#3ba08e] !to-[#257466] !text-[#fffdf6] hover:brightness-105"
          >
            <span aria-hidden="true">📖</span>
            <span>
              {missionsDone}/{STUDENT_COUNT}
            </span>
            <span className="hidden opacity-60 xl:inline">·</span>
            <span data-testid="active-students-count" className="hidden xl:inline">
              👥 {activeStudentsCount}
            </span>
          </button>

          {/* Kapsul Kecepatan Simulasi */}
          <div
            role="group"
            aria-label={STRINGS.speedControls.speedPrefix}
            className="hud-speed-group"
          >
            {speedControls.map((ctl) => {
              const CtlIcon = SPEED_ICON_COMPONENTS[ctl.icon];
              return (
                <button
                  key={ctl.id}
                  type="button"
                  aria-label={ctl.label}
                  title={ctl.label}
                  aria-pressed={ctl.pressed}
                  onClick={() => {
                    playSfx('klik');
                    if (ctl.value === null) handleTogglePause();
                    else handleChangeSpeed(ctl.value as SimulationSpeed);
                  }}
                  className={`hud-speed-btn ${ctl.pressed ? 'hud-speed-btn--active' : ''}`}
                >
                  {ctl.value === null ? (
                    CtlIcon ? <CtlIcon className="h-3.5 w-3.5" /> : '⏸'
                  ) : (
                    <span>{ctl.value}x</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tengah Atas: Radar Sinyal Prioritas / Status Energi Lab */}
        <div className="pointer-events-auto order-3 flex min-w-0 flex-1 justify-center lg:order-2">
          {campusMission.topPriorityAgent ? (
            <button
              type="button"
              disabled={story.avatarMode !== 'idle'}
              onClick={() => {
                const target = campusMission.topPriorityAgent;
                if (!target) return;
                playSfx('klik');
                setSelectedAgentId(target.id);
                setSelectedZoneId(target.currentZoneId);
                setActiveDrawer(null);
                story.requestApproach(target.id);
              }}
              className="mission-alert-pill max-w-full cursor-pointer text-left disabled:cursor-not-allowed disabled:opacity-75"
              data-status={campusMission.campusStatus}
              data-testid="isolation-radar-alert"
              title={signalForStudent(campusMission.topPriorityAgent.id).clue}
            >
              <span className="shrink-0">
                {campusMission.campusStatus === 'darurat' ? '⚠ KRITIS' : '🔔 SINYAL'}
              </span>
              <span className="shrink-0 opacity-55">·</span>
              <span className="shrink-0">
                {campusMission.topPriorityAgent.name.split(' ')[0]} (
                {Math.round(campusMission.topPriorityAgent.energy * 100)}%)
              </span>
              <span className="hidden truncate font-normal italic opacity-95 2xl:inline">
                “{signalForStudent(campusMission.topPriorityAgent.id).clue}”
              </span>
              <span className="shrink-0 underline decoration-2 underline-offset-2">Hampiri →</span>
            </button>
          ) : (
            <div
              className="mission-alert-pill"
              data-status="terjaga"
              data-testid="isolation-radar-alert"
            >
              <span>✦ Energi Lab {campusMission.averageEnergyPct}%</span>
              <span className="opacity-55">·</span>
              <span>Semua Terjaga</span>
            </div>
          )}
        </div>

        {/* Kanan Atas: Cuaca Dinamis, Shader GPU HD-2D, Mode Pintu Konsultasi, Musik Kampus, Label, Grid, Panduan, Pengaturan */}
        <div className="pointer-events-auto order-2 flex shrink-0 items-center gap-1.5 lg:order-3">
          <button
            type="button"
            data-testid="toggle-weather-mode"
            onClick={() => {
              playSfx('klik');
              setWeatherMode((cur) =>
                cur === 'otomatis'
                  ? 'cerah'
                  : cur === 'cerah'
                    ? 'senja'
                    : cur === 'senja'
                      ? 'hujan'
                      : 'otomatis'
              );
            }}
            title="Siklus Cuaca & Atmosfer Pencahayaan Kampus (Otomatis / Cerah / Senja Keemasan / Hujan Cozy) [C]"
            className={`hud-pill cursor-pointer transition hover:-translate-y-0.5 ${
              weatherMode === 'hujan'
                ? '!bg-gradient-to-b !from-[#4a7aa8] !to-[#2d537a] !text-[#fffdf6]'
                : weatherMode === 'senja'
                  ? '!bg-gradient-to-b !from-[#f08e4b] !to-[#c25b22] !text-[#fffdf6]'
                  : weatherMode === 'cerah'
                    ? '!bg-gradient-to-b !from-[#ffe799] !to-[#f3b83c] !text-[#3e2517]'
                    : ''
            }`}
          >
            <span aria-hidden="true">
              {weatherMode === 'hujan'
                ? '🌧️'
                : weatherMode === 'senja'
                  ? '🌇'
                  : weatherMode === 'cerah'
                    ? '☀️'
                    : '🌤️'}
            </span>
            <span className="hidden xl:inline">
              {weatherMode === 'hujan'
                ? 'Hujan'
                : weatherMode === 'senja'
                  ? 'Senja'
                  : weatherMode === 'cerah'
                    ? 'Cerah'
                    : 'Cuaca'}
            </span>
          </button>

          <button
            type="button"
            data-testid="toggle-hd2d-gpu"
            aria-pressed={gpuFxEnabled}
            onClick={() => {
              playSfx('klik');
              setGpuFxEnabled((cur) => !cur);
            }}
            title="Shader GPU HD-2D WebGL2: Bloom Emisif, Tilt-Shift DoF, Volumetric God-Rays, & ACES Filmic Grading [G]"
            className={`hud-pill cursor-pointer transition hover:-translate-y-0.5 ${
              gpuFxEnabled
                ? '!bg-gradient-to-b !from-[#3ba08e] !to-[#1f6356] !text-[#fffdf6] shadow-[0_0_12px_rgba(59,160,142,0.55),0_3.5px_0_#3e2517]'
                : 'opacity-80'
            }`}
          >
            <span aria-hidden="true">✨</span>
            <span className="hidden sm:inline">HD-2D</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSfx('klik');
              handleUpdateViewOptions({
                consultationDoorMode: viewOptions.consultationDoorMode === 'lab' ? 'samping' : 'lab',
              });
            }}
            title={
              viewOptions.consultationDoorMode === 'lab'
                ? `${STRINGS.canvasToolbar.doorVisibilityHintLab} (Klik untuk ganti ke Pintu Samping)`
                : `${STRINGS.canvasToolbar.doorVisibilityHintSide} (Klik untuk ganti ke Pintu Lab)`
            }
            className={`hud-pill cursor-pointer transition hover:-translate-y-0.5 ${
              viewOptions.consultationDoorMode === 'samping'
                ? '!bg-gradient-to-b !from-[#3ba08e] !to-[#257466] !text-[#fffdf6]'
                : '!bg-gradient-to-b !from-[#ffe799] !to-[#f3b83c] !text-[#3e2517]'
            }`}
          >
            <IconDoor className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {viewOptions.consultationDoorMode === 'lab' ? 'Pintu Lab' : 'Pintu Samping'}
            </span>
          </button>

          {onToggleAudio && (
            <button
              type="button"
              onClick={onToggleAudio}
              aria-pressed={audioEnabled}
              aria-label={audioEnabled ? 'Matikan musik kampus & suara' : 'Nyalakan musik kampus & suara'}
              title={audioEnabled ? 'Musik Kampus & Suara Aktif' : 'Nyalakan Musik Kampus & Suara'}
              className="game-btn-round !h-9 !w-9 text-sm"
            >
              <span aria-hidden="true">{audioEnabled ? '🔊' : '🔇'}</span>
            </button>
          )}

          <button
            type="button"
            aria-pressed={viewOptions.showZoneLabels}
            aria-label={STRINGS.canvasToolbar.toggleLabels}
            title={STRINGS.canvasToolbar.toggleLabels}
            onClick={() => {
              playSfx('klik');
              handleUpdateViewOptions({ showZoneLabels: !viewOptions.showZoneLabels });
            }}
            className="game-btn-round !h-9 !w-9"
          >
            <IconTag className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-pressed={viewOptions.showGrid}
            aria-label={STRINGS.canvasToolbar.toggleGrid}
            title={STRINGS.canvasToolbar.toggleGrid}
            onClick={() => {
              playSfx('klik');
              handleUpdateViewOptions({ showGrid: !viewOptions.showGrid });
            }}
            className="game-btn-round hidden !h-9 !w-9 sm:inline-flex"
          >
            <IconGrid className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Panduan Shift Pagi"
            title="Panduan Shift Pagi"
            onClick={() => {
              playSfx('klik');
              setBriefingOpen(true);
            }}
            className="game-btn-round !h-9 !w-9 font-['Fredoka'] text-xs font-bold"
          >
            ?
          </button>

          <button
            type="button"
            aria-label={STRINGS.statusBar.settingsQuick}
            title={STRINGS.statusBar.settingsQuick}
            onClick={() => {
              playSfx('klik');
              onOpenSettings();
            }}
            className="game-btn-round !h-9 !w-9"
          >
            <IconSettings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* =====================================================================
          3. FLOATING BOTTOM-CENTER TOASTS, WALKING BANNER & ONBOARDING TIP
         ===================================================================== */}
      {lostAlertToast && (
        <div
          role="alert"
          className="fx-panel-in absolute bottom-24 left-1/2 z-30 flex max-w-[92%] -translate-x-1/2 items-center gap-2 rounded-full border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#e05248] to-[#b8322a] px-4 py-1.5 font-['Fredoka'] text-xs font-bold text-[#fffdf6] shadow-[0_4px_0_#3e2517]"
        >
          <span>{lostAlertToast}</span>
        </div>
      )}

      {celebrationToast && (
        <div
          role="status"
          className="fx-panel-in absolute bottom-20 left-1/2 z-30 flex max-w-[92%] -translate-x-1/2 items-center gap-2 rounded-full border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#ffe799] to-[#f4b93c] px-4 py-1.5 font-['Fredoka'] text-xs font-bold text-[#3e2517] shadow-[0_4px_0_#3e2517]"
        >
          <span>{celebrationToast}</span>
          <button
            type="button"
            onClick={() => {
              playSfx('klik');
              setCelebrationToast(null);
              setDecorShopOpen(true);
            }}
            className="cursor-pointer rounded-full border border-[#3e2517] bg-[#fffdf6] px-2.5 py-0.5 text-[11px] font-bold text-[#3e2517] hover:bg-[#fff4d4]"
          >
            Hias →
          </button>
        </div>
      )}

      {(story.avatarMode === 'menuju-mahasiswa' || story.avatarMode === 'berdua-ke-bk') && (
        <div
          role="status"
          data-testid="story-status"
          className="hud-onboarding-tip absolute bottom-4 left-1/2 z-20 -translate-x-1/2"
        >
          <span>
            {story.avatarMode === 'menuju-mahasiswa'
              ? '🚶 Ibu Dosen sedang menghampiri mahasiswa...'
              : '🤝 Berjalan bersama menuju Ruang Konsultasi...'}
          </span>
        </div>
      )}

      {showFirstTimePrompt && (
        <div
          role="status"
          className="hud-onboarding-tip pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 md:inline-flex"
        >
          <span>✨ Klik mahasiswa bertanda (!) di peta untuk menghampiri &amp; mulai sesi!</span>
        </div>
      )}

      {/* =====================================================================
          4. FLOATING BOTTOM-LEFT CONTEXTUAL INSPECTOR CARD (OR SLIM LEGEND)
         ===================================================================== */}
      <div className="pointer-events-none absolute bottom-3.5 left-3.5 z-20 max-w-[min(31rem,calc(100vw-18rem))]">
        {selectedAgentSnapshot ? (
          <div
            className="hud-inspector-card fx-panel-in pointer-events-auto"
            data-testid="agent-inspector-bar"
          >
            <div className="flex items-center gap-3">
              {/* Potret mahasiswa */}
              <div
                className="relative h-[76px] w-[60px] shrink-0 overflow-hidden rounded-2xl border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#d8ecfa] via-[#f0f5e8] to-[#f8e6c8] shadow-[0_3px_0_#3e2517]"
                style={{ lineHeight: 0 }}
              >
                <div className="h-full w-full [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:object-contain [&>canvas]:object-bottom [&>img]:!h-full [&>img]:!w-full">
                  <PixelPortrait
                    studentId={selectedAgentSnapshot.id}
                    name={selectedAgentSnapshot.name}
                    expression="netral"
                    scale={1}
                    reducedMotion={reducedMotion}
                    demographicLabel={selectedAgentSnapshot.demographicLabel}
                  />
                </div>
              </div>

              {/* Info + Meter + Aksi */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate font-['Fredoka'] text-sm font-bold text-[#3e2517]">
                        {selectedAgentSnapshot.name}
                      </span>
                      <span className="rounded-full border border-[#3e2517]/35 bg-[#e6f7f2] px-2 py-0.5 font-['Fredoka'] text-[10px] font-bold text-[#1e6a5d]">
                        {STRINGS.agentInspector.activityNames[selectedAgentSnapshot.status]}
                      </span>
                      <span className="rounded-full border border-[#3e2517]/35 bg-[#fff2d2] px-2 py-0.5 font-['Fredoka'] text-[10px] font-bold text-[#8a4f16]">
                        {STRINGS.agentInspector.socialNames[selectedAgentSnapshot.socialStatus]}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] italic text-[#6b482e]">
                      🔔 “{signalForStudent(selectedAgentSnapshot.id).clue}”
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={STRINGS.agentInspector.closeAgent}
                    onClick={() => {
                      playSfx('klik');
                      setSelectedAgentId(null);
                    }}
                    className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-[#3e2517] bg-[#fff5dc] font-['Fredoka'] text-xs font-bold text-[#3e2517] hover:bg-[#ffe199]"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 rounded-xl border border-[#3e2517]/25 bg-[#fffdf7] px-2 py-1 text-[11px]">
                    {selectedMeters.energy && (
                      <GameMeter
                        label={STRINGS.agentInspector.energyLabel}
                        icon={<IconEnergi className="h-3.5 w-3.5" />}
                        value={selectedMeters.energy.value}
                        max={selectedMeters.energy.max}
                        higherIsBetter={selectedMeters.energy.higherIsBetter}
                      />
                    )}
                    {selectedMeters.stress && (
                      <GameMeter
                        label={STRINGS.agentInspector.stressLabel}
                        icon={<IconStres className="h-3.5 w-3.5" />}
                        value={selectedMeters.stress.value}
                        max={selectedMeters.stress.max}
                        higherIsBetter={selectedMeters.stress.higherIsBetter}
                      />
                    )}
                  </div>
                  <GameButton
                    variant="primer"
                    size="sm"
                    bounce
                    onClick={() => {
                      playSfx('klik');
                      setActiveDrawer(null);
                      story.requestApproach(selectedAgentSnapshot.id);
                    }}
                    aria-label={STRINGS.story.approachAria(selectedAgentSnapshot.name)}
                    className="!min-h-[1.95rem] whitespace-nowrap !px-3.5 text-xs"
                  >
                    {STRINGS.story.approachBtn} →
                  </GameButton>
                </div>
              </div>
            </div>
          </div>
        ) : selectedZone ? (
          <div className="hud-inspector-card fx-panel-in pointer-events-auto">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border-2 border-[#3e2517] bg-[#ffe694] px-2.5 py-0.5 font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                    📍 {selectedZone.label}
                  </span>
                  <span className="rounded-full border border-[#3e2517]/30 bg-[#fffdf7] px-2 py-0.5 font-['Fredoka'] text-[10px] font-bold text-[#3e2517]">
                    🔒 Privasi{' '}
                    {Math.round(
                      getEffectiveZonePrivacy(
                        selectedZone.id,
                        selectedZone.privacy,
                        viewOptions.consultationDoorMode
                      ) * 100
                    )}
                    %
                  </span>
                  <span className="rounded-full border border-[#3e2517]/30 bg-[#fffdf7] px-2 py-0.5 font-['Fredoka'] text-[10px] font-bold text-[#3e2517]">
                    👥 Kapasitas {selectedZone.capacity}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#5d3d26]">
                  {selectedZone.id === 'konsultasi'
                    ? viewOptions.consultationDoorMode === 'lab'
                      ? STRINGS.canvasToolbar.doorVisibilityHintLab
                      : STRINGS.canvasToolbar.doorVisibilityHintSide
                    : selectedZone.description}
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup info ruangan"
                onClick={() => {
                  playSfx('klik');
                  setSelectedZoneId(null);
                }}
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-[#3e2517] bg-[#fff5dc] font-['Fredoka'] text-xs font-bold text-[#3e2517] hover:bg-[#ffe199]"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="hud-pill pointer-events-none hidden text-[11px] sm:inline-flex"
          >
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full border border-[#3e2517] bg-[#36ab81]" />
              Mengobrol (+)
            </span>
            <span className="opacity-35">·</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full border border-[#3e2517] bg-[#f2ae30]" />
              Waspada
            </span>
            <span className="opacity-35">·</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full border border-[#3e2517] bg-[#e5534b]" />
              Terisolasi (&lt;35%)
            </span>
          </div>
        )}
      </div>

      {/* =====================================================================
          5. FLOATING BOTTOM-RIGHT PLAY-STORE ICON DOCK (4 TOMBOL TAKTIL)
         ===================================================================== */}
      <nav
        aria-label="Dok Menu Konselor"
        className="pointer-events-auto absolute bottom-3.5 right-3.5 z-20 flex items-end gap-2"
      >
        <button
          type="button"
          aria-pressed={activeDrawer === 'misi'}
          title="Daftar Misi & Energi Mahasiswa [M]"
          onClick={() => toggleDrawer('misi')}
          className={`hud-dock-btn ${activeDrawer === 'misi' ? 'hud-dock-btn--active' : ''}`}
        >
          {campusMission.criticalAgents.length > 0 ? (
            <span className="hud-dock-badge hud-dock-badge--danger">
              {campusMission.criticalAgents.length}
            </span>
          ) : campusMission.warningAgents.length > 0 ? (
            <span className="hud-dock-badge hud-dock-badge--warn">
              {campusMission.warningAgents.length}
            </span>
          ) : null}
          <span aria-hidden="true" className="text-xl leading-none">
            🎯
          </span>
          <span className="hud-dock-label">Misi</span>
        </button>

        <button
          type="button"
          aria-pressed={activeDrawer === 'sosiogram'}
          title="Peta Relasi & Sosiogram [R]"
          onClick={() => toggleDrawer('sosiogram')}
          className={`hud-dock-btn ${activeDrawer === 'sosiogram' ? 'hud-dock-btn--active' : ''}`}
        >
          <span aria-hidden="true" className="text-xl leading-none">
            🕸️
          </span>
          <span className="hud-dock-label">Relasi</span>
        </button>

        <button
          type="button"
          aria-pressed={activeDrawer === 'catatan' || activeDrawer === 'pengamatan'}
          title="Buku Pengamatan, Catatan & Pustaka [B]"
          onClick={() =>
            toggleDrawer(
              activeDrawer === 'catatan' || activeDrawer === 'pengamatan' ? activeDrawer : 'catatan'
            )
          }
          className={`hud-dock-btn ${
            activeDrawer === 'catatan' || activeDrawer === 'pengamatan'
              ? 'hud-dock-btn--active'
              : ''
          }`}
        >
          <span className="hud-dock-badge hud-dock-badge--teal">
            {missionsDone}/{STUDENT_COUNT}
          </span>
          <span aria-hidden="true" className="text-xl leading-none">
            📓
          </span>
          <span className="hud-dock-label">Buku</span>
        </button>

        <button
          type="button"
          data-testid="open-decor-shop-btn"
          onClick={() => {
            playSfx('klik');
            setDecorShopOpen(true);
          }}
          title="Hias Ruang Konsultasi BK dengan Bintang Empati [H]"
          className="hud-dock-btn hud-dock-btn--gold"
        >
          <span
            className={`hud-dock-badge ${
              canBuyAnyDecor ? 'hud-dock-badge--danger' : 'hud-dock-badge--gold'
            }`}
          >
            ⭐{availableStars}
          </span>
          <span aria-hidden="true" className="text-xl leading-none">
            🪴
          </span>
          <span className="hud-dock-label">Hias</span>
        </button>
      </nav>

      {/* =====================================================================
          6. ON-DEMAND FLOATING COUNSELOR DRAWER (HANYA MUNCUL SAAT DOK DIKLIK)
         ===================================================================== */}
      {activeDrawer && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setActiveDrawer(null)}
            className="fixed inset-0 z-[25] bg-[#2c1a0e]/24"
          />
          <aside
            aria-label="Panel Konselor"
            className="hud-drawer fx-panel-in fixed bottom-[5.8rem] right-3.5 top-[4.4rem] z-30 flex w-[min(25rem,92vw)] flex-col overflow-hidden"
          >
            {/* Header kayu hangat + tombol tutup */}
            <div className="flex shrink-0 items-center justify-between border-b-[3px] border-[#3e2517] bg-gradient-to-b from-[#a76940] to-[#874f2d] px-3.5 py-2">
              <GameRibbon level={2} tone="navy" shine>
                Panel Konselor
              </GameRibbon>
              <button
                type="button"
                aria-label="Tutup Panel Konselor"
                onClick={() => {
                  playSfx('klik');
                  setActiveDrawer(null);
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-[#3e2517] bg-[#fff5dc] font-['Fredoka'] text-xs font-bold text-[#3e2517] shadow-[0_2px_0_#3e2517] hover:bg-[#ffe199]"
              >
                ✕
              </button>
            </div>

            {/* 4 Tab Buku Konselor */}
            <div
              role="tablist"
              aria-label="Menu Panel Konselor"
              className="grid shrink-0 grid-cols-4 items-end gap-1 border-b-[3px] border-[#3e2517] bg-[#f4e4c5] px-1.5 pt-2 [&>button]:min-w-0 [&>button]:justify-center [&>button]:!px-1 [&>button]:!text-[0.68rem]"
            >
              {STRINGS.tabs.list.map((tab) => {
                const TabIcon = TAB_ICON_COMPONENTS[tab.id];
                return (
                  <GameTab
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    controls={`panel-${tab.id}`}
                    selected={activeDrawer === tab.id}
                    onClick={() => {
                      playSfx('klik');
                      setActiveDrawer(tab.id);
                    }}
                    icon={<TabIcon className="h-3.5 w-3.5 shrink-0" />}
                  >
                    {STRINGS.gameTabs[tab.id]}
                  </GameTab>
                );
              })}
            </div>

            {/* Konten Tab */}
            <div
              id={`panel-${activeDrawer}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeDrawer}`}
              className="flex-1 overflow-y-auto bg-[#fffdf5] p-2.5"
            >
              {activeDrawer === 'pengamatan' ? (
                <ObservationPanel
                  agents={agentsSnapshot}
                  observationLog={observationLog}
                  currentDay={clock.day}
                  currentTimeFormatted={formattedTime}
                  selectedAgentId={selectedAgentId}
                  onSelectAgent={(id) => {
                    setSelectedAgentId(id);
                    if (id) {
                      const found = worldRef.current.agents.find((a) => a.id === id);
                      if (found) setSelectedZoneId(found.currentZoneId);
                    }
                  }}
                  anecdotalRecords={anecdotalRecords}
                  onAddAnecdotalRecord={handleAddAnecdotalRecord}
                />
              ) : activeDrawer === 'sosiogram' ? (
                <SociogramPanel
                  agents={agentsSnapshot}
                  snapshots={sociometrySnapshots}
                  livePreviewSnapshot={livePreviewSnapshot}
                  observationLog={observationLog}
                  currentDay={clock.day}
                  currentTimeFormatted={formattedTime}
                  selectedAgentId={selectedAgentId}
                  onSelectAgent={(id) => {
                    setSelectedAgentId(id);
                    if (id) {
                      const found = worldRef.current.agents.find((a) => a.id === id);
                      if (found) setSelectedZoneId(found.currentZoneId);
                    }
                  }}
                  hypotheses={hypotheses}
                  onAddHypothesis={handleAddHypothesis}
                />
              ) : activeDrawer === 'misi' ? (
                <MissionPanel
                  agents={agentsSnapshot}
                  missions={story.missions}
                  avatarMode={story.avatarMode}
                  activeAgentId={story.activeAgentId}
                  observationLog={observationLog}
                  currentDay={clock.day}
                  availableStars={availableStars}
                  lostAgentIds={lostStudentSet}
                  onOpenDecorShop={() => {
                    playSfx('klik');
                    setDecorShopOpen(true);
                  }}
                  onOpenJournal={() => {
                    playSfx('klik');
                    setJournalOpen(true);
                  }}
                  onOpenShiftReport={() => {
                    playSfx('klik');
                    setShiftReportOpen(true);
                  }}
                  onApproach={(id) => {
                    setSelectedAgentId(id);
                    setActiveDrawer(null);
                    story.requestApproach(id);
                  }}
                  onFollowUp={(id) => {
                    setSelectedAgentId(id);
                    setActiveDrawer(null);
                    story.startFollowUp(id);
                  }}
                />
              ) : (
                <div className="space-y-3.5 text-xs text-[#3e2517]" data-testid="counselor-notes-panel">
                  <div className="rounded-2xl border-2 border-[#3e2517] bg-gradient-to-b from-[#fffdf7] to-[#f8ecd2] p-3.5 shadow-[0_4px_0_#3e2517]">
                    <h2 className="font-['Fredoka'] text-sm font-bold text-[#3e2517]">
                      📓 {STRINGS.tabs.placeholders[activeDrawer].title}
                    </h2>
                    <p className="mt-1 leading-relaxed text-[#6b482e]">
                      Ringkasan lengkap seluruh kisah terungkap, catatan anekdot, dan hipotesis relasi mahasiswa di laboratorium.
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl border-2 border-[#3e2517]/30 bg-[#fffdf7] p-2">
                        <div className="font-['Fredoka'] text-base font-bold text-[#2e8274]">
                          {missionsDone}/{STUDENT_COUNT}
                        </div>
                        <div className="text-[10px] font-semibold text-[#6b482e]">Kisah</div>
                      </div>
                      <div className="rounded-xl border-2 border-[#3e2517]/30 bg-[#fffdf7] p-2">
                        <div className="font-['Fredoka'] text-base font-bold text-[#c6453c]">
                          {anecdotalRecords.length}
                        </div>
                        <div className="text-[10px] font-semibold text-[#6b482e]">Anekdot</div>
                      </div>
                      <div className="rounded-xl border-2 border-[#3e2517]/30 bg-[#fffdf7] p-2">
                        <div className="font-['Fredoka'] text-base font-bold text-[#b87314]">
                          {hypotheses.length}
                        </div>
                        <div className="text-[10px] font-semibold text-[#6b482e]">Hipotesis</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <GameButton
                        variant="primer"
                        size="sm"
                        onClick={() => {
                          playSfx('klik');
                          setJournalOpen(true);
                        }}
                      >
                        📖 Buka Jurnal ({missionsDone}/{STUDENT_COUNT})
                      </GameButton>
                      <GameButton
                        variant="sekunder"
                        size="sm"
                        onClick={() => {
                          playSfx('klik');
                          setDecorShopOpen(true);
                        }}
                      >
                        🪴 Hias Ruang · ⭐ {availableStars}
                      </GameButton>
                      {onOpenTheory && (
                        <GameButton
                          variant="sekunder"
                          size="sm"
                          onClick={() => {
                            playSfx('klik');
                            onOpenTheory();
                          }}
                        >
                          📚 Landasan Psikologi
                        </GameButton>
                      )}
                    </div>
                  </div>

                  {/* Daftar Kisah Terungkap */}
                  <section className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fffdf7] p-3">
                    <h3 className="font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                      ✦ Kisah Mahasiswa Terungkap ({missionsDone})
                    </h3>
                    {missionsDone === 0 ? (
                      <p className="mt-1.5 text-[11px] text-[#6b482e]">
                        Belum ada kisah yang terbuka. Hampiri mahasiswa di peta atau lewat tab Misi untuk mulai mendengarkan.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-1.5">
                        {agentsSnapshot
                          .filter((a) => story.missions[a.id]?.status === 'selesai')
                          .map((a) => (
                            <li
                              key={a.id}
                              className="rounded-xl border border-[#3e2517]/20 bg-[#fff7de] px-2.5 py-2"
                            >
                              <div className="font-['Fredoka'] font-bold text-[#3e2517]">{a.name}</div>
                              <div className="text-[11px] font-semibold text-[#7a4b10]">
                                “{signalForStudent(a.id).unlockedTitle}”
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </section>

                  {/* Catatan Anekdot Terbaru */}
                  <section className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fffdf7] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                        📝 Catatan Anekdot ({anecdotalRecords.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveDrawer('pengamatan')}
                        className="cursor-pointer font-['Fredoka'] text-[11px] font-bold text-[#2e8274] underline"
                      >
                        Tambah di Pengamatan →
                      </button>
                    </div>
                    {anecdotalRecords.length === 0 ? (
                      <p className="mt-1.5 text-[11px] text-[#6b482e]">
                        Belum ada catatan anekdot tersimpan.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-1.5">
                        {anecdotalRecords.slice(0, 5).map((rec) => (
                          <li
                            key={rec.id}
                            className="rounded-xl border border-[#3e2517]/15 bg-[#fffaf0] px-2.5 py-1.5 text-[11px]"
                          >
                            <div className="font-bold text-[#3e2517]">
                              {rec.agentName}{' '}
                              <span className="font-normal text-[#7a5234]">
                                ({rec.dateLabel} · {rec.timeLabel})
                              </span>
                            </div>
                            <p className="mt-0.5 text-[#5c3d26]">{rec.observedFact}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {/* Hipotesis Relasi Terbaru */}
                  <section className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fffdf7] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                        🔎 Hipotesis Sosiometri ({hypotheses.length})
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveDrawer('sosiogram')}
                        className="cursor-pointer font-['Fredoka'] text-[11px] font-bold text-[#2e8274] underline"
                      >
                        Buka Sosiogram →
                      </button>
                    </div>
                    {hypotheses.length === 0 ? (
                      <p className="mt-1.5 text-[11px] text-[#6b482e]">
                        Belum ada hipotesis relasi yang dicatat.
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-1.5">
                        {hypotheses.slice(0, 5).map((h) => (
                          <li
                            key={h.id}
                            className="rounded-xl border border-[#3e2517]/15 bg-[#fffaf0] px-2.5 py-1.5 text-[11px]"
                          >
                            <div className="font-bold text-[#3e2517]">
                              {h.agentName}{' '}
                              <span className="font-normal text-[#7a5234]">
                                · Keyakinan {h.confidence}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[#5c3d26]">{h.hypothesisText}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* =====================================================================
          7. OVERLAYS & MODALS (StoryScreen VN, Survival, Debrief, Briefing, dll.)
         ===================================================================== */}
      {story.storyState &&
        story.graph &&
        story.agent &&
        story.storyVisible &&
        !story.debriefProps &&
        survivalSummary.status !== 'kalah' && (
          <div className="fixed inset-0 z-[60]" data-testid="story-overlay">
            <StoryScreen
              graph={story.graph}
              agent={story.agent}
              state={story.storyState}
              arrival={story.arrival}
              onChoose={story.chooseStoryChoice}
              onSave={story.saveStory}
              onLoad={story.loadStory}
              onEndSession={story.finishStoryEarly}
              onViewDebrief={story.viewDebrief}
              onReturnToLab={story.finishAndReturnToLab}
              reducedMotion={reducedMotion}
              statusMessage={story.statusMessage}
              roster={agentsSnapshot}
              missions={story.missions}
              sceneVariant={storySceneVariant}
              equippedDecor={roomDecor.equippedIds}
              lastChoiceFeedback={story.lastChoiceFeedback}
              turnResults={story.turnResults}
              otherCriticalAgent={otherCriticalAgent}
              lostCount={lostStudentIds.length}
              maxLost={MAX_LOST_STUDENTS}
              audioEnabled={audioEnabled}
              onToggleAudio={onToggleAudio}
            />
          </div>
        )}

      {(survivalSummary.status === 'kalah' ||
        (survivalSummary.status === 'menang' && !victoryDismissed)) && (
        <SurvivalResultModal
          summary={survivalSummary}
          lostAgents={lostAgentsList}
          reducedMotion={reducedMotion}
          onRestart={handleRestartRun}
          onContinueExplore={
            survivalSummary.status === 'menang' ? () => setVictoryDismissed(true) : undefined
          }
        />
      )}

      {story.debriefProps && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="debrief-overlay"
          className="fixed inset-0 z-[70] overflow-y-auto bg-[#eadbc2] p-3 sm:p-6"
        >
          <DebriefDashboard
            props={story.debriefProps}
            onRevealRequest={handleStoryDebriefReveal}
            onRequestReplay={handleStoryDebriefReplay}
            onClose={story.closeDebrief}
          />
        </div>
      )}

      {briefingOpen && (
        <MorningBriefingModal
          onStartShift={() => {
            playSfx('klik');
            setBriefingOpen(false);
          }}
        />
      )}

      {journalOpen && (
        <StoryJournalModal
          agents={agentsSnapshot}
          missions={story.missions}
          reducedMotion={reducedMotion}
          canApproach={story.avatarMode === 'idle'}
          onApproach={(id) => {
            setSelectedAgentId(id);
            setActiveDrawer(null);
            story.requestApproach(id);
          }}
          onClose={() => setJournalOpen(false)}
        />
      )}

      {shiftReportOpen && (
        <ShiftReportModal
          report={shiftReport}
          agents={agentsSnapshot}
          reducedMotion={reducedMotion}
          onOpenJournal={() => setJournalOpen(true)}
          onClose={() => setShiftReportOpen(false)}
        />
      )}

      {decorShopOpen && (
        <RoomDecorModal
          decor={roomDecor}
          missions={story.missions}
          onBuy={handleBuyDecor}
          onToggleEquip={handleToggleEquipDecor}
          onClose={() => setDecorShopOpen(false)}
        />
      )}

      <DevPanel
        isOpen={devPanelOpen}
        seed={seed}
        clock={clock}
        viewOptions={viewOptions}
        selectedTestZoneId={selectedTestZoneId}
        devPathTest={devPathTest}
        worldSummary={worldSummary}
        activeEvents={activeEvents}
        randomSessionsAudit={randomSessionsAudit}
        onClose={() => setDevPanelOpen(false)}
        onChangeSeed={onChangeSeed}
        onTogglePause={handleTogglePause}
        onChangeSpeed={handleChangeSpeed}
        onUpdateViewOptions={handleUpdateViewOptions}
        onSelectTestZone={setSelectedTestZoneId}
        onRunPathTest={handleRunPathTest}
        onClearPathTest={handleClearPathTest}
        onPrintSociometryDebug={handlePrintSociometryDebug}
        onAdvanceOneDay={handleAdvanceOneDay}
        onRun100RandomSessions={handleRun100RandomSessions}
      />
    </div>
  );
};
