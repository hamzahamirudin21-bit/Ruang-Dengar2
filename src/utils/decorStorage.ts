import {
  DEFAULT_ROOM_DECOR_STATE,
  ROOM_DECOR_CATALOG,
  type RoomDecorId,
  type RoomDecorState,
} from '../engine/roomDecor';

const KEY = 'ruang-dengar.room-decor.v1';
const VALID_IDS = new Set<string>(ROOM_DECOR_CATALOG.map((item) => item.id));

export function loadRoomDecorState(): RoomDecorState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_ROOM_DECOR_STATE;
    const parsed = JSON.parse(raw) as Partial<RoomDecorState>;
    const ownedIds = Array.isArray(parsed.ownedIds)
      ? parsed.ownedIds.filter((id): id is RoomDecorId => typeof id === 'string' && VALID_IDS.has(id))
      : [];
    const ownedSet = new Set<string>(ownedIds);
    const equippedIds = Array.isArray(parsed.equippedIds)
      ? parsed.equippedIds.filter(
          (id): id is RoomDecorId => typeof id === 'string' && ownedSet.has(id),
        )
      : [...ownedIds];
    return { ownedIds, equippedIds };
  } catch {
    return DEFAULT_ROOM_DECOR_STATE;
  }
}

export function saveRoomDecorState(state: RoomDecorState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Abaikan kuota penuh atau mode privat
  }
}
