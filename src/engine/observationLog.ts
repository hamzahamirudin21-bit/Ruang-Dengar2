import {
  AgentDayObservationSummary,
  LabMapData,
  ObservationLogState,
  StudentAgent,
  ZoneType,
} from '../types';

function createEmptyDaySummary(): AgentDayObservationSummary {
  return {
    totalTicks: 0,
    zoneTicks: {},
    aloneTicks: 0,
    groupTicks: 0,
    avoidTicks: 0,
    conflictTicks: 0,
  };
}

export function makePairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

export function createInitialObservationLog(
  agents: readonly StudentAgent[]
): ObservationLogState {
  const tileHeatmapByAgent: Record<string, Record<string, number>> = {};
  for (const agent of agents) {
    tileHeatmapByAgent[agent.id] = {};
  }

  return {
    byDay: {},
    tileHeatmapByAgent,
    coPresenceScores: {},
    coPresenceByDay: {},
  };
}

/**
 * Mencatat 1 tick pengamatan (5 menit simulasi) secara deterministik dan imutabel.
 */
export function recordObservationTick(
  prev: ObservationLogState,
  agents: readonly StudentAgent[],
  day: number
): ObservationLogState {
  const prevDayMap = prev.byDay[day] ?? {};
  const nextDayMap: Record<string, AgentDayObservationSummary> = { ...prevDayMap };
  const nextHeatmap: Record<string, Record<string, number>> = {
    ...prev.tileHeatmapByAgent,
  };
  const nextCoPresence: Record<string, number> = { ...prev.coPresenceScores };
  const prevCoDay = prev.coPresenceByDay[day] ?? {};
  const nextCoDay: Record<string, number> = { ...prevCoDay };

  for (const agent of agents) {
    const existing = prevDayMap[agent.id];
    const summary: AgentDayObservationSummary = existing
      ? {
          totalTicks: existing.totalTicks + 1,
          zoneTicks: { ...existing.zoneTicks },
          aloneTicks: existing.aloneTicks,
          groupTicks: existing.groupTicks,
          avoidTicks: existing.avoidTicks,
          conflictTicks: existing.conflictTicks,
        }
      : {
          ...createEmptyDaySummary(),
          totalTicks: 1,
        };

    summary.zoneTicks[agent.currentZoneId] =
      (summary.zoneTicks[agent.currentZoneId] ?? 0) + 1;

    if (agent.socialStatus === 'sendiri') {
      summary.aloneTicks += 1;
    } else if (
      agent.socialStatus === 'berkelompok' ||
      agent.socialStatus === 'berinteraksi'
    ) {
      summary.groupTicks += 1;
    } else if (agent.socialStatus === 'menghindar') {
      summary.avoidTicks += 1;
    } else if (agent.socialStatus === 'konflik-ringan') {
      summary.conflictTicks += 1;
    }

    nextDayMap[agent.id] = summary;

    const tx = Math.round(agent.position.x);
    const ty = Math.round(agent.position.y);
    const tileKey = `${tx},${ty}`;
    const prevTiles = prev.tileHeatmapByAgent[agent.id] ?? {};
    nextHeatmap[agent.id] = {
      ...prevTiles,
      [tileKey]: (prevTiles[tileKey] ?? 0) + 1,
    };
  }

  // Catat ko-presensi antar-agen yang tidak sedang berjalan di zona yang sama
  for (let i = 0; i < agents.length; i += 1) {
    const a = agents[i];
    if (a.status === 'berpindah') continue;

    for (let j = i + 1; j < agents.length; j += 1) {
      const b = agents[j];
      if (b.status === 'berpindah') continue;
      if (a.currentZoneId !== b.currentZoneId) continue;

      const dist = Math.hypot(
        a.position.x - b.position.x,
        a.position.y - b.position.y
      );
      if (dist > 4.5) continue;

      const pairKey = makePairKey(a.id, b.id);
      const isInteracting = a.interactingWithIds.includes(b.id);
      const weight = isInteracting ? 1.25 : 0.35;
      nextCoPresence[pairKey] = Number(
        ((nextCoPresence[pairKey] ?? 0) + weight).toFixed(3)
      );
      nextCoDay[pairKey] = Number(
        ((nextCoDay[pairKey] ?? 0) + weight).toFixed(3)
      );
    }
  }

  return {
    byDay: {
      ...prev.byDay,
      [day]: nextDayMap,
    },
    tileHeatmapByAgent: nextHeatmap,
    coPresenceScores: nextCoPresence,
    coPresenceByDay: {
      ...prev.coPresenceByDay,
      [day]: nextCoDay,
    },
  };
}

