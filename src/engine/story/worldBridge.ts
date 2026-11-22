import type { GridPoint, StudentAgent, WorldState } from '../../types';
import { STORY_ROLE_DEFS, STORY_ROLES } from '../../data/storyRoles';
import type { StoryRoleDef, StoryRoleId } from '../../data/storyRoles';
import type { StoryOutcome } from './runner';
import type { MissionRecord } from './saveSlot';
import type { StoryOutcomeKind } from './storyTypes';

/**
 * Jembatan antara mode cerita dan dunia simulasi (Requirement 1.2, 6.8, 10).
 * Semua fungsi murni: masukan tidak dimutasi, hasil berupa salinan baru.
 */

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** Salin dunia dan ganti hanya agen sasaran dengan hasil `update`. */
function updateAgent(
  world: WorldState,
  agentId: string,
  update: (agent: StudentAgent) => StudentAgent,
): WorldState {
  if (!world.agents.some((a) => a.id === agentId)) return { ...world, agents: [...world.agents] };
  return {
    ...world,
    agents: world.agents.map((a) => (a.id === agentId ? update(a) : a)),
  };
}

/** Hentikan gerak: posisi halus dikunci ke petak, jalur dikosongkan (dunia sudah dipause). */
export function snapAgentToTile(world: WorldState, agentId: string): WorldState {
  return updateAgent(world, agentId, (a) => ({
    ...a,
    position: { x: a.tilePosition.x, y: a.tilePosition.y },
    path: [],
    pathStepIndex: 0,
    targetPosition: null,
    status: 'menunggu',
  }));
}

/** Pindahkan mahasiswa ke kursi konsultasi. */
export function placeAgentAtSeat(world: WorldState, agentId: string, seat: GridPoint): WorldState {
  return updateAgent(world, agentId, (a) => ({
    ...a,
    position: { x: seat.x, y: seat.y },
    tilePosition: { x: seat.x, y: seat.y },
    path: [],
    pathStepIndex: 0,
    targetPosition: null,
    currentZoneId: 'konsultasi',
    targetZoneId: 'konsultasi',
    status: 'menunggu',
  }));
}

/** Lepaskan mahasiswa agar tick berikutnya memilih aktivitas baru. */
export function releaseAgent(world: WorldState, agentId: string): WorldState {
  return updateAgent(world, agentId, (a) => ({ ...a, activityDurationTicks: 0 }));
}

const clampAffinity = (v: number): number => Math.min(1, Math.max(-1, v));

/**
 * Terapkan hasil cerita hanya pada agen sasaran: energi dan stres dijepit [0,1],
 * adaptasi berupa objek baru. Bila hasil 'terbantu', keterbukaan sosial agen
 * terhadap rekan lab ikut menguat agar ia lebih mudah berinteraksi kembali.
 * Agen lain dikembalikan sebagai referensi yang sama.
 */
export function applyStoryOutcomeToAgents(
  agents: StudentAgent[],
  agentId: string,
  outcome: StoryOutcome,
): StudentAgent[] {
  return agents.map((a) => {
    if (a.id !== agentId) return a;
    const nextAffinities =
      outcome.kind === 'terbantu'
        ? Object.fromEntries(
            Object.entries(a.affinities).map(([peerId, val]) => [
              peerId,
              Number(clampAffinity(val + 0.1).toFixed(3)),
            ]),
          )
        : a.affinities;
    const nextSolitude =
      outcome.kind === 'terbantu' && a.socialCircleHint === 'terisolasi-rentan'
        ? clamp01(a.solitudePreference - 0.12)
        : a.solitudePreference;
    return {
      ...a,
      energy: clamp01(a.energy + outcome.energyDelta),
      stress: clamp01(a.stress + outcome.stressDelta),
      affinities: nextAffinities,
      solitudePreference: nextSolitude,
      storyAdaptation: {
        ...outcome.adaptation,
        zoneBonuses: { ...outcome.adaptation.zoneBonuses },
      },
    };
  });
}

/**
 * Id mahasiswa dengan misi aktif: peran dengan hasMission benar dan misi belum selesai
 * (status 'selesai' atau hasil terakhir 'terbantu' berarti tidak bermisi).
 */
export function getMissionAgentIds(
  missions: Record<string, MissionRecord>,
  roles: Record<string, StoryRoleId> = STORY_ROLES,
  roleDefs: Record<StoryRoleId, StoryRoleDef> = STORY_ROLE_DEFS,
): string[] {
  const ids: string[] = [];
  for (const id of Object.keys(roles)) {
    const def = roleDefs[roles[id]];
    if (!def || !def.hasMission) continue;
    const m = missions[id];
    if (m && (m.status === 'selesai' || m.lastOutcome === 'terbantu')) continue;
    ids.push(id);
  }
  return ids;
}

/**
 * Lencana hasil untuk satu mahasiswa: hasil terakhir selama hari simulasi yang sama
 * dengan hari hasil diterapkan, selain itu null.
 */
export function getOutcomeBadge(
  mission: MissionRecord | undefined,
  currentDay: number,
): StoryOutcomeKind | null {
  if (!mission || mission.lastOutcome === null || mission.lastDay === null) return null;
  return mission.lastDay === currentDay ? mission.lastOutcome : null;
}

/** Lencana seluruh mahasiswa yang punya hasil pada hari ini (untuk StoryRenderLayer.badges). */
export function getOutcomeBadges(
  missions: Record<string, MissionRecord>,
  currentDay: number,
): Record<string, StoryOutcomeKind> {
  const badges: Record<string, StoryOutcomeKind> = {};
  for (const id of Object.keys(missions)) {
    const kind = getOutcomeBadge(missions[id], currentDay);
    if (kind) badges[id] = kind;
  }
  return badges;
}
