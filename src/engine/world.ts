import { createInitialAgents } from '../data/agents.seed';
import {
  AgentActivityStatus,
  AgentSocialStatus,
  ConsultationDoorMode,
  DailySociometrySnapshot,
  LabEvent,
  LabMapData,
  ObservationLogState,
  SimulationSpeed,
  StudentAgent,
  WorldSocialSummary,
  WorldState,
} from '../types';
import {
  assignNextActivityForAgent,
  moveAgentsAlongPaths,
  updateAgentsNeedsAndSocialTick,
} from './agent';
import {
  SIM_MINUTES_PER_REAL_SECOND_AT_1X,
  WORK_START_MINUTES,
  createInitialClock,
  setClockPaused,
  setClockSpeed,
  tickClock,
} from './clock';
import { stepLabEvents } from './events';
import {
  createInitialObservationLog,
  recordObservationTick,
} from './observationLog';
import { NavigationGrid, buildNavigationGrid } from './pathfinding';
import { SeededRng, clamp01, mulberry32 } from './rng';
import { generateDailySociometrySnapshot } from './sociometry';

function getMinuteKey(day: number, minutesOfDay: number): number {
  return day * 10000 + Math.floor(minutesOfDay / 5);
}

export function createWorldState(
  map: LabMapData,
  seed: number,
  speed: SimulationSpeed = 1,
  doorMode: ConsultationDoorMode = 'lab',
  paused = false
): WorldState {
  const grid = buildNavigationGrid(map, doorMode);
  const clock = createInitialClock(speed, paused);
  const agents = createInitialAgents(map, grid, seed);
  const observationLog = recordObservationTick(
    createInitialObservationLog(agents),
    agents,
    clock.day
  );

  return {
    seed,
    tickCount: 0,
    lastProcessedMinuteKey: getMinuteKey(clock.day, clock.minutesOfDay),
    clock,
    consultationDoorMode: doorMode,
    agents,
    activeEvents: [],
    recentEvents: [],
    rngStepCount: 0,
    observationLog,
    sociometrySnapshots: [],
  };
}

export function setWorldPaused(world: WorldState, paused: boolean): WorldState {
  return {
    ...world,
    clock: setClockPaused(world.clock, paused),
  };
}

export function setWorldSpeed(world: WorldState, speed: SimulationSpeed): WorldState {
  return {
    ...world,
    clock: setClockSpeed(setClockPaused(world.clock, false), speed),
  };
}

export function setWorldDoorMode(
  world: WorldState,
  doorMode: ConsultationDoorMode
): WorldState {
  return {
    ...world,
    consultationDoorMode: doorMode,
  };
}

function handleMorningReset(agents: StudentAgent[], rng: SeededRng): void {
  for (const agent of agents) {
    // Pulihkan energi setelah istirahat malam & segarkan sebagian beban tugas harian
    agent.energy = clamp01(Math.max(agent.energy, 0.72) + 0.14);
    agent.stress = clamp01(agent.stress * 0.72);
    agent.taskLoad = clamp01(0.35 + rng() * 0.35);
    agent.activityDurationTicks = 0;

    // Kedaluwarsa adaptasi cerita: objek baru, tanpa memutasi objek bersama
    if (agent.storyAdaptation) {
      const remaining = agent.storyAdaptation.daysRemaining - 1;
      if (remaining > 0) {
        agent.storyAdaptation = { ...agent.storyAdaptation, daysRemaining: remaining };
      } else {
        delete agent.storyAdaptation;
      }
    }
  }
}

function advanceSingleFiveMinuteTick(
  agents: StudentAgent[],
  activeEvents: LabEvent[],
  recentEvents: LabEvent[],
  observationLog: ObservationLogState,
  sociometrySnapshots: DailySociometrySnapshot[],
  day: number,
  minutesOfDay: number,
  tickCount: number,
  seed: number,
  map: LabMapData,
  grid: NavigationGrid,
  rng: SeededRng,
  isNewDay: boolean
): {
  activeEvents: LabEvent[];
  recentEvents: LabEvent[];
  observationLog: ObservationLogState;
  sociometrySnapshots: DailySociometrySnapshot[];
} {
  let nextSnapshots = sociometrySnapshots;
  if (isNewDay) {
    const finishedDay = day - 1;
    if (
      finishedDay >= 1 &&
      !nextSnapshots.some((snap) => snap.day === finishedDay)
    ) {
      nextSnapshots = [
        ...nextSnapshots,
        generateDailySociometrySnapshot(
          agents,
          observationLog,
          finishedDay,
          seed,
          false
        ),
      ];
    }
    handleMorningReset(agents, rng);
  }

  const eventRes = stepLabEvents(
    activeEvents,
    agents,
    day,
    minutesOfDay,
    tickCount,
    rng
  );

  const nextRecent = [...eventRes.newlyTriggered, ...recentEvents].slice(0, 18);

  updateAgentsNeedsAndSocialTick(agents, eventRes.activeEvents, rng);

  // Evaluasi aktivitas baru bagi mahasiswa yang durasi aktivitasnya habis atau idle menunggu
  for (const agent of agents) {
    if (agent.status !== 'berpindah' && agent.activityDurationTicks <= 0) {
      assignNextActivityForAgent(
        agent,
        agents,
        map,
        grid,
        eventRes.activeEvents,
        minutesOfDay,
        rng
      );
    }
  }

  const nextObservationLog = recordObservationTick(observationLog, agents, day);

  return {
    activeEvents: eventRes.activeEvents,
    recentEvents: nextRecent,
    observationLog: nextObservationLog,
    sociometrySnapshots: nextSnapshots,
  };
}