export function getAgentDominantZone(
  log: ObservationLogState,
  agentId: string,
  fallbackZoneId: ZoneType,
  upToDay?: number
): ZoneType {
  const totals: Partial<Record<ZoneType, number>> = {};

  for (const [dayStr, dayData] of Object.entries(log.byDay)) {
    const dayNum = Number(dayStr);
    if (upToDay !== undefined && dayNum > upToDay) continue;
    const summary = dayData[agentId];
    if (!summary) continue;
    for (const [zId, count] of Object.entries(summary.zoneTicks)) {
      const zone = zId as ZoneType;
      totals[zone] = (totals[zone] ?? 0) + (count ?? 0);
    }
  }

  let bestZone = fallbackZoneId;
  let bestCount = -1;
  for (const [zId, count] of Object.entries(totals)) {
    if ((count ?? 0) > bestCount) {
      bestCount = count ?? 0;
      bestZone = zId as ZoneType;
    }
  }
  return bestZone;
}

export function getAgentTileHeatmap(
  log: ObservationLogState,
  agentId: string
): { counts: Record<string, number>; maxCount: number } {
  const counts = log.tileHeatmapByAgent[agentId] ?? {};
  let maxCount = 0;
  for (const val of Object.values(counts)) {
    if (val > maxCount) maxCount = val;
  }
  return { counts, maxCount };
}

function getZoneLabel(map: LabMapData, zoneId: ZoneType): string {
  return map.zones.find((z) => z.id === zoneId)?.label ?? zoneId;
}

/**
 * Menghasilkan daftar pola perilaku murni berbasis hitungan log untuk satu agen.
 * DILARANG memuat tafsir psikologis atau label menghakimi.
 */
export function extractAgentBehavioralFacts(
  log: ObservationLogState,
  agent: StudentAgent,
  allAgents: readonly StudentAgent[],
  map: LabMapData
): string[] {
  const days = Object.keys(log.byDay)
    .map(Number)
    .sort((a, b) => a - b);

  if (days.length === 0) {
    return [];
  }

  const facts: string[] = [];
  const totalZoneTicks: Partial<Record<ZoneType, number>> = {};
  let totalObservedTicks = 0;
  let daysMostlyAlone = 0;
  let daysMostlyInteractive = 0;
  let totalAvoidOrConflict = 0;

  const dominantZoneByDay: ZoneType[] = [];

  for (const d of days) {
    const sum = log.byDay[d]?.[agent.id];
    if (!sum || sum.totalTicks === 0) continue;

    totalObservedTicks += sum.totalTicks;
    totalAvoidOrConflict += sum.avoidTicks + sum.conflictTicks;

    let dayBestZone: ZoneType = agent.currentZoneId;
    let dayBestCount = -1;
    for (const [zId, cnt] of Object.entries(sum.zoneTicks)) {
      const z = zId as ZoneType;
      const c = cnt ?? 0;
      totalZoneTicks[z] = (totalZoneTicks[z] ?? 0) + c;
      if (c > dayBestCount) {
        dayBestCount = c;
        dayBestZone = z;
      }
    }
    dominantZoneByDay.push(dayBestZone);

    if (sum.aloneTicks >= sum.totalTicks * 0.5) {
      daysMostlyAlone += 1;
    }
    if (sum.groupTicks >= sum.totalTicks * 0.4) {
      daysMostlyInteractive += 1;
    }
  }

  if (totalObservedTicks === 0) {
    return [];
  }

  const overallBestZone = getAgentDominantZone(log, agent.id, agent.currentZoneId);
  const overallBestTicks = totalZoneTicks[overallBestZone] ?? 0;
  const pctInBestZone = Math.round((overallBestTicks / totalObservedTicks) * 100);
  const daysInBestZone = dominantZoneByDay.filter((z) => z === overallBestZone).length;

  facts.push(
    `Dalam ${daysInBestZone} dari ${dominantZoneByDay.length} hari pengamatan, paling banyak berada di ${getZoneLabel(map, overallBestZone)} (${pctInBestZone}% dari ${totalObservedTicks} interval pengamatan).`
  );

  if (daysMostlyAlone > 0) {
    facts.push(
      `Dalam ${daysMostlyAlone} dari ${dominantZoneByDay.length} hari, separuh atau lebih waktu pengamatan tercatat tanpa interaksi langsung di tempat kerja (status "Sendiri").`
    );
  } else if (daysMostlyInteractive > 0) {
    facts.push(
      `Dalam ${daysMostlyInteractive} dari ${dominantZoneByDay.length} hari, cukup sering tercatat berinteraksi atau berkelompok bersama rekan sebaya.`
    );
  }

  // Rekan yang paling sering berada di zona dan waktu yang sama
  const peerScores: { name: string; score: number }[] = [];
  for (const other of allAgents) {
    if (other.id === agent.id) continue;
    const score = log.coPresenceScores[makePairKey(agent.id, other.id)] ?? 0;
    if (score >= 4) {
      peerScores.push({ name: other.name, score });
    }
  }
  peerScores.sort((a, b) => b.score - a.score);
  if (peerScores.length > 0) {
    const topNames = peerScores
      .slice(0, 3)
      .map((p) => p.name)
      .join(', ');
    facts.push(
      `Paling sering teramati berada pada area kerja atau diskusi yang sama dengan: ${topNames}.`
    );
  } else {
    facts.push(
      `Belum tercatat frekuensi kebersamaan yang dominan dengan rekan tertentu pada log interval sejauh ini.`
    );
  }

  if (totalAvoidOrConflict > 0) {
    facts.push(
      `Tercatat ${totalAvoidOrConflict} interval menjaga jarak atau gesekan teknis ringan saat zona kerja padat.`
    );
  }

  return facts;
}

