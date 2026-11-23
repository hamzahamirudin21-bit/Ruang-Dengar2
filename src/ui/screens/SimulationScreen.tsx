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
  ConsultationDoorMode,
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
  findZoneAtTile,
  renderLabCanvas,
  screenToTile,
} from '../canvas/labRenderer';
import { clampCamera, coverFillScale, followCamera } from '../world/cameraFollow';
import {
  IconBintang,
  IconEnergi,
  IconIkuti,
  IconJam,
  IconJeda,
  IconKalender,
  IconKecepatan,
  IconLog,
  IconObrolan,
  IconOrang,
  IconPutar,
  IconRelasi,
  IconStres,
  IconTelinga,
} from '../components/GameIcons';
import {
  GameBadge,
  GameButton,
  GameFrame,
  GameMeter,
  GameRibbon,
  GameTab,
} from '../components/game';
import type { HudBadgeKey, HudIconId } from '../components/game/hudIcons';
import { PixelPortrait } from '../characters/PixelPortrait';
import { playSfx } from '../motion/sfx';
import { buildHudBadges, buildSelectedMeters, buildSpeedControls } from './hudModel';
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

const HUD_ICON_COMPONENTS: Record<HudIconId, React.FC<{ className?: string }>> = {
  bintang: IconBintang,
  jam: IconJam,
  kalender: IconKalender,
  orang: IconOrang,
  energi: IconEnergi,
  jeda: IconJeda,
  putar: IconPutar,
  kecepatan: IconKecepatan,
  telinga: IconTelinga,
  obrolan: IconObrolan,
  stres: IconStres,
};

const TAB_ICON_COMPONENTS: Record<CounselorTabId, React.FC<{ className?: string }>> = {
  pengamatan: IconTelinga,
  sosiogram: IconRelasi,
  catatan: IconLog,
  misi: IconBintang,
};

const HUD_BADGE_TONES: Partial<Record<HudBadgeKey, 'emas' | 'merah' | 'navy' | 'krem'>> = {
  hari: 'emas',
  'jam-lab': 'krem',
  'misi-selesai': 'merah',
  'mahasiswa-aktif': 'navy',
};

const HUD_BADGE_TESTIDS: Partial<Record<HudBadgeKey, string>> = {
  hari: 'sim-day',
  'jam-lab': 'sim-time',
  'misi-selesai': 'mission-progress',
  'mahasiswa-aktif': 'active-students-count',
};


interface SimulationScreenProps {
  initialClock: ClockState;
  seed: number;
  reducedMotion: boolean;
  onChangeSeed: (nextSeed: number) => void;
  onOpenSettings: () => void;
  onBackToStart: () => void;
}

