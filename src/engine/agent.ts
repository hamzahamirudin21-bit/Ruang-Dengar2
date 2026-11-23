import {
  AgentActivityStatus,
  GridPoint,
  LabEvent,
  LabMapData,
  StudentAgent,
  ZoneType,
} from '../types';
import { NavigationGrid, findPath, isPointWalkable } from './pathfinding';
import { SeededRng, clamp01, clampAffinity, pickOne, randomInt } from './rng';
import { STABILIZED_MIN_ENERGY } from './survivalMission';

export interface AgentTickControlOptions {
  /** Mahasiswa yang sedang duduk dalam sesi percakapan (posisi & drain pasifnya ditahan). */
  inSessionAgentIds?: ReadonlySet<string>;
  /** Mahasiswa yang sudah hilang dari kelas (energi 0%, tidak bergerak/berinteraksi). */
  lostAgentIds?: ReadonlySet<string>;
  /** Mahasiswa yang sudah stabil ('selesai'), energinya terlindungi tidak jatuh ke 0%. */
  stabilizedAgentIds?: ReadonlySet<string>;
}

export interface ActivityCandidate {
  zoneId: ZoneType;
  targetStatus: Exclude<AgentActivityStatus, 'berpindah'>;
  goal: string;
  score: number;
  durationTicks: number;
}

/**
 * Bonus skor zona Meja Diskusi saat ada event 'diskusi-proyek'.
 * Dengan 0.24, Meja Diskusi kosong pada sekitar 6% hari simulasi kohort 15
 * mahasiswa; 0.4 menjaga zona tetap terpakai.
 */
const DISCUSSION_EVENT_SCORE_BONUS = 0.4;

const WORK_ZONES: readonly ZoneType[] = [
  'cetak-3d',
  'pemrograman',
  'las',
  'elektronik-iot',
  'studio-desain',
];

function getInterestAndSkillForZone(
  agent: StudentAgent,
  zoneId: ZoneType
): { interest: number; skill: number } {
  switch (zoneId) {
    case 'cetak-3d':
      return { interest: agent.interests.cetak3d, skill: agent.skills.cetak3d };
    case 'pemrograman':
      return { interest: agent.interests.pemrograman, skill: agent.skills.pemrograman };
    case 'las':
      return { interest: agent.interests.pengelasan, skill: agent.skills.pengelasan };
    case 'elektronik-iot':
      return { interest: agent.interests.elektronika, skill: agent.skills.elektronika };
    case 'studio-desain':
      return {
        interest: Math.max(agent.interests.pemrograman, agent.interests.cetak3d) * 0.65 + agent.personality.openness * 0.35,
        skill: Math.max(agent.skills.pemrograman, agent.skills.cetak3d),
      };
    case 'pojok-baca':
      return {
        interest: agent.personality.openness * 0.55 + agent.personality.conscientiousness * 0.45,
        skill: (agent.skills.pemrograman + agent.skills.elektronika) / 2,
      };
    default:
      return { interest: 0.4, skill: 0.5 };
  }
}

function getWorkGoalForZone(agent: StudentAgent, zoneId: ZoneType): string {
  switch (zoneId) {
    case 'cetak-3d':
      return agent.skills.cetak3d > 0.7
        ? 'Mengkalibrasi cetak komponen presisi'
        : 'Memantau proses cetak prototipe 3D';
    case 'pemrograman':
      return agent.skills.pemrograman > 0.75
        ? 'Mengoptimasi firmware mikrokontroler'
        : 'Menguji logika program dan debugging';
    case 'las':
      return 'Mengelas rangka praktikum sesuai prosedur K3';
    case 'elektronik-iot':
      return agent.skills.elektronika > 0.7
        ? 'Menguji sinyal rangkaian dengan osiloskop'
        : 'Menyolder dan merakit modul sensor IoT';
    case 'studio-desain':
      return 'Merancang antarmuka dan sketsa purwarupa multimedia';
    case 'pojok-baca':
      return 'Membaca referensi modul dan menyusun catatan riset';
    case 'gudang-alat':
      return 'Mengambil alat ukur dan komponen cadangan';
    case 'diskusi':
      return 'Berdiskusi dan menyinkronkan progres kelompok';
    case 'istirahat':
      return 'Beristirahat dan memulihkan fokus sejenak';
    case 'ruang-dosen':
      return 'Berkonsultasi singkat terkait arahan tugas lab';
    case 'konsultasi':
      return 'Menunggu jadwal konsultasi';
  }
}

