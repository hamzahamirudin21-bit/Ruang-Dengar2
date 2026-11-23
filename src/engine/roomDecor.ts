import type { MissionRecord } from './story/saveSlot';

/**
 * Katalog dekorasi "Hias Ruang Konsultasi BK" & perhitungan Bintang Empati.
 * Modul murni tanpa React/DOM.
 */

export type RoomDecorId =
  | 'tanaman-monstera'
  | 'set-teh-hangat'
  | 'lampu-senja'
  | 'kucing-penenang'
  | 'poster-hangat'
  | 'pemutar-vinyl';

export interface RoomDecorItem {
  id: RoomDecorId;
  name: string;
  description: string;
  cost: number;
  tag: string;
}

export const ROOM_DECOR_CATALOG: readonly RoomDecorItem[] = [
  {
    id: 'tanaman-monstera',
    name: 'Pot Monstera & Kaktus',
    description: 'Sudut hijau segar di dekat jendela yang membuat ruang terasa lebih hidup.',
    cost: 1,
    tag: 'Sudut Hijau',
  },
  {
    id: 'set-teh-hangat',
    name: 'Teko Teh Melati Hangat',
    description: 'Dua cangkir keramik mengepul lembut di meja untuk mencairkan suasana.',
    cost: 2,
    tag: 'Meja Konsultasi',
  },
  {
    id: 'kucing-penenang',
    name: 'Patung Kucing Sapa',
    description: 'Maskot mungil menggemaskan di pojok meja yang bikin mahasiswa tersenyum.',
    cost: 2,
    tag: 'Maskot Meja',
  },
  {
    id: 'lampu-senja',
    name: 'Lampu Meja Cahaya Senja',
    description: 'Pendar hangat keemasan yang memberi rasa teduh saat bercerita.',
    cost: 3,
    tag: 'Pencahayaan',
  },
  {
    id: 'poster-hangat',
    name: 'Bingkai Poster & Catatan',
    description: 'Hiasan dinding bertuliskan "Pelan-pelan saja, kamu didengar".',
    cost: 3,
    tag: 'Dinding',
  },
  {
    id: 'pemutar-vinyl',
    name: 'Pemutar Vinyl Lo-Fi',
    description: 'Piringan hitam klasik yang berputar tenang menemani setiap obrolan.',
    cost: 4,
    tag: 'Atmosfer',
  },
];

export interface RoomDecorState {
  ownedIds: RoomDecorId[];
  equippedIds: RoomDecorId[];
}

export const DEFAULT_ROOM_DECOR_STATE: RoomDecorState = {
  ownedIds: [],
  equippedIds: [],
};

/**
 * Total Bintang Empati yang diperoleh pemain dari seluruh sesi pendampingan:
 * - 1 bintang modal awal agar pemain langsung merasakan keseruan menghias ruang!
 * - +2 bintang untuk setiap mahasiswa yang berstatus 'selesai' (terbantu)
 * - +1 bintang untuk setiap mahasiswa yang sudah berstatus 'lanjutan' (kemajuan kecil)
 */
export function computeEarnedEmpathyStars(
  missions: Readonly<Record<string, MissionRecord>>,
): number {
  let stars = 1;
  for (const rec of Object.values(missions)) {
    if (rec.status === 'selesai') stars += 2;
    else if (rec.status === 'lanjutan') stars += 1;
  }
  return stars;
}

export function computeSpentStars(ownedIds: readonly RoomDecorId[]): number {
  let spent = 0;
  for (const id of ownedIds) {
    const item = ROOM_DECOR_CATALOG.find((x) => x.id === id);
    if (item) spent += item.cost;
  }
  return spent;
}

export function computeAvailableStars(
  missions: Readonly<Record<string, MissionRecord>>,
  decor: RoomDecorState,
): number {
  return Math.max(0, computeEarnedEmpathyStars(missions) - computeSpentStars(decor.ownedIds));
}

export function buyRoomDecor(
  decor: RoomDecorState,
  itemId: RoomDecorId,
  missions: Readonly<Record<string, MissionRecord>>,
): { ok: boolean; next: RoomDecorState } {
  const item = ROOM_DECOR_CATALOG.find((x) => x.id === itemId);
  if (!item) return { ok: false, next: decor };
  if (decor.ownedIds.includes(itemId)) return { ok: false, next: decor };
  const avail = computeAvailableStars(missions, decor);
  if (avail < item.cost) return { ok: false, next: decor };

  return {
    ok: true,
    next: {
      ownedIds: [...decor.ownedIds, itemId],
      equippedIds: decor.equippedIds.includes(itemId)
        ? decor.equippedIds
        : [...decor.equippedIds, itemId],
    },
  };
}

export function toggleEquipRoomDecor(
  decor: RoomDecorState,
  itemId: RoomDecorId,
): RoomDecorState {
  if (!decor.ownedIds.includes(itemId)) return decor;
  const active = decor.equippedIds.includes(itemId);
  return {
    ...decor,
    equippedIds: active
      ? decor.equippedIds.filter((id) => id !== itemId)
      : [...decor.equippedIds, itemId],
  };
}
