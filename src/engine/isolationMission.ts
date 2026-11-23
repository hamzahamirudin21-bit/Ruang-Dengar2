import type { ObservationLogState, StudentAgent } from '../types';
import type { MissionRecord } from './story/saveSlot';

/**
 * Model misi pengawasan isolasi sosial & kesehatan energi mahasiswa (modul murni, tanpa React/DOM).
 * Hanya membaca metrik yang terlihat (energi, status sosial, log pengamatan, status misi).
 */

export const ENERGY_CRITICAL_THRESHOLD = 0.35;
export const ENERGY_WARNING_THRESHOLD = 0.6;

export type AgentWellbeingTier = 'kritis' | 'waspada' | 'terhubung' | 'stabil';
export type AgentEnergyTrend = 'naik' | 'turun' | 'tetap';

export interface AgentWellbeingSnapshot {
  agentId: string;
  energyPct: number;
  tier: AgentWellbeingTier;
  trend: AgentEnergyTrend;
  /** Rasio 0..1 waktu pengamatan hari ini dalam status sendiri/menghindar. */
  isolationRatio: number;
  /** True bila mahasiswa sedang aktif berkomunikasi dengan rekan sebaya. */
  isCommunicating: boolean;
  /** Label singkat yang mudah dipindai konselor. */
  statusLabel: string;
}

export interface CampusMissionSummary {
  averageEnergyPct: number;
  criticalAgents: readonly StudentAgent[];
  warningAgents: readonly StudentAgent[];
  communicatingCount: number;
  healthyCount: number;
  missionsCompleted: number;
  missionsTotal: number;
  /** Mahasiswa dengan prioritas pendampingan tertinggi saat ini (bila ada yang < 60%). */
  topPriorityAgent: StudentAgent | null;
  /** Status keseluruhan kesehatan energi laboratorium. */
  campusStatus: 'darurat' | 'waspada' | 'terjaga';
}

export function isAgentCommunicating(agent: Pick<StudentAgent, 'interactingWithIds' | 'socialStatus'>): boolean {
  return (
    agent.interactingWithIds.length > 0 ||
    agent.socialStatus === 'berinteraksi' ||
    agent.socialStatus === 'berkelompok'
  );
}

export function energyTrendOf(
  agent: Pick<StudentAgent, 'interactingWithIds' | 'socialStatus' | 'status'>,
): AgentEnergyTrend {
  if (isAgentCommunicating(agent) || agent.status === 'mengobrol') return 'naik';
  if (agent.status === 'istirahat' && agent.socialStatus !== 'menghindar') return 'tetap';
  return 'turun';
}

export function isolationRatioForDay(
  log: ObservationLogState | null | undefined,
  agentId: string,
  day: number,
): number {
  const sum = log?.byDay[day]?.[agentId];
  if (!sum || sum.totalTicks <= 0) return 0;
  return Math.min(1, Math.max(0, (sum.aloneTicks + sum.avoidTicks) / sum.totalTicks));
}

export function classifyAgentWellbeing(
  agent: Pick<StudentAgent, 'id' | 'energy' | 'interactingWithIds' | 'socialStatus' | 'status'>,
  log?: ObservationLogState | null,
  day = 1,
): AgentWellbeingSnapshot {
  const energyPct = Math.round(Math.min(1, Math.max(0, agent.energy)) * 100);
  const communicating = isAgentCommunicating(agent);
  const trend = energyTrendOf(agent);
  const isolationRatio = isolationRatioForDay(log, agent.id, day);

  let tier: AgentWellbeingTier;
  let statusLabel: string;
  if (agent.energy < ENERGY_CRITICAL_THRESHOLD) {
    tier = 'kritis';
    statusLabel = communicating ? 'Kritis · Mulai Mengobrol' : 'Kritis · Terisolasi';
  } else if (agent.energy < ENERGY_WARNING_THRESHOLD) {
    tier = 'waspada';
    statusLabel = communicating ? 'Pulih · Berinteraksi' : 'Menurun · Jarang Ngobrol';
  } else if (communicating) {
    tier = 'terhubung';
    statusLabel = 'Aktif Ngobrol · Energi Naik';
  } else {
    tier = 'stabil';
    statusLabel = 'Energi Stabil';
  }

  return {
    agentId: agent.id,
    energyPct,
    tier,
    trend,
    isolationRatio,
    isCommunicating: communicating,
    statusLabel,
  };
}

/**
 * Mengurutkan mahasiswa berdasarkan urgensi misi pengawasan:
 * 1) Kritis (<35%) terendah dulu, 2) Waspada (<60%) terendah dulu,
 * 3) Yang belum selesai misi, 4) Sisanya menurut energi menaik.
 */
export function sortAgentsByUrgency(
  agents: readonly StudentAgent[],
  missions: Readonly<Record<string, MissionRecord>>,
  lostAgentIds?: ReadonlySet<string>,
): StudentAgent[] {
  const rank = (a: StudentAgent): number => {
    if (lostAgentIds?.has(a.id)) return 5;
    if (a.energy < ENERGY_CRITICAL_THRESHOLD) return 0;
    if (a.energy < ENERGY_WARNING_THRESHOLD) return 1;
    const status = missions[a.id]?.status ?? 'belum';
    if (status === 'lanjutan') return 2;
    if (status !== 'selesai') return 3;
    return 4;
  };
  return [...agents].sort((a, b) => {
    const rDiff = rank(a) - rank(b);
    if (rDiff !== 0) return rDiff;
    if (Math.abs(a.energy - b.energy) > 0.001) return a.energy - b.energy;
    return a.id.localeCompare(b.id);
  });
}

export function computeCampusMissionSummary(
  agents: readonly StudentAgent[],
  missions: Readonly<Record<string, MissionRecord>>,
  lostAgentIds?: ReadonlySet<string>,
): CampusMissionSummary {
  const activeAgents = lostAgentIds
    ? agents.filter((a) => !lostAgentIds.has(a.id))
    : agents;
  const total = agents.length;
  const activeTotal = activeAgents.length;
  const energySum = activeAgents.reduce((acc, a) => acc + Math.min(1, Math.max(0, a.energy)), 0);
  const averageEnergyPct = activeTotal > 0 ? Math.round((energySum / activeTotal) * 100) : 0;

  const criticalAgents = activeAgents
    .filter((a) => a.energy < ENERGY_CRITICAL_THRESHOLD)
    .sort((a, b) => a.energy - b.energy);
  const warningAgents = activeAgents
    .filter((a) => a.energy >= ENERGY_CRITICAL_THRESHOLD && a.energy < ENERGY_WARNING_THRESHOLD)
    .sort((a, b) => a.energy - b.energy);

  const communicatingCount = activeAgents.filter((a) => isAgentCommunicating(a)).length;
  const healthyCount = activeAgents.filter((a) => a.energy >= ENERGY_WARNING_THRESHOLD).length;
  const missionsCompleted = activeAgents.filter((a) => missions[a.id]?.status === 'selesai').length;

  const topPriorityAgent = criticalAgents[0] ?? warningAgents[0] ?? null;
  const campusStatus: CampusMissionSummary['campusStatus'] =
    criticalAgents.length > 0 ? 'darurat' : warningAgents.length > 0 ? 'waspada' : 'terjaga';

  return {
    averageEnergyPct,
    criticalAgents,
    warningAgents,
    communicatingCount,
    healthyCount,
    missionsCompleted,
    missionsTotal: total,
    topPriorityAgent,
    campusStatus,
  };
}
