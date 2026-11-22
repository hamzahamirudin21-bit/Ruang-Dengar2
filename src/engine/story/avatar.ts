import { GridPoint } from '../../types';
import { NavigationGrid, findPath, isPointWalkable } from '../pathfinding';

/**
 * Avatar Dosen Konseling: tipe dan perencanaan rute (tugas 9.1).
 * Mesin keadaan (reduceAvatar, advanceAvatar) ditambahkan pada tugas 9.2 di berkas ini.
 * Seluruh fungsi di bagian perencanaan murni: tidak mengubah argumen dan tidak memakai acak.
 */

// ---------------------------------------------------------------------------
// Tipe
// ---------------------------------------------------------------------------

export type AvatarMode = 'idle' | 'menuju-mahasiswa' | 'dalam-cerita' | 'berdua-ke-bk';

export interface AvatarCompanion {
  agentId: string;
  path: GridPoint[];
  seat: GridPoint;
  avatarSeat: GridPoint;
}

export interface AvatarState {
  mode: AvatarMode;
  /** Posisi halus (pecahan petak) untuk animasi. */
  position: { x: number; y: number };
  /** Petak bulat terakhir yang dicapai. */
  tile: GridPoint;
  path: GridPoint[];
  stepIndex: number;
  targetAgentId: string | null;
  companion: AvatarCompanion | null;
}

export interface ApproachPlan {
  path: GridPoint[];
  standTile: GridPoint;
}

export interface WalkTogetherPlan {
  avatarPath: GridPoint[];
  companionPath: GridPoint[];
  avatarSeat: GridPoint;
  studentSeat: GridPoint;
}

// ---------------------------------------------------------------------------
// Konstanta
// ---------------------------------------------------------------------------

/** Titik awal avatar: walkable pada mode pintu lab maupun samping. */
export const AVATAR_START: GridPoint = { x: 29, y: 10 };

/** Slot konsultasi (standingSlots zona `konsultasi`). */
const AVATAR_SEAT: GridPoint = { x: 33, y: 12 };
const STUDENT_SEAT: GridPoint = { x: 32, y: 13 };