/**
 * Menghasilkan ringkasan fakta perilaku kelompok dan lab secara keseluruhan (bebas tafsir).
 */
export function extractGroupBehavioralFacts(
  log: ObservationLogState,
  agents: readonly StudentAgent[],
  map: LabMapData
): string[] {
  const days = Object.keys(log.byDay)
    .map(Number)
    .sort((a, b) => a - b);
  if (days.length === 0) return [];

  const facts: string[] = [];

  // 1. Pasangan / kelompok dengan ko-presensi tertinggi
  const agentMap = new Map(agents.map((a) => [a.id, a]));
  const topPairs = Object.entries(log.coPresenceScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (topPairs.length > 0 && topPairs[0][1] >= 4) {
    const involvedIds = new Set<string>();
    for (const [key] of topPairs) {
      const [idA, idB] = key.split('|');
      involvedIds.add(idA);
      involvedIds.add(idB);
    }
    const names = Array.from(involvedIds)
      .slice(0, 4)
      .map((id) => agentMap.get(id)?.name ?? id)
      .join(', ');

    // Cari zona tersering untuk kelompok ini
    const zoneSum: Partial<Record<ZoneType, number>> = {};
    for (const id of involvedIds) {
      const z = getAgentDominantZone(log, id, 'diskusi');
      zoneSum[z] = (zoneSum[z] ?? 0) + 1;
    }
    let commonZone: ZoneType = 'diskusi';
    let bestCount = -1;
    for (const [zId, c] of Object.entries(zoneSum)) {
      if ((c ?? 0) > bestCount) {
        bestCount = c ?? 0;
        commonZone = zId as ZoneType;
      }
    }
    facts.push(
      `Mahasiswa yang kerap berada di area yang sama (${names}) paling sering teramati bersama di sekitar ${getZoneLabel(map, commonZone)}.`
    );
  }

  // 2. Hitung siapa yang dominan di Meja Diskusi Bersama
  const diskusiRegulars: string[] = [];
  const steadySoloWorkers: { name: string; zone: ZoneType }[] = [];

  for (const agent of agents) {
    let totalTicks = 0;
    let aloneTicks = 0;
    let conflictAvoid = 0;
    let diskusiTicks = 0;
    for (const d of days) {
      const s = log.byDay[d]?.[agent.id];
      if (!s) continue;
      totalTicks += s.totalTicks;
      aloneTicks += s.aloneTicks;
      conflictAvoid += s.avoidTicks + s.conflictTicks;
      diskusiTicks += s.zoneTicks.diskusi ?? 0;
    }
    if (totalTicks === 0) continue;
    if (diskusiTicks / totalTicks >= 0.28) {
      diskusiRegulars.push(agent.name);
    }
    if (aloneTicks / totalTicks >= 0.6 && conflictAvoid === 0) {
      steadySoloWorkers.push({
        name: agent.name,
        zone: getAgentDominantZone(log, agent.id, agent.currentZoneId),
      });
    }
  }

  if (diskusiRegulars.length >= 2) {
    facts.push(
      `Kelompok yang paling rutin berkumpul di ${getZoneLabel(map, 'diskusi')} antara lain: ${diskusiRegulars.slice(0, 4).join(', ')}.`
    );
  }

  if (steadySoloWorkers.length > 0) {
    const sample = steadySoloWorkers
      .slice(0, 3)
      .map((s) => `${s.name} (${getZoneLabel(map, s.zone)})`)
      .join(', ');
    facts.push(
      `Tercatat mahasiswa yang bekerja mandiri secara konsisten tanpa insiden gesekan pada log: ${sample}.`
    );
  }

  return facts;
}

const INTERPRETIVE_KEYWORDS: readonly string[] = [
  'malas',
  'pemalas',
  'sombong',
  'angkuh',
  'aneh',
  'bermasalah',
  'nakal',
  'bodoh',
  'egois',
  'depresi',
  'antisosial',
  'anti-sosial',
  'stres berat',
  'benci',
  'pemarah',
  'cari perhatian',
  'mengganggu',
  'toxic',
  'lemah',
  'menyedihkan',
  'frustrasi',
  'gagal',
];

/**
 * Validasi ringan kolom FAKTA pada Catatan Anekdot:
 * mendeteksi kata bernuansa tafsir/penilaian agar konselor memisahkannya ke kolom TAFSIR.
 */
export function detectInterpretiveWordsInFacts(factText: string): string[] {
  const normalized = factText.toLowerCase();
  const found: string[] = [];

  for (const keyword of INTERPRETIVE_KEYWORDS) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(normalized)) {
      found.push(keyword);
    }
  }

  return found;
}
