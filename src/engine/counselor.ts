import { getContactChannelConfig } from '../data/contactChannels';
import { LAB_MAP } from '../data/map';
import {
  ContactActionOptions,
  ContactChannelId,
  CounselorActionLogEntry,
  CounselorDaySummary,
  CounselorState,
  LabMapData,
  PlaceholderConversationContext,
  StudentAgent,
  WorldState,
} from '../types';
import { SIM_MINUTES_PER_REAL_SECOND_AT_1X, formatClockTime } from './clock';
import {
  evaluateChannelAvailability,
  resolveContactChannel,
} from './contactChannels';
import { extractAgentBehavioralFacts } from './observationLog';
import { NavigationGrid } from './pathfinding';
import { clamp01 } from './rng';
import { assessChannelVisibility } from './visibility';
import { advanceWorld, advanceWorldToNextDay } from './world';

export const MAX_COUNSELOR_ENERGY = 100;
export const OBSERVE_CORNER_ENERGY_COST = 5;
export const OBSERVE_CORNER_MINUTES = 30;

export function createInitialCounselorState(): CounselorState {
  return {
    energy: MAX_COUNSELOR_ENERGY,
    maxEnergy: MAX_COUNSELOR_ENERGY,
    actionCounter: 0,
    actionLogs: [],
    exposureByAgent: {},
    daySummaries: [],
  };
}

/**
 * Memajukan simulasi dunia selama sejumlah menit simulasi penuh secara deterministik
 * sambil mempertahankan status jeda & kecepatan pengguna.
 */
