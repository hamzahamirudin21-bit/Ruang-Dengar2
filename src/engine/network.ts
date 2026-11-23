import {
  DailySociometrySnapshot,
  ObservationLogState,
  SociogramNodePosition,
  SociometryNetworkStats,
  SociometryNodeMetrics,
  SociometryStatus,
  StudentAgent,
  ZoneType,
} from '../types';
import { getAgentDominantZone } from './observationLog';
import { mulberry32 } from './rng';

function computeConnectedComponents(
  nodeIds: readonly string[],
  adj: Record<string, Set<string>>
): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  for (const startId of nodeIds) {
    if (visited.has(startId)) continue;
    const comp: string[] = [];
    const queue: string[] = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      comp.push(curr);
      const neighbors = adj[curr];
      if (!neighbors) continue;
      for (const next of neighbors) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }

    comp.sort();
    components.push(comp);
  }

  components.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));
  return components;
}

function isArticulationVertex(
  targetId: string,
  componentMembers: readonly string[],
  adj: Record<string, Set<string>>
): boolean {
  if (componentMembers.length < 3) return false;
  const remaining = componentMembers.filter((id) => id !== targetId);
  if (remaining.length < 2) return false;

  const visited = new Set<string>();
  const queue: string[] = [remaining[0]];
  visited.add(remaining[0]);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adj[curr];
    if (!neighbors) continue;
    for (const next of neighbors) {
      if (next === targetId || visited.has(next)) continue;
      visited.add(next);
      queue.push(next);
    }
  }

  return visited.size < remaining.length;
}

/**
 * Menganalisis statistik sosiometri klasik, timbal balik, komponen terhubung,
 * serta klasifikasi bintang, terisolasi, terabaikan, dan jembatan.
 */
export function analyzeSociometryNetwork(
  snapshot: DailySociometrySnapshot,
  agents: readonly StudentAgent[],
  observationLog: ObservationLogState
): SociometryNetworkStats {
  const agentIds = agents.map((a) => a.id);
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  const outgoing: Record<string, string[]> = {};
  const incoming: Record<string, string[]> = {};
  const undirectedAdj: Record<string, Set<string>> = {};

  for (const id of agentIds) {
    outgoing[id] = [];
    incoming[id] = [];
    undirectedAdj[id] = new Set<string>();
  }

  let totalDirectedChoices = 0;

  for (const fromId of agentIds) {
    const rawTargets = snapshot.choicesByAgent[fromId] ?? [];
    const uniqueTargets: string[] = [];
    const seen = new Set<string>();

    for (const toId of rawTargets) {
      if (toId === fromId || !agentMap.has(toId) || seen.has(toId)) continue;
      seen.add(toId);
      uniqueTargets.push(toId);
    }

    outgoing[fromId] = uniqueTargets;
    totalDirectedChoices += uniqueTargets.length;

    for (const toId of uniqueTargets) {
      incoming[toId].push(fromId);
      undirectedAdj[fromId].add(toId);
      undirectedAdj[toId].add(fromId);
    }
  }

  // Hitung pasangan timbal balik
  const mutualByAgent: Record<string, string[]> = {};
  let reciprocalDirectedChoices = 0;

  for (const id of agentIds) {
    const outSet = new Set(outgoing[id]);
    const mutual = incoming[id].filter((src) => outSet.has(src));
    mutualByAgent[id] = mutual;
    reciprocalDirectedChoices += mutual.length;
  }

  const reciprocalPairCount = Math.floor(reciprocalDirectedChoices / 2);
  const reciprocityChoicePercent =
    totalDirectedChoices > 0
      ? Number(((reciprocalDirectedChoices / totalDirectedChoices) * 100).toFixed(1))
      : 0;

  const agentsWithReciprocalCount = agentIds.filter(
    (id) => mutualByAgent[id].length >= 1
  ).length;
  const agentsWithReciprocalPercent =
    agentIds.length > 0
      ? Number(((agentsWithReciprocalCount / agentIds.length) * 100).toFixed(1))
      : 0;

  // Komponen terhubung (graf tak berarah)
  const components = computeConnectedComponents(agentIds, undirectedAdj);
  const componentByAgent: Record<string, string[]> = {};
  for (const comp of components) {
    for (const id of comp) {
      componentByAgent[id] = comp;
    }
  }

  // Ambang 10% teratas untuk status bintang
  const receivedCountsDesc = agentIds
    .map((id) => incoming[id].length)
    .sort((a, b) => b - a);
  const top10Idx = Math.max(0, Math.ceil(agentIds.length * 0.1) - 1);
  const starThreshold = Math.max(1, receivedCountsDesc[top10Idx] ?? 1);

  const nodeMetrics: Record<string, SociometryNodeMetrics> = {};
  const orderedMetrics: SociometryNodeMetrics[] = [];

  for (const agent of agents) {
    const id = agent.id;
    const receivedCount = incoming[id].length;
    const sentCount = outgoing[id].length;
    const mutualCount = mutualByAgent[id].length;

    const isIsolated = receivedCount === 0;
    const isNeglected = receivedCount === 1 && mutualCount === 0;
    const isStar = receivedCount >= starThreshold && receivedCount > 0;
    const isBridge = isArticulationVertex(
      id,
      componentByAgent[id] ?? [id],
      undirectedAdj
    );

    let status: SociometryStatus = 'umum';
    if (isIsolated) status = 'terisolasi';
    else if (isNeglected) status = 'terabaikan';
    else if (isBridge) status = 'jembatan';
    else if (isStar) status = 'bintang';

    const dominantZoneId = getAgentDominantZone(
      observationLog,
      id,
      agent.currentZoneId,
      snapshot.day
    );

    const metric: SociometryNodeMetrics = {
      agentId: id,
      name: agent.name,
      receivedCount,
      sentCount,
      mutualCount,
      incomingFromIds: [...incoming[id]],
      outgoingToIds: [...outgoing[id]],
      mutualIds: [...mutualByAgent[id]],
      dominantZoneId,
      isStar,
      isIsolated,
      isNeglected,
      isBridge,
      status,
    };

    nodeMetrics[id] = metric;
    orderedMetrics.push(metric);
  }

  orderedMetrics.sort(
    (a, b) =>
      b.receivedCount - a.receivedCount ||
      b.mutualCount - a.mutualCount ||
      a.name.localeCompare(b.name)
  );

  return {
    day: snapshot.day,
    totalAgents: agents.length,
    totalDirectedChoices,
    reciprocalDirectedChoices,
    reciprocalPairCount,
    reciprocityChoicePercent,
    agentsWithReciprocalCount,
    agentsWithReciprocalPercent,
    starThreshold,
    componentCount: components.length,
    components,
    nodeMetrics,
    orderedMetrics,
  };
}