export const SimulationScreen: React.FC<SimulationScreenProps> = ({
  initialClock,
  seed,
  reducedMotion,
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

  const [activeTab, setActiveTab] = useState<CounselorTabId>('misi');
  const [briefingOpen, setBriefingOpen] = useState<boolean>(true);
  const briefingOpenRef = useRef<boolean>(true);
  const [journalOpen, setJournalOpen] = useState<boolean>(false);
  const [shiftReportOpen, setShiftReportOpen] = useState<boolean>(false);
  const [decorShopOpen, setDecorShopOpen] = useState<boolean>(false);
  const [roomDecor, setRoomDecor] = useState<RoomDecorState>(() => loadRoomDecorState());
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
  }, [roomDecor]);

  useEffect(() => {
    briefingOpenRef.current = briefingOpen;
  }, [briefingOpen]);
  const [viewOptions, setViewOptions] = useState<CanvasViewOptions>({
    showGrid: false,
    showZoneLabels: true,
    consultationDoorMode: 'lab',
  });
  const [selectedZoneId, setSelectedZoneId] = useState<ZoneType | null>('konsultasi');
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
  const cameraRef = useRef<CameraTransform>({ offsetX: 16, offsetY: 16, scale: 1 });
  const stageSizeRef = useRef<{ width: number; height: number }>({ width: 900, height: 600 });
  const userMovedCameraRef = useRef<boolean>(false);
  const [followAvatar, setFollowAvatar] = useState<boolean>(true);
  const followRef = useRef<boolean>(true);
  const cameraInitedRef = useRef<boolean>(false);
  const avatarWorldPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const needsRedrawRef = useRef<boolean>(true);
  const lastDrawTimeRef = useRef<number>(0);
  const clickRippleRef = useRef<ClickRippleState | null>(null);
  const timeSecRef = useRef<number>(0);

  const dragRef = useRef<{
    dragging: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    origOffsetX: number;
    origOffsetY: number;
  }>({
    dragging: false,
    moved: false,
    startX: 0,
    startY: 0,
    origOffsetX: 0,
    origOffsetY: 0,
  });

  const viewOptionsRef = useRef<CanvasViewOptions>(viewOptions);
  const hoveredZoneRef = useRef<ZoneType | null>(hoveredZoneId);
  const selectedZoneRef = useRef<ZoneType | null>(selectedZoneId);
  const selectedAgentRef = useRef<string | null>(selectedAgentId);
  const hoveredAgentRef = useRef<string | null>(hoveredAgentId);
  const reducedMotionRef = useRef<boolean>(reducedMotion);
  // Lapisan cerita: diperbarui tiap render, dibaca oleh loop frame.
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
  }, [reducedMotion]);

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

  // Sinkronkan dataset.state pada body untuk pemantauan status & pengujian
  useEffect(() => {
    document.body.dataset.state = clock.paused ? 'paused' : 'playing';
  }, [clock.paused]);

  // Pintasan keyboard Ctrl+Shift+D untuk membuka/menutup Panel Dev & Esc menutup modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDevPanelOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setJournalOpen(false);
        setShiftReportOpen(false);
        setDecorShopOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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

  const setFollow = useCallback((on: boolean) => {
    followRef.current = on;
    setFollowAvatar(on);
    needsRedrawRef.current = true;
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

  // Jika mode pintu berubah saat ada jejak uji aktif, hitung ulang A* dari posisi saat ini
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

  // ResizeObserver untuk menjaga ketajaman DPI kanvas tanpa memicu remount
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
      const av = storyRef.current?.avatarRef.current.position;
      if (av) {
        avatarWorldPosRef.current = {
          x: (av.x + 0.5) * LAB_MAP.tileSizePx,
          y: (av.y + 0.5) * LAB_MAP.tileSizePx,
        };
      }
      const scale = coverFillScale(vp, LAB_MAP);
      if (!cameraInitedRef.current) {
        cameraInitedRef.current = true;
        cameraRef.current = followCamera(
          { offsetX: 0, offsetY: 0, scale },
          avatarWorldPosRef.current,
          vp,
          LAB_MAP,
          0,
          true
        );
      } else if (followRef.current) {
        cameraRef.current = followCamera(
          { ...cameraRef.current, scale },
          avatarWorldPosRef.current,
          vp,
          LAB_MAP,
          0,
          true
        );
      } else {
        cameraRef.current = clampCamera({ ...cameraRef.current, scale }, vp, LAB_MAP);
      }
      needsRedrawRef.current = true;
    };

    updateCanvasSize();
    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Loop simulasi utama (dunia seluruh agen mahasiswa + jam + animasi jejak uji + render Canvas 2D)
  useEffect(() => {
    let rafId = 0;
    let lastTimestamp = performance.now();

    let lastAnimTick = animationTick(0);
    const frame = (now: number) => {
      const rawDt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.05);

      // 1. Majukan dunia seluruh agen mahasiswa & jam simulasi (waktu tetap berjalan saat mengobrol; jeda hanya saat briefing/hasil akhir)
      const prevWorld = worldRef.current;
      let walkingDirty = false;
      if (!prevWorld.clock.paused && !briefingOpenRef.current && !survivalOverRef.current) {
        const nextWorld = advanceWorld(prevWorld, dt, LAB_MAP, navGridRef.current, {
          inSessionAgentIds: inSessionIdsRef.current,
          lostAgentIds: lostIdsRef.current,
          stabilizedAgentIds: stabilizedIdsRef.current,
        });
        worldRef.current = nextWorld;

        // Deteksi mahasiswa yang baru saja kehabisan energi (0%) -> hilang dari kelas
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

        // Gambar ulang saat tick berubah (langsung) atau saat ada agen berjalan (dibatasi ~30fps)
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
            // Mode misi: tanpa modal ringkasan hari dan tanpa pause; janji yang
            // lewat tenggat kedaluwarsa pada pergantian hari.
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

      // 1b. Majukan avatar Dosen BK (menuju mahasiswa / berdua ke Ruang BK)
      const storyApi = storyRef.current;
      if (storyApi) {
        const modeBefore = storyApi.avatarRef.current.mode;
        if (modeBefore !== 'idle' && modeBefore !== 'dalam-cerita') {
          storyApi.advanceFrame(dt);
          walkingDirty = true;
        }
        if (storyMarkerIdsRef.current.length > 0 && !reducedMotionRef.current) {
          walkingDirty = true; // penanda misi naik turun halus
        }
      }

      // 1c. Kamera mengikuti avatar Dosen BK
      if (storyApi) {
        const av = storyApi.avatarRef.current.position;
        const target = {
          x: (av.x + 0.5) * LAB_MAP.tileSizePx,
          y: (av.y + 0.5) * LAB_MAP.tileSizePx,
        };
        avatarWorldPosRef.current = target;
        if (followRef.current && !dragRef.current.dragging) {
          const cam = cameraRef.current;
          const next = followCamera(
            cam,
            target,
            stageSizeRef.current,
            LAB_MAP,
            dt,
            reducedMotionRef.current
          );
          if (
            Math.abs(next.offsetX - cam.offsetX) > 0.01 ||
            Math.abs(next.offsetY - cam.offsetY) > 0.01 ||
            next.scale !== cam.scale
          ) {
            cameraRef.current = next;
            needsRedrawRef.current = true;
          }
        }
      }

      // 2. Majukan penanda uji A* jika aktif
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
      lastAnimTick = animTick;
      // 3. Render Canvas 2D hanya saat diperlukan (~30fps saat berjalan, instan saat interaksi)
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
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origOffsetX: cameraRef.current.offsetX,
      origOffsetY: cameraRef.current.offsetY,
    };
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (dragRef.current.dragging) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragRef.current.moved = true;
        userMovedCameraRef.current = true;
        if (followRef.current) setFollow(false);
      }
      cameraRef.current = clampCamera(
        {
          ...cameraRef.current,
          offsetX: dragRef.current.origOffsetX + dx,
          offsetY: dragRef.current.origOffsetY + dy,
        },
        stageSizeRef.current,
        LAB_MAP
      );
      needsRedrawRef.current = true;
      return;
    }

    const rect = canvas.getBoundingClientRect();
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
    if (!dragRef.current.dragging) return;
    const wasMoved = dragRef.current.moved;
    dragRef.current.dragging = false;

    if (!wasMoved && canvasRef.current) {
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
        setSelectedAgentId(hitAgent.id);
        setSelectedZoneId(hitAgent.currentZoneId);
        setActiveTab('misi');
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
      setSelectedZoneId(zone ? zone.id : null);
    }
  };

  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const step = 28;
    if (e.key.startsWith('Arrow') && followRef.current) setFollow(false);
    let dx = 0;
    let dy = 0;
    if (e.key === 'ArrowLeft') dx = step;
    else if (e.key === 'ArrowRight') dx = -step;
    else if (e.key === 'ArrowUp') dy = step;
    else if (e.key === 'ArrowDown') dy = -step;
    else return;
    e.preventDefault();
    cameraRef.current = clampCamera(
      {
        ...cameraRef.current,
        offsetX: cameraRef.current.offsetX + dx,
        offsetY: cameraRef.current.offsetY + dy,
      },
      stageSizeRef.current,
      LAB_MAP
    );
    needsRedrawRef.current = true;
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

  // Mode misi berbasis cerita (avatar Dosen BK, StoryScreen, Debrief cerita)
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

  // Sinkronkan himpunan mahasiswa stabil & yang sedang dalam sesi percakapan ke ref loop frame
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

  // Varian latar dihitung sekali per graf/mahasiswa: sesi lanjutan bernuansa sore.
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
    setSelectedAgentSnapshot(null);
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

  // Toast perayaan hangat saat baru saja menuntaskan cerita mahasiswa
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);
  const prevMissionsDoneRef = useRef<number>(missionsDone);
  useEffect(() => {
    const prev = prevMissionsDoneRef.current;
    prevMissionsDoneRef.current = missionsDone;
    if (missionsDone > prev) {
      setCelebrationToast(
        `✨ Kisah terungkap (${missionsDone}/${STUDENT_COUNT}) · ⭐ +2 Bintang Empati siap untuk Hias Ruang BK!`
      );
      const timer = window.setTimeout(() => setCelebrationToast(null), 5500);
      return () => window.clearTimeout(timer);
    }
  }, [missionsDone]);

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

  // Tampilkan Kartu Hasil Shift satu kali tepat saat target 3 kisah baru tercapai dan kembali ke lab
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

  const hudBadges = buildHudBadges(
    {
      day: clock.day,
      clockText: formattedTime,
      missionsDone,
      missionsTotal: STUDENT_COUNT,
      activeStudents: Math.max(0, worldSummary.totalAgents - lostStudentIds.length),
    },
    STRINGS.hud
  );
  const speedControls = buildSpeedControls(speeds, clock, STRINGS.speedControls);
  const hudMeters = buildSelectedMeters(
    { energy: counselorRef.current.energy, max: counselorRef.current.maxEnergy },
    STRINGS.meters
  );
  const selectedMeters = buildSelectedMeters(
    selectedAgentSnapshot
      ? { energy: selectedAgentSnapshot.energy * 100, stress: selectedAgentSnapshot.stress * 100, max: 100 }
      : { max: 100 },
    STRINGS.meters
  );


  return (
    <div
      className="flex min-h-screen flex-col gap-2.5 bg-[#e8d8be] p-2.5 lg:h-screen lg:overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(rgba(62, 37, 23, 0.09) 1.2px, transparent 1.2px), linear-gradient(180deg, #efe2ca 0%, #e2cfa9 100%)',
        backgroundSize: '20px 20px, 100% 100%',
      }}
    >

      {/* HUD atas 1 baris rapi bergaya game cozy hand-inked melayang (nol wrap di desktop!) */}
      <GameFrame
        as="header"
        variant="kayu"
        nails
        animateIn
        className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1.5 !rounded-[22px] px-3 py-1.5 lg:flex-nowrap lg:px-3.5"
      >
        {/* Kiri: kembali & logo pita */}
        <div className="flex shrink-0 items-center gap-2">
          <GameButton variant="sekunder" size="sm" bounce onClick={() => { playSfx('klik'); onBackToStart(); }} className="!min-h-[2rem] whitespace-nowrap !px-3 text-xs">
            {STRINGS.statusBar.backToStart}
          </GameButton>
          <GameRibbon level={1} tone="merah" shine className="!px-3.5 !py-1 !text-[0.74rem]">
            {STRINGS.app.name}
          </GameRibbon>
        </div>

        {/* Tengah: lencana status, nyawa kelas, tombol Hias Ruang BK, dan meter energi konselor */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs lg:flex-nowrap">
          {hudBadges.map((b) => {
            const BadgeIcon = HUD_ICON_COMPONENTS[b.icon];
            return (
              <span
                key={b.key}
                data-testid={HUD_BADGE_TESTIDS[b.key]}
                className={b.key === 'mahasiswa-aktif' ? 'hidden xl:inline-flex' : 'inline-flex'}
              >
                <GameBadge
                  icon={<BadgeIcon className="h-4 w-4" />}
                  value={b.value}
                  animateValue={/^\d+$/.test(b.value)}
                  label={b.label}
                  tone={HUD_BADGE_TONES[b.key]}
                />
              </span>
            );
          })}
          {/* Lencana Nyawa Kelas / Batas Mahasiswa Hilang (3 = Kalah) */}
          <span
            data-testid="survival-lives-badge"
            title={`Kalah bila ${MAX_LOST_STUDENTS} mahasiswa kehabisan energi (0%) dan hilang`}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border-[2.5px] border-[#3e2517] px-2.5 py-0.5 font-['Fredoka'] text-[11px] font-bold shadow-[0_3px_0_#3e2517] ${
              lostStudentIds.length >= 2
                ? 'bg-[#d9463e] text-[#fffdf6]'
                : lostStudentIds.length === 1
                  ? 'bg-[#f5b63b] text-[#3e2517]'
                  : 'bg-[#fffaf0] text-[#3e2517]'
            }`}
          >
            <span aria-hidden="true">
              {Array.from({ length: MAX_LOST_STUDENTS }, (_, idx) =>
                idx < lostStudentIds.length ? '🖤' : '❤️'
              ).join('')}
            </span>
            <span className="whitespace-nowrap">
              Hilang {lostStudentIds.length}/{MAX_LOST_STUDENTS}
            </span>
          </span>
          <button
            type="button"
            data-testid="open-decor-shop-btn"
            onClick={() => {
              playSfx('klik');
              setDecorShopOpen(true);
            }}
            className="relative inline-flex shrink-0 items-center gap-1 rounded-full border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#ffe694] to-[#f2b53b] px-2.5 py-0.5 font-['Fredoka'] text-[11px] font-bold text-[#3e2517] shadow-[inset_0_-2.5px_0_#c68616,0_3px_0_#3e2517] transition hover:-translate-y-0.5 hover:brightness-105"
            title="Hias Ruang Konsultasi BK dengan Bintang Empati"
          >
            {canBuyAnyDecor && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-[1.5px] border-[#3e2517] bg-[#e56256] text-[9px] font-bold text-white"
              >
                !
              </span>
            )}
            <span aria-hidden="true">🪴</span>
            <span className="hidden 2xl:inline">Hias Ruang</span>
            <span className="hidden lg:inline 2xl:hidden">Hias</span>
            <span className="whitespace-nowrap">⭐ {availableStars}</span>
          </button>
          <span
            className="hidden h-2 w-10 overflow-hidden rounded-full border-2 border-[#3e2517] bg-[#3e2517]/40 2xl:block"
            aria-hidden="true"
          >
            <span
              className="block h-full rounded-full bg-[#ffe285]"
              style={{ width: `${Math.round(dayRatio * 100)}%` }}
            />
          </span>
          {hudMeters.energy && (
            <span className="inline-flex shrink-0 items-center rounded-full border-[2.5px] border-[#3e2517] bg-[#fffaf0] px-2.5 py-0.5 text-[#3e2517] shadow-[inset_0_-2px_0_#e5caa0,0_3px_0_#3e2517] [&_.game-meter]:!min-w-[3.4rem]">
              <GameMeter
                label={hudMeters.energy.label}
                icon={<IconEnergi className="h-4 w-4" />}
                value={hudMeters.energy.value}
                max={hudMeters.energy.max}
                higherIsBetter={hudMeters.energy.higherIsBetter}
              />
            </span>
          )}
        </div>

        {/* Kanan: tombol bulat timbul jeda/kecepatan dan pengaturan */}
        <div className="flex shrink-0 items-center gap-1">
          <div
            role="group"
            aria-label={STRINGS.speedControls.speedPrefix}
            className="flex items-center gap-1"
          >
            {speedControls.map((ctl) => {
              const CtlIcon = HUD_ICON_COMPONENTS[ctl.icon];
              return (
                <GameButton
                  key={ctl.id}
                  variant="bulat-ikon"
                  aria-label={ctl.label}
                  title={ctl.label}
                  aria-pressed={ctl.pressed}
                  bounce
                  className="!h-[2.05rem] !w-[2.05rem]"
                  onClick={() => {
                    playSfx('klik');
                    if (ctl.value === null) handleTogglePause();
                    else handleChangeSpeed(ctl.value as SimulationSpeed);
                  }}
                >
                  <span className="flex flex-col items-center leading-none" aria-hidden="true">
                    <CtlIcon className="h-3.5 w-3.5" />
                    {ctl.value !== null && (
                      <span className="font-mono-data text-[9px] font-bold">{ctl.value}x</span>
                    )}
                  </span>
                </GameButton>
              );
            })}
          </div>
          <GameButton
            variant="bulat-ikon"
            bounce
            className="!h-[2.05rem] !w-[2.05rem]"
            onClick={() => { playSfx('klik'); setBriefingOpen(true); }}
            aria-label="Panduan Shift Pagi"
            title="Panduan Shift Pagi"
          >
            <span className="font-['Fredoka'] text-xs font-bold" aria-hidden="true">?</span>
          </GameButton>
          <GameButton
            variant="bulat-ikon"
            bounce
            className="!h-[2.05rem] !w-[2.05rem]"
            onClick={() => { playSfx('klik'); onOpenSettings(); }}
            aria-label={STRINGS.statusBar.settingsQuick}
            title={STRINGS.statusBar.settingsQuick}
          >
            <IconSettings className="h-4 w-4" />
          </GameButton>
        </div>
      </GameFrame>
      {/* Ruang kerja utama: kiri 68% Papan Peta Lab 2D + kanan 32% Panel Konselor — bingkai & header sejajar 100%! */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch">
        {/* Kolom kiri: Papan Peta Lab 2D Berbingkai Tinta Tangan Cozy */}
        <section
          aria-label={STRINGS.canvasToolbar.mapLegendTitle}
          className="flex flex-col overflow-hidden rounded-[26px] border-[3.5px] border-[#3e2517] bg-[#fffdf5] shadow-[0_7px_0_#3e2517,0_14px_28px_rgba(62,37,23,0.18)] lg:min-h-0 lg:w-[68%] lg:flex-1"
        >
          {/* Bilah kontrol peta (tanpa zoom — peta selalu penuh rapi tanpa tepi kosong!) */}
          <div className="flex min-h-[54px] shrink-0 flex-wrap items-center justify-between gap-2 border-b-[3px] border-[#3e2517] bg-gradient-to-b from-[#a76940] to-[#874f2d] px-3.5 py-2 text-[#fffdf6]">
            <div className="flex flex-wrap items-center gap-2">
              <GameButton
                variant="sekunder"
                size="sm"
                aria-pressed={followAvatar}
                bounce
                onClick={() => { playSfx('klik'); setFollow(!followAvatar); }}
                icon={<IconIkuti className="h-4 w-4" />}
                className="whitespace-nowrap text-xs"
              >
                {followAvatar
                  ? STRINGS.canvasToolbar.followAvatarOn
                  : STRINGS.canvasToolbar.followAvatar}
              </GameButton>

              <GameButton
                variant="bulat-ikon"
                aria-pressed={viewOptions.showZoneLabels}
                aria-label={STRINGS.canvasToolbar.toggleLabels}
                title={STRINGS.canvasToolbar.toggleLabels}
                bounce
                onClick={() => {
                  playSfx('klik');
                  handleUpdateViewOptions({ showZoneLabels: !viewOptions.showZoneLabels });
                }}
              >
                <IconTag className="h-5 w-5" />
              </GameButton>

              <GameButton
                variant="bulat-ikon"
                aria-pressed={viewOptions.showGrid}
                aria-label={STRINGS.canvasToolbar.toggleGrid}
                title={STRINGS.canvasToolbar.toggleGrid}
                bounce
                onClick={() => {
                  playSfx('klik');
                  handleUpdateViewOptions({ showGrid: !viewOptions.showGrid });
                }}
              >
                <IconGrid className="h-5 w-5" />
              </GameButton>

              <span className="hidden items-center gap-1 rounded-full border border-[#fffdf6]/25 bg-[#3e2517]/35 px-2.5 py-1 font-['Fredoka'] text-[11px] font-semibold text-[#fff3d6] xl:inline-flex">
                🗺️ Peta Penuh · Geser untuk menjelajah
              </span>
            </div>

            {/* Pengatur visibilitas pintu Ruang Konsultasi */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--game-cream-paper)]">
                <IconDoor className="h-4 w-4" />
                <span>{STRINGS.canvasToolbar.doorModeLabel}</span>
              </span>
              <div className="flex items-center gap-1.5">
                {(['lab', 'samping'] as ConsultationDoorMode[]).map((mode) => {
                  const active = viewOptions.consultationDoorMode === mode;
                  return (
                    <GameButton
                      key={mode}
                      variant="sekunder"
                      size="sm"
                      aria-pressed={active}
                      bounce
                      onClick={() => {
                        playSfx('klik');
                        handleUpdateViewOptions({ consultationDoorMode: mode });
                      }}
                      className="whitespace-nowrap text-xs"
                    >
                      {mode === 'lab'
                        ? STRINGS.canvasToolbar.doorModeLab
                        : STRINGS.canvasToolbar.doorModeSide}
                    </GameButton>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stage HTML5 Canvas 2D */}
          <div
            ref={stageRef}
            data-testid="lab-canvas-stage"
            className="relative h-[320px] shrink-0 overflow-hidden bg-[var(--lab-void)] sm:h-[400px] lg:h-auto lg:min-h-[260px] lg:flex-1"
          >
            <canvas
              ref={canvasRef}
              data-testid="lab-canvas"
              tabIndex={0}
              aria-label={STRINGS.canvasToolbar.mapLegendTitle}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerCancel={handleCanvasPointerUp}
              onKeyDown={handleCanvasKeyDown}
              className="absolute inset-0 block h-full w-full cursor-grab active:cursor-grabbing"
            />
            {/* Lencana atmosfer waktu & status berjalan melayang non-intrusif */}
            <div
              aria-hidden="true"
              className="map-hud-pill pointer-events-none absolute left-3 top-3 z-10"
            >
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full border border-[#3e2517] ${
                  clock.minutesOfDay < 660
                    ? 'bg-[#f5be42]'
                    : clock.minutesOfDay >= 870
                      ? 'bg-[#e56256]'
                      : 'bg-[#3aa08e]'
                }`}
              />
              <span className="text-[#b8463c]">
                {clock.minutesOfDay < 660
                  ? 'Pagi Cerah'
                  : clock.minutesOfDay >= 870
                    ? 'Sore Hangat'
                    : 'Siang Terang'}
              </span>
              <span className="opacity-45">·</span>
              <span>
                {story.avatarMode === 'menuju-mahasiswa'
                  ? 'Menghampiri mahasiswa...'
                  : story.avatarMode === 'berdua-ke-bk'
                    ? 'Menuju Ruang Konsultasi...'
                    : selectedZone?.shortLabel ?? 'Lab Vokasi'}
              </span>
            </div>
            {/* Radar Sinyal Perilaku & Energi di sudut kanan atas peta */}
            <div className="absolute right-3 top-3 z-10 flex max-w-[66%] items-center gap-2">
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
                    setActiveTab('misi');
                    story.requestApproach(target.id);
                  }}
                  className="mission-alert-pill max-w-full cursor-pointer text-left disabled:cursor-not-allowed disabled:opacity-70"
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
                  <span className="hidden truncate font-normal italic opacity-90 xl:inline">
                    “{signalForStudent(campusMission.topPriorityAgent.id).clue}”
                  </span>
                  <span className="shrink-0 underline decoration-2 underline-offset-2">Hampiri →</span>
                </button>
              ) : (
                <div
                  className="mission-alert-pill pointer-events-none"
                  data-status="terjaga"
                  data-testid="isolation-radar-alert"
                >
                  <span>✦ Energi Lab {campusMission.averageEnergyPct}%</span>
                  <span className="opacity-55">·</span>
                  <span>Semua Terjaga</span>
                </div>
              )}
            </div>
            {/* Toast Peringatan Mahasiswa Hilang (0%) */}
            {lostAlertToast && (
              <div
                role="alert"
                className="fx-panel-in absolute bottom-24 left-1/2 z-20 flex max-w-[92%] -translate-x-1/2 items-center gap-2 rounded-full border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#e05248] to-[#b8322a] px-4 py-1.5 font-['Fredoka'] text-xs font-bold text-[#fffdf6] shadow-[0_4px_0_#3e2517]"
              >
                <span>{lostAlertToast}</span>
              </div>
            )}
            {/* Toast Perayaan Bintang Empati melayang saat kisah baru terungkap */}
            {celebrationToast && (
              <div
                role="status"
                className="fx-panel-in absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#ffe799] to-[#f4b93c] px-4 py-1.5 font-['Fredoka'] text-xs font-bold text-[#3e2517] shadow-[0_4px_0_#3e2517]"
              >
                <span>{celebrationToast}</span>
                <button
                  type="button"
                  onClick={() => {
                    playSfx('klik');
                    setCelebrationToast(null);
                    setDecorShopOpen(true);
                  }}
                  className="rounded-full border border-[#3e2517] bg-[#fffdf6] px-2.5 py-0.5 text-[11px] font-bold text-[#3e2517] hover:bg-[#fff4d4]"
                >
                  Hias →
                </button>
              </div>
            )}
            {/* Legenda Mini Energi di sudut kiri bawah kanvas (jelas dalam 2 detik!) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-3 z-10 hidden flex-wrap items-center gap-2 rounded-full border-2 border-[#3e2517] bg-[#fffdf6]/92 px-3 py-1 font-['Fredoka'] text-[11px] font-bold text-[#3e2517] shadow-[0_3px_0_#3e2517] sm:inline-flex"
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
            {/* Bingkai viewport hangat hand-inked */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 border-[3px] border-[#3e2517]/25"
            />
          </div>

          {/* Bilah info mahasiswa atau zona terpilih — Grid 3-Kolom Simetris Kompak (nol ruang kosong!) */}
          <div className="shrink-0 border-t-[3px] border-[#3e2517] bg-gradient-to-b from-[#fffdf6] to-[#f6e6c8] px-3.5 py-2.5 text-xs shadow-[inset_0_2px_0_rgba(255,255,255,0.8)]">
            {selectedAgentSnapshot ? (
              <div
                className="grid grid-cols-1 items-center gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto]"
                data-testid="agent-inspector-bar"
              >
                {/* Kolom 1: Potret mahasiswa proporsional & tidak melar */}
                <div
                  className="relative h-[78px] w-[62px] shrink-0 overflow-hidden rounded-2xl border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#d8ecfa] via-[#f0f5e8] to-[#f8e6c8] shadow-[0_3px_0_#3e2517]"
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

                {/* Kolom 2: Identitas + status pil + potensi & sinyal mengisi ruang tengah penuh */}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-['Fredoka'] text-[0.95rem] font-bold text-[#3e2517]">
                      {STRINGS.agentInspector.selectedPrefix} {selectedAgentSnapshot.name}
                    </span>
                    <span className="rounded-full border border-[#3e2517]/40 bg-[#fffdf7] px-2 py-0.5 font-['Fredoka'] text-[11px] font-bold text-[#2e8274]">
                      {STRINGS.agentInspector.activityNames[selectedAgentSnapshot.status]}
                    </span>
                    <span className="rounded-full border border-[#3e2517]/40 bg-[#fff3d6] px-2 py-0.5 font-['Fredoka'] text-[11px] font-bold text-[#8a4f16]">
                      {STRINGS.agentInspector.socialLabel}:{' '}
                      {STRINGS.agentInspector.socialNames[selectedAgentSnapshot.socialStatus]}
                    </span>
                    <span className="hidden rounded-full bg-[#3e2517]/10 px-2 py-0.5 text-[11px] font-semibold text-[#5d3d26] xl:inline-block">
                      {STRINGS.agentInspector.cohortPrefix} {selectedAgentSnapshot.cohort} ·{' '}
                      {selectedAgentSnapshot.demographicLabel.originLabel}
                    </span>
                  </div>

                  <p className="line-clamp-1 text-[11.5px] leading-snug text-[#4e321e]">
                    <strong className="text-[#3e2517]">{STRINGS.agentInspector.potentialLabel}:</strong>{' '}
                    {selectedAgentSnapshot.uniquePotential}
                    <span aria-hidden="true"> · </span>
                    <span className="text-[#6b482e]">{selectedAgentSnapshot.activityGoal}</span>
                  </p>

                  <p className="line-clamp-1 rounded-xl border border-[#3e2517]/20 bg-[#fffdf7]/85 px-2.5 py-1 text-[11px] italic text-[#6b482e]">
                    🔔 Sinyal teramati: “{signalForStudent(selectedAgentSnapshot.id).clue}”
                  </p>
                </div>

                {/* Kolom 3: Meter Energi/Stres di atas & Tombol Aksi sejajar rapi di bawah */}
                <div className="flex shrink-0 flex-col items-stretch justify-between gap-2 md:items-end">
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-[#3e2517]/30 bg-[#fffdf7] px-2.5 py-1.5 shadow-[inset_0_-2px_0_#edd9b4]">
                    {selectedMeters.energy && (
                      <GameMeter
                        label={STRINGS.agentInspector.energyLabel}
                        icon={<IconEnergi className="h-4 w-4" />}
                        value={selectedMeters.energy.value}
                        max={selectedMeters.energy.max}
                        higherIsBetter={selectedMeters.energy.higherIsBetter}
                      />
                    )}
                    {selectedMeters.stress && (
                      <GameMeter
                        label={STRINGS.agentInspector.stressLabel}
                        icon={<IconStres className="h-4 w-4" />}
                        value={selectedMeters.stress.value}
                        max={selectedMeters.stress.max}
                        higherIsBetter={selectedMeters.stress.higherIsBetter}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <GameButton
                      variant="primer"
                      size="sm"
                      bounce
                      onClick={() => { playSfx('klik'); story.requestApproach(selectedAgentSnapshot.id); }}
                      aria-label={STRINGS.story.approachAria(selectedAgentSnapshot.name)}
                      className="!min-h-[2rem] whitespace-nowrap !px-4 text-xs"
                    >
                      {STRINGS.story.approachBtn}
                    </GameButton>
                    <GameButton
                      variant="sekunder"
                      size="sm"
                      bounce
                      onClick={() => { playSfx('klik'); setSelectedAgentId(null); }}
                      className="!min-h-[2rem] whitespace-nowrap !px-3.5 text-xs"
                    >
                      {STRINGS.agentInspector.closeAgent}
                    </GameButton>
                  </div>
                </div>
              </div>
            ) : selectedZone ? (
              <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border-2 border-[#3e2517] bg-[#ffe694] px-2.5 py-0.5 font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                      📍 {STRINGS.canvasToolbar.selectedZonePrefix} {selectedZone.label}
                    </span>
                    {story.statusMessage && (
                      <span
                        role="status"
                        data-testid="story-status"
                        className="truncate rounded-full border border-[#2e8274]/40 bg-[#e4f7f1] px-2.5 py-0.5 text-[11px] font-semibold text-[#1e6457]"
                      >
                        {story.statusMessage}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-[11.5px] text-[#5d3d26]">
                    {selectedZone.id === 'konsultasi'
                      ? viewOptions.consultationDoorMode === 'lab'
                        ? STRINGS.canvasToolbar.doorVisibilityHintLab
                        : STRINGS.canvasToolbar.doorVisibilityHintSide
                      : selectedZone.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1.5 font-['Fredoka'] text-[11px] font-bold">
                  <span className="rounded-full border-2 border-[#3e2517]/35 bg-[#fffdf7] px-2.5 py-1 text-[#3e2517]">
                    🔒 {STRINGS.canvasToolbar.privacyLabel}{' '}
                    {Math.round(
                      getEffectiveZonePrivacy(
                        selectedZone.id,
                        selectedZone.privacy,
                        viewOptions.consultationDoorMode
                      ) * 100
                    )}
                    %
                  </span>
                  <span className="rounded-full border-2 border-[#3e2517]/35 bg-[#fffdf7] px-2.5 py-1 text-[#3e2517]">
                    👥 {STRINGS.canvasToolbar.capacityLabel} {selectedZone.capacity}
                  </span>
                  <span className="rounded-full border-2 border-[#3e2517]/35 bg-[#fffdf7] px-2.5 py-1 text-[#3e2517]">
                    🪑 {STRINGS.canvasToolbar.slotsLabel} {selectedZone.standingSlots.length}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[#6b482e]">{STRINGS.canvasToolbar.noZoneSelected}</p>
            )}
            {selectedAgentSnapshot && story.statusMessage && (
              <p
                role="status"
                data-testid="story-status"
                className="mt-1.5 border-t border-dashed border-[#3e2517]/20 pt-1 text-[11px] font-semibold text-[#6b482e]"
              >
                💡 {story.statusMessage}
              </p>
            )}
          </div>
        </section>

        {/* Kolom kanan: Panel Konselor dengan bingkai, sudut & tinggi header kayu SEJAJAR 100% dengan Papan Peta kiri! */}
        <GameFrame
          as="aside"
          variant="krem"
          animateIn
          aria-label="Panel Konselor"
          className="relative flex min-h-0 w-full flex-col overflow-hidden !rounded-[26px] !border-[3.5px] !border-[#3e2517] !shadow-[0_7px_0_#3e2517,0_14px_28px_rgba(62,37,23,0.18)] lg:w-[32%]"
        >
          {/* Header kayu hangat min-h-[54px] — sejajar presisi dengan Bilah Kontrol Peta di kiri! */}
          <div className="flex min-h-[54px] shrink-0 items-center justify-center border-b-[3px] border-[#3e2517] bg-gradient-to-b from-[#a76940] to-[#874f2d] px-3 py-1.5">
            <GameRibbon level={2} tone="navy" shine>
              Panel Konselor
            </GameRibbon>
          </div>
          <div
            role="tablist"
            aria-label="Menu Panel Konselor"
            className="grid shrink-0 grid-cols-4 items-end gap-1 border-b-[3px] border-[#3e2517] bg-[#f4e4c5] px-2 pt-2 [&>button]:min-w-0 [&>button]:justify-center [&>button]:!px-1.5 [&>button]:!text-[0.72rem]"
          >
            {STRINGS.tabs.list.map((tab) => {
              const TabIcon = TAB_ICON_COMPONENTS[tab.id];
              return (
                <GameTab
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  controls={`panel-${tab.id}`}
                  selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  icon={<TabIcon className="h-4 w-4" />}
                >
                  {STRINGS.gameTabs[tab.id]}
                </GameTab>
              );
            })}
          </div>

          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="flex-1 overflow-y-auto p-3"
          >
            {activeTab === 'pengamatan' ? (
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
            ) : activeTab === 'sosiogram' ? (
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
            ) : activeTab === 'misi' ? (
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
                  story.requestApproach(id);
                }}
                onFollowUp={(id) => {
                  setSelectedAgentId(id);
                  story.startFollowUp(id);
                }}
              />
            ) : (
              <div className="space-y-3.5 text-xs text-[#3e2517]" data-testid="counselor-notes-panel">
                <div className="rounded-2xl border-2 border-[#3e2517] bg-gradient-to-b from-[#fffdf7] to-[#f8ecd2] p-3.5 shadow-[0_4px_0_#3e2517]">
                  <h2 className="font-['Fredoka'] text-sm font-bold text-[#3e2517]">
                    📓 {STRINGS.tabs.placeholders[activeTab].title}
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
                      onClick={() => setActiveTab('pengamatan')}
                      className="font-['Fredoka'] text-[11px] font-bold text-[#2e8274] underline"
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
                      onClick={() => setActiveTab('sosiogram')}
                      className="font-['Fredoka'] text-[11px] font-bold text-[#2e8274] underline"
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
        </GameFrame>
      </div>

      {/* StoryScreen (mode misi); disembunyikan saat Walk_Together, Debrief, atau Game Over */}
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
            />
          </div>
        )}

      {/* Modal Kalah (3 Mahasiswa Hilang) atau Menang (Semua Mahasiswa Tersisa Stabil) */}
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

      {/* Debrief mode cerita */}
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

      {/* Briefing Pagi 1-kartu saat baru masuk ke laboratorium */}
      {briefingOpen && (
        <MorningBriefingModal
          onStartShift={() => {
            playSfx('klik');
            setBriefingOpen(false);
          }}
        />
      )}

      {/* Jurnal Koleksi 15 Kisah Lab */}
      {journalOpen && (
        <StoryJournalModal
          agents={agentsSnapshot}
          missions={story.missions}
          reducedMotion={reducedMotion}
          canApproach={story.avatarMode === 'idle'}
          onApproach={(id) => {
            setSelectedAgentId(id);
            setActiveTab('misi');
            story.requestApproach(id);
          }}
          onClose={() => setJournalOpen(false)}
        />
      )}

      {/* Kartu Hasil Shift Dosen BK (muncul saat 3 kisah terungkap, bisa disalin untuk dibagikan) */}
      {shiftReportOpen && (
        <ShiftReportModal
          report={shiftReport}
          agents={agentsSnapshot}
          reducedMotion={reducedMotion}
          onOpenJournal={() => setJournalOpen(true)}
          onClose={() => setShiftReportOpen(false)}
        />
      )}

      {/* Pop-Up Hias Ruang Konsultasi BK (tukar ⭐ Bintang Empati -> tampil nyata di ruangan!) */}
      {decorShopOpen && (
        <RoomDecorModal
          decor={roomDecor}
          missions={story.missions}
          onBuy={handleBuyDecor}
          onToggleEquip={handleToggleEquipDecor}
          onClose={() => setDecorShopOpen(false)}
        />
      )}

      {/* Panel Pengembang (Ctrl+Shift+D) */}
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