/**
 * Memajukan dunia simulasi berdasarkan delta waktu nyata (detik).
 * Setiap 5 menit waktu simulasi menjalankan 1 tick penuh pengambilan keputusan & dinamika sosial.
 */
export function advanceWorld(
  world: WorldState,
  realDeltaSeconds: number,
  map: LabMapData,
  cachedGrid?: NavigationGrid
): WorldState {
  if (world.clock.paused || !Number.isFinite(realDeltaSeconds) || realDeltaSeconds <= 0) {
    return world;
  }

  const prevClock = world.clock;
  const nextClock = tickClock(prevClock, realDeltaSeconds);
  const simMinutesDelta =
    realDeltaSeconds * SIM_MINUTES_PER_REAL_SECOND_AT_1X * prevClock.speed;

  // Clone ringan daftar agen agar mutasi aman & terisolasi dalam langkah ini
  const agents: StudentAgent[] = world.agents.map((a) => ({
    ...a,
    position: { ...a.position },
    tilePosition: { ...a.tilePosition },
    targetPosition: a.targetPosition ? { ...a.targetPosition } : null,
    path: a.path,
    interactingWithIds: [...a.interactingWithIds],
    affinities: { ...a.affinities },
  }));

  moveAgentsAlongPaths(agents, simMinutesDelta, map);

  const prevKey = world.lastProcessedMinuteKey;
  const nextKey = getMinuteKey(nextClock.day, nextClock.minutesOfDay);

  let tickCount = world.tickCount;
  let activeEvents = world.activeEvents;
  let recentEvents = world.recentEvents;
  let rngStepCount = world.rngStepCount;
  let observationLog = world.observationLog;
  let sociometrySnapshots = world.sociometrySnapshots;

  if (nextKey !== prevKey) {
    const grid = cachedGrid ?? buildNavigationGrid(map, world.consultationDoorMode);
    const prevTotalTicks =
      (prevClock.day - 1) * 96 +
      Math.floor((prevClock.minutesOfDay - WORK_START_MINUTES) / 5);
    const nextTotalTicks =
      (nextClock.day - 1) * 96 +
      Math.floor((nextClock.minutesOfDay - WORK_START_MINUTES) / 5);

    const stepsToRun = Math.max(1, Math.min(96, nextTotalTicks - prevTotalTicks));
    let simulatedDay = prevClock.day;

    for (let s = 1; s <= stepsToRun; s += 1) {
      tickCount += 1;
      rngStepCount += 1;
      const tickRng = mulberry32(world.seed + rngStepCount * 7919);

      const globalTick = prevTotalTicks + s;
      const tickDay = Math.floor(globalTick / 96) + 1;
      const tickMinutes = WORK_START_MINUTES + (globalTick % 96) * 5;
      const isNewDay = tickDay > simulatedDay;
      simulatedDay = tickDay;

      const tickResult = advanceSingleFiveMinuteTick(
        agents,
        activeEvents,
        recentEvents,
        observationLog,
        sociometrySnapshots,
        tickDay,
        tickMinutes,
        tickCount,
        world.seed,
        map,
        grid,
        tickRng,
        isNewDay
      );
      activeEvents = tickResult.activeEvents;
      recentEvents = tickResult.recentEvents;
      observationLog = tickResult.observationLog;
      sociometrySnapshots = tickResult.sociometrySnapshots;
    }
  }

  return {
    ...world,
    tickCount,
    lastProcessedMinuteKey: nextKey,
    clock: nextClock,
    agents,
    activeEvents,
    recentEvents,
    rngStepCount,
    observationLog,
    sociometrySnapshots,
  };
}

/**
 * Memajukan simulasi tepat sampai akhir hari kerja saat ini (mengunci snapshot sosiometri harian),
 * berguna untuk pengujian cepat di Panel Pengembang tanpa mengubah logika gerak agen.
 */
export function advanceWorldToNextDay(
  world: WorldState,
  map: LabMapData,
  cachedGrid?: NavigationGrid
): WorldState {
  const targetDay = world.clock.day + 1;
  let current: WorldState = {
    ...world,
    clock: { ...world.clock, paused: false, speed: 4 },
  };
  let guard = 0;
  while (current.clock.day < targetDay && guard < 150) {
    current = advanceWorld(current, 0.25, map, cachedGrid);
    guard += 1;
  }
  return {
    ...current,
    clock: {
      ...current.clock,
      paused: world.clock.paused,
      speed: world.clock.speed,
    },
  };
}

export function getWorldSocialSummary(world: WorldState): WorldSocialSummary {
  const byActivity: Record<AgentActivityStatus, number> = {
    bekerja: 0,
    berpindah: 0,
    mengobrol: 0,
    istirahat: 0,
    menunggu: 0,
  };
  const bySocialStatus: Record<AgentSocialStatus, number> = {
    sendiri: 0,
    berkelompok: 0,
    berinteraksi: 0,
    'konflik-ringan': 0,
    menghindar: 0,
  };

  let energySum = 0;
  let stressSum = 0;
  let interactionLinks = 0;

  for (const agent of world.agents) {
    byActivity[agent.status] += 1;
    bySocialStatus[agent.socialStatus] += 1;
    energySum += agent.energy;
    stressSum += agent.stress;
    interactionLinks += agent.interactingWithIds.length;
  }

  const count = Math.max(1, world.agents.length);
  return {
    totalAgents: world.agents.length,
    byActivity,
    bySocialStatus,
    averageEnergy: energySum / count,
    averageStress: stressSum / count,
    activeInteractions: Math.floor(interactionLinks / 2),
    mildConflicts: bySocialStatus['konflik-ringan'],
  };
}
