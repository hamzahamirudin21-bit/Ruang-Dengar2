import type { MissionRecord, StorySaveSlot } from '../engine/story/saveSlot';

// Kunci baru khusus mode cerita. Kunci lama (settings, counselor-records,
// agent-memory) tidak pernah dibaca atau ditulis dari berkas ini.
export const STORY_SAVE_STORAGE_KEY = 'ruang-dengar:story-save:v1';
export const STORY_MISSIONS_STORAGE_KEY = 'ruang-dengar:story-missions:v1';

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Membaca objek peta per agentId; apa pun yang korup menjadi objek kosong. */
function readMap(key: string): Record<string, unknown> {
  try {
    const store = getStorage();
    if (!store) return {};
    const raw = store.getItem(key);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(key: string, map: Record<string, unknown>): boolean {
  try {
    const store = getStorage();
    if (!store) return false;
    store.setItem(key, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

/** Menyimpan satu slot per agentId. Mengembalikan false bila gagal. */
export function saveStorySlot(slot: StorySaveSlot): boolean {
  try {
    const map = readMap(STORY_SAVE_STORAGE_KEY);
    map[slot.agentId] = slot;
    return writeMap(STORY_SAVE_STORAGE_KEY, map);
  } catch {
    return false;
  }
}

/**
 * Mengembalikan slot mentah sebagai string JSON, atau null bila tidak ada.
 * Validasi dilakukan pemanggil lewat validateSaveSlot.
 */
export function loadStorySlotRaw(agentId: string): string | null {
  try {
    const map = readMap(STORY_SAVE_STORAGE_KEY);
    if (!Object.prototype.hasOwnProperty.call(map, agentId)) return null;
    const value = map[agentId];
    if (value === undefined || value === null) return null;
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export function clearStorySlot(agentId: string): void {
  try {
    const store = getStorage();
    if (!store) return;
    const map = readMap(STORY_SAVE_STORAGE_KEY);
    if (!Object.prototype.hasOwnProperty.call(map, agentId)) return;
    delete map[agentId];
    store.setItem(STORY_SAVE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Abaikan kegagalan penyimpanan lokal
  }
}

export function loadMissionRecords(): Record<string, MissionRecord> {
  return readMap(STORY_MISSIONS_STORAGE_KEY) as Record<string, MissionRecord>;
}

export function saveMissionRecords(
  records: Readonly<Record<string, MissionRecord>>
): boolean {
  return writeMap(STORY_MISSIONS_STORAGE_KEY, { ...records });
}