const ZONE_CLUSTER_ANGLE: Record<ZoneType, number> = {
  'elektronik-iot': 0,
  pemrograman: 1.1,
  'cetak-3d': 2.2,
  las: 3.1,
  diskusi: 4.1,
  istirahat: 4.9,
  'gudang-alat': 5.6,
  'ruang-dosen': 0.55,
  konsultasi: 2.7,
  'studio-desain': 1.65,
  'pojok-baca': 4.5,
};

/**
 * Menghitung tata letak force-directed deterministik yang stabil (tidak berkedip).
 * Mendukung posisi awal sebelumnya agar transisi antar-hari tetap mudah dibaca.
 */
export function computeStableForceLayout(
  snapshot: DailySociometrySnapshot,
  agents: readonly StudentAgent[],
  stats: SociometryNetworkStats,
  width: number,
  height: number,
  previousPositions?: Record<string, SociogramNodePosition>
): Record<string, SociogramNodePosition> {
  const rng = mulberry32(snapshot.day * 2029 + 71);
  const cx = width / 2;
  const cy = height / 2;
  const pad = 26;
  const maxRadius = Math.max(40, Math.min(width, height) * 0.34);

  const pos: Record<string, SociogramNodePosition> = {};
  const disp: Record<string, { x: number; y: number }> = {};

  agents.forEach((agent, index) => {
    const prev = previousPositions?.[agent.id];
    if (prev && Number.isFinite(prev.x) && Number.isFinite(prev.y)) {
      pos[agent.id] = {
        x: Math.max(pad, Math.min(width - pad, prev.x)),
        y: Math.max(pad, Math.min(height - pad, prev.y)),
      };
    } else {
      const zone = stats.nodeMetrics[agent.id]?.dominantZoneId ?? agent.currentZoneId;
      const baseAngle = ZONE_CLUSTER_ANGLE[zone] ?? (index / Math.max(1, agents.length)) * Math.PI * 2;
      const angle = baseAngle + (rng() - 0.5) * 0.9;
      const metric = stats.nodeMetrics[agent.id];
      const radiusFactor = metric?.isIsolated ? 0.88 : metric?.isStar ? 0.36 : 0.62;
      const r = maxRadius * (radiusFactor + (rng() - 0.5) * 0.2);
      pos[agent.id] = {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      };
    }
    disp[agent.id] = { x: 0, y: 0 };
  });

  // Bangun daftar sisi tak berarah unik dengan bobot (timbal balik lebih kuat menarik)
  const edgeMap = new Map<string, { a: string; b: string; weight: number }>();
  for (const agent of agents) {
    const metric = stats.nodeMetrics[agent.id];
    if (!metric) continue;
    const mutualSet = new Set(metric.mutualIds);
    for (const targetId of metric.outgoingToIds) {
      const key = agent.id < targetId ? `${agent.id}|${targetId}` : `${targetId}|${agent.id}`;
      const existing = edgeMap.get(key);
      const isMutual = mutualSet.has(targetId);
      if (!existing) {
        edgeMap.set(key, {
          a: agent.id,
          b: targetId,
          weight: isMutual ? 1.6 : 0.9,
        });
      } else if (isMutual) {
        existing.weight = 1.6;
      }
    }
  }
  const edges = Array.from(edgeMap.values());

  const area = Math.max(10000, (width - pad * 2) * (height - pad * 2));
  const k = Math.sqrt(area / Math.max(1, agents.length)) * 0.68;
  const iterations = 150;

  for (let iter = 0; iter < iterations; iter += 1) {
    for (const agent of agents) {
      disp[agent.id].x = 0;
      disp[agent.id].y = 0;
    }

    // Gaya tolak-menolak antar semua simpul
    for (let i = 0; i < agents.length; i += 1) {
      const idA = agents[i].id;
      const pA = pos[idA];
      for (let j = i + 1; j < agents.length; j += 1) {
        const idB = agents[j].id;
        const pB = pos[idB];
        let dx = pA.x - pB.x;
        let dy = pA.y - pB.y;
        let dist = Math.hypot(dx, dy);
        if (dist < 0.01) {
          dx = 0.5;
          dy = 0.5;
          dist = 0.7;
        }
        const repulse = (k * k) / dist;
        const rx = (dx / dist) * repulse;
        const ry = (dy / dist) * repulse;
        disp[idA].x += rx;
        disp[idA].y += ry;
        disp[idB].x -= rx;
        disp[idB].y -= ry;
      }
    }

    // Gaya tarik pada sisi pilihan sosiometri
    for (const edge of edges) {
      const pA = pos[edge.a];
      const pB = pos[edge.b];
      const dx = pA.x - pB.x;
      const dy = pA.y - pB.y;
      const dist = Math.max(0.01, Math.hypot(dx, dy));
      const attract = ((dist * dist) / k) * edge.weight * 0.56;
      const ax = (dx / dist) * attract;
      const ay = (dy / dist) * attract;
      disp[edge.a].x -= ax;
      disp[edge.a].y -= ay;
      disp[edge.b].x += ax;
      disp[edge.b].y += ay;
    }

    // Gravitasi ke pusat agar simpul membentuk konstelasi rapi di dalam kanvas
    for (const agent of agents) {
      const p = pos[agent.id];
      const metric = stats.nodeMetrics[agent.id];
      const gravity = metric?.isIsolated ? 0.34 : 0.24;
      disp[agent.id].x += (cx - p.x) * gravity;
      disp[agent.id].y += (cy - p.y) * gravity;
    }

    // Batasi langkah berdasarkan cooling temperature
    const temp = Math.max(1.2, (1 - iter / iterations) * (Math.min(width, height) * 0.08));
    for (const agent of agents) {
      const d = disp[agent.id];
      const len = Math.hypot(d.x, d.y);
      if (len > 0.0001) {
        const step = Math.min(len, temp);
        pos[agent.id].x += (d.x / len) * step;
        pos[agent.id].y += (d.y / len) * step;
      }
      pos[agent.id].x = Math.max(pad, Math.min(width - pad, pos[agent.id].x));
      pos[agent.id].y = Math.max(pad, Math.min(height - pad, pos[agent.id].y));
    }
  }

  return pos;
}

