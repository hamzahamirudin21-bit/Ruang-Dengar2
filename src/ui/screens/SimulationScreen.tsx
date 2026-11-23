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
  computeFitCamera,
  findZoneAtTile,
  renderLabCanvas,
  screenToTile,
} from '../canvas/labRenderer';
import { clampCamera, defaultScale, followCamera, zoomScale } from '../world/cameraFollow';
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
import { computeCampusMissionSummary } from '../../engine/isolationMission';
import {
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
  IconResetView,
  IconSettings,
  IconTag,
  IconZoomIn,
  IconZoomOut,
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

  const handleFitView = useCallback(() => {
    const { width, height } = stageSizeRef.current;
    userMovedCameraRef.current = false;
    setFollow(false);
    cameraRef.current = computeFitCamera(width, height, LAB_MAP);
    needsRedrawRef.current = true;
  }, [setFollow]);

  const handleZoomBy = useCallback((factor: number, anchorX?: number, anchorY?: number) => {
    const cam = cameraRef.current;
    const { width, height } = stageSizeRef.current;
    const cx = anchorX ?? width / 2;
    const cy = anchorY ?? height / 2;
    const nextScale = zoomScale(cam.scale, factor);
    const ratio = nextScale / cam.scale;
    userMovedCameraRef.current = true;
    cameraRef.current = {
      scale: nextScale,
      offsetX: cx - (cx - cam.offsetX) * ratio,
      offsetY: cy - (cy - cam.offsetY) * ratio,
    };
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
      if (!cameraInitedRef.current) {
        cameraInitedRef.current = true;
        const scale = defaultScale(vp, LAB_MAP);
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
          cameraRef.current,
          avatarWorldPosRef.current,
          vp,
          LAB_MAP,
          0,
          true
        );
      } else {
        cameraRef.current = clampCamera(cameraRef.current, vp, LAB_MAP);
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

      // 1. Majukan dunia seluruh agen mahasiswa & jam simulasi (jeda otomatis saat briefing pagi terbuka)
      const prevWorld = worldRef.current;
      let walkingDirty = false;
      if (!prevWorld.clock.paused && !briefingOpenRef.current) {
        const nextWorld = advanceWorld(prevWorld, dt, LAB_MAP, navGridRef.current);
        worldRef.current = nextWorld;

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
              agents: worldRef.current.agents,
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

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    handleZoomBy(factor, localX, localY);
  };

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
      cameraRef.current = {
        ...cameraRef.current,
        offsetX: dragRef.current.origOffsetX + dx,
        offsetY: dragRef.current.origOffsetY + dy,
      };
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
      worldRef.current.agents
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
        worldRef.current.agents
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
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      cameraRef.current.offsetX += step;
      needsRedrawRef.current = true;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      cameraRef.current.offsetX -= step;
      needsRedrawRef.current = true;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cameraRef.current.offsetY += step;
      needsRedrawRef.current = true;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      cameraRef.current.offsetY -= step;
      needsRedrawRef.current = true;
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      handleZoomBy(1.12);
    } else if (e.key === '-') {
      e.preventDefault();
      handleZoomBy(0.89);
    } else if (e.key === '0') {
      e.preventDefault();
      handleFitView();
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
  });
  storyRef.current = story;

  useEffect(() => {
    const ids: string[] = [];
    const badges: Record<string, StoryOutcomeKind> = {};
    for (const a of agentsSnapshot) {
      const m = story.missions[a.id];
      if (!m || m.status !== 'selesai') ids.push(a.id);
      if (m?.lastOutcome && m.lastDay === clock.day) badges[a.id] = m.lastOutcome;
    }
    storyMarkerIdsRef.current = ids;
    storyBadgesRef.current = badges;
    needsRedrawRef.current = true;
  }, [agentsSnapshot, story.missions, clock.day]);

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
    () => agentsSnapshot.filter((a) => story.missions[a.id]?.status === 'selesai').length,
    [agentsSnapshot, story.missions]
  );

  const campusMission = useMemo(
    () => computeCampusMissionSummary(agentsSnapshot, story.missions),
    [agentsSnapshot, story.missions]
  );

  const shiftReport = useMemo(
    () => computeShiftReport(agentsSnapshot, story.missions),
    [agentsSnapshot, story.missions]
  );

  const availableStars = useMemo(
    () => computeAvailableStars(story.missions, roomDecor),
    [story.missions, roomDecor]
  );

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
      activeStudents: worldSummary.totalAgents,
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

      {/* HUD atas bergaya game cozy hand-inked melayang (membulat lembut, nol kotak tajam!) */}
      <GameFrame
        as="header"
        variant="kayu"
        nails
        animateIn
        className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 !rounded-[24px] px-4 py-2 lg:px-5"
      >
        {/* Kiri: kembali & logo pita */}
        <div className="flex items-center gap-3">
          <GameButton variant="sekunder" size="sm" bounce onClick={() => { playSfx('klik'); onBackToStart(); }} className="whitespace-nowrap text-sm">
            {STRINGS.statusBar.backToStart}
          </GameButton>
          <GameRibbon level={1} tone="merah" shine>
            {STRINGS.app.name}
          </GameRibbon>
        </div>

        {/* Tengah: empat lencana, tombol pop-up Hias Ruang BK, dan meter energi konselor */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {hudBadges.map((b) => {
            const BadgeIcon = HUD_ICON_COMPONENTS[b.icon];
            return (
              <span
                key={b.key}
                data-testid={HUD_BADGE_TESTIDS[b.key]}
                className={b.key === 'mahasiswa-aktif' ? 'hidden sm:inline-flex' : 'inline-flex'}
              >
                <GameBadge
                  icon={<BadgeIcon className="h-5 w-5" />}
                  value={b.value}
                  animateValue={/^\d+$/.test(b.value)}
                  label={b.label}
                  tone={HUD_BADGE_TONES[b.key]}
                />
              </span>
            );
          })}
          <button
            type="button"
            data-testid="open-decor-shop-btn"
            onClick={() => {
              playSfx('klik');
              setDecorShopOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#ffe694] to-[#f2b53b] px-3.5 py-1 font-['Fredoka'] text-xs font-bold text-[#3e2517] shadow-[inset_0_-2.5px_0_#c68616,0_3px_0_#3e2517] transition hover:-translate-y-0.5 hover:brightness-105"
            title="Hias Ruang Konsultasi BK dengan Bintang Empati"
          >
            <span aria-hidden="true">🪴</span>
            <span className="hidden md:inline">Hias Ruang</span>
            <span>⭐ {availableStars}</span>
          </button>
          <span
            className="hidden h-2.5 w-14 overflow-hidden rounded-full border-2 border-[#3e2517] bg-[#3e2517]/40 md:block"
            aria-hidden="true"
          >
            <span
              className="block h-full rounded-full bg-[#ffe285]"
              style={{ width: `${Math.round(dayRatio * 100)}%` }}
            />
          </span>
          {hudMeters.energy && (
            <span className="inline-flex items-center rounded-full border-[2.5px] border-[#3e2517] bg-[#fffaf0] px-3 py-1 text-[#3e2517] shadow-[inset_0_-2px_0_#e5caa0,0_3px_0_#3e2517]">
              <GameMeter
                label={hudMeters.energy.label}
                icon={<IconEnergi className="h-5 w-5" />}
                value={hudMeters.energy.value}
                max={hudMeters.energy.max}
                higherIsBetter={hudMeters.energy.higherIsBetter}
              />
            </span>
          )}
        </div>

        {/* Kanan: tombol bulat timbul jeda/kecepatan dan pengaturan */}
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label={STRINGS.speedControls.speedPrefix}
            className="flex items-center gap-1.5"
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
                  onClick={() => {
                    playSfx('klik');
                    if (ctl.value === null) handleTogglePause();
                    else handleChangeSpeed(ctl.value as SimulationSpeed);
                  }}
                >
                  <span className="flex flex-col items-center leading-none" aria-hidden="true">
                    <CtlIcon className="h-4 w-4" />
                    {ctl.value !== null && (
                      <span className="font-mono-data text-[10px] font-bold">{ctl.value}x</span>
                    )}
                  </span>
                </GameButton>
              );
            })}
          </div>
          <GameButton
            variant="bulat-ikon"
            bounce
            onClick={() => { playSfx('klik'); onOpenSettings(); }}
            aria-label={STRINGS.statusBar.settingsQuick}
            title={STRINGS.statusBar.settingsQuick}
          >
            <IconSettings className="h-5 w-5" />
          </GameButton>
        </div>
      </GameFrame>
      {/* Ruang kerja utama: kiri 69% Papan Peta Lab 2D + kanan 31% Papan Klip Konselor Melayang */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        {/* Kolom kiri: Papan Peta Lab 2D Berbingkai Tinta Tangan Cozy */}
        <section
          aria-label={STRINGS.canvasToolbar.mapLegendTitle}
          className="flex flex-col overflow-hidden rounded-[26px] border-[3.5px] border-[#3e2517] bg-[#fffdf5] shadow-[0_7px_0_#3e2517,0_14px_28px_rgba(62,37,23,0.18)] lg:min-h-0 lg:w-[69%] lg:flex-1"
        >
          {/* Bilah kontrol peta */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b-[3px] border-[#3e2517] bg-gradient-to-b from-[#a76940] to-[#874f2d] px-3.5 py-2 text-[#fffdf6]">
            <div className="flex flex-wrap items-center gap-2">
              <GameButton
                variant="bulat-ikon"
                bounce
                onClick={() => { playSfx('klik'); handleZoomBy(1.15); }}
                aria-label={STRINGS.canvasToolbar.zoomIn}
                title={STRINGS.canvasToolbar.zoomIn}
              >
                <IconZoomIn className="h-5 w-5" />
              </GameButton>
              <GameButton
                variant="bulat-ikon"
                bounce
                onClick={() => { playSfx('klik'); handleZoomBy(0.87); }}
                aria-label={STRINGS.canvasToolbar.zoomOut}
                title={STRINGS.canvasToolbar.zoomOut}
              >
                <IconZoomOut className="h-5 w-5" />
              </GameButton>
              <GameButton
                variant="bulat-ikon"
                bounce
                onClick={() => { playSfx('klik'); handleFitView(); }}
                aria-label={STRINGS.canvasToolbar.resetView}
                title={STRINGS.canvasToolbar.resetView}
              >
                <IconResetView className="h-5 w-5" />
              </GameButton>

              <span className="mx-1 h-6 w-0.5 bg-white/20" aria-hidden="true" />

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
              onWheel={handleCanvasWheel}
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
            {/* Bingkai viewport hangat hand-inked */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 border-[3px] border-[#3e2517]/25"
            />
          </div>

          {/* Bilah info mahasiswa atau zona terpilih (krem hangat hand-inked) */}
          <div className="shrink-0 border-t-[3px] border-[#3e2517] bg-gradient-to-b from-[#fffdf6] to-[#f7e9cd] px-4 py-2.5 text-xs">
            {selectedAgentSnapshot ? (
              <div className="flex flex-wrap items-center justify-between gap-2" data-testid="agent-inspector-bar">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="shrink-0 overflow-hidden rounded-2xl border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#d8ecfa] via-[#f0f5e8] to-[#f8e6c8] shadow-[0_3px_0_#3e2517]" style={{ lineHeight: 0 }}>
                    <PixelPortrait
                      studentId={selectedAgentSnapshot.id}
                      name={selectedAgentSnapshot.name}
                      expression="netral"
                      scale={1}
                      reducedMotion={reducedMotion}
                      demographicLabel={selectedAgentSnapshot.demographicLabel}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[var(--game-ink)]">
                      {STRINGS.agentInspector.selectedPrefix} {selectedAgentSnapshot.name}
                    </div>
                    <div className="text-[var(--game-ink)]">
                      {STRINGS.agentInspector.activityLabel}:{' '}
                      {STRINGS.agentInspector.activityNames[selectedAgentSnapshot.status]}
                      <span aria-hidden="true"> · </span>
                      {STRINGS.agentInspector.socialLabel}:{' '}
                      {STRINGS.agentInspector.socialNames[selectedAgentSnapshot.socialStatus]}
                    </div>
                    <div className="text-[var(--game-ink)]">
                      ({STRINGS.agentInspector.cohortPrefix} {selectedAgentSnapshot.cohort} ·{' '}
                      {selectedAgentSnapshot.demographicLabel.originLabel}) ·{' '}
                      {STRINGS.agentInspector.potentialLabel}: {selectedAgentSnapshot.uniquePotential} ·{' '}
                      {selectedAgentSnapshot.activityGoal}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedMeters.energy && (
                      <GameMeter
                        label={STRINGS.agentInspector.energyLabel}
                        icon={<IconEnergi className="h-5 w-5" />}
                        value={selectedMeters.energy.value}
                        max={selectedMeters.energy.max}
                        higherIsBetter={selectedMeters.energy.higherIsBetter}
                      />
                    )}
                    {selectedMeters.stress && (
                      <GameMeter
                        label={STRINGS.agentInspector.stressLabel}
                        icon={<IconStres className="h-5 w-5" />}
                        value={selectedMeters.stress.value}
                        max={selectedMeters.stress.max}
                        higherIsBetter={selectedMeters.stress.higherIsBetter}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <GameButton
                    variant="primer"
                    size="sm"
                    bounce
                    onClick={() => { playSfx('klik'); story.requestApproach(selectedAgentSnapshot.id); }}
                    aria-label={STRINGS.story.approachAria(selectedAgentSnapshot.name)}
                    className="whitespace-nowrap text-xs"
                  >
                    {STRINGS.story.approachBtn}
                  </GameButton>
                  <GameButton
                    variant="sekunder"
                    size="sm"
                    bounce
                    onClick={() => { playSfx('klik'); setSelectedAgentId(null); }}
                    className="whitespace-nowrap text-xs"
                  >
                    {STRINGS.agentInspector.closeAgent}
                  </GameButton>
                </div>
              </div>

            ) : selectedZone ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-[var(--ui-text)]">
                    {STRINGS.canvasToolbar.selectedZonePrefix} {selectedZone.label}
                  </span>
                  <span className="mx-2 text-[var(--ui-text-muted)]" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[var(--ui-text-muted)]">
                    {selectedZone.id === 'konsultasi'
                      ? viewOptions.consultationDoorMode === 'lab'
                        ? STRINGS.canvasToolbar.doorVisibilityHintLab
                        : STRINGS.canvasToolbar.doorVisibilityHintSide
                      : selectedZone.description}
                  </span>
                </div>
                <div className="font-mono-data flex items-center gap-3 text-[var(--ui-text-muted)]">
                  <span>
                    {STRINGS.canvasToolbar.privacyLabel}:{' '}
                    {Math.round(
                      getEffectiveZonePrivacy(
                        selectedZone.id,
                        selectedZone.privacy,
                        viewOptions.consultationDoorMode
                      ) * 100
                    )}
                    %
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {STRINGS.canvasToolbar.capacityLabel}: {selectedZone.capacity}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {STRINGS.canvasToolbar.slotsLabel}: {selectedZone.standingSlots.length}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[var(--ui-text-muted)]">
                {STRINGS.canvasToolbar.noZoneSelected}
              </p>
            )}
            {story.statusMessage && (
              <p
                role="status"
                data-testid="story-status"
                className="mt-1.5 font-medium text-[var(--ui-text)]"
              >
                {story.statusMessage}
              </p>
            )}
          </div>
        </section>

        {/* Kolom kanan: Papan Klip Konselor Melayang (Pop-Up Rounded Clipboard — bukan sidebar kotak tajam!) */}
        <GameFrame
          as="aside"
          variant="krem"
          nails
          animateIn
          aria-label="Panel Konselor"
          className="relative flex min-h-0 w-full flex-col !rounded-[28px] !border-[3.5px] !border-[#3e2517] !shadow-[inset_0_-5px_0_#e5caa0,0_7px_0_#3e2517,0_14px_28px_rgba(62,37,23,0.18)] lg:w-[31%]"
        >
          {/* Penjepit papan klip dekoratif di tengah atas */}
          <div
            aria-hidden="true"
            className="mx-auto -mt-2 flex h-4 w-24 items-center justify-center rounded-full border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#ffe391] to-[#d99b2a] shadow-[0_2px_0_#3e2517]"
          >
            <span className="h-1.5 w-10 rounded-full bg-[#3e2517]/30" />
          </div>
          <div className="shrink-0 px-3 pt-2 text-center">
            <GameRibbon level={2} tone="navy" shine>
              Panel Konselor
            </GameRibbon>
          </div>
          <div
            role="tablist"
            aria-label="Menu Panel Konselor"
            className="grid shrink-0 grid-cols-4 items-end gap-1 border-b-[3px] border-[#3e2517] px-2.5 pt-2.5 [&>button]:min-w-0 [&>button]:justify-center [&>button]:!px-1.5 [&>button]:!text-[0.72rem]"
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
            className="flex-1 overflow-y-auto p-4"
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
              <div className="rounded-xl border border-dashed border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-5">
                <h2 className="text-base font-semibold text-[var(--ui-text)]">
                  {STRINGS.tabs.placeholders[activeTab].title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ui-text-muted)]">
                  {STRINGS.tabs.placeholders[activeTab].description(STUDENT_COUNT)}
                </p>
              </div>
            )}
          </div>
        </GameFrame>
      </div>

      {/* StoryScreen (mode misi); disembunyikan saat Walk_Together atau Debrief */}
      {story.storyState &&
        story.graph &&
        story.agent &&
        story.storyVisible &&
        !story.debriefProps && (
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
            />
          </div>
        )}

      {/* Debrief mode cerita */}
      {story.debriefProps && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="debrief-overlay"
          className="fixed inset-0 z-[70] overflow-y-auto bg-[var(--ui-bg,#f8fafc)] p-3 sm:p-6"
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