/**
 * Menghitung skor utilitas kandidat aktivitas/zona bagi satu mahasiswa.
 * Catatan etis: fungsi ini SAMA SEKALI tidak mengakses demographicLabel.
 */
export function scoreAgentActivityCandidates(
  agent: StudentAgent,
  allAgents: readonly StudentAgent[],
  map: LabMapData,
  activeEvents: readonly LabEvent[],
  minutesOfDay: number
): ActivityCandidate[] {
  const candidates: ActivityCandidate[] = [];

  // Hitung jumlah agen & afinitas per zona
  const occupantsByZone: Record<string, StudentAgent[]> = {};
  for (const z of map.zones) {
    occupantsByZone[z.id] = [];
  }
  for (const other of allAgents) {
    if (other.id === agent.id) continue;
    const zId = other.status === 'berpindah' ? other.targetZoneId : other.currentZoneId;
    if (occupantsByZone[zId]) {
      occupantsByZone[zId].push(other);
    }
  }

  const isLunchWindow = minutesOfDay >= 705 && minutesOfDay <= 775; // 11:45 - 12:55
  const hasLunchEvent = activeEvents.some((e) => e.kind === 'jeda-siang');
  const hasDiscussEvent = activeEvents.some((e) => e.kind === 'diskusi-proyek');

  for (const zone of map.zones) {
    // Ruang Konsultasi dijaga khusus untuk sesi konseling (tidak dimasuki acak oleh rutinitas)
    if (zone.id === 'konsultasi') continue;

    const peers = occupantsByZone[zone.id] ?? [];
    const occupancyRatio = peers.length / Math.max(1, zone.capacity);

    let friendCount = 0;
    let frictionCount = 0;
    for (const peer of peers) {
      const aff = agent.affinities[peer.id] ?? 0;
      if (aff >= 0.25) friendCount += 1;
      else if (aff <= -0.25) frictionCount += 1;
    }

    const crowdingPenalty =
      occupancyRatio >= 1.15
        ? 0.45
        : occupancyRatio >= 0.9
          ? 0.18
          : 0;

    // Penalti sosial bagi mahasiswa nyaman menyendiri jika zona terlalu ramai
    const solitudeCrowdPenalty =
      agent.solitudePreference * Math.max(0, peers.length - 2) * 0.08;

    // 1. Stasiun praktikum (bekerja)
    if (WORK_ZONES.includes(zone.id)) {
      const { interest, skill } = getInterestAndSkillForZone(agent, zone.id);
      let score =
        0.32 +
        interest * 0.42 +
        skill * 0.14 +
        agent.taskLoad * 0.28 +
        agent.personality.conscientiousness * 0.14;

      if (agent.energy < 0.28) score -= 0.14;
      if (agent.stress > 0.78) score -= 0.22;

      // Mahasiswa menyendiri sehat suka bekerja tenang di stasiun minatnya saat belum sesak
      if (agent.solitudePreference > 0.7 && peers.length <= 2) {
        score += 0.14;
      }

      // Bonus/penalti sosial
      score += Math.min(0.14, friendCount * 0.05) * agent.personality.extraversion;
      score -= Math.min(0.32, frictionCount * 0.16);
      score -= crowdingPenalty + solitudeCrowdPenalty;

      // Pengaruh event aktif
      for (const ev of activeEvents) {
        if (ev.targetZoneId === zone.id) {
          if (ev.kind === 'tenggat-praktikum') score += 0.2;
          if (ev.kind === 'printer-macet' && zone.id === 'cetak-3d') {
            score += agent.skills.cetak3d > 0.7 ? 0.14 : -0.15;
          }
          if (ev.kind === 'inspeksi-k3' && zone.id === 'las') {
            score += agent.personality.conscientiousness * 0.12;
          }
        }
      }

      candidates.push({
        zoneId: zone.id,
        targetStatus: 'bekerja',
        goal: getWorkGoalForZone(agent, zone.id),
        score,
        durationTicks: 4 + Math.round(agent.personality.conscientiousness * 4),
      });
      continue;
    }

    // 2. Meja Diskusi Bersama (mengobrol / kolaborasi)
    if (zone.id === 'diskusi') {
      let score =
        0.18 +
        agent.personality.extraversion * 0.34 +
        agent.personality.agreeableness * 0.14 +
        agent.skills.kolaborasi * 0.16 +
        Math.min(0.28, friendCount * 0.09);

      score -= agent.solitudePreference * 0.32;
      score -= Math.min(0.35, frictionCount * 0.18);
      score -= crowdingPenalty;
      if (agent.energy < 0.24) score -= 0.12;
      if (hasDiscussEvent) score += DISCUSSION_EVENT_SCORE_BONUS;

      candidates.push({
        zoneId: 'diskusi',
        targetStatus: 'mengobrol',
        goal: getWorkGoalForZone(agent, 'diskusi'),
        score,
        durationTicks: 3 + Math.round(agent.personality.extraversion * 3),
      });
      continue;
    }

    // 3. Ruang Istirahat (istirahat / pulihkan energi & stres)
    if (zone.id === 'istirahat') {
      const energyNeed = Math.max(0, 1 - agent.energy);
      const stressNeed = agent.stress;
      let score =
        0.08 +
        energyNeed * 0.56 +
        stressNeed * 0.36 +
        (isLunchWindow || hasLunchEvent ? 0.28 : 0) -
        (agent.currentZoneId === 'istirahat' ? 0.36 : 0);

      if (agent.energy > 0.76 && agent.stress < 0.3 && !isLunchWindow) {
        score -= 0.3;
      }
      score += Math.min(0.12, friendCount * 0.04) * agent.personality.extraversion;
      score -= Math.min(0.22, frictionCount * 0.11);
      score -= crowdingPenalty * 0.7;

      candidates.push({
        zoneId: 'istirahat',
        targetStatus: 'istirahat',
        goal: getWorkGoalForZone(agent, 'istirahat'),
        score,
        durationTicks: 2 + Math.round(energyNeed * 2),
      });
      continue;
    }

    // 4. Gudang Alat (singgah ambil alat / kalibrasi singkat)
    if (zone.id === 'gudang-alat') {
      let score =
        0.14 +
        agent.taskLoad * 0.24 +
        agent.personality.conscientiousness * 0.15 +
        (agent.currentZoneId === 'gudang-alat' ? -0.25 : 0);
      score -= crowdingPenalty;

      candidates.push({
        zoneId: 'gudang-alat',
        targetStatus: 'bekerja',
        goal: getWorkGoalForZone(agent, 'gudang-alat'),
        score,
        durationTicks: 2,
      });
      continue;
    }

    // 5. Pojok Baca & Riset (tenang, cocok untuk riset dokumentasi & memulihkan fokus)
    if (zone.id === 'pojok-baca') {
      let score =
        0.24 +
        agent.personality.openness * 0.24 +
        agent.personality.conscientiousness * 0.22 +
        agent.solitudePreference * 0.26 +
        agent.taskLoad * 0.16 -
        (agent.currentZoneId === 'pojok-baca' ? 0.2 : 0);
      score -= crowdingPenalty + solitudeCrowdPenalty * 0.5;
      score -= Math.min(0.24, frictionCount * 0.12);

      candidates.push({
        zoneId: 'pojok-baca',
        targetStatus: 'bekerja',
        goal: getWorkGoalForZone(agent, 'pojok-baca'),
        score,
        durationTicks: 3 + Math.round(agent.personality.conscientiousness * 3),
      });
      continue;
    }

    // 6. Ruang Dosen (konsultasi teknis singkat ketika beban tugas tinggi)
    if (zone.id === 'ruang-dosen') {
      let score =
        0.06 +
        (agent.taskLoad > 0.62 ? 0.24 : 0) +
        agent.personality.conscientiousness * 0.14 -
        agent.hiddenVars.stigmaSensitivity * 0.08 -
        (agent.currentZoneId === 'ruang-dosen' ? 0.28 : 0) -
        crowdingPenalty;

      candidates.push({
        zoneId: 'ruang-dosen',
        targetStatus: 'menunggu',
        goal: getWorkGoalForZone(agent, 'ruang-dosen'),
        score,
        durationTicks: 2,
      });
    }
  }

  // Adaptasi sementara akibat hasil cerita (tanpa adaptasi: tidak ada perubahan)
  for (const candidate of candidates) {
    candidate.score += agent.storyAdaptation?.zoneBonuses[candidate.zoneId] ?? 0;
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

function reserveTargetTileInZone(
  zoneId: ZoneType,
  allAgents: readonly StudentAgent[],
  map: LabMapData,
  grid: NavigationGrid,
  selfId: string,
  rng: SeededRng
): GridPoint {
  const occupied = new Set<string>();
  for (const other of allAgents) {
    if (other.id === selfId) continue;
    const pt = other.targetPosition ?? other.tilePosition;
    occupied.add(`${pt.x},${pt.y}`);
  }

  const zone = map.zones.find((z) => z.id === zoneId);
  if (zone) {
    const freeSlots = zone.standingSlots.filter(
      (s) => !occupied.has(`${s.x},${s.y}`) && isPointWalkable(grid, s)
    );
    if (freeSlots.length > 0) {
      return pickOne(rng, freeSlots);
    }

    const freeBoundsTiles: GridPoint[] = [];
    for (let y = zone.bounds.y; y < zone.bounds.y + zone.bounds.h; y += 1) {
      for (let x = zone.bounds.x; x < zone.bounds.x + zone.bounds.w; x += 1) {
        const pt = { x, y };
        if (!occupied.has(`${x},${y}`) && isPointWalkable(grid, pt)) {
          freeBoundsTiles.push(pt);
        }
      }
    }
    if (freeBoundsTiles.length > 0) {
      return pickOne(rng, freeBoundsTiles);
    }

    if (zone.standingSlots.length > 0) {
      return pickOne(rng, zone.standingSlots);
    }
  }

  return { x: 15, y: 9 };
}

export function assignNextActivityForAgent(
  agent: StudentAgent,
  allAgents: readonly StudentAgent[],
  map: LabMapData,
  grid: NavigationGrid,
  activeEvents: readonly LabEvent[],
  minutesOfDay: number,
  rng: SeededRng
): void {
  const candidates = scoreAgentActivityCandidates(
    agent,
    allAgents,
    map,
    activeEvents,
    minutesOfDay
  );
  if (candidates.length === 0) return;

  // Pilih secara deterministik berbobot antara peringkat 1 dan 2 agar alami namun tidak acak liar
  const top = candidates[0];
  const second = candidates[1];
  const chosen =
    second && top.score - second.score < 0.14 && rng() < 0.34 ? second : top;

  const targetTile = reserveTargetTileInZone(
    chosen.zoneId,
    allAgents,
    map,
    grid,
    agent.id,
    rng
  );

  agent.targetZoneId = chosen.zoneId;
  agent.activityGoal = chosen.goal;
  agent.activityDurationTicks = chosen.durationTicks;

  if (
    targetTile.x === agent.tilePosition.x &&
    targetTile.y === agent.tilePosition.y
  ) {
    agent.currentZoneId = chosen.zoneId;
    agent.targetPosition = null;
    agent.path = [];
    agent.pathStepIndex = 0;
    agent.status = chosen.targetStatus;
    return;
  }

  const path = findPath(grid, agent.tilePosition, targetTile);
  if (!path || path.length === 0) {
    // Jika jalur terhalang sementara, tetap di tempat dan tunggu 1 tick
    agent.status = 'menunggu';
    agent.activityDurationTicks = 1;
    agent.path = [];
    agent.targetPosition = null;
    return;
  }

  agent.targetPosition = targetTile;
  agent.path = path;
  agent.pathStepIndex = 0;
  agent.status = 'berpindah';
}

function getZoneStatusOnArrival(zoneId: ZoneType): Exclude<AgentActivityStatus, 'berpindah'> {
  if (zoneId === 'istirahat') return 'istirahat';
  if (zoneId === 'diskusi') return 'mengobrol';
  if (zoneId === 'ruang-dosen') return 'menunggu';
  return 'bekerja';
}

export function findZoneIdForPoint(map: LabMapData, pt: GridPoint): ZoneType | null {
  for (const zone of map.zones) {
    const b = zone.bounds;
    if (pt.x >= b.x && pt.x < b.x + b.w && pt.y >= b.y && pt.y < b.y + b.h) {
      return zone.id;
    }
  }
  return null;
}

/**
 * Menggerakkan agen yang sedang berstatus 'berpindah' secara mulus di sepanjang jalur A*.
 * Kecepatan jalan disinkronkan dengan waktu simulasi (petak per menit simulasi).
 */
export function moveAgentsAlongPaths(
  agents: StudentAgent[],
  simMinutesDelta: number,
  map: LabMapData,
  control?: AgentTickControlOptions
): void {
  if (simMinutesDelta <= 0) return;

  // ~7 petak per menit simulasi -> melintasi lab ~40 petak butuh ~5-6 menit simulasi (1 tick)
  const tilesPerSimMinute = 7.5;
  const maxStep = simMinutesDelta * tilesPerSimMinute;

  for (const agent of agents) {
    if (control?.lostAgentIds?.has(agent.id) || control?.inSessionAgentIds?.has(agent.id)) {
      continue;
    }
    if (agent.status !== 'berpindah' || agent.path.length === 0) {
      continue;
    }

    let remainingMove = maxStep;
    while (remainingMove > 0 && agent.pathStepIndex < agent.path.length - 1) {
      const nextPt = agent.path[agent.pathStepIndex + 1];
      const dx = nextPt.x - agent.position.x;
      const dy = nextPt.y - agent.position.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= remainingMove || dist < 0.0001) {
        agent.position.x = nextPt.x;
        agent.position.y = nextPt.y;
        agent.tilePosition = { x: nextPt.x, y: nextPt.y };
        agent.pathStepIndex += 1;
        remainingMove -= dist;
      } else {
        agent.position.x += (dx / dist) * remainingMove;
        agent.position.y += (dy / dist) * remainingMove;
        remainingMove = 0;
      }
    }

    if (agent.pathStepIndex >= agent.path.length - 1) {
      const finalPt = agent.path[agent.path.length - 1];
      agent.position = { x: finalPt.x, y: finalPt.y };
      agent.tilePosition = { x: finalPt.x, y: finalPt.y };
      agent.targetPosition = null;
      agent.path = [];
      agent.pathStepIndex = 0;
      agent.currentZoneId =
        findZoneIdForPoint(map, finalPt) ?? agent.targetZoneId;
      agent.status = getZoneStatusOnArrival(agent.currentZoneId);
    } else {
      const detected = findZoneIdForPoint(map, agent.tilePosition);
      if (detected) {
        agent.currentZoneId = detected;
      }
    }
  }
}

/**
 * Memperbarui energi, stres, beban tugas, dan interaksi sosial antarmahasiswa tiap tick 5 menit.
 */
export function updateAgentsNeedsAndSocialTick(
  agents: StudentAgent[],
  activeEvents: readonly LabEvent[],
  rng: SeededRng,
  control?: AgentTickControlOptions
): void {
  const isPausedAgent = (id: string) =>
    Boolean(control?.lostAgentIds?.has(id) || control?.inSessionAgentIds?.has(id));

  // Hitung jumlah penghuni tiap zona untuk mendeteksi kepadatan
  const zoneCounts: Record<string, number> = {};
  for (const agent of agents) {
    agent.interactingWithIds = [];
    if (control?.lostAgentIds?.has(agent.id)) {
      agent.energy = 0;
      continue;
    }
    if (control?.inSessionAgentIds?.has(agent.id)) {
      continue;
    }
    if (agent.status !== 'berpindah') {
      zoneCounts[agent.currentZoneId] = (zoneCounts[agent.currentZoneId] ?? 0) + 1;
    }
  }

  const hasDeadlineEvent = activeEvents.some((e) => e.kind === 'tenggat-praktikum');

  // 1. Pembaruan kebutuhan individu (dikalibrasi agar 100% -> 0% bertahan ~65-95 detik nyata pada 1x)
  for (const agent of agents) {
    if (isPausedAgent(agent.id)) continue;

    if (agent.activityDurationTicks > 0 && agent.status !== 'berpindah') {
      agent.activityDurationTicks -= 1;
    }

    const peersNearby = Math.max(0, (zoneCounts[agent.currentZoneId] ?? 1) - 1);
    const stressFloor = 0.06 + agent.personality.stressSensitivity * 0.14;

    switch (agent.status) {
      case 'bekerja': {
        // Bekerja sendiri menguras energi perlahan (-0.3%/detik di 1x)
        agent.energy = clamp01(agent.energy - 0.003);
        const { interest, skill } = getInterestAndSkillForZone(
          agent,
          agent.currentZoneId
        );
        const workEfficiency = 0.018 + skill * 0.022;
        agent.taskLoad = clamp01(agent.taskLoad - workEfficiency);

        // Tekanan kerja meningkat jika lelah, beban tinggi, ada tenggat, atau zona terlalu ramai bagi penyendiri
        let stressDelta = 0;
        if (agent.energy < 0.36 || agent.taskLoad > 0.68) {
          stressDelta += 0.014 * (0.6 + agent.personality.stressSensitivity);
        } else if (interest > 0.68 && agent.stress > stressFloor + 0.06) {
          stressDelta -= 0.004;
        }
        if (hasDeadlineEvent && agent.taskLoad > 0.5) {
          stressDelta += 0.007 * (0.5 + agent.personality.stressSensitivity);
        }
        if (peersNearby >= 5 && agent.solitudePreference > 0.55) {
          stressDelta += 0.01 * agent.personality.stressSensitivity;
        }
        agent.stress = clamp01(Math.max(stressFloor * 0.7, agent.stress + stressDelta));
        break;
      }
      case 'berpindah':
        agent.energy = clamp01(agent.energy - 0.002);
        break;
      case 'istirahat':
        // Istirahat memulihkan energi bertahap (+1.5%/detik), tetap lebih pelan dari konseling
        agent.energy = clamp01(agent.energy + 0.015);
        agent.stress = clamp01(
          Math.max(stressFloor * 0.65, agent.stress - 0.02)
        );
        break;
      case 'mengobrol':
        // Mengobrol di meja diskusi menambah energi positif secara bertahap
        agent.energy = clamp01(agent.energy + 0.006);
        // Bagi penyendiri yang terpaksa ramai-ramai, keramaian tetap memberi sedikit penat
        if (agent.solitudePreference > 0.65 && peersNearby >= 4) {
          agent.stress = clamp01(agent.stress + 0.005 * agent.personality.stressSensitivity);
        }
        break;
      case 'menunggu':
        agent.energy = clamp01(agent.energy - 0.003);
        agent.stress = clamp01(agent.stress + 0.006 * agent.personality.stressSensitivity);
        break;
    }

    // Beban tugas bertambah ringan secara alami seiring berjalannya hari lab
    if (agent.taskLoad < 0.55 && rng() < 0.16) {
      agent.taskLoad = clamp01(agent.taskLoad + 0.045);
    }
  }

  // Lacak apakah agen mendapat interaksi suportif pada tick ini (dibatasi 1x reduksi stres per tick)
  const gotWarmSupport = new Set<string>();

  // 2. Interaksi sosial & evolusi afinitas antar-agen yang berada di zona yang sama
  for (let i = 0; i < agents.length; i += 1) {
    const a = agents[i];
    if (isPausedAgent(a.id) || a.status === 'berpindah') continue;

    for (let j = i + 1; j < agents.length; j += 1) {
      const b = agents[j];
      if (isPausedAgent(b.id) || b.status === 'berpindah') continue;
      if (a.currentZoneId !== b.currentZoneId) continue;

      const dist = Math.hypot(
        a.position.x - b.position.x,
        a.position.y - b.position.y
      );
      if (dist > 3.6) continue;

      const affAB = a.affinities[b.id] ?? 0;
      const affBA = b.affinities[a.id] ?? 0;
      const avgAff = (affAB + affBA) / 2;

      const socialChance =
        0.18 +
        ((a.personality.extraversion + b.personality.extraversion) / 2) * 0.42 +
        Math.max(0, avgAff) * 0.35 -
        ((a.solitudePreference + b.solitudePreference) / 2) * 0.25;

      if (avgAff < -0.22 && (a.stress > 0.3 || b.stress > 0.3 || a.energy < 0.45 || b.energy < 0.45)) {
        // Ketegangan ringan jika dua agen tidak cocok berdekatan saat lelah/stres
        if (rng() < 0.4) {
          a.affinities[b.id] = clampAffinity(affAB - 0.025);
          b.affinities[a.id] = clampAffinity(affBA - 0.025);
          a.stress = clamp01(a.stress + 0.026);
          b.stress = clamp01(b.stress + 0.026);
          a.socialStatus = 'konflik-ringan';
          b.socialStatus = 'konflik-ringan';
          // Salah satu cenderung menyingkir di evaluasi berikut
          if (a.personality.agreeableness <= b.personality.agreeableness) {
            a.activityDurationTicks = 0;
          } else {
            b.activityDurationTicks = 0;
          }
        }
        continue;
      }

      if (rng() < socialChance) {
        a.interactingWithIds.push(b.id);
        b.interactingWithIds.push(a.id);

        // Interaksi hangat membangun afinitas bertahap
        const delta =
          avgAff >= 0
            ? 0.012 + ((a.personality.agreeableness + b.personality.agreeableness) / 2) * 0.014
            : 0.005;
        a.affinities[b.id] = clampAffinity(affAB + delta);
        b.affinities[a.id] = clampAffinity(affBA + delta);

        if (avgAff >= 0.25) {
          gotWarmSupport.add(a.id);
          gotWarmSupport.add(b.id);
        }
      }
    }
  }

  for (const agent of agents) {
    if (isPausedAgent(agent.id)) continue;
    if (gotWarmSupport.has(agent.id)) {
      const floor = 0.06 + agent.personality.stressSensitivity * 0.14;
      agent.stress = clamp01(Math.max(floor, agent.stress - 0.008));
    }
  }

  // 3. Perbarui status sosial keseluruhan tiap mahasiswa
  const conflictEventIds = new Set<string>();
  for (const ev of activeEvents) {
    if (ev.kind === 'gesekan-tugas') {
      for (const id of ev.involvedAgentIds) conflictEventIds.add(id);
    }
  }

  for (const agent of agents) {
    if (isPausedAgent(agent.id)) continue;

    if (conflictEventIds.has(agent.id)) {
      agent.socialStatus = 'konflik-ringan';
      agent.energy = clamp01(agent.energy - 0.014);
    } else if (
      agent.interactingWithIds.length >= 2 ||
      (agent.currentZoneId === 'diskusi' && agent.interactingWithIds.length >= 1)
    ) {
      agent.socialStatus = 'berkelompok';
      // Sering berinteraksi & mengobrol dalam kelompok meningkatkan energi sosial secara nyata
      const crowdFactor = agent.solitudePreference > 0.7 ? 0.65 : 1;
      agent.energy = clamp01(agent.energy + 0.016 * crowdFactor);
    } else if (agent.interactingWithIds.length === 1) {
      agent.socialStatus = 'berinteraksi';
      // Interaksi tatap muka 1-lawan-1 mengisi energi bahkan bagi mahasiswa introver
      agent.energy = clamp01(agent.energy + 0.012);
    } else {
      // Menyendiri: bedakan menyendiri sehat vs menghindar/tertekan
      const peersInZone = agents.filter(
        (o) => !isPausedAgent(o.id) && o.id !== agent.id && o.currentZoneId === agent.currentZoneId
      );
      const hasDislikedPeerNear = peersInZone.some(
        (o) => (agent.affinities[o.id] ?? 0) <= -0.22
      );
      if (hasDislikedPeerNear && agent.stress > 0.36) {
        agent.socialStatus = 'menghindar';
        agent.energy = clamp01(agent.energy - 0.014);
      } else {
        agent.socialStatus = 'sendiri';
        // Total penurunan bekerja sendiri ~0.75%-0.95%/detik -> bertahan ~65-100 detik (1 - 1,5 menit!)
        const isolationDrain =
          agent.status === 'istirahat'
            ? 0.004
            : agent.socialCircleHint === 'terisolasi-rentan' || agent.solitudePreference < 0.5
              ? 0.0065
              : agent.socialCircleHint === 'mandiri-sehat'
                ? 0.0045
                : 0.0055;
        agent.energy = clamp01(agent.energy - isolationDrain);
        if (
          (agent.solitudePreference < 0.42 && agent.personality.extraversion > 0.6) ||
          (agent.socialCircleHint === 'terisolasi-rentan' && agent.personality.stressSensitivity > 0.6)
        ) {
          agent.stress = clamp01(agent.stress + 0.008);
        }
      }
    }

    // Mahasiswa yang sudah stabil ('selesai' didampingi) energinya terlindungi agar tidak hilang
    if (control?.stabilizedAgentIds?.has(agent.id)) {
      agent.energy = Math.max(STABILIZED_MIN_ENERGY, agent.energy);
    }
  }
}