/** Urutan penentu seri: Utara, Timur, Selatan, Barat (U, T, S, B). */
const TIE_BREAK_DIRS: readonly GridPoint[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

// ---------------------------------------------------------------------------
// Perencanaan rute
// ---------------------------------------------------------------------------

function samePoint(a: GridPoint, b: GridPoint): boolean {
  return a.x === b.x && a.y === b.y;
}

function copyPoint(p: GridPoint): GridPoint {
  return { x: p.x, y: p.y };
}

/**
 * Rute dari `from` ke salah satu empat tetangga ortogonal sel `target`.
 * Sel yang ditempati agen lain dihindari selama ada alternatif berjalur;
 * jalur terpendek menang, seri diputus urutan U, T, S, B.
 * Mengembalikan null bila tidak ada tetangga yang terjangkau.
 */
export function planApproach(
  grid: NavigationGrid,
  from: GridPoint,
  target: GridPoint,
  occupied: readonly GridPoint[]
): ApproachPlan | null {
  const pickBest = (skipOccupied: boolean): ApproachPlan | null => {
    let best: ApproachPlan | null = null;
    for (const dir of TIE_BREAK_DIRS) {
      const cand: GridPoint = { x: target.x + dir.x, y: target.y + dir.y };
      if (!isPointWalkable(grid, cand)) continue;
      if (skipOccupied && occupied.some((o) => samePoint(o, cand))) continue;
      const path = findPath(grid, from, cand);
      if (!path) continue;
      if (best === null || path.length < best.path.length) {
        best = { path, standTile: cand };
      }
    }
    return best;
  };
  return pickBest(true) ?? pickBest(false);
}

/**
 * Rute berdampingan dari Lab ke slot konsultasi.
 * Avatar menempuh A* ke kursi avatar. Pendamping mengikuti rute yang sama
 * satu petak di belakang: `[studentTile, avatarTile, ...rute avatar tanpa awal, ...langkah ke kursi mahasiswa]`.
 * Mengembalikan null bila salah satu rute tidak ada; pemanggil memakai `teleportTogether`.
 */
export function planWalkTogether(
  grid: NavigationGrid,
  avatarTile: GridPoint,
  studentTile: GridPoint
): WalkTogetherPlan | null {
  const avatarPath = findPath(grid, avatarTile, AVATAR_SEAT);
  if (!avatarPath) return null;
  const seatPath = findPath(grid, AVATAR_SEAT, STUDENT_SEAT);
  if (!seatPath) return null;
  // Pendamping harus bisa berdiri di petak sendiri dan bersebelahan dengan awal rute.
  if (!isPointWalkable(grid, studentTile)) return null;
  if (Math.abs(studentTile.x - avatarTile.x) + Math.abs(studentTile.y - avatarTile.y) > 1) {
    return null;
  }

  const companionPath: GridPoint[] = [];
  if (!samePoint(studentTile, avatarTile)) companionPath.push(copyPoint(studentTile));
  companionPath.push(...avatarPath.map(copyPoint));
  companionPath.push(...seatPath.slice(1).map(copyPoint));

  return {
    avatarPath,
    companionPath,
    avatarSeat: copyPoint(AVATAR_SEAT),
    studentSeat: copyPoint(STUDENT_SEAT),
  };
}

/** Cadangan tanpa rute: kedua karakter langsung ke slot konsultasi. */
export function teleportTogether(): { avatarSeat: GridPoint; studentSeat: GridPoint } {
  return { avatarSeat: copyPoint(AVATAR_SEAT), studentSeat: copyPoint(STUDENT_SEAT) };
}

// ---------------------------------------------------------------------------
// Mesin keadaan (tugas 9.2)
// ---------------------------------------------------------------------------

export type AvatarEvent =
  | { type: 'klik'; path: GridPoint[]; targetAgentId: string }
  | { type: 'tiba' }
  | { type: 'batal' }
  | { type: 'mulai-jalan-berdua'; avatarPath: GridPoint[]; companion: AvatarCompanion }
  | { type: 'selesai-jalan-berdua' }
  | { type: 'cerita-selesai' };

export interface AvatarTransition {
  state: AvatarState;
  /** true hanya bila peristiwa `klik` ditolak karena mode bukan `idle` (Requirement 2.5). */
  ditolak: boolean;
}

export interface AvatarAdvance {
  state: AvatarState;
  /** true bila avatar berada di ujung rute pada mode yang berjalan (tingkat, bukan pulsa). */
  tiba: boolean;
}

/** Posisi akhir rute, atau `fallback` bila rute kosong. */
function lastPoint(path: readonly GridPoint[], fallback: GridPoint): GridPoint {
  return path.length > 0 ? path[path.length - 1] : fallback;
}

/**
 * Transisi keadaan avatar. Fungsi murni: tidak mengubah `state` maupun `event`.
 * Peristiwa yang tidak berlaku pada mode saat ini mengembalikan objek `state` yang sama.
 * - klik: idle -> menuju-mahasiswa; mode lain ditolak.
 * - tiba: menuju-mahasiswa -> dalam-cerita (avatar diletakkan di ujung rute).
 * - batal: menuju-mahasiswa -> idle (avatar berhenti di petak terakhir yang dicapai).
 * - mulai-jalan-berdua: dalam-cerita -> berdua-ke-bk.
 * - selesai-jalan-berdua: berdua-ke-bk -> dalam-cerita (avatar di kursinya, pendamping di kursinya).
 * - cerita-selesai: dalam-cerita -> idle.
 */
export function reduceAvatar(state: AvatarState, event: AvatarEvent): AvatarTransition {
  const unchanged: AvatarTransition = { state, ditolak: false };
  switch (event.type) {
    case 'klik': {
      if (state.mode !== 'idle') return { state, ditolak: true };
      return {
        state: {
          ...state,
          mode: 'menuju-mahasiswa',
          path: event.path.map(copyPoint),
          stepIndex: 0,
          targetAgentId: event.targetAgentId,
          companion: null,
        },
        ditolak: false,
      };
    }
    case 'tiba': {
      if (state.mode !== 'menuju-mahasiswa') return unchanged;
      const end = copyPoint(lastPoint(state.path, state.tile));
      return {
        state: {
          ...state,
          mode: 'dalam-cerita',
          position: { x: end.x, y: end.y },
          tile: end,
          path: [],
          stepIndex: 0,
        },
        ditolak: false,
      };
    }
    case 'batal': {
      if (state.mode !== 'menuju-mahasiswa') return unchanged;
      const at = copyPoint(state.path[state.stepIndex] ?? state.tile);
      return {
        state: {
          ...state,
          mode: 'idle',
          position: { x: at.x, y: at.y },
          tile: at,
          path: [],
          stepIndex: 0,
          targetAgentId: null,
          companion: null,
        },
        ditolak: false,
      };
    }
    case 'mulai-jalan-berdua': {
      if (state.mode !== 'dalam-cerita') return unchanged;
      const path = event.avatarPath.map(copyPoint);
      const start = path.length > 0 ? path[0] : state.tile;
      return {
        state: {
          ...state,
          mode: 'berdua-ke-bk',
          position: { x: start.x, y: start.y },
          tile: copyPoint(start),
          path,
          stepIndex: 0,
          companion: {
            agentId: event.companion.agentId,
            path: event.companion.path.map(copyPoint),
            seat: copyPoint(event.companion.seat),
            avatarSeat: copyPoint(event.companion.avatarSeat),
          },
        },
        ditolak: false,
      };
    }
    case 'selesai-jalan-berdua': {
      if (state.mode !== 'berdua-ke-bk') return unchanged;
      const seat = copyPoint(state.companion ? state.companion.avatarSeat : lastPoint(state.path, state.tile));
      return {
        state: {
          ...state,
          mode: 'dalam-cerita',
          position: { x: seat.x, y: seat.y },
          tile: seat,
          path: [],
          stepIndex: 0,
        },
        ditolak: false,
      };
    }
    case 'cerita-selesai': {
      if (state.mode !== 'dalam-cerita') return unchanged;
      return {
        state: {
          ...state,
          mode: 'idle',
          path: [],
          stepIndex: 0,
          targetAgentId: null,
          companion: null,
        },
        ditolak: false,
      };
    }
    default:
      return unchanged;
  }
}

/**
 * Menggerakkan avatar sepanjang `state.path` pada mode `menuju-mahasiswa` dan `berdua-ke-bk`.
 * `reduced` (gerak dikurangi) memindahkan avatar langsung ke ujung rute.
 * Mode lain, `dtSeconds`/`tilesPerSecond` tidak valid atau <= 0: posisi tidak berubah.
 * `tiba` bernilai true selama avatar berada di ujung rute pada mode yang berjalan;
 * pemanggil mengirim peristiwa `tiba` atau `selesai-jalan-berdua`.
 * Fungsi murni: mengembalikan keadaan baru.
 */
export function advanceAvatar(
  state: AvatarState,
  dtSeconds: number,
  tilesPerSecond: number,
  reduced: boolean
): AvatarAdvance {
  if (state.mode !== 'menuju-mahasiswa' && state.mode !== 'berdua-ke-bk') {
    return { state, tiba: false };
  }
  const path = state.path;
  const lastIndex = path.length - 1;

  if (lastIndex < 0) return { state, tiba: true };

  let budget = 0;
  if (reduced) {
    budget = Number.POSITIVE_INFINITY;
  } else if (
    Number.isFinite(dtSeconds) && Number.isFinite(tilesPerSecond) &&
    dtSeconds > 0 && tilesPerSecond > 0
  ) {
    budget = dtSeconds * tilesPerSecond;
  }

  let index = Math.min(Math.max(state.stepIndex, 0), lastIndex);
  let x = state.position.x;
  let y = state.position.y;

  while (index < lastIndex && budget > 0) {
    const next = path[index + 1];
    const dx = next.x - x;
    const dy = next.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist <= budget) {
      x = next.x;
      y = next.y;
      budget -= dist;
      index += 1;
    } else {
      x += (dx / dist) * budget;
      y += (dy / dist) * budget;
      budget = 0;
    }
  }

  const tiba = index >= lastIndex;
  const tile = copyPoint(path[index]);
  return {
    state: {
      ...state,
      position: tiba ? { x: path[lastIndex].x, y: path[lastIndex].y } : { x, y },
      tile,
      stepIndex: index,
    },
    tiba,
  };
}

/**
 * Posisi halus pendamping. Saat `berdua-ke-bk` pendamping berada pada kemajuan rute
 * yang sama dengan avatar (indeks rute pendamping = kemajuan avatar, satu petak di belakang).
 * Saat `dalam-cerita` dengan pendamping, ia berada di kursinya. Selain itu null.
 */
export function companionPosition(state: AvatarState): { x: number; y: number } | null {
  const c = state.companion;
  if (!c) return null;
  if (state.mode === 'dalam-cerita') return { x: c.seat.x, y: c.seat.y };
  if (state.mode !== 'berdua-ke-bk' || c.path.length === 0) return null;

  const base = state.path[state.stepIndex];
  const next = state.path[state.stepIndex + 1];
  let frac = 0;
  if (base && next) {
    const seg = Math.hypot(next.x - base.x, next.y - base.y);
    if (seg > 0) {
      frac = Math.min(1, Math.hypot(state.position.x - base.x, state.position.y - base.y) / seg);
    }
  }
  const i = Math.min(state.stepIndex, c.path.length - 1);
  const a = c.path[i];
  const b = c.path[Math.min(i + 1, c.path.length - 1)];
  return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
}