export interface RawSociometryConsoleReport {
  day: number;
  isLivePreview: boolean;
  totalAgents: number;
  totalDirectedChoices: number;
  reciprocalPairCount: number;
  reciprocalDirectedChoices: number;
  reciprocityChoicePercent: number;
  agentsWithReciprocalCount: number;
  agentsWithReciprocalPercent: number;
  starThresholdTop10Percent: number;
  componentCount: number;
  components: string[][];
  perAgentRows: {
    id: string;
    name: string;
    receivedCount: number;
    sentCount: number;
    mutualCount: number;
    status: SociometryStatus;
    flags: string;
    outgoingTo: string[];
    incomingFrom: string[];
  }[];
}

export function buildRawSociometryConsoleReport(
  snapshot: DailySociometrySnapshot,
  stats: SociometryNetworkStats
): RawSociometryConsoleReport {
  return {
    day: snapshot.day,
    isLivePreview: Boolean(snapshot.isLivePreview),
    totalAgents: stats.totalAgents,
    totalDirectedChoices: stats.totalDirectedChoices,
    reciprocalPairCount: stats.reciprocalPairCount,
    reciprocalDirectedChoices: stats.reciprocalDirectedChoices,
    reciprocityChoicePercent: stats.reciprocityChoicePercent,
    agentsWithReciprocalCount: stats.agentsWithReciprocalCount,
    agentsWithReciprocalPercent: stats.agentsWithReciprocalPercent,
    starThresholdTop10Percent: stats.starThreshold,
    componentCount: stats.componentCount,
    components: stats.components,
    perAgentRows: stats.orderedMetrics.map((m) => ({
      id: m.agentId,
      name: m.name,
      receivedCount: m.receivedCount,
      sentCount: m.sentCount,
      mutualCount: m.mutualCount,
      status: m.status,
      flags:
        [
          m.isStar ? 'BINTANG' : '',
          m.isBridge ? 'JEMBATAN' : '',
          m.isIsolated ? 'TERISOLASI' : '',
          m.isNeglected ? 'TERABAIKAN' : '',
        ]
          .filter(Boolean)
          .join(',') || 'UMUM',
      outgoingTo: m.outgoingToIds,
      incomingFrom: m.incomingFromIds,
    })),
  };
}