export function advanceWorldByMinutes(
  world: WorldState,
  simMinutes: number,
  map: LabMapData = LAB_MAP,
  cachedGrid?: NavigationGrid
): WorldState {
  if (!Number.isFinite(simMinutes) || simMinutes <= 0) {
    return world;
  }

  let current: WorldState = {
    ...world,
    clock: {
      ...world.clock,
      paused: false,
      speed: 1,
    },
  };

  let remaining = simMinutes;
  const chunkMinutes = 5; // 1 detik nyata pada 1x = 5 menit simulasi
  while (remaining > 0.0001) {
    const stepMinutes = Math.min(chunkMinutes, remaining);
    const realSeconds = stepMinutes / SIM_MINUTES_PER_REAL_SECOND_AT_1X;
    current = advanceWorld(current, realSeconds, map, cachedGrid);
    remaining -= stepMinutes;
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

export function buildCounselorDaySummary(
  day: number,
  allLogs: readonly CounselorActionLogEntry[],
  remainingEnergy: number,
  endedReason: CounselorDaySummary['endedReason']
): CounselorDaySummary {
  const dayActions = allLogs.filter((entry) => entry.day === day);

  const contactedMap = new Map<
    string,
    { agentId: string; agentName: string; channelsUsed: string[] }
  >();
  const observedMap = new Map<string, { agentId: string; agentName: string }>();

  for (const entry of dayActions) {
    if (entry.kind === 'jalur-kontak') {
      const existing = contactedMap.get(entry.targetAgentId);
      if (existing) {
        if (!existing.channelsUsed.includes(entry.actionLabel)) {
          existing.channelsUsed.push(entry.actionLabel);
        }
      } else {
        contactedMap.set(entry.targetAgentId, {
          agentId: entry.targetAgentId,
          agentName: entry.targetAgentName,
          channelsUsed: [entry.actionLabel],
        });
      }
    } else if (entry.kind === 'amati-sudut') {
      if (!observedMap.has(entry.targetAgentId)) {
        observedMap.set(entry.targetAgentId, {
          agentId: entry.targetAgentId,
          agentName: entry.targetAgentName,
        });
      }
    }
  }

  return {
    day,
    endedReason,
    remainingEnergy: Math.max(0, Math.round(remainingEnergy)),
    actions: dayActions,
    contactedAgents: Array.from(contactedMap.values()),
    observedAgents: Array.from(observedMap.values()),
  };
}

export function resetCounselorForNewDay(
  counselor: CounselorState,
  completedSummary: CounselorDaySummary
): CounselorState {
  const alreadyStored = counselor.daySummaries.some(
    (s) => s.day === completedSummary.day
  );
  return {
    ...counselor,
    energy: MAX_COUNSELOR_ENERGY,
    daySummaries: alreadyStored
      ? counselor.daySummaries
      : [completedSummary, ...counselor.daySummaries],
  };
}

/**
 * Menyelesaikan transisi hari ketika energi habis atau jam kerja berakhir:
 * memastikan dunia maju ke pagi hari berikutnya (08:00) dan energi konselor pulih ke 100.
 */
export function finalizeEndOfDayTransition(
  counselor: CounselorState,
  world: WorldState,
  completedSummary: CounselorDaySummary,
  map: LabMapData = LAB_MAP,
  cachedGrid?: NavigationGrid
): { nextCounselor: CounselorState; nextWorld: WorldState } {
  const nextWorld =
    world.clock.day <= completedSummary.day
      ? advanceWorldToNextDay(world, map, cachedGrid)
      : world;

  const nextCounselor = resetCounselorForNewDay(counselor, completedSummary);
  return { nextCounselor, nextWorld };
}

export interface CornerObservationResult {
  ok: boolean;
  error?: string;
  nextCounselor: CounselorState;
  nextWorld: WorldState;
  logEntry?: CounselorActionLogEntry;
  dayEnded: boolean;
  completedDaySummary?: CounselorDaySummary;
}

/**
 * Menjalankan aksi "Amati dari sudut" (5 energi, 30 menit simulasi) dan memasukkan
 * dinamika 30 menit tersebut ke observationLog dunia.
 */
export function executeCornerObservation(
  counselor: CounselorState,
  world: WorldState,
  targetAgentId: string,
  map: LabMapData = LAB_MAP,
  cachedGrid?: NavigationGrid
): CornerObservationResult {
  if (counselor.energy < OBSERVE_CORNER_ENERGY_COST) {
    return {
      ok: false,
      error: 'Energi konselor tidak cukup untuk mengamati.',
      nextCounselor: counselor,
      nextWorld: world,
      dayEnded: false,
    };
  }

  const targetBefore = world.agents.find((a) => a.id === targetAgentId);
  if (!targetBefore) {
    return {
      ok: false,
      error: 'Mahasiswa sasaran tidak ditemukan.',
      nextCounselor: counselor,
      nextWorld: world,
      dayEnded: false,
    };
  }

  const actionDay = world.clock.day;
  const actionTimeFormatted = formatClockTime(world.clock.minutesOfDay);
  const nextWorld = advanceWorldByMinutes(
    world,
    OBSERVE_CORNER_MINUTES,
    map,
    cachedGrid
  );

  const targetAfter =
    nextWorld.agents.find((a) => a.id === targetAgentId) ?? targetBefore;
  const facts = extractAgentBehavioralFacts(
    nextWorld.observationLog,
    targetAfter,
    nextWorld.agents,
    map
  );
  const zoneLabel =
    map.zones.find((z) => z.id === targetAfter.currentZoneId)?.shortLabel ??
    targetAfter.currentZoneId;

  const nextCounter = counselor.actionCounter + 1;
  const nextEnergy = Math.max(0, counselor.energy - OBSERVE_CORNER_ENERGY_COST);

  const logEntry: CounselorActionLogEntry = {
    id: `aksi-${actionDay}-${nextCounter}`,
    day: actionDay,
    timeFormatted: actionTimeFormatted,
    kind: 'amati-sudut',
    actionLabel: 'Amati dari sudut',
    targetAgentId: targetAfter.id,
    targetAgentName: targetAfter.name,
    energyCost: OBSERVE_CORNER_ENERGY_COST,
    durationMinutes: OBSERVE_CORNER_MINUTES,
    witnessCount: 0,
    outcomeSummary:
      facts[0] ?? `Teramati di ${zoneLabel} selama 30 menit simulasi.`,
  };

  const nextLogs = [logEntry, ...counselor.actionLogs];
  const clockRolledOver = nextWorld.clock.day > actionDay;
  const energyDepleted = nextEnergy <= 0;
  const dayEnded = clockRolledOver || energyDepleted;

  let nextCounselor: CounselorState = {
    ...counselor,
    energy: nextEnergy,
    actionCounter: nextCounter,
    actionLogs: nextLogs,
  };

  let completedDaySummary: CounselorDaySummary | undefined;
  if (dayEnded) {
    completedDaySummary = buildCounselorDaySummary(
      actionDay,
      nextLogs,
      nextEnergy,
      energyDepleted ? 'energi-habis' : 'jam-selesai'
    );
    nextCounselor = {
      ...nextCounselor,
      daySummaries: [completedDaySummary, ...nextCounselor.daySummaries],
    };
  }

  return {
    ok: true,
    nextCounselor,
    nextWorld,
    logEntry,
    dayEnded,
    completedDaySummary,
  };
}

export interface ContactChannelExecutionResult {
  ok: boolean;
  error?: string;
  nextCounselor: CounselorState;
  nextWorld: WorldState;
  logEntry?: CounselorActionLogEntry;
  conversationContext?: PlaceholderConversationContext;
  dayEnded: boolean;
  completedDaySummary?: CounselorDaySummary;
}

function applyHiddenCounselingDeltas(
  agents: StudentAgent[],
  targetAgentId: string,
  trustDelta: number,
  readinessDelta: number,
  ruptureDelta: number,
  socialComfortDelta: number
): StudentAgent[] {
  return agents.map((agent) => {
    if (agent.id !== targetAgentId) return agent;
    return {
      ...agent,
      hiddenVars: {
        ...agent.hiddenVars,
        trustInCounselor: clamp01(agent.hiddenVars.trustInCounselor + trustDelta),
        disclosureReadiness: clamp01(
          agent.hiddenVars.disclosureReadiness + readinessDelta
        ),
        ruptureLevel: clamp01(agent.hiddenVars.ruptureLevel + ruptureDelta),
        socialComfort: clamp01(agent.hiddenVars.socialComfort + socialComfortDelta),
      },
    };
  });
}

/**
 * Menjalankan salah satu dari 6 jalur kontak, menghitung saksi & paparan gosip,
 * memajukan waktu simulasi, mengurangi energi konselor, serta menyiapkan layar percakapan placeholder.
 */
export function executeContactChannelAction(
  counselor: CounselorState,
  world: WorldState,
  targetAgentId: string,
  channelId: ContactChannelId,
  options: ContactActionOptions = {},
  map: LabMapData = LAB_MAP,
  cachedGrid?: NavigationGrid
): ContactChannelExecutionResult {
  const channel = getContactChannelConfig(channelId);
  const targetBefore = world.agents.find((a) => a.id === targetAgentId);
  if (!targetBefore) {
    return {
      ok: false,
      error: 'Mahasiswa sasaran tidak ditemukan.',
      nextCounselor: counselor,
      nextWorld: world,
      dayEnded: false,
    };
  }

  const availability = evaluateChannelAvailability(
    channel,
    targetBefore,
    world,
    counselor.energy
  );
  if (!availability.available) {
    return {
      ok: false,
      error: availability.unavailableReason ?? 'Jalur tidak tersedia saat ini.',
      nextCounselor: counselor,
      nextWorld: world,
      dayEnded: false,
    };
  }

  const actionDay = world.clock.day;
  const actionTimeFormatted = formatClockTime(world.clock.minutesOfDay);
  const nextCounter = counselor.actionCounter + 1;

  // Hitung saksi & paparan tepat pada momen pendekatan sebelum waktu dimajukan
  const visibility = assessChannelVisibility(
    channel.id,
    targetBefore,
    world.agents,
    world.consultationDoorMode,
    map,
    options.intermediaryKind
  );

  const resolution = resolveContactChannel(
    channel,
    targetBefore,
    world,
    visibility,
    options,
    nextCounter
  );

  const advancedWorld = advanceWorldByMinutes(
    world,
    channel.durationMinutes,
    map,
    cachedGrid
  );

  const updatedAgents = applyHiddenCounselingDeltas(
    advancedWorld.agents,
    targetBefore.id,
    resolution.trustDelta,
    resolution.readinessDelta,
    resolution.ruptureDelta,
    resolution.socialComfortDelta
  );

  const nextWorld: WorldState = {
    ...advancedWorld,
    agents: updatedAgents,
  };

  const nextEnergy = Math.max(0, counselor.energy - channel.energyCost);
  const prevExposure = counselor.exposureByAgent[targetBefore.id] ?? 0;
  const nextExposure = Number(
    Math.min(1, prevExposure + visibility.exposureDelta).toFixed(4)
  );

  const targetZoneLabel =
    map.zones.find((z) => z.id === targetBefore.currentZoneId)?.label ??
    targetBefore.currentZoneId;

  const logEntry: CounselorActionLogEntry = {
    id: `aksi-${actionDay}-${nextCounter}`,
    day: actionDay,
    timeFormatted: actionTimeFormatted,
    kind: 'jalur-kontak',
    channelId: channel.id,
    actionLabel: channel.shortName,
    targetAgentId: targetBefore.id,
    targetAgentName: targetBefore.name,
    energyCost: channel.energyCost,
    durationMinutes: channel.durationMinutes,
    witnessCount: visibility.witnessCount,
    outcomeSummary: resolution.outcomeSummary,
  };

  const nextLogs = [logEntry, ...counselor.actionLogs];
  const clockRolledOver = nextWorld.clock.day > actionDay;
  const energyDepleted = nextEnergy <= 0;
  const dayEnded = clockRolledOver || energyDepleted;

  const conversationContext: PlaceholderConversationContext = {
    channelId: channel.id,
    channelName: channel.name,
    targetAgentId: targetBefore.id,
    targetAgentName: targetBefore.name,
    targetZoneLabel,
    day: actionDay,
    timeFormatted: actionTimeFormatted,
    scheduledTimeLabel: options.scheduledTimeLabel,
    intermediaryKind: options.intermediaryKind,
    shareDetailsToIntermediary: options.shareDetailsToIntermediary,
    witnessCount: visibility.witnessCount,
    witnessNames: visibility.witnessNames,
    visibilitySummary: visibility.summaryText,
    outcomeKind: resolution.outcomeKind,
    outcomeHeadline: resolution.outcomeHeadline,
    outcomeDescription: resolution.outcomeDescription,
    maxDialogueLevel: channel.maxDialogueLevel,
    energyCost: channel.energyCost,
    durationMinutes: channel.durationMinutes,
    endsDayAfterClose: dayEnded,
  };

  let nextCounselor: CounselorState = {
    ...counselor,
    energy: nextEnergy,
    actionCounter: nextCounter,
    actionLogs: nextLogs,
    exposureByAgent: {
      ...counselor.exposureByAgent,
      [targetBefore.id]: nextExposure,
    },
  };

  let completedDaySummary: CounselorDaySummary | undefined;
  if (dayEnded) {
    completedDaySummary = buildCounselorDaySummary(
      actionDay,
      nextLogs,
      nextEnergy,
      energyDepleted ? 'energi-habis' : 'jam-selesai'
    );
    nextCounselor = {
      ...nextCounselor,
      daySummaries: [completedDaySummary, ...nextCounselor.daySummaries],
    };
  }

  return {
    ok: true,
    nextCounselor,
    nextWorld,
    logEntry,
    conversationContext,
    dayEnded,
    completedDaySummary,
  };
}
